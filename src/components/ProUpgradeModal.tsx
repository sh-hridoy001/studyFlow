import React, { useEffect, useState } from 'react';
import { useAppControl } from '../context/AppControlContext';
import { useAuth } from '../context/AuthContext';
import { showNativeRewardedAd } from '../services/adsService';
import { PaymentMethod, SubscriptionPlan } from '../types';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Copy,
  Loader2,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  PlayCircle,
  Gift,
} from 'lucide-react';

export const ProUpgradeModal: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const {
    isUpgradeModalOpen,
    upgradeFeatureReason,
    closeUpgradeModal,
    globalConfig,
    isPro,
    hasPaidPro,
    isTrialActive,
    trialDaysRemaining,
    rewardProExpiresAt,
    grantRewardedProPass,
    userAccess,
    myPaymentRequests,
    submitPaymentRequest,
    restorePurchaseStatus,
  } = useAppControl();

  const [selectedPlan, setSelectedPlan] = useState<Exclude<SubscriptionPlan, 'free'>>('pro_yearly');
  const [paymentTab, setPaymentTab] = useState<'mobile_banking' | 'store_billing'>('mobile_banking');
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [rewardState, setRewardState] = useState<'idle' | 'watching' | 'unlocked'>('idle');
  const [rewardSecondsLeft, setRewardSecondsLeft] = useState(5);

  useEffect(() => {
    if (rewardState !== 'watching') return;
    if (rewardSecondsLeft <= 0) {
      grantRewardedProPass(24);
      setRewardState('unlocked');
      return;
    }
    const timer = window.setTimeout(() => {
      setRewardSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [rewardState, rewardSecondsLeft, grantRewardedProPass]);

  if (!isUpgradeModalOpen) return null;

  const handleStartRewardedAd = async () => {
    setErrorMsg(null);
    const nativeDone = await showNativeRewardedAd(globalConfig.admobRewardedUnitId);
    if (nativeDone) {
      grantRewardedProPass(24);
      setRewardState('unlocked');
      return;
    }
    setRewardSecondsLeft(5);
    setRewardState('watching');
  };

  const isGuest = !user || user.uid.startsWith('guest_');

  const plans: Array<{
    id: Exclude<SubscriptionPlan, 'free'>;
    name: string;
    bdt: number;
    usd: number;
    period: string;
    badge?: string;
  }> = [
    {
      id: 'pro_monthly',
      name: 'Monthly',
      bdt: globalConfig.monthlyPriceBdt,
      usd: globalConfig.monthlyPriceUsd,
      period: '/ month',
    },
    {
      id: 'pro_yearly',
      name: 'Yearly',
      bdt: globalConfig.yearlyPriceBdt,
      usd: globalConfig.yearlyPriceUsd,
      period: '/ year',
      badge: 'Best Value',
    },
    {
      id: 'pro_lifetime',
      name: 'Lifetime',
      bdt: globalConfig.lifetimePriceBdt,
      usd: globalConfig.lifetimePriceUsd,
      period: 'one-time',
    },
  ];

  const activePlanObj = plans.find((p) => p.id === selectedPlan) || plans[1];

  const rawPaymentNumbers: Array<{ id: PaymentMethod; label: string; number: string }> = [
    { id: 'bkash', label: 'bKash', number: globalConfig.bkashNumber },
    { id: 'nagad', label: 'Nagad', number: globalConfig.nagadNumber },
    { id: 'rocket', label: 'Rocket', number: globalConfig.rocketNumber },
  ];
  const paymentNumbers = rawPaymentNumbers.filter(
    (item) => item.number && item.number.trim().length > 0
  );

  const selectedMethodNumber =
    paymentNumbers.find((p) => p.id === method)?.number ||
    paymentNumbers[0]?.number ||
    'Contact admin for payment number';

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(num);
    window.setTimeout(() => setCopiedNum(null), 1800);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitSuccess(false);

    if (!senderNumber.trim() || !transactionId.trim()) {
      setErrorMsg('Please enter both your sender number and Transaction ID (TrxID).');
      return;
    }

    setSubmitting(true);
    try {
      await submitPaymentRequest({
        plan: selectedPlan,
        method,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim(),
      });
      setSubmitSuccess(true);
      setSenderNumber('');
      setTransactionId('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not submit verification request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setRestoreMsg(null);
    try {
      const restored = await restorePurchaseStatus();
      setRestoreMsg(
        restored
          ? 'Pro membership restored and active on this account.'
          : 'No active Pro subscription found for this account yet.'
      );
    } catch {
      setRestoreMsg('Unable to check subscription status right now.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={closeUpgradeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242738] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto text-slate-900 dark:text-white animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-label="Upgrade to FocusTrack Pro"
      >
        {/* Top Grab Handle on Mobile */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-200 dark:border-[#222536] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--app-accent)] to-amber-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                FocusTrack Pro
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {upgradeFeatureReason
                  ? `Unlock ${upgradeFeatureReason} & all premium tools`
                  : 'Unlock unlimited folders, heatmap, history, soundscapes & custom themes'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            aria-label="Close upgrade modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Active Pro or Trial Status Banner */}
          {hasPaidPro ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold">FocusTrack Pro is Active</span>
                {userAccess?.proExpiresAt ? (
                  <span className="block text-[11px] opacity-80">
                    Valid until {new Date(userAccess.proExpiresAt).toLocaleDateString()}
                  </span>
                ) : rewardProExpiresAt && rewardProExpiresAt > Date.now() ? (
                  <span className="block text-[11px] opacity-80">
                    24h Reward Pass active until {new Date(rewardProExpiresAt).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          ) : isTrialActive ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-700/50 flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
              <div>
                <span className="font-bold block">
                  {globalConfig.freeTrialDays ?? 30}-Day Free Trial Active · {trialDaysRemaining}{' '}
                  {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
                <span className="block text-[11px] opacity-85 mt-0.5">
                  All features are unlocked during your trial. After {trialDaysRemaining}{' '}
                  {trialDaysRemaining === 1 ? 'day' : 'days'}, only the Study Timer &amp; 5-Time Salah Tracker stay free unless you upgrade.
                </span>
              </div>
            </div>
          ) : !isPro ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-bold block">Your {globalConfig.freeTrialDays ?? 30}-Day Free Trial Has Ended</span>
                <span className="block text-[11px] opacity-85 mt-0.5">
                  Study Timer &amp; 5-Time Salah Tracker stay free forever. Upgrade to restore Heatmap, History, Custom Themes, Soundscapes &amp; Unlimited Folders.
                </span>
              </div>
            </div>
          ) : null}

          {/* Free 24-Hour Pro Pass via Rewarded Ad */}
          {!isPro && globalConfig.rewardedAdsEnabled !== false && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-700/40 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Try All Pro Features Free for 24 Hours
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Watch a short 5-second sponsor preview to unlock Heatmap, History, Soundscapes, Custom Themes &amp; Unlimited Folders for 24h.
                    </p>
                  </div>
                </div>
              </div>

              {rewardState === 'watching' ? (
                <div className="p-3 rounded-xl bg-white dark:bg-[#12131c] border border-amber-300 dark:border-amber-700/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Sponsor preview playing... Unlocking Pro in {rewardSecondsLeft}s
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    {rewardSecondsLeft}s
                  </span>
                </div>
              ) : rewardState === 'unlocked' ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>24-Hour Pro Pass unlocked! Enjoy all Pro features ad-free.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRewardedAd}
                  className="w-full py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Watch Short Ad · Unlock 24h Free Pro</span>
                </button>
              )}
            </div>
          )}

          {/* Pro Benefits List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              'Activity Heatmap & Full Study History',
              'Warm Paper, AMOLED & Custom Themes',
              'Unlimited Folders & Nested Sub-Folders',
              'Soundscapes Studio, Zen Mode & Goals',
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#181a26] border border-slate-200/80 dark:border-[#26293b]"
              >
                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{feat}</span>
              </div>
            ))}
          </div>

          {/* Plan Picker */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              1. Choose Plan
            </span>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                      selected
                        ? 'bg-[var(--app-accent-soft)] border-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/40'
                        : 'bg-slate-50 dark:bg-[#181a26] border-slate-200 dark:border-[#26293b] hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {plan.badge && (
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[var(--app-accent)] mb-0.5">
                        {plan.badge}
                      </span>
                    )}
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {plan.name}
                    </div>
                    <div className="mt-1 font-mono tabular-nums text-base font-black text-slate-900 dark:text-white">
                      ৳{plan.bdt}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      ${plan.usd} {plan.period}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              2. Payment Method
            </span>

            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b]">
              <button
                type="button"
                onClick={() => setPaymentTab('mobile_banking')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentTab === 'mobile_banking'
                    ? 'bg-white dark:bg-[#24283b] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                <span>bKash / Nagad</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('store_billing')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentTab === 'store_billing'
                    ? 'bg-white dark:bg-[#24283b] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                <span>Play / App Store</span>
              </button>
            </div>

            {paymentTab === 'mobile_banking' ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] space-y-3.5">
                {isGuest ? (
                  <div className="text-center py-3 space-y-2.5">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Sign in with your Google account first so Pro access is permanently linked to your account across devices.
                    </p>
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="px-4 py-2.5 rounded-xl bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-xs font-bold cursor-pointer"
                    >
                      Continue with Google
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Wallet Selector */}
                    {paymentNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {paymentNumbers.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMethod(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              method === item.id
                                ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]'
                                : 'bg-white dark:bg-[#12131c] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#2b2e42]'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Copyable Payment Number */}
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40]">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Send ৳{activePlanObj.bdt} ({activePlanObj.name}) to:
                        </span>
                        <span className="font-mono tabular-nums text-sm font-extrabold text-slate-900 dark:text-white select-all">
                          {selectedMethodNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(selectedMethodNumber)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e2130] hover:bg-slate-200 dark:hover:bg-[#272b3e] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedNum === selectedMethodNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {globalConfig.paymentInstructions}
                    </p>

                    {errorMsg && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Payment verification submitted! Admin will review your TrxID shortly and unlock Pro on your account.
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitPayment} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="Your Sender Number (e.g. 017...)"
                          className="w-full bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
                        />
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Transaction ID (TrxID)"
                          className="w-full bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 px-4 rounded-xl bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Submit Payment Verification</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    When installed from <strong>Google Play Store</strong> or <strong>Apple App Store</strong>, native in-app billing (${activePlanObj.usd} {activePlanObj.period}) unlocks Pro instantly via Play Billing / StoreKit.
                  </p>
                </div>

                {restoreMsg && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2b2e42] text-slate-700 dark:text-slate-200">
                    {restoreMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring || isGuest}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2b2e42] hover:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRestoring ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>Restore Purchase</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Payment Requests by This User */}
          {myPaymentRequests.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#222536]">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Your Payment History
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {myPaymentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] text-[11px]"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                        {req.plan.replace('pro_', 'Pro ').toUpperCase()} · {req.method.toUpperCase()} ({req.transactionId})
                      </span>
                      <span className="text-slate-400 block truncate">
                        ৳{req.amountBdt} · {new Date(req.createdAt).toLocaleDateString()}
                        {req.adminNote ? ` · ${req.adminNote}` : ''}
                      </span>
                    </div>
                    <span
                      className={`font-bold shrink-0 flex items-center gap-1 ${
                        req.status === 'approved'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : req.status === 'rejected'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                      <span className="capitalize">{req.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
