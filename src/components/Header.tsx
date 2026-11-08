import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  AlertTriangle,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddTask: () => void;
  onOpenResetDay: () => void;
  onOpenSyncCalendar: () => void;
  onOpenCalendarSettings: () => void;
  onOpenResetAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTask,
  onOpenResetDay,
  onOpenSyncCalendar,
  onOpenResetAllData,
}) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    syncStatus,
    todaySalahCount,
  } = useStudy();

  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 md:gap-6">
        {/* Zone 1: Brand Wordmark & Cloud Sync Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                FocusTrack
              </span>
              {/* Firestore Cloud Sync Badge */}
              <div
                className={`hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
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

        {/* Zone 2: Clean 3-Tab Navigation (Routine, Salah, History) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'routine'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Today's Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('salah')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'salah'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-500" />
            <span>Salah Tracker</span>
            {todaySalahCount > 0 && (
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {todaySalahCount}/5
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Study History</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action & User Profile / Reset Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Add Morning Task Button */}
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap"
            title="Add morning target task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Add Task</span>
          </button>

          {/* Sync Calendar Button */}
          <button
            onClick={onOpenSyncCalendar}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            title="Sync Today's Log to Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          {/* Download Standalone Single-File HTML */}
          <button
            onClick={downloadSingleFileApp}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium rounded-xl transition-colors whitespace-nowrap"
            title="Download standalone single-file HTML version"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Pill & Dropdown (With Reset All Data & Logout) */}
          {user && (
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                aria-label="User Profile Menu"
              >
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
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {/* Profile & Settings Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'FocusTrack User'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      <Cloud className="w-3 h-3" />
                      <span>{user.email?.includes('local') ? 'Local Mode (Browser Storage)' : 'Isolated Firestore Account'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Reset Daily Routine */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenResetDay();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start New Day (Reset Daily Hours)</span>
                    </button>

                    {/* Subtle Reset All Data Option with Confirmation */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenResetAllData();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-left font-medium"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Reset All Data (Fresh Start)</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
