import React from 'react';
import { Plus, Target, ChevronRight, BookOpen } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface ProminentAddTaskBannerProps {
  onOpenAddTask: () => void;
}

export const ProminentAddTaskBanner: React.FC<ProminentAddTaskBannerProps> = ({
  onOpenAddTask,
}) => {
  const { totalTasksCount, completedTasksCount, totalTargetMinutes, accentColor } = useStudy();
  const accent = accentColor || '#ff4757';

  return (
    <div
      onClick={onOpenAddTask}
      className="relative w-full overflow-hidden rounded-2xl p-4 text-white shadow-md hover:shadow-lg border border-white/15 transition-all duration-200 active:scale-[0.99] cursor-pointer group select-none"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
        boxShadow: `0 10px 24px -10px ${accent}66`,
      }}
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
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 group-hover:rotate-90 transition-transform duration-300 border border-white/25">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
              + Add Today&apos;s Target Task
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-white/85 font-medium mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {totalTasksCount} planned ({completedTasksCount} done)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Goal: {Math.floor(totalTargetMinutes / 60)}h {totalTargetMinutes % 60}m
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/15 px-2.5 py-1.5 rounded-xl shrink-0">
          <span className="text-[11px] font-bold hidden sm:inline">Add</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
