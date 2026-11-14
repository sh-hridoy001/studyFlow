import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { Menu, Plus, Sun, Moon, Sparkles, Flame } from 'lucide-react';

interface MobileAppHeaderProps {
  onOpenSidebar: () => void;
  onOpenAddTask: () => void;
  containerWidthClass?: string;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  onOpenSidebar,
  onOpenAddTask,
  containerWidthClass = 'max-w-4xl',
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme, streakDays, accentColor } = useStudy();
  const accent = accentColor || '#ff4757';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0e0f17]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#212334] px-3.5 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6 transition-colors shadow-xs">
      <div className={`${containerWidthClass} mx-auto flex items-center justify-between gap-2.5`}>
        {/* Left: User Profile Avatar & Greeting with Streak */}
        <div
          onClick={onOpenSidebar}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0 min-h-[44px]"
          title="Open Menu & Settings"
        >
          <div className="relative shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="w-9 h-9 rounded-xl ring-2 object-cover shadow-xs group-hover:scale-105 transition-transform"
                style={{ '--tw-ring-color': `${accent}66` } as React.CSSProperties}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${accent}, #f59e0b)` }}
              >
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {user?.displayName ? user.displayName.split(' ')[0] : 'FocusTrack'}
              </span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-amber-500" />
                  {streakDays}d
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
              <span>Ready to focus</span>
              <Sparkles className="w-2.5 h-2.5" style={{ color: accent }} />
            </p>
          </div>
        </div>

        {/* Right: Theme Toggle + Add Task + Sidebar Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-slate-100 dark:bg-[#191b27] hover:bg-slate-200 dark:hover:bg-[#232637] border border-slate-200 dark:border-[#272a3d] text-slate-600 dark:text-slate-300 transition-all cursor-pointer active:scale-90 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button
            onClick={onOpenAddTask}
            className="relative group/add overflow-hidden min-h-[40px] px-3 py-2 rounded-xl text-white text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-90 select-none"
            style={{
              backgroundColor: accent,
              boxShadow: `0 6px 16px -4px ${accent}55`,
            }}
            title="Create New Study Task"
            aria-label="Add Task"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/add:translate-x-full transition-transform duration-700 pointer-events-none" />
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover/add:rotate-90 transition-transform duration-300">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Add Task</span>
          </button>

          <button
            onClick={onOpenSidebar}
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-slate-100 dark:bg-[#191b27] hover:bg-slate-200 dark:hover:bg-[#232637] border border-slate-200 dark:border-[#272a3d] text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-90 flex items-center justify-center"
            aria-label="Open sidebar menu"
            title="Folders, Themes & Settings"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
