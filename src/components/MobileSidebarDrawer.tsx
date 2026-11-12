import React, { useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  FolderPlus,
  Folders,
  Folder,
  Settings,
  Sun,
  Moon,
  RotateCcw,
  Calendar,
  Download,
  FileText,
  Smartphone,
  AlertTriangle,
  LogOut,
  Cloud,
  Check,
  Loader2,
  ChevronRight,
  BookOpen,
  Sparkles,
  Target,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { downloadSingleFileApp } from '../utils/singleFileGenerator';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFolderManager: (folderId?: string) => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
  onOpenExportReport: () => void;
  onOpenResetAllData: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenFolderManager,
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
  } = useStudy();

  const { user, logout } = useAuth();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Sidebar Panel from Right Side */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#12131b] text-white h-full shadow-2xl flex flex-col z-10 border-l border-[#242636] overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header with Close */}
        <div className="p-4 sm:p-5 border-b border-[#212332] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff4757] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                FocusTrack
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Mobile Study App & Control Hub
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-[#212332] bg-[#161723]">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-11 h-11 rounded-full ring-2 ring-[#ff4757]/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ff4757] to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">
                {user?.displayName || 'Study Master'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'Offline Guest'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-400 animate-pulse'
                      : syncStatus === 'saving'
                      ? 'bg-indigo-400 animate-spin'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[10px] font-semibold text-slate-300">
                  {syncStatus === 'synced'
                    ? 'Firestore Synced'
                    : syncStatus === 'saving'
                    ? 'Saving...'
                    : 'Local Cache'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Section 1: Manage Folders & Subjects (User Request: manage folder, create folder in sidebar) */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Folders className="w-3.5 h-3.5 text-[#ff4757]" />
                Manage Folders & Subjects
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenFolderManager();
                }}
                className="text-[10px] font-bold text-[#ff4757] hover:underline cursor-pointer"
              >
                + New Folder
              </button>
            </div>

            {/* List of current folders */}
            <div className="space-y-1.5">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => {
                    onClose();
                    setSelectedFolderId(folder.id);
                    setActiveTab('routine');
                  }}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#181925] hover:bg-[#202232] border border-[#26283b] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: folder.color }}
                    />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {folder.subjects?.length || 0} subjects / chapters
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onOpenFolderManager(folder.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit Folder & Subjects"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Create Folder Quick Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenFolderManager();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-dashed border-[#ff4757]/40 hover:border-[#ff4757] text-[#ff4757] text-xs font-bold transition-all cursor-pointer bg-[#ff4757]/5 hover:bg-[#ff4757]/10"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Create New Study Folder</span>
              </button>
            </div>
          </div>

          {/* Section 2: Quick Views / Navigation */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              App Screens
            </span>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  setSelectedFolderId(null);
                  setActiveTab('routine');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'routine'
                    ? 'bg-[#ff4757] text-white shadow-md'
                    : 'text-slate-300 hover:bg-[#1b1c28]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4" />
                  <span>Home (Timer & Daily Routine)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('salah');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'salah'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-emerald-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-emerald-400" />
                  <span>5-Time Salah Tracker</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {todaySalahCount}/5
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('milestones');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'milestones'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-[#1b1c28]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>Exam & Goal Countdown</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('history');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-[#1b1c28]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Study History & Past Records</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* Section 3: Settings & Controls (User Request: theme, settings in sidebar) */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Settings & Tools
            </span>

            <div className="space-y-1">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#1b1c28] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>App Theme</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#26283b] text-slate-300">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>

              {/* Export Study Report PDF / Markdown */}
              <button
                onClick={() => {
                  onClose();
                  onOpenExportReport();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#1b1c28] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Export Report (PDF / Markdown)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Google Calendar Sync */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSyncCalendar();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#1b1c28] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Google Calendar Sync</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Start New Day (Reset Daily Hours) */}
              <button
                onClick={() => {
                  onClose();
                  onOpenResetDay();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#1b1c28] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Start New Day (Reset Daily Hours)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Single File HTML Backup */}
              <button
                onClick={() => {
                  onClose();
                  downloadSingleFileApp();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:bg-[#1b1c28] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Download Standalone HTML</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Install Mobile PWA App */}
              <div className="pt-1">
                <PWAInstallButton variant="menu-item" />
              </div>
            </div>
          </div>

          {/* Section 4: Danger Zone & Signout */}
          <div className="pt-2 border-t border-[#212332] space-y-1">
            {/* Reset All Data */}
            <button
              onClick={() => {
                onClose();
                onOpenResetAllData();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Reset All Data (Fresh Start)</span>
            </button>

            {/* Logout */}
            <button
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
