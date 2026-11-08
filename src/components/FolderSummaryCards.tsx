import React from 'react';
import { useStudy } from '../context/StudyContext';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { PrimaryFolderId } from '../types';
import { formatDuration } from '../utils/dateUtils';
import { GraduationCap, Target, Languages, ArrowRight } from 'lucide-react';

export const FolderSummaryCards: React.FC = () => {
  const { folderStats, selectedFolderFilter, setSelectedFolderFilter } = useStudy();

  const folderIcons = {
    academic: GraduationCap,
    admission: Target,
    english: Languages,
  };

  const folderKeys: PrimaryFolderId[] = ['academic', 'admission', 'english'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {folderKeys.map((fId) => {
        const folder = PRIMARY_FOLDERS[fId];
        const stats = folderStats[fId];
        const Icon = folderIcons[folder.icon];
        const isSelected = selectedFolderFilter === fId;

        return (
          <div
            key={fId}
            className={`group bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all duration-200 shadow-xs flex flex-col justify-between ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white border-transparent'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            style={{
              borderTopWidth: '4px',
              borderTopColor: folder.color,
            }}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: folder.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {folder.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {folder.subtitle}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${folder.badgeClass}`}
                >
                  {stats.completedTasks}/{stats.totalTasks} Done
                </span>
              </div>

              {/* Study Time Metrics */}
              <div className="my-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatDuration(stats.actualMinutes)}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Target: {formatDuration(stats.targetMinutes)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.percent}%`,
                      backgroundColor: folder.color,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>{stats.percent}% completed</span>
                  <span>
                    {stats.actualMinutes >= stats.targetMinutes && stats.targetMinutes > 0
                      ? 'Goal met!'
                      : `${formatDuration(Math.max(0, stats.targetMinutes - stats.actualMinutes))} left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Filter Shortcut */}
            <button
              onClick={() => setSelectedFolderFilter(isSelected ? 'all' : fId)}
              className={`w-full mt-2 py-2 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isSelected ? 'Showing Filtered Tasks' : `View ${stats.totalTasks} Tasks`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
