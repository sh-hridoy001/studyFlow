import React, { useEffect, useMemo, useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
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
  FileText,
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
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLongPress } from '../hooks/useLongPress';
import { FolderSettingsModal } from './FolderSettingsModal';
import { FOLDER_COLOR_PRESETS } from '../utils/folderConstants';
import { FolderDefinition } from '../types';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFoldersPage: (autoCreate?: boolean) => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
  onOpenExportReport: () => void;
  onOpenResetAllData: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenFoldersPage,
  onOpenResetDay,
  onOpenSyncCalendar,
  onOpenExportReport,
  onOpenResetAllData,
}) => {
  const {
    folders,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    syncStatus,
    todaySalahCount,
    setSelectedFolderId,
    addFolder,
    addSubjectToFolder,
    deleteSubjectFromFolder,
  } = useStudy();

  const { user, logout } = useAuth();
  const [settingsFolderId, setSettingsFolderId] = useState<string | null>(null);

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

  const handleOpenFolderWorkspace = (folderId: string) => {
    onClose();
    setSelectedFolderId(folderId);
    setActiveTab('routine');
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
        setSelectedFolderId(null);
        setActiveTab('routine');
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
        onOpenFoldersPage(false);
      },
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      active: activeTab === 'tasks',
      onClick: () => {
        onClose();
        setActiveTab('tasks');
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
        setActiveTab('salah');
      },
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: <Target className="w-3.5 h-3.5" />,
      active: activeTab === 'milestones',
      onClick: () => {
        onClose();
        setActiveTab('milestones');
      },
    },
    {
      id: 'history',
      label: 'History',
      icon: <Calendar className="w-3.5 h-3.5" />,
      active: activeTab === 'history',
      onClick: () => {
        onClose();
        setActiveTab('history');
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
      <div className="relative w-full max-w-[360px] sm:max-w-sm bg-[#f8f9fc] dark:bg-[#101118] text-slate-900 dark:text-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-[#222434] animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-4 py-3.5 bg-white dark:bg-[#141621] border-b border-slate-200 dark:border-[#212332] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff4757] to-amber-500 flex items-center justify-center text-white shadow-sm">
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
                className="w-10 h-10 rounded-full ring-2 ring-[#ff4757]/30 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff4757] to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
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
                      ? 'bg-[#ff4757] border-[#ff4757] text-white shadow-xs'
                      : 'bg-white dark:bg-[#151722] border-slate-200 dark:border-[#232638] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
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
                <div className="w-7 h-7 rounded-lg bg-[#ff4757]/12 text-[#ff4757] flex items-center justify-center shrink-0">
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
                    setIsManageFoldersOpen(true);
                    setIsAddingRootFolder((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    isAddingRootFolder
                      ? 'bg-slate-200 dark:bg-[#262a3d] text-slate-700 dark:text-slate-200'
                      : 'bg-[#ff4757] hover:bg-[#ff3344] text-white'
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
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1d2b] border border-dashed border-[#ff4757]/50 space-y-2 animate-in fade-in duration-150"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={rootFolderName}
                      onChange={(e) => setRootFolderName(e.target.value)}
                      placeholder="New folder name..."
                      className="w-full bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
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
                        className="px-2.5 py-1 rounded-lg bg-[#ff4757] hover:bg-[#ff3344] disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer shrink-0"
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
                    onOpenFoldersPage(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-[#262a3d] hover:bg-slate-50 dark:hover:bg-[#1a1d2b] text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Folders className="w-3.5 h-3.5 text-[#ff4757]" />
                  <span>Open Full Folder Explorer</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: App Preferences (Grouped Professionally) */}
          <div className="space-y-3">
            {/* Group A: Appearance */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                Appearance
              </span>
              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        App Theme
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {theme === 'dark' ? 'Dark OLED Mode' : 'Light Mode'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#1e2130] border border-slate-200 dark:border-[#2b2f45] cursor-pointer"
                    aria-label="Toggle Light/Dark Theme"
                  >
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                        theme === 'light'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-400'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      Light
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                        theme === 'dark'
                          ? 'bg-[#ff4757] text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      Dark
                    </span>
                  </button>
                </div>
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
                  onClick={() => {
                    onClose();
                    onOpenSyncCalendar();
                  }}
                />
                <SettingsActionRow
                  icon={<FileText className="w-4 h-4 text-indigo-500" />}
                  iconBg="bg-indigo-500/10"
                  title="Export Study Report"
                  subtitle="PDF summary & Markdown notes"
                  onClick={() => {
                    onClose();
                    onOpenExportReport();
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

            {/* Group C: App & Legal */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                App &amp; Privacy
              </span>
              <div className="rounded-2xl bg-white dark:bg-[#151722] border border-slate-200 dark:border-[#232638] divide-y divide-slate-100 dark:divide-[#212434] overflow-hidden shadow-2xs">
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
                    setActiveTab('legal');
                  }}
                />
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
          setSelectedFolderId(fId);
          setActiveTab('routine');
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
  onClick: () => void;
}

const SettingsActionRow: React.FC<SettingsActionRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
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
    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  </button>
);

interface FolderAccordionNodeProps {
  folder: FolderDefinition;
  depth: number;
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#ff4757] hover:bg-slate-200/70 dark:hover:bg-[#24283b] transition-colors cursor-pointer"
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
                onClick={() => setCreateMode('folder')}
                className={`py-1 px-2 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  createMode === 'folder'
                    ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FolderPlus className="w-3 h-3 text-[#ff4757]" />
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
                  className="flex-1 min-w-0 bg-slate-50 dark:bg-[#181a26] border border-slate-200 dark:border-[#2a2d42] rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#ff4757]"
                />
                <button
                  type="submit"
                  disabled={!draftName.trim()}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white shrink-0 cursor-pointer disabled:opacity-40 transition-colors whitespace-nowrap ${
                    createMode === 'folder'
                      ? 'bg-[#ff4757] hover:bg-[#ff3344]'
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
                    className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:text-[#ff4757] transition-colors"
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
