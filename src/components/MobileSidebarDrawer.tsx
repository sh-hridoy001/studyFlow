import React, { useEffect, useMemo, useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { useAppControl, ADMIN_EMAIL } from '../context/AppControlContext';
import {
  X,
  FolderPlus,
  Folders,
  Folder,
  FolderOpen,
  Sun,
  Moon,
  RotateCcw,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Target,
  Clock,
  CheckSquare,
  ShieldCheck,
  Plus,
  Check,
  ArrowUpRight,
  MoreVertical,
  Trash2,
  SlidersHorizontal,
  Crown,
  Shield,
  Palette,
  Sparkles,
  HelpCircle,
  Mail,
  Lock,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLongPress } from '../hooks/useLongPress';
import { FolderSettingsModal } from './FolderSettingsModal';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { ActiveMainTab, FolderDefinition, GlassEffectLevel, SurfaceThemeId } from '../types';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFoldersPage: (autoCreate?: boolean, fromSidebar?: boolean) => void;
  onNavigateSubView?: (tab: ActiveMainTab, folderId?: string | null) => void;
  onNavigateRootTab?: (tab: ActiveMainTab) => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
  onOpenResetAllData: () => void;
  onStartTour?: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenFoldersPage,
  onNavigateSubView,
  onNavigateRootTab,
  onOpenResetDay,
  onOpenSyncCalendar,
  onOpenResetAllData,
  onStartTour,
}) => {
  const {
    folders,
    activeTab,
    setActiveTab,
    surfaceTheme,
    setSurfaceTheme,
    accentColor,
    setAccentColor,
    glassMode,
    setGlassMode,
    auroraRing,
    setAuroraRing,
    customThemes,
    addCustomTheme,
    deleteCustomTheme,
    syncStatus,
    todaySalahCount,
    setSelectedFolderId,
    addFolder,
    addSubjectToFolder,
    deleteSubjectFromFolder,
  } = useStudy();

  const { user, logout } = useAuth();
  const {
    globalConfig,
    isAdmin,
    isPro,
    hasPaidPro,
    isTrialActive,
    trialDaysRemaining,
    previewAsFree,
    allPaymentRequests,
    openUpgradeModal,
  } = useAppControl();
  const [settingsFolderId, setSettingsFolderId] = useState<string | null>(null);

  // Custom Theme Studio state
  const [isAddingCustomTheme, setIsAddingCustomTheme] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeColor, setCustomThemeColor] = useState('#ec4899');
  const [customThemeSurface, setCustomThemeSurface] = useState<SurfaceThemeId>(surfaceTheme);

  // Accordion states
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(true);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({});

  // Root folder quick inline creator
  const [isAddingRootFolder, setIsAddingRootFolder] = useState(false);
  const [rootFolderName, setRootFolderName] = useState('');
  const [rootFolderColor, setRootFolderColor] = useState(
    FOLDER_COLOR_PRESETS[0]?.color || '#4F46E5'
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const folderIdSet = useMemo(
    () => new Set(folders.map((f) => String(f.id))),
    [folders]
  );

  const rootFolders = useMemo(
    () => folders.filter((f) => !f.parentId || !folderIdSet.has(String(f.parentId))),
    [folders, folderIdSet]
  );

  const childrenByParentId = useMemo(() => {
    const map: Record<string, FolderDefinition[]> = {};
    folders.forEach((f) => {
      if (f.parentId && folderIdSet.has(String(f.parentId))) {
        const key = String(f.parentId);
        if (!map[key]) map[key] = [];
        map[key].push(f);
      }
    });
    return map;
  }, [folders, folderIdSet]);

  if (!isOpen) return null;

  const pendingPaymentsCount = allPaymentRequests.filter((p) => p.status === 'pending').length;

  const toggleFolderAccordion = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const expandFolderAccordion = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: true,
    }));
  };

  const handleCreateRootFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro && rootFolders.length >= globalConfig.freeMaxRootFolders) {
      onClose();
      openUpgradeModal('Unlimited Study Folders');
      return;
    }
    const trimmed = rootFolderName.trim();
    if (!trimmed) return;
    const created = addFolder({
      name: trimmed,
      color: rootFolderColor,
      subjects: [],
      parentId: null,
    });
    setRootFolderName('');
    setIsAddingRootFolder(false);
    setIsManageFoldersOpen(true);
    expandFolderAccordion(created.id);
  };

  const navigateSubView = (tab: ActiveMainTab, folderId: string | null = null) => {
    if (onNavigateSubView) {
      onNavigateSubView(tab, folderId);
    } else {
      setSelectedFolderId(folderId);
      setActiveTab(tab);
    }
  };

  const navigateRootTab = (tab: ActiveMainTab) => {
    if (onNavigateRootTab) {
      onNavigateRootTab(tab);
    } else {
      setSelectedFolderId(null);
      setActiveTab(tab);
    }
  };

  const handleOpenFolderWorkspace = (folderId: string) => {
    onClose();
    navigateSubView('routine', folderId);
  };

  const navItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    badge?: string;
    onClick: () => void;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: <Clock className="w-3.5 h-3.5" />,
      active: activeTab === 'routine',
      onClick: () => {
        onClose();
        navigateRootTab('routine');
      },
    },
    {
      id: 'folders',
      label: 'All Folders',
      icon: <Folder className="w-3.5 h-3.5" />,
      active: activeTab === 'folders',
      badge: String(rootFolders.length),
      onClick: () => {
        onClose();
        onOpenFoldersPage(false, true);
      },
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      active: activeTab === 'tasks',
      onClick: () => {
        onClose();
        navigateRootTab('tasks');
      },
    },
    {
      id: 'salah',
      label: '5-Time Salah',
      icon: <Moon className="w-3.5 h-3.5" />,
      active: activeTab === 'salah',
      badge: `${todaySalahCount}/5`,
      onClick: () => {
        onClose();
        navigateRootTab('salah');
      },
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: <Target className="w-3.5 h-3.5" />,
      active: activeTab === 'milestones',
      onClick: () => {
        onClose();
        navigateRootTab('milestones');
      },
    },
    {
      id: 'history',
      label: 'History',
      icon: <Calendar className="w-3.5 h-3.5" />,
      active: activeTab === 'history',
      onClick: () => {
        onClose();
        navigateRootTab('history');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Mobile App Settings & Navigation Panel */}
      <div
        className={`relative w-full max-w-[360px] sm:max-w-sm text-slate-900 dark:text-white h-full shadow-2xl flex flex-col z-10 border-l animate-in slide-in-from-right duration-200 ${
          surfaceTheme === 'midnight-glass'
            ? 'bg-[#071947]/92 backdrop-blur-xl border-sky-300/20'
            : glassMode !== 'off'
            ? 'bg-white/88 dark:bg-[#101118]/86 backdrop-blur-xl border-slate-200/80 dark:border-white/15'
            : 'bg-[#f8f9fc] dark:bg-[#101118] border-slate-200 dark:border-[#222434]'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${
            surfaceTheme === 'midnight-glass'
              ? 'bg-[#091f56]/80 border-sky-300/20'
              : glassMode !== 'off'
              ? 'bg-white/70 dark:bg-[#141621]/70 border-slate-200/80 dark:border-white/10'
              : 'bg-white dark:bg-[#141621] border-slate-200 dark:border-[#212332]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 6px 14px -4px ${accentColor}66`,
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                Settings &amp; Workspace
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                FocusTrack App Preferences
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
          {/* User Profile Summary Card */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] shadow-2xs flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full ring-2 object-cover shrink-0"
                style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #4f46e5)` }}
              >
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {user?.displayName || 'Study Master'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'Offline Guest Account'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1c1f2e] shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500'
                    : syncStatus === 'saving'
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {syncStatus === 'synced'
                  ? 'Synced'
                  : syncStatus === 'saving'
                  ? 'Saving'
                  : 'Local'}
              </span>
            </div>
          </div>

          {/* Admin Control Center Shortcut + Pro Membership Card */}
          <div className="space-y-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateSubView('admin');
                }}
                className="w-full p-3 rounded-2xl bg-slate-900 dark:bg-indigo-950/70 border border-slate-800 dark:border-indigo-500/40 text-white flex items-center justify-between gap-2.5 shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold block truncate">
                      Admin Control Center
                    </span>
                    <span className="text-[10px] text-slate-300 block truncate">
                      {previewAsFree
                        ? 'Previewing Free Paywall Mode'
                        : 'Manage pricing, paywall & TrxIDs'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {pendingPaymentsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--app-accent)] text-white font-mono tabular-nums text-[10px] font-extrabold">
                      {pendingPaymentsCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                openUpgradeModal();
              }}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                isPro
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-700/40 text-emerald-800 dark:text-emerald-200'
                  : 'bg-[var(--app-accent-soft)] border-[var(--app-accent)]/40 text-slate-900 dark:text-white hover:border-[var(--app-accent)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isPro ? 'bg-emerald-500 text-white' : 'text-white'
                  }`}
                  style={!isPro ? { backgroundColor: accentColor } : undefined}
                >
                  <Crown className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-extrabold block truncate">
                    {hasPaidPro
                      ? 'FocusTrack Pro Active'
                      : isTrialActive
                      ? `${globalConfig.freeTrialDays ?? 30}-Day Free Trial · ${trialDaysRemaining}d Left`
                      : 'Upgrade to FocusTrack Pro'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {hasPaidPro
                      ? 'All folders, heatmap, history & themes unlocked'
                      : isTrialActive
                      ? 'Full features unlocked · Tap to upgrade anytime'
                      : `Trial ended (Timer & Salah only) · From ৳${globalConfig.monthlyPriceBdt}/mo`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Section 1: Quick Screen Navigation */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 px-1">
              Navigation
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-[0.98] ${
                    item.active
                      ? 'text-white shadow-xs'
                      : 'bg-white dark:bg-[#151722] border-slate-200 dark:border-[#232638] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={
                    item.active
                      ? { backgroundColor: accentColor, borderColor: accentColor }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={item.active ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ${
                        item.active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#1e2130] text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Manage Folders (Nested Folder-by-Folder Accordion) */}
          <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] shadow-2xs overflow-hidden">
            {/* Manage Folders Accordion Header */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-3 bg-slate-50/70 dark:bg-[#181b28] border-b border-slate-200/70 dark:border-[#232638]">
              <button
                type="button"
                onClick={() => setIsManageFoldersOpen((prev) => !prev)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)] flex items-center justify-center shrink-0">
                  <Folders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Manage Folders
                    </span>
                    <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-md bg-slate-200/80 dark:bg-[#25283a] text-slate-600 dark:text-slate-300">
                      {folders.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    Create sub-folders or subjects inside any folder
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAddingRootFolder && !isPro && rootFolders.length >= globalConfig.freeMaxRootFolders) {
                      onClose();
                      openUpgradeModal('Unlimited Study Folders');
                      return;
                    }
                    setIsManageFoldersOpen(true);
                    setIsAddingRootFolder((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    isAddingRootFolder
                      ? 'bg-slate-200 dark:bg-[#262a3d] text-slate-700 dark:text-slate-200'
                      : 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white'
                  }`}
                >
                  {isAddingRootFolder ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  <span>{isAddingRootFolder ? 'Close' : 'New'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsManageFoldersOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  aria-label="Toggle Manage Folders accordion"
                >
                  {isManageFoldersOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Accordion Body */}
            {isManageFoldersOpen && (
              <div className="p-2.5 space-y-2">
                {/* Inline Root Folder Creator */}
                {isAddingRootFolder && (
                  <form
                    onSubmit={handleCreateRootFolder}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1d2b] border border-dashed border-[var(--app-accent)]/50 space-y-2 animate-in fade-in duration-150"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={rootFolderName}
                      onChange={(e) => setRootFolderName(e.target.value)}
                      placeholder="New folder name..."
                      className="w-full bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[var(--app-accent)]"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {FOLDER_COLOR_PRESETS.slice(0, 7).map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => setRootFolderColor(preset.color)}
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-white cursor-pointer transition-transform ${
                              rootFolderColor === preset.color
                                ? 'scale-115 ring-2 ring-offset-1 ring-slate-900 dark:ring-white'
                                : 'opacity-75 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          >
                            {rootFolderColor === preset.color && (
                              <Check className="w-2.5 h-2.5" />
                            )}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        disabled={!rootFolderName.trim()}
                        className="px-2.5 py-1 rounded-lg bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {/* Recursive Folder-by-Folder Accordions */}
                <div className="space-y-1.5">
                  {rootFolders.map((folder) => (
                    <FolderAccordionNode
                      key={folder.id}
                      folder={folder}
                      depth={0}
                      isPro={isPro}
                      onRequirePro={(feature) => {
                        onClose();
                        openUpgradeModal(feature);
                      }}
                      childrenByParentId={childrenByParentId}
                      expandedFolderIds={expandedFolderIds}
                      onToggleExpand={toggleFolderAccordion}
                      onExpandFolder={expandFolderAccordion}
                      onOpenWorkspace={handleOpenFolderWorkspace}
                      onOpenSettings={(fId) => setSettingsFolderId(fId)}
                      onCreateSubFolder={(parentId, name, color) => {
                        const created = addFolder({
                          name,
                          color,
                          subjects: [],
                          parentId,
                        });
                        expandFolderAccordion(parentId);
                        expandFolderAccordion(created.id);
                      }}
                      onAddSubject={(fId, subj) => {
                        addSubjectToFolder(fId, subj);
                        expandFolderAccordion(fId);
                      }}
                      onDeleteSubject={deleteSubjectFromFolder}
                    />
                  ))}
                </div>

                {/* Quick Link to Full Folders Explorer */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFoldersPage(false, true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-[#262a3d] hover:bg-slate-50 dark:hover:bg-[#1a1d2b] text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Folders className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span>Open Full Folder Explorer</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: App Preferences (Grouped Professionally) */}
          <div className="space-y-3">
            {/* Group A: Appearance & Custom Theme Studio */}
            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Theme &amp; Colors
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) {
                      onClose();
                      openUpgradeModal('Custom Themes & Colors');
                      return;
                    }
                    setCustomThemeSurface(surfaceTheme);
                    setIsAddingCustomTheme((v) => !v);
                  }}
                  className="text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                  style={{ color: accentColor }}
                >
                  {!isPro ? <Lock className="w-2.5 h-2.5" /> : <Plus className="w-3 h-3" />}
                  <span>{isAddingCustomTheme && isPro ? 'Cancel' : !isPro ? 'Custom Theme (Pro)' : 'Custom Theme'}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] p-3 space-y-3 shadow-2xs">
                {/* Surface Themes (Eye-friendly Light + Dark + Midnight Glass modes) */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Surface Mode
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        {
                          id: 'soft-light' as SurfaceThemeId,
                          label: 'Soft Light',
                          swatch: '#e8edf5',
                          proOnly: false,
                          icon: <Sun className="w-3 h-3 text-sky-500" />,
                        },
                        {
                          id: 'warm-paper' as SurfaceThemeId,
                          label: 'Warm Paper',
                          swatch: '#ede6d6',
                          proOnly: true,
                          icon: <BookOpen className="w-3 h-3 text-amber-600" />,
                        },
                        {
                          id: 'dark' as SurfaceThemeId,
                          label: 'Midnight Dark',
                          swatch: '#0a0b10',
                          proOnly: false,
                          icon: <Moon className="w-3 h-3 text-indigo-400" />,
                        },
                        {
                          id: 'amoled' as SurfaceThemeId,
                          label: 'AMOLED Black',
                          swatch: '#000000',
                          proOnly: true,
                          icon: <Sparkles className="w-3 h-3 text-emerald-400" />,
                        },
                        {
                          id: 'midnight-glass' as SurfaceThemeId,
                          label: 'Midnight Sapphire Glass',
                          swatch: 'linear-gradient(135deg, #061844 0%, #0d2f7a 55%, #22d3ee 100%)',
                          proOnly: true,
                          fullWidth: true,
                          icon: <Sparkles className="w-3 h-3 text-cyan-400" />,
                        },
                      ]
                    ).map((opt) => {
                      const isLocked = opt.proOnly && !isPro;
                      const active = surfaceTheme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              onClose();
                              openUpgradeModal(`${opt.label} Theme`);
                              return;
                            }
                            setSurfaceTheme(opt.id);
                            if (opt.id === 'midnight-glass') {
                              if (glassMode === 'off') setGlassMode('strong');
                              setAuroraRing(true);
                            }
                          }}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer min-h-[40px] ${
                            opt.fullWidth ? 'col-span-2' : ''
                          } ${
                            active
                              ? 'border-2 bg-slate-50 dark:bg-[#1c1f2e] font-bold text-slate-900 dark:text-white shadow-2xs'
                              : isLocked
                              ? 'border-slate-200/80 dark:border-[#25283a] text-slate-400 dark:text-slate-500 hover:border-[var(--app-accent)]/50'
                              : 'border-slate-200 dark:border-[#25283a] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d2b]'
                          }`}
                          style={active ? { borderColor: accentColor } : undefined}
                        >
                          <span
                            className="w-4 h-4 rounded-md border border-black/15 dark:border-white/20 shrink-0"
                            style={{ background: opt.swatch }}
                          />
                          <span className="text-[11px] truncate flex-1">{opt.label}</span>
                          {isLocked ? (
                            <Lock className="w-3 h-3 text-[var(--app-accent)] shrink-0" />
                          ) : (
                            opt.icon
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* User-Controlled Glassmorphism Look & Aurora Ring Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#212434] space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Glassy UI Look
                      </span>
                      {!isPro && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--app-accent)] flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1a1c29] border border-slate-200/70 dark:border-[#25283a]">
                      {(
                        [
                          { id: 'off' as GlassEffectLevel, label: 'Flat' },
                          { id: 'subtle' as GlassEffectLevel, label: 'Subtle' },
                          { id: 'strong' as GlassEffectLevel, label: 'Frosted' },
                        ]
                      ).map((g) => {
                        const selected = glassMode === g.id;
                        const locked = g.id !== 'off' && !isPro;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              if (locked) {
                                onClose();
                                openUpgradeModal('User-Controlled Glassy Look');
                                return;
                              }
                              setGlassMode(g.id);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              selected
                                ? 'text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            style={selected ? { backgroundColor: accentColor } : undefined}
                          >
                            {locked && <Lock className="w-2.5 h-2.5 opacity-80" />}
                            <span>{g.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Timer Ring Style
                      </span>
                      {!isPro && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--app-accent)] flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAuroraRing(false)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                          !auroraRing
                            ? 'bg-slate-50 dark:bg-[#1c1f2e] text-slate-900 dark:text-white border-2'
                            : 'border-slate-200 dark:border-[#25283a] text-slate-500 dark:text-slate-400'
                        }`}
                        style={!auroraRing ? { borderColor: accentColor } : undefined}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span>Theme Solid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isPro) {
                            onClose();
                            openUpgradeModal('Aurora Gradient Ring');
                            return;
                          }
                          setAuroraRing(true);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                          auroraRing && isPro
                            ? 'bg-slate-50 dark:bg-[#1c1f2e] text-slate-900 dark:text-white border-2'
                            : 'border-slate-200 dark:border-[#25283a] text-slate-500 dark:text-slate-400'
                        }`}
                        style={auroraRing && isPro ? { borderColor: accentColor } : undefined}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            background: `linear-gradient(135deg, #22d3ee, #6366f1, #ec4899, ${accentColor})`,
                          }}
                        />
                        <span className="truncate">Aurora Glow</span>
                        {!isPro && <Lock className="w-2.5 h-2.5 text-[var(--app-accent)] ml-auto shrink-0" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Curated Accent Colors */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#212434]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Accent Color
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {accentColor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { name: 'Crimson', color: '#ff4757', proOnly: false },
                      { name: 'Indigo', color: '#4f46e5', proOnly: true },
                      { name: 'Emerald', color: '#10b981', proOnly: true },
                      { name: 'Amber', color: '#d97706', proOnly: true },
                      { name: 'Teal', color: '#0d9488', proOnly: true },
                      { name: 'Violet', color: '#7c3aed', proOnly: true },
                    ].map((swatch) => {
                      const isLocked = swatch.proOnly && !isPro;
                      const isSelected = accentColor.toLowerCase() === swatch.color.toLowerCase();
                      return (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              onClose();
                              openUpgradeModal('Custom Accent Colors');
                              return;
                            }
                            setAccentColor(swatch.color);
                          }}
                          title={isLocked ? `Pro Color: ${swatch.name}` : swatch.name}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-white transition-transform cursor-pointer ${
                            isSelected
                              ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-[#151722]'
                              : isLocked
                              ? 'opacity-55 hover:opacity-90'
                              : 'opacity-85 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: swatch.color }}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : isLocked ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : null}
                        </button>
                      );
                    })}

                    {isPro ? (
                      <label
                        title="Pick any custom accent color"
                        className="w-7 h-7 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 overflow-hidden relative"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 pointer-events-none" />
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          aria-label="Pick custom accent color"
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openUpgradeModal('Custom Color Picker');
                        }}
                        title="Pro Feature: Custom Accent Color Picker"
                        className="w-7 h-7 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-[var(--app-accent)]"
                      >
                        <Lock className="w-3 h-3 text-[var(--app-accent)]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* User Saved Custom Themes */}
                {customThemes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-[#212434] space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      My Saved Themes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {customThemes.map((preset) => {
                        const isActive =
                          isPro &&
                          surfaceTheme === preset.surface &&
                          accentColor.toLowerCase() === preset.accent.toLowerCase();
                        return (
                          <div
                            key={preset.id}
                            className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
                              isActive
                                ? 'bg-slate-100 dark:bg-[#222536] border-slate-400 dark:border-white/40 text-slate-900 dark:text-white'
                                : 'bg-slate-50 dark:bg-[#191b27] border-slate-200 dark:border-[#272b3f] text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (!isPro) {
                                  onClose();
                                  openUpgradeModal('Saved Custom Themes');
                                  return;
                                }
                                setSurfaceTheme(preset.surface);
                                setAccentColor(preset.accent);
                              }}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: preset.accent }}
                              />
                              <span className="max-w-[95px] truncate">{preset.name}</span>
                              {!isPro && <Lock className="w-2.5 h-2.5 text-[var(--app-accent)]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCustomTheme(preset.id)}
                              className="p-0.5 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Delete theme"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inline Custom Theme Creator */}
                {isAddingCustomTheme && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const clean = customThemeName.trim();
                      if (!clean) return;
                      addCustomTheme({
                        name: clean,
                        surface: customThemeSurface,
                        accent: customThemeColor,
                      });
                      setSurfaceTheme(customThemeSurface);
                      setAccentColor(customThemeColor);
                      setCustomThemeName('');
                      setIsAddingCustomTheme(false);
                    }}
                    className="pt-2.5 border-t border-dashed border-slate-200 dark:border-[#2a2e42] space-y-2 animate-in fade-in duration-150"
                  >
                    <input
                      type="text"
                      required
                      maxLength={24}
                      value={customThemeName}
                      onChange={(e) => setCustomThemeName(e.target.value)}
                      placeholder="Theme name (e.g. Forest Paper)..."
                      className="w-full bg-slate-50 dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="color"
                          value={customThemeColor}
                          onChange={(e) => setCustomThemeColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span>Accent</span>
                      </label>

                      <select
                        value={customThemeSurface}
                        onChange={(e) => setCustomThemeSurface(e.target.value as SurfaceThemeId)}
                        className="bg-slate-50 dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-xl px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="soft-light">Soft Light</option>
                        <option value="warm-paper">Warm Paper</option>
                        <option value="dark">Midnight Dark</option>
                        <option value="amoled">AMOLED Black</option>
                        <option value="midnight-glass">Midnight Glass</option>
                      </select>

                      <button
                        type="submit"
                        disabled={!customThemeName.trim()}
                        className="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold disabled:opacity-40 cursor-pointer shrink-0"
                        style={{ backgroundColor: customThemeColor }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Group B: Study Tools & Sync */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                Sync &amp; Study Data
              </span>
              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] divide-y divide-slate-100 dark:divide-[#212434] overflow-hidden shadow-2xs">
                <SettingsActionRow
                  icon={<Calendar className="w-4 h-4 text-emerald-500" />}
                  iconBg="bg-emerald-500/10"
                  title="Google Calendar Sync"
                  subtitle="Backup study sessions to Calendar"
                  badge={!isPro ? 'PRO' : undefined}
                  onClick={() => {
                    onClose();
                    onOpenSyncCalendar();
                  }}
                />
                <SettingsActionRow
                  icon={<RotateCcw className="w-4 h-4 text-amber-500" />}
                  iconBg="bg-amber-500/10"
                  title="Start New Day"
                  subtitle="Archive today & reset daily timer"
                  onClick={() => {
                    onClose();
                    onOpenResetDay();
                  }}
                />
              </div>
            </div>

            {/* Group C: App, User Guide & Legal */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                Guide, Support &amp; Privacy
              </span>
              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] divide-y divide-slate-100 dark:divide-[#212434] overflow-hidden shadow-2xs">
                {onStartTour && (
                  <SettingsActionRow
                    icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                    iconBg="bg-amber-500/10"
                    title="Interactive Step-by-Step Tour"
                    subtitle="Quick 5-step guided walkthrough"
                    onClick={() => {
                      onClose();
                      onStartTour();
                    }}
                  />
                )}
                <SettingsActionRow
                  icon={<HelpCircle className="w-4 h-4 text-indigo-500" />}
                  iconBg="bg-indigo-500/10"
                  title="User Guide Handbook"
                  subtitle="Full বাংলা & English app instructions"
                  badge="GUIDE"
                  onClick={() => {
                    onClose();
                    navigateSubView('guide');
                  }}
                />
                <div className="p-1.5">
                  <PWAInstallButton variant="menu-item" />
                </div>
                <SettingsActionRow
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
                  iconBg="bg-emerald-500/10"
                  title="Privacy, Terms & Account"
                  subtitle="Data policy & account deletion"
                  onClick={() => {
                    onClose();
                    navigateSubView('legal');
                  }}
                />
                <a
                  href={`mailto:${globalConfig.supportEmail || ADMIN_EMAIL}?subject=FocusTrack%20Support%20%2F%20Feedback`}
                  onClick={onClose}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                        Contact Support
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {globalConfig.supportEmail || ADMIN_EMAIL}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </a>
              </div>
            </div>

            {/* Group D: Account & Reset */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                Account
              </span>
              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] divide-y divide-slate-100 dark:divide-[#212434] overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResetAllData();
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                        Reset All Data
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Clear history &amp; restore defaults
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    onClose();
                    await logout();
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#222536] text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Sign Out
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Press / Button Folder Settings Modal */}
      <FolderSettingsModal
        folderId={settingsFolderId}
        onClose={() => setSettingsFolderId(null)}
        onOpenFolder={(fId) => {
          onClose();
          navigateSubView('routine', fId);
        }}
      />
    </div>
  );
};

interface SettingsActionRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
}

