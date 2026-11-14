import React, { useMemo, useState } from 'react';
import { useAppControl, CURRENT_APP_VERSION } from '../context/AppControlContext';
import { PaymentRequestRecord, SubscriptionPlan } from '../types';
import {
  ArrowLeft,
  Shield,
  Users,
  CreditCard,
  Sliders,
  Check,
  X,
  Crown,
  AlertTriangle,
  Megaphone,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Smartphone,
} from 'lucide-react';

interface AdminDashboardScreenProps {
  onBack: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack }) => {
  const {
    isAdmin,
    globalConfig,
    allUsers,
    allPaymentRequests,
    previewAsFree,
    setPreviewAsFree,
    updateGlobalConfig,
    approvePaymentRequest,
    rejectPaymentRequest,
    adminSetUserAccess,
  } = useAppControl();

  const [tab, setTab] = useState<'overview' | 'payments' | 'users' | 'config'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Local editable config state synced when opening config
  const [paywallEnabled, setPaywallEnabled] = useState(globalConfig.paywallEnabled);
  const [freeTrialDays, setFreeTrialDays] = useState(String(globalConfig.freeTrialDays ?? 30));
  const [freeMaxFolders, setFreeMaxFolders] = useState(String(globalConfig.freeMaxRootFolders));
  const [freeMaxMilestones, setFreeMaxMilestones] = useState(String(globalConfig.freeMaxMilestones));
  const [monthlyBdt, setMonthlyBdt] = useState(String(globalConfig.monthlyPriceBdt));
  const [yearlyBdt, setYearlyBdt] = useState(String(globalConfig.yearlyPriceBdt));
  const [lifetimeBdt, setLifetimeBdt] = useState(String(globalConfig.lifetimePriceBdt));
  const [bkashNumber, setBkashNumber] = useState(globalConfig.bkashNumber);
  const [nagadNumber, setNagadNumber] = useState(globalConfig.nagadNumber);
  const [rocketNumber, setRocketNumber] = useState(globalConfig.rocketNumber);
  const [paymentInstructions, setPaymentInstructions] = useState(globalConfig.paymentInstructions);
  const [announcementEnabled, setAnnouncementEnabled] = useState(globalConfig.announcementEnabled);
  const [announcementText, setAnnouncementText] = useState(globalConfig.announcementText);
  const [maintenanceMode, setMaintenanceMode] = useState(globalConfig.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(globalConfig.maintenanceMessage);
  const [adsEnabled, setAdsEnabled] = useState(globalConfig.adsEnabled ?? true);
  const [rewardedAdsEnabled, setRewardedAdsEnabled] = useState(globalConfig.rewardedAdsEnabled ?? true);
  const [admobAppId, setAdmobAppId] = useState(globalConfig.admobAppId || '');
  const [admobBannerUnitId, setAdmobBannerUnitId] = useState(globalConfig.admobBannerUnitId || '');
  const [admobRewardedUnitId, setAdmobRewardedUnitId] = useState(globalConfig.admobRewardedUnitId || '');
  const [adsensePublisherId, setAdsensePublisherId] = useState(globalConfig.adsensePublisherId || '');

  const stats = useMemo(() => {
    const proUsers = allUsers.filter((u) => u.plan !== 'free' && u.status === 'active').length;
    const pendingPayments = allPaymentRequests.filter((p) => p.status === 'pending').length;
    const approvedRevenueBdt = allPaymentRequests
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amountBdt || 0), 0);
    return {
      totalUsers: allUsers.length,
      proUsers,
      pendingPayments,
      approvedRevenueBdt,
    };
  }, [allUsers, allPaymentRequests]);

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-8 text-center space-y-3">
        <Shield className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Admin Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This control panel is restricted to authorized app administrators.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBusyId('config');
    setSaveNotice(null);
    try {
      await updateGlobalConfig({
        paywallEnabled,
        freeTrialDays: Math.max(0, Math.min(365, Number.isNaN(parseInt(freeTrialDays, 10)) ? 30 : parseInt(freeTrialDays, 10))),
        freeMaxRootFolders: Math.max(1, Math.min(100, parseInt(freeMaxFolders, 10) || 3)),
        freeMaxMilestones: Math.max(1, Math.min(100, parseInt(freeMaxMilestones, 10) || 2)),
        monthlyPriceBdt: Math.max(0, parseInt(monthlyBdt, 10) || 99),
        yearlyPriceBdt: Math.max(0, parseInt(yearlyBdt, 10) || 799),
        lifetimePriceBdt: Math.max(0, parseInt(lifetimeBdt, 10) || 1499),
        bkashNumber: bkashNumber.trim(),
        nagadNumber: nagadNumber.trim(),
        rocketNumber: rocketNumber.trim(),
        paymentInstructions: paymentInstructions.trim(),
        announcementEnabled,
        announcementText: announcementText.trim(),
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim(),
        adsEnabled,
        rewardedAdsEnabled,
        admobAppId: admobAppId.trim().slice(0, 120),
        admobBannerUnitId: admobBannerUnitId.trim().slice(0, 120),
        admobRewardedUnitId: admobRewardedUnitId.trim().slice(0, 120),
        adsensePublisherId: adsensePublisherId.trim().slice(0, 120),
      });
      setSaveNotice('Global app configuration saved to Firestore.');
      window.setTimeout(() => setSaveNotice(null), 2500);
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (req: PaymentRequestRecord) => {
    setBusyId(req.id);
    try {
      await approvePaymentRequest(req);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reqId: string) => {
    setBusyId(reqId);
    try {
      await rejectPaymentRequest(reqId);
    } finally {
      setBusyId(null);
    }
  };

  const filteredPayments = allPaymentRequests.filter((p) =>
    paymentFilter === 'pending' ? p.status === 'pending' : true
  );

  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-200">
      {/* Admin Top Bar */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#1c1f2e] text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            aria-label="Back to app"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--app-accent)]" />
              <span>Admin Control Center</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manage Pro subscriptions, payments, users, pricing &amp; live app config
            </p>
          </div>
        </div>

        {/* Preview Paywall as Free User Toggle */}
        <button
          type="button"
          onClick={() => setPreviewAsFree(!previewAsFree)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            previewAsFree
              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-[#1b1d2b] border-slate-200 dark:border-[#2a2e42] text-slate-700 dark:text-slate-200'
          }`}
        >
          {previewAsFree ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{previewAsFree ? 'Previewing Free Mode' : 'Preview Free Paywall'}</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Registered Users
          </span>
          <span className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            {stats.totalUsers}
          </span>
        </div>

        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Active Pro Users
          </span>
          <span className="text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.proUsers}
          </span>
        </div>

        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Pending Payments
          </span>
          <span className="text-xl font-black font-mono tabular-nums text-amber-500 mt-1 block">
            {stats.pendingPayments}
          </span>
        </div>

        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Verified Revenue
          </span>
          <span className="text-xl font-black font-mono tabular-nums text-[var(--app-accent)] mt-1 block">
            ৳{stats.approvedRevenueBdt}
          </span>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434]">
        {[
          { id: 'overview', label: 'Controls', icon: <Megaphone className="w-3.5 h-3.5" /> },
          {
            id: 'payments',
            label: `Payments${stats.pendingPayments > 0 ? ` (${stats.pendingPayments})` : ''}`,
            icon: <CreditCard className="w-3.5 h-3.5" />,
          },
          { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'config', label: 'Pricing & APK', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tab === item.id
                ? 'bg-[var(--app-accent)] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {saveNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* TAB 1: Overview & Broadcast Controls */}
      {tab === 'overview' && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Pro Paywall Enforcement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When enabled, new users get a {freeTrialDays || 30}-day free trial, then only Timer &amp; Salah stay free (Pro locks Heatmap, History, Soundscapes, Zen Mode, Custom Themes, Extra Folders &amp; Sub-Folders)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaywallEnabled((p) => !p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shrink-0 ${
                  paywallEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-[#24283b] text-slate-700 dark:text-slate-300'
                }`}
              >
                {paywallEnabled ? 'Paywall ON' : 'Paywall OFF'}
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-[#222536] pt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Global App Notice Banner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Show an announcement banner to every user in real time
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncementEnabled((p) => !p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                    announcementEnabled
                      ? 'bg-[var(--app-accent)] text-white'
                      : 'bg-slate-200 dark:bg-[#24283b] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {announcementEnabled ? 'Active' : 'Off'}
                </button>
              </div>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Eid Special Offer: 50% off Lifetime Pro until Friday!"
                className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-[#222536] pt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Maintenance Mode</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Temporarily lock non-admin screens during server updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode((p) => !p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                    maintenanceMode
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-[#24283b] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {maintenanceMode ? 'Locked' : 'Normal'}
                </button>
              </div>
              <input
                type="text"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Maintenance notice message..."
                className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-[#222536] pt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Banner Ads for Free Users
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Shown cleanly to Free users only (automatically hidden for Pro, active timer, and Salah tab)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdsEnabled((p) => !p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shrink-0 ${
                    adsEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-[#24283b] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {adsEnabled ? 'Ads ON' : 'Ads OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Rewarded Ad (24h Free Pro Pass)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Let Free users watch a short ad inside the Upgrade sheet to unlock Pro for 24 hours
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRewardedAdsEnabled((p) => !p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shrink-0 ${
                    rewardedAdsEnabled
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-[#24283b] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {rewardedAdsEnabled ? 'Reward ON' : 'Reward OFF'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busyId === 'config'}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {busyId === 'config' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Controls</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Payment Requests */}
      {tab === 'payments' && (
        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Payment Verifications ({filteredPayments.length})
            </h3>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1a1d2b] text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentFilter('pending')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  paymentFilter === 'pending'
                    ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  paymentFilter === 'all'
                    ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No {paymentFilter === 'pending' ? 'pending' : ''} payment requests yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredPayments.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {req.userName || req.userEmail || req.userId}
                      </span>
                      <span className="font-mono font-bold text-[var(--app-accent)]">
                        ৳{req.amountBdt} · {req.plan.replace('pro_', 'Pro ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      {req.userEmail} · {req.method.toUpperCase()} from{' '}
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {req.senderNumber}
                      </span>{' '}
                      · TrxID:{' '}
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {req.transactionId}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(req.createdAt).toLocaleString()} · Status:{' '}
                      <strong className="uppercase">{req.status}</strong>
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busyId === req.id}
                        onClick={() => handleApprove(req)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Pro</span>
                      </button>
                      <button
                        type="button"
                        disabled={busyId === req.id}
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Users & Access Control */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Registered Users ({filteredUsers.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search email or name..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {filteredUsers.map((u) => (
              <div
                key={u.uid}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#26293b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {u.displayName || 'Unnamed User'}
                    </span>
                    {u.plan !== 'free' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Crown className="w-3 h-3" /> {u.plan.replace('pro_', 'Pro ')}
                      </span>
                    )}
                    {u.status === 'suspended' && (
                      <span className="text-[10px] font-bold text-rose-500">SUSPENDED</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {u.email || u.uid} · Last active {new Date(u.lastActiveAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <select
                    value={u.plan}
                    onChange={(e) =>
                      adminSetUserAccess(
                        u.uid,
                        e.target.value as SubscriptionPlan,
                        u.status,
                        u.email,
                        u.displayName
                      )
                    }
                    className="bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#2b2e42] rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="free">Free Plan</option>
                    <option value="pro_monthly">Pro Monthly</option>
                    <option value="pro_yearly">Pro Yearly</option>
                    <option value="pro_lifetime">Pro Lifetime</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      adminSetUserAccess(
                        u.uid,
                        u.plan,
                        u.status === 'active' ? 'suspended' : 'active',
                        u.email,
                        u.displayName
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                      u.status === 'active'
                        ? 'border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : 'border-emerald-300 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Pricing, Limits & Play Store Readiness */}
      {tab === 'config' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSaveConfig}
            className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 space-y-4 text-xs"
          >
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Pricing, Free Limits &amp; Wallet Numbers
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Free Trial (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={freeTrialDays}
                  onChange={(e) => setFreeTrialDays(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Free Max Folders
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={freeMaxFolders}
                  onChange={(e) => setFreeMaxFolders(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Free Max Milestones
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={freeMaxMilestones}
                  onChange={(e) => setFreeMaxMilestones(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Monthly (BDT ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyBdt}
                  onChange={(e) => setMonthlyBdt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Yearly (BDT ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={yearlyBdt}
                  onChange={(e) => setYearlyBdt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Lifetime (BDT ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lifetimeBdt}
                  onChange={(e) => setLifetimeBdt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  bKash Number
                </label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="017..."
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Nagad Number
                </label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="018..."
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Rocket Number (Optional)
                </label>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                  placeholder="01..."
                  className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Payment Instructions
              </label>
              <textarea
                rows={2}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2"
              />
            </div>

              <div className="border-t border-slate-100 dark:border-[#222536] pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Google AdMob &amp; AdSense IDs
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Add your real publisher &amp; unit IDs to monetize Free users on Web (AdSense) and Android APK (AdMob). Also update <code>/public/app-ads.txt</code> with your publisher ID.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      AdSense Publisher ID (Web)
                    </label>
                    <input
                      type="text"
                      value={adsensePublisherId}
                      onChange={(e) => setAdsensePublisherId(e.target.value)}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      AdMob App ID (Android APK)
                    </label>
                    <input
                      type="text"
                      value={admobAppId}
                      onChange={(e) => setAdmobAppId(e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxx~xxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      AdMob Banner Ad Unit ID
                    </label>
                    <input
                      type="text"
                      value={admobBannerUnitId}
                      onChange={(e) => setAdmobBannerUnitId(e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      AdMob Rewarded Ad Unit ID
                    </label>
                    <input
                      type="text"
                      value={admobRewardedUnitId}
                      onChange={(e) => setAdmobRewardedUnitId(e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d40] rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>

            <button
              type="submit"
              disabled={busyId === 'config'}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              {busyId === 'config' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Pricing, Payment &amp; Ads Settings</span>
            </button>
          </form>

          {/* Play Store & APK Readiness Status */}
          <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Play Store / APK Launch Checklist (v{CURRENT_APP_VERSION})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'PWA Manifest + App Shortcuts + Maskable 512px Icon',
                'Offline Service Worker & Local Cache Sync',
                'Privacy Policy, Terms & Refund Policy Screen',
                'In-App Account & Data Deletion (Play Store Mandatory)',
                'Digital Asset Links Template (.well-known/assetlinks.json)',
                'AdMob / AdSense Ready + app-ads.txt Verification File',
                'Subscription Restore & Admin Billing Controls',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
