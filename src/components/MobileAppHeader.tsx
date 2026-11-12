import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { Menu, Plus, Sun, Moon, Sparkles, Flame } from 'lucide-react';

interface MobileAppHeaderProps {
  onOpenSidebar: () => void;
  onOpenAddTask: () => void;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  onOpenSidebar,
  onOpenAddTask,
}) => {
  const { user } = useAuth();
  const { syncStatus, theme, toggleTheme, streakDays } = useStudy();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0e0f17]/95 backdrop-blur-md border-b border-[#212334] px-3.5 py-2.5 sm:px-6 transition-colors shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
        {/* Left: User Profile Avatar & Greeting with Streak */}
        <div
          onClick={onOpenSidebar}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
          title="Open Control Center & Settings"
        >
          <div className="relative shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="w-10 h-10 rounded-2xl ring-2 ring-[#ff4757]/40 object-cover shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff4757] via-[#f43f5e] to-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            {/* Live Sync Status Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#0e0f17] ${
                syncStatus === 'synced'
                  ? 'bg-emerald-400'
                  : syncStatus === 'saving'
                  ? 'bg-indigo-400 animate-spin'
                  : 'bg-amber-400'
              }`}
              title={`Cloud sync: ${syncStatus}`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight truncate">
                {user?.displayName ? user.displayName.split(' ')[0] : 'FocusTrack'}
              </span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-amber-400" />
                  {streakDays}d
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span>Ready to conquer today</span>
              <Sparkles className="w-2.5 h-2.5 text-[#ff4757]" />
            </p>
          </div>
        </div>

        {/* Right: Theme Toggle + CRAZY Add Task Button + Sidebar Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Switcher Toggle (Moved to navbar per user request) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-[#191b27] hover:bg-[#232637] border border-[#272a3d] text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Crazy High-Energy "Add Task" Button with Neon Glow & Micro-animation */}
          <button
            onClick={onOpenAddTask}
            className="relative group/add overflow-hidden px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#ff3849] via-[#ff4757] to-[#f43f5e] text-white text-xs font-black flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shadow-[#ff4757]/35 hover:shadow-xl hover:shadow-[#ff4757]/50 active:scale-90 ring-1 ring-white/20 select-none"
            title="Create New Study Task (Fast Add)"
            aria-label="Add Task"
          >
            {/* Shimmer light pass animation */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/add:translate-x-full transition-transform duration-700 pointer-events-none" />

            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover/add:rotate-90 transition-transform duration-300">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-extrabold tracking-wide">Add Task</span>
          </button>

          {/* Hamburger Menu Toggle (Opens Right Sidebar Drawer) */}
          <button
            onClick={onOpenSidebar}
            className="p-2.5 rounded-2xl bg-[#191b27] hover:bg-[#232637] border border-[#272a3d] text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
            aria-label="Open sidebar menu"
            title="Settings & Folders"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
