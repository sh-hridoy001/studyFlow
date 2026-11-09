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
    setSelectedFolderId,
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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-xs">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark & Cloud Sync Status */}
        <div
          onClick={() => {
            setSelectedFolderId(null);
            setActiveTab('routine');
          }}
          className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 cursor-pointer group/brand"
          title="Return to Routine Overview"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0 group-hover/brand:scale-105 transition-transform">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                FocusTrack
              </span>
              {/* Firestore Cloud / Local Sync Badge */}
              <div
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors shrink-0 ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : syncStatus === 'saving'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : syncStatus === 'loading'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
                title={`Sync Status: ${syncStatus}`}
              >
                {syncStatus === 'saving' ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : syncStatus === 'synced' ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <Cloud className="w-2.5 h-2.5" />
                )}
                <span className="hidden xs:inline">
                  {syncStatus === 'synced'
                    ? 'Synced'
                    : syncStatus === 'saving'
                    ? 'Saving'
                    : syncStatus === 'loading'
                    ? 'Loading'
                    : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Tabs (Hidden on mobile, cleanly rendered on md+) */}
        <nav className="hidden md:flex items-center gap-1.5 py-1">
          <button
            onClick={() => {
              setSelectedFolderId(null);
              setActiveTab('routine');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Today's Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('salah')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'salah'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Salah Tracker</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              {todaySalahCount}/5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Study History</span>
          </button>
        </nav>

        {/* Zone 3: Actions & User Profile Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Add Morning Task Quick Button */}
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
            title="Add morning target task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Sync Calendar Button (visible on lg+) */}
          <button
            onClick={onOpenSyncCalendar}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            title="Sync Today's Log to Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sync Calendar</span>
          </button>

          {/* Single File Download (visible on xl+) */}
          <button
            onClick={downloadSingleFileApp}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            title="Download standalone single-file HTML version"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Pill & Dropdown */}
          {user && (
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
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
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
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
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start New Day (Reset Hours)</span>
                    </button>

                    {/* Subtle Reset All Data Option with Confirmation */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenResetAllData();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Reset All Data (Fresh Start)</span>
                    </button>

                    {/* Single-File HTML Download */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        downloadSingleFileApp();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download Single-File HTML</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar: dedicated row for mobile screens (< md) */}
      <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 bg-slate-50/80 dark:bg-slate-900/80">
        <nav className="grid grid-cols-3 gap-1 w-full max-w-md mx-auto">
          <button
            onClick={() => {
              setSelectedFolderId(null);
              setActiveTab('routine');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('salah')}
            className={`flex items-center justify-center gap-1 py-2 px-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'salah'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Salah</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                activeTab === 'salah'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {todaySalahCount}/5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">History</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
