import React from 'react';
import { Plus, Target, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface ProminentAddTaskBannerProps {
  onOpenAddTask: () => void;
}

export const ProminentAddTaskBanner: React.FC<ProminentAddTaskBannerProps> = ({
  onOpenAddTask,
}) => {
  const { totalTasksCount, completedTasksCount, totalTargetMinutes } = useStudy();

  return (
    <div
      onClick={onOpenAddTask}
      className="relative w-full overflow-hidden rounded-[28px] p-5 sm:p-6 bg-gradient-to-r from-[#ff4757] via-[#f43f5e] to-[#e11d48] text-white shadow-xl shadow-rose-950/40 hover:shadow-2xl hover:shadow-rose-900/50 border border-white/20 transition-all duration-300 transform active:scale-[0.99] cursor-pointer group select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenAddTask();
        }
      }}
      aria-label="Add today's target task"
    >
      {/* Decorative ambient blurred blobs */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left Side: Big Icon & Text */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg shrink-0 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300 border border-white/30">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Routine Planner</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-0.5 truncate drop-shadow-sm">
              + Add Today's Target Task
            </h2>
            <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5 truncate">
              Set subject, chapter topic & study duration to begin
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shrink-0 group-hover:bg-black/30 transition-colors">
          <span className="text-xs font-bold">New Task</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Mini Quick Stats row */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/20 flex items-center gap-3 text-xs text-white/90 font-medium flex-wrap">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          <span>
            {totalTasksCount} planned today ({completedTasksCount} finished)
          </span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            Target: {Math.floor(totalTargetMinutes / 60)}h {totalTargetMinutes % 60}m
          </span>
        </div>
      </div>
    </div>
  );
};