const SettingsActionRow: React.FC<SettingsActionRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#1a1d2b] transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] text-slate-400 block truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {badge && (
        <span className="px-1.5 py-0.5 rounded-md bg-[var(--app-accent-soft)] text-[var(--app-accent)] text-[9px] font-extrabold uppercase tracking-wider">
          {badge}
        </span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    </div>
  </button>
);

interface FolderAccordionNodeProps {
  folder: FolderDefinition;
  depth: number;
  isPro: boolean;
  onRequirePro: (feature: string) => void;
  childrenByParentId: Record<string, FolderDefinition[]>;
  expandedFolderIds: Record<string, boolean>;
  onToggleExpand: (folderId: string) => void;
  onExpandFolder: (folderId: string) => void;
  onOpenWorkspace: (folderId: string) => void;
  onOpenSettings: (folderId: string) => void;
  onCreateSubFolder: (parentId: string, name: string, color: string) => void;
  onAddSubject: (folderId: string, subjectName: string) => void;
  onDeleteSubject: (folderId: string, subjectName: string) => void;
}

const FolderAccordionNode: React.FC<FolderAccordionNodeProps> = ({
  folder,
  depth,
  isPro,
  onRequirePro,
  childrenByParentId,
  expandedFolderIds,
  onToggleExpand,
  onExpandFolder,
  onOpenWorkspace,
  onOpenSettings,
  onCreateSubFolder,
  onAddSubject,
  onDeleteSubject,
}) => {
  const childFolders = childrenByParentId[String(folder.id)] || [];
  const subjects = folder.subjects || [];
  const isExpanded = !!expandedFolderIds[folder.id];

  // User choice inside each folder: create a sub-folder OR add a subject
  const [createMode, setCreateMode] = useState<'folder' | 'subject'>('subject');
  const [draftName, setDraftName] = useState('');
  const [subFolderColor, setSubFolderColor] = useState(folder.color || '#4F46E5');

  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: () => onOpenSettings(folder.id),
    onClick: () => onToggleExpand(folder.id),
  });

  const handleSubmitInside = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMode === 'folder' && !isPro) {
      onRequirePro('Nested Sub-Folders');
      return;
    }
    const trimmed = draftName.trim();
    if (!trimmed) return;

    if (createMode === 'folder') {
      onCreateSubFolder(folder.id, trimmed, subFolderColor);
    } else {
      onAddSubject(folder.id, trimmed);
    }
    setDraftName('');
    onExpandFolder(folder.id);
  };

  const countParts: string[] = [];
  if (childFolders.length > 0) {
    countParts.push(`${childFolders.length} ${childFolders.length === 1 ? 'folder' : 'folders'}`);
  }
  countParts.push(`${subjects.length} ${subjects.length === 1 ? 'subject' : 'subjects'}`);

  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        isExpanded
          ? 'bg-slate-50/80 dark:bg-[#191b28] border-slate-300 dark:border-[#32364e]'
          : 'bg-slate-50/40 dark:bg-[#161824] border-slate-200/90 dark:border-[#24273a]'
      }`}
    >
      {/* Accordion Header Row */}
      <div className="flex items-center justify-between gap-1 px-2 py-2 select-none">
        <div
          {...longPressHandlers}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer active:scale-[0.99] py-0.5 px-1 rounded-lg"
          title="Tap to expand · Hold for folder settings"
        >
          <span className="text-slate-400 shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>

          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: folder.color }}
          >
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5" />
            ) : (
              <Folder className="w-3.5 h-3.5" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {folder.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {countParts.join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWorkspace(folder.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--app-accent)] hover:bg-slate-200/70 dark:hover:bg-[#24283b] transition-colors cursor-pointer"
            title={`Open ${folder.name}`}
            aria-label={`Open ${folder.name}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings(folder.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-[#24283b] transition-colors cursor-pointer"
            title={`Settings for ${folder.name}`}
            aria-label={`Settings for ${folder.name}`}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content: Inline Sub-Folder / Subject Creator + Children Tree + Subjects */}
      {isExpanded && (
        <div
          className="px-2.5 pb-2.5 pt-2 border-t border-slate-200/80 dark:border-[#26293d] space-y-2.5"
          style={{
            borderLeftWidth: depth > 0 ? '2px' : undefined,
            borderLeftColor: depth > 0 ? folder.color : undefined,
          }}
        >
          {/* User Choice Mode Switcher: Create Sub-Folder OR Create Subject */}
          <div className="p-2 rounded-xl bg-white dark:bg-[#12131c] border border-slate-200 dark:border-[#272a3e] space-y-2">
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#1a1c29]">
              <button
                type="button"
                onClick={() => setCreateMode('subject')}
                className={`py-1 px-2 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  createMode === 'subject'
                    ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3 h-3 text-emerald-500" />
                <span>+ Subject</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPro) {
                    onRequirePro('Nested Sub-Folders');
                    return;
                  }
                  setCreateMode('folder');
                }}
                className={`py-1 px-2 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  createMode === 'folder' && isPro
                    ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {!isPro ? (
                  <Lock className="w-2.5 h-2.5 text-[var(--app-accent)]" />
                ) : (
                  <FolderPlus className="w-3 h-3 text-[var(--app-accent)]" />
                )}
                <span>+ Sub-Folder</span>
              </button>
            </div>

            <form onSubmit={handleSubmitInside} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={
                    createMode === 'folder'
                      ? `New folder inside ${folder.name}...`
                      : `New subject in ${folder.name}...`
                  }
                  className="flex-1 min-w-0 bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d42] rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[var(--app-accent)]"
                />
                <button
                  type="submit"
                  disabled={!draftName.trim()}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white shrink-0 cursor-pointer disabled:opacity-40 transition-colors whitespace-nowrap ${
                    createMode === 'folder'
                      ? 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)]'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {createMode === 'folder' ? 'Create' : 'Add'}
                </button>
              </div>

              {createMode === 'folder' && (
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10px] text-slate-400">Color:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {FOLDER_COLOR_PRESETS.slice(0, 7).map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSubFolderColor(preset.color)}
                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-white cursor-pointer ${
                          subFolderColor === preset.color
                            ? 'scale-115 ring-1 ring-offset-1 ring-slate-900 dark:ring-white'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      >
                        {subFolderColor === preset.color && (
                          <Check className="w-2 h-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Child Sub-Folders Tree */}
          {childFolders.length > 0 && (
            <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-[#2a2e44]">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                Sub-Folders ({childFolders.length})
              </span>
              {childFolders.map((child) => (
                <FolderAccordionNode
                  key={child.id}
                  folder={child}
                  depth={depth + 1}
                  isPro={isPro}
                  onRequirePro={onRequirePro}
                  childrenByParentId={childrenByParentId}
                  expandedFolderIds={expandedFolderIds}
                  onToggleExpand={onToggleExpand}
                  onExpandFolder={onExpandFolder}
                  onOpenWorkspace={onOpenWorkspace}
                  onOpenSettings={onOpenSettings}
                  onCreateSubFolder={onCreateSubFolder}
                  onAddSubject={onAddSubject}
                  onDeleteSubject={onDeleteSubject}
                />
              ))}
            </div>
          )}

          {/* Subjects inside this Folder */}
          {subjects.length > 0 ? (
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                Subjects ({subjects.length})
              </span>
              {subjects.map((subj) => (
                <div
                  key={subj}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#12131c] border border-slate-200/80 dark:border-[#25283a] text-[11px]"
                >
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace(folder.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:text-[var(--app-accent)] transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {subj}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteSubject(folder.id, subj)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer shrink-0"
                    title={`Remove ${subj}`}
                    aria-label={`Remove ${subj}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            childFolders.length === 0 && (
              <p className="text-[10px] text-slate-400 text-center py-1">
                Empty folder — add a subject or sub-folder above.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};
