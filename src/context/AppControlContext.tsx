import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  AppGlobalConfig,
  PaymentMethod,
  PaymentRequestRecord,
  SubscriptionPlan,
  UserAccessRecord,
} from '../types';

export const ADMIN_EMAIL = 'sazzadhossainhridoy961@gmail.com';
export const CURRENT_APP_VERSION = '1.0.0';

export const DEFAULT_APP_CONFIG: AppGlobalConfig = {
  paywallEnabled: true,
  freeMaxRootFolders: 3,
  freeMaxMilestones: 2,
  monthlyPriceBdt: 99,
  yearlyPriceBdt: 799,
  lifetimePriceBdt: 1499,
  monthlyPriceUsd: 2.99,
  yearlyPriceUsd: 19.99,
  lifetimePriceUsd: 34.99,
  bkashNumber: '01700-000000',
  nagadNumber: '01800-000000',
  rocketNumber: '',
  paymentInstructions:
    'Send Money / Payment to the number above, then submit your Sender Number & Transaction ID (TrxID) below. Pro access unlocks immediately after verification.',
  announcementEnabled: false,
  announcementText: '',
  maintenanceMode: false,
  maintenanceMessage: 'Scheduled upgrade in progress. Please check back shortly.',
  minAppVersion: '1.0.0',
  supportEmail: ADMIN_EMAIL,
  adsEnabled: true,
  rewardedAdsEnabled: true,
  admobAppId: '',
  admobBannerUnitId: '',
  admobRewardedUnitId: '',
  adsensePublisherId: '',
  freeTrialDays: 30,
  updatedAt: new Date().toISOString(),
};

interface AppControlContextType {
  globalConfig: AppGlobalConfig;
  userAccess: UserAccessRecord | null;
  myPaymentRequests: PaymentRequestRecord[];
  isAdmin: boolean;
  isPro: boolean;
  hasPaidPro: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialEndsAt: number | null;
  rewardProExpiresAt: number | null;
  grantRewardedProPass: (hours?: number) => void;
  isSuspended: boolean;
  previewAsFree: boolean;
  setPreviewAsFree: (v: boolean) => void;

  // Upgrade modal state
  isUpgradeModalOpen: boolean;
  upgradeFeatureReason: string | null;
  openUpgradeModal: (featureReason?: string) => void;
  closeUpgradeModal: () => void;

  // User actions
  submitPaymentRequest: (data: {
    plan: Exclude<SubscriptionPlan, 'free'>;
    method: PaymentMethod;
    senderNumber: string;
    transactionId: string;
  }) => Promise<void>;
  restorePurchaseStatus: () => Promise<boolean>;

  // Admin state & actions
  allUsers: UserAccessRecord[];
  allPaymentRequests: PaymentRequestRecord[];
  updateGlobalConfig: (updates: Partial<AppGlobalConfig>) => Promise<void>;
  approvePaymentRequest: (req: PaymentRequestRecord, note?: string) => Promise<void>;
  rejectPaymentRequest: (reqId: string, note?: string) => Promise<void>;
  adminSetUserAccess: (
    targetUid: string,
    plan: SubscriptionPlan,
    status: 'active' | 'suspended',
    targetEmail?: string | null,
    targetName?: string | null
  ) => Promise<void>;
}

const AppControlContext = createContext<AppControlContextType | null>(null);

function computeExpiryIso(plan: SubscriptionPlan): string | null {
  if (plan === 'pro_monthly') {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  }
  if (plan === 'pro_yearly') {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  }
  return null;
}

