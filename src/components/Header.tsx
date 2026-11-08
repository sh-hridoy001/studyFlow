import React from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { downloadSingleFileApp } from '../utils/singleFileGenerator';
import {
  Timer,
  Sun,
  Moon,
  Plus,
  RotateCcw,
  Download,
  Calendar,
  CheckSquare,
  LogOut,
  Cloud,
  Check,
  Loader2,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddTask: () => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
  onOpenCalendarSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTask,
  onOpenResetDay,
  onOpenSyncCalendar,
}) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    totalActualMinutes,
    syncStatus,
  } = useStudy();

  const { user, logout } = useAuth();

  const formattedActual = `${Math.floor(totalActualMinutes / 60)}h ${totalActualMinutes % 60}m`;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Brand Wordmark & Cloud Sync Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                FocusTrack
              </span>
              {/* Firestore Cloud Sync Badge */}
              <div
                className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : syncStatus === 'saving'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : syncStatus === 'loading'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
                title={`Firestore Sync Status: ${syncStatus}`}
              >
                {syncStatus === 'saving' ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : syncStatus === 'synced' ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <Cloud className="w-2.5 h-2.5" />
                )}
                <span>
                  {syncStatus === 'synced'
                    ? 'Synced'
                    : syncStatus === 'saving'
                    ? 'Saving...'
                    : syncStatus === 'loading'
                    ? 'Loading...'
                    : 'Offline'}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Daily Routine & History
            </span>
          </div>
        </div>

        {/* Zone 2: Clean 2-Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'routine'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Today's Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Study History</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action & User Profile / Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Add Morning Task Button */}
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap"
            title="Add morning target task"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Task</span>
          </button>

          {/* Sync Calendar Button */}
          <button
            onClick={onOpenSyncCalendar}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            title="Sync Today's Log to Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Calendar Sync</span>
          </button>

          {/* Reset Daily Progress Button */}
          <button
            onClick={onOpenResetDay}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            title="Start New Day or reset today's study progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Day</span>
          </button>

          {/* Download Standalone Single-File HTML */}
          <button
            onClick={downloadSingleFileApp}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium rounded-xl transition-colors whitespace-nowrap"
            title="Download standalone single-file HTML version"
          >
            <Download className="w-3.5 h-3.5" />
            <span>HTML Export</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Info & Logout Button */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2" title={user.email || user.displayName || 'Logged in'}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden 2xl:flex flex-col text-left leading-none max-w-[120px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user.displayName || 'Student'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                title="Log out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