export const AppControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [globalConfig, setGlobalConfig] = useState<AppGlobalConfig>(DEFAULT_APP_CONFIG);
  const [userAccess, setUserAccess] = useState<UserAccessRecord | null>(null);
  const [myPaymentRequests, setMyPaymentRequests] = useState<PaymentRequestRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccessRecord[]>([]);
  const [allPaymentRequests, setAllPaymentRequests] = useState<PaymentRequestRecord[]>([]);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);

  const [previewAsFree, setPreviewAsFree] = useState(false);
  const [rewardProExpiresAt, setRewardProExpiresAt] = useState<number | null>(null);
  const [guestOrFallbackTrialStart, setGuestOrFallbackTrialStart] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureReason, setUpgradeFeatureReason] = useState<string | null>(null);

  const isGuest = !user || user.uid.startsWith('guest_');

  // Track persistent trial start timestamp per user (Firestore userAccess.createdAt takes precedence when signed in)
  useEffect(() => {
    if (!user?.uid) {
      setGuestOrFallbackTrialStart(null);
      return;
    }
    try {
      const key = `focustrack_trial_start_${user.uid}`;
      let saved = localStorage.getItem(key);
      if (!saved) {
        saved = new Date().toISOString();
        localStorage.setItem(key, saved);
      }
      setGuestOrFallbackTrialStart(saved);
    } catch {
      setGuestOrFallbackTrialStart(new Date().toISOString());
    }
  }, [user?.uid]);

  // Load 24h Rewarded Ad Pro Pass per signed-in or guest user
  useEffect(() => {
    if (!user?.uid) {
      setRewardProExpiresAt(null);
      return;
    }
    try {
      const raw = localStorage.getItem(`focustrack_reward_pro_${user.uid}`);
      const parsed = raw ? parseInt(raw, 10) : 0;
      if (parsed > Date.now()) {
        setRewardProExpiresAt(parsed);
      } else {
        setRewardProExpiresAt(null);
        if (raw) localStorage.removeItem(`focustrack_reward_pro_${user.uid}`);
      }
    } catch {
      setRewardProExpiresAt(null);
    }
  }, [user?.uid]);

  const grantRewardedProPass = (hours = 24) => {
    const expires = Date.now() + hours * 60 * 60 * 1000;
    setRewardProExpiresAt(expires);
    if (user?.uid) {
      try {
        localStorage.setItem(`focustrack_reward_pro_${user.uid}`, String(expires));
      } catch {}
    }
  };

  const isAdmin = useMemo(() => {
    if (!user || isGuest) return false;
    const isVerifiedBootstrapped =
      (user.email || '').toLowerCase() === ADMIN_EMAIL &&
      (auth.currentUser?.emailVerified ?? true);
    return isVerifiedBootstrapped || hasAdminDoc;
  }, [user, isGuest, hasAdminDoc]);

  // 1. Subscribe to global appConfig/global
  useEffect(() => {
    const configRef = doc(db, 'appConfig', 'global');
    const unsub = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<AppGlobalConfig>;
          setGlobalConfig((prev) => ({
            ...DEFAULT_APP_CONFIG,
            ...prev,
            ...data,
          }));
        }
      },
      (err) => {
        console.warn('AppConfig listener note:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // 2. Check /admins/{uid} doc and register/sync /userAccess/{uid}
  useEffect(() => {
    if (!user || isGuest) {
      setUserAccess(null);
      setMyPaymentRequests([]);
      setHasAdminDoc(false);
      return;
    }

    const adminDocRef = doc(db, 'admins', user.uid);
    getDoc(adminDocRef)
      .then((snap) => setHasAdminDoc(snap.exists()))
      .catch(() => setHasAdminDoc(false));

    const accessRef = doc(db, 'userAccess', user.uid);
    const nowIso = new Date().toISOString();

    // Ensure userAccess document exists or update heartbeat fields allowed by rules
    getDoc(accessRef)
      .then(async (snap) => {
        if (!snap.exists()) {
          const initialAccess: UserAccessRecord = {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            plan: 'free',
            status: 'active',
            lastActiveAt: nowIso,
            createdAt: nowIso,
          };
          await setDoc(accessRef, initialAccess);
        } else {
          await updateDoc(accessRef, {
            email: user.email || null,
            displayName: user.displayName || null,
            lastActiveAt: nowIso,
          });
        }
      })
      .catch((err) => {
        console.warn('UserAccess sync warning:', err?.message);
      });

    const unsubAccess = onSnapshot(
      accessRef,
      (snap) => {
        if (snap.exists()) {
          setUserAccess(snap.data() as UserAccessRecord);
        } else {
          setUserAccess(null);
        }
      },
      (err) => {
        console.warn('UserAccess listener warning:', err?.message);
      }
    );

    const myPayQ = query(
      collection(db, 'paymentRequests'),
      where('userId', '==', user.uid)
    );
    const unsubMyPay = onSnapshot(
      myPayQ,
      (snap) => {
        const items = snap.docs
          .map((d) => d.data() as PaymentRequestRecord)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyPaymentRequests(items);
      },
      (err) => {
        console.warn('My payment requests listener warning:', err?.message);
      }
    );

    return () => {
      unsubAccess();
      unsubMyPay();
    };
  }, [user, isGuest]);

  // 3. Admin-only real-time listeners (all users & all payment requests)
  useEffect(() => {
    if (!isAdmin) {
      setAllUsers([]);
      setAllPaymentRequests([]);
      return;
    }

    const unsubUsers = onSnapshot(
      collection(db, 'userAccess'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as UserAccessRecord)
          .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
        setAllUsers(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'userAccess');
      }
    );

    const unsubPayments = onSnapshot(
      collection(db, 'paymentRequests'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as PaymentRequestRecord)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllPaymentRequests(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'paymentRequests');
      }
    );

    return () => {
      unsubUsers();
      unsubPayments();
    };
  }, [isAdmin]);

  // Determine paid Pro status, 30-day free trial status, and overall effective isPro
  const hasPaidPro = useMemo(() => {
    if (!userAccess || userAccess.status === 'suspended') return false;
    if (userAccess.plan === 'pro_lifetime') return true;
    if (userAccess.plan === 'pro_monthly' || userAccess.plan === 'pro_yearly') {
      if (!userAccess.proExpiresAt) return true;
      return new Date(userAccess.proExpiresAt).getTime() > Date.now();
    }
    return false;
  }, [userAccess]);

  const { isTrialActive, trialDaysRemaining, trialEndsAt } = useMemo(() => {
    const trialDays = globalConfig.freeTrialDays ?? 30;
    if (trialDays <= 0 || !user?.uid) {
      return { isTrialActive: false, trialDaysRemaining: 0, trialEndsAt: null };
    }
    const startIso = userAccess?.createdAt || guestOrFallbackTrialStart;
    if (!startIso) {
      return { isTrialActive: true, trialDaysRemaining: trialDays, trialEndsAt: null };
    }
    const startMs = Date.parse(startIso);
    if (Number.isNaN(startMs)) {
      return { isTrialActive: true, trialDaysRemaining: trialDays, trialEndsAt: null };
    }
    const endMs = startMs + trialDays * 24 * 60 * 60 * 1000;
    const diffMs = endMs - Date.now();
    if (diffMs <= 0) {
      return { isTrialActive: false, trialDaysRemaining: 0, trialEndsAt: endMs };
    }
    return {
      isTrialActive: true,
      trialDaysRemaining: Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000))),
      trialEndsAt: endMs,
    };
  }, [globalConfig.freeTrialDays, user?.uid, userAccess?.createdAt, guestOrFallbackTrialStart]);

  const isPro = useMemo(() => {
    if (isAdmin && !previewAsFree) return true;
    if (!globalConfig.paywallEnabled) return true;
    if (!previewAsFree && hasPaidPro) return true;
    if (!previewAsFree && rewardProExpiresAt && rewardProExpiresAt > Date.now()) return true;
    if (!previewAsFree && isTrialActive) return true;
    return false;
  }, [isAdmin, previewAsFree, hasPaidPro, rewardProExpiresAt, isTrialActive, globalConfig.paywallEnabled]);

  const isSuspended = !isAdmin && userAccess?.status === 'suspended';

  const openUpgradeModal = (featureReason?: string) => {
    setUpgradeFeatureReason(featureReason || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeFeatureReason(null);
  };

  const submitPaymentRequest = async (data: {
    plan: Exclude<SubscriptionPlan, 'free'>;
    method: PaymentMethod;
    senderNumber: string;
    transactionId: string;
  }) => {
    if (!user || isGuest) {
      throw new Error('Please sign in with Google first to upgrade to Pro.');
    }

    const requestId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const amountBdt =
      data.plan === 'pro_monthly'
        ? globalConfig.monthlyPriceBdt
        : data.plan === 'pro_yearly'
        ? globalConfig.yearlyPriceBdt
        : globalConfig.lifetimePriceBdt;

    const payload: PaymentRequestRecord = {
      id: requestId,
      userId: user.uid,
      userEmail: user.email || null,
      userName: user.displayName || null,
      plan: data.plan,
      amountBdt,
      method: data.method,
      senderNumber: data.senderNumber.trim(),
      transactionId: data.transactionId.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'paymentRequests', requestId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `paymentRequests/${requestId}`);
    }
  };

  const restorePurchaseStatus = async (): Promise<boolean> => {
    if (!user || isGuest) return false;
    const path = `userAccess/${user.uid}`;
    try {
      const snap = await getDoc(doc(db, 'userAccess', user.uid));
      if (snap.exists()) {
        const record = snap.data() as UserAccessRecord;
        setUserAccess(record);
        return record.plan !== 'free' && record.status === 'active';
      }
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  const updateGlobalConfig = async (updates: Partial<AppGlobalConfig>) => {
    if (!isAdmin) throw new Error('Unauthorized');
    const merged: AppGlobalConfig = {
      ...globalConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'appConfig', 'global'), merged);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appConfig/global');
    }
  };

  const approvePaymentRequest = async (req: PaymentRequestRecord, note?: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    const nowIso = new Date().toISOString();
    const expiry = computeExpiryIso(req.plan);
    const batch = writeBatch(db);

    const payRef = doc(db, 'paymentRequests', req.id);
    batch.update(payRef, {
      status: 'approved',
      adminNote: note?.trim() || 'Verified & Pro activated',
      reviewedAt: nowIso,
    });

    const userRef = doc(db, 'userAccess', req.userId);
    const existingUser = allUsers.find((u) => u.uid === req.userId);
    const updatedUser: UserAccessRecord = {
      uid: req.userId,
      email: existingUser?.email || req.userEmail || null,
      displayName: existingUser?.displayName || req.userName || null,
      plan: req.plan,
      status: 'active',
      proExpiresAt: expiry,
      grantedBy: user?.email || ADMIN_EMAIL,
      lastActiveAt: existingUser?.lastActiveAt || nowIso,
      createdAt: existingUser?.createdAt || nowIso,
    };
    batch.set(userRef, updatedUser);

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `paymentRequests/${req.id}`);
    }
  };

  const rejectPaymentRequest = async (reqId: string, note?: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await updateDoc(doc(db, 'paymentRequests', reqId), {
        status: 'rejected',
        adminNote: note?.trim() || 'Transaction ID could not be verified.',
        reviewedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `paymentRequests/${reqId}`);
    }
  };

  const adminSetUserAccess = async (
    targetUid: string,
    plan: SubscriptionPlan,
    status: 'active' | 'suspended',
    targetEmail?: string | null,
    targetName?: string | null
  ) => {
    if (!isAdmin) throw new Error('Unauthorized');
    const nowIso = new Date().toISOString();
    const existing = allUsers.find((u) => u.uid === targetUid);
    const payload: UserAccessRecord = {
      uid: targetUid,
      email: existing?.email ?? targetEmail ?? null,
      displayName: existing?.displayName ?? targetName ?? null,
      plan,
      status,
      proExpiresAt: plan === 'free' ? null : computeExpiryIso(plan),
      grantedBy: user?.email || ADMIN_EMAIL,
      lastActiveAt: existing?.lastActiveAt || nowIso,
      createdAt: existing?.createdAt || nowIso,
    };

    try {
      await setDoc(doc(db, 'userAccess', targetUid), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `userAccess/${targetUid}`);
    }
  };

  return (
    <AppControlContext.Provider
      value={{
        globalConfig,
        userAccess,
        myPaymentRequests,
        isAdmin,
        isPro,
        hasPaidPro,
        isTrialActive,
        trialDaysRemaining,
        trialEndsAt,
        rewardProExpiresAt,
        grantRewardedProPass,
        isSuspended,
        previewAsFree,
        setPreviewAsFree,
        isUpgradeModalOpen,
        upgradeFeatureReason,
        openUpgradeModal,
        closeUpgradeModal,
        submitPaymentRequest,
        restorePurchaseStatus,
        allUsers,
        allPaymentRequests,
        updateGlobalConfig,
        approvePaymentRequest,
        rejectPaymentRequest,
        adminSetUserAccess,
      }}
    >
      {children}
    </AppControlContext.Provider>
  );
};

export const useAppControl = () => {
  const ctx = useContext(AppControlContext);
  if (!ctx) {
    throw new Error('useAppControl must be used within AppControlProvider');
  }
  return ctx;
};
