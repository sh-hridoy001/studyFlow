import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import {
  GraduationCap,
  Target,
  Languages,
  ArrowRight,
  Plus,
  Settings2,
  FolderPlus,
  BookOpen,
} from 'lucide-react';
import { FolderManageModal } from './FolderManageModal';

export const FolderSummaryCards: React.FC = () => {
  const { folders, folderStats, selectedFolderFilter, setSelectedFolderFilter } = useStudy();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | undefined>();

  const handleOpenManageFolder = (folderId?: string) => {
    setEditingFolderId(folderId);
    setIsManageModalOpen(true);
  };

  const getFolderIcon = (iconName?: string) => {
    if (iconName === 'academic') return GraduationCap;
    if (iconName === 'admission') return Target;
    if (iconName === 'english') return Languages;
    return BookOpen;
  };

  return (
    <div className="space-y-3">
      {/* Small bar above cards to manage folders */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Study Folders & Subjects ({folders.length})
        </span>

        <button
          onClick={() => handleOpenManageFolder()}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
          <span>+ Add / Manage Folders</span>
        </button>
      </div>

      {/* Grid of Dynamic Folder Cards (Maintaining exact visual layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {folders.map((folder) => {
          const stats = folderStats[folder.id] || {
            targetMinutes: 0,
            actualMinutes: 0,
            percent: 0,
            totalTasks: 0,
            completedTasks: 0,
          };
          const Icon = getFolderIcon(folder.icon);
          const isSelected = selectedFolderFilter === folder.id;

          return (
            <div
              key={folder.id}
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
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: folder.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate">
                          {folder.name}
                        </h3>
                        <button
                          onClick={() => handleOpenManageFolder(folder.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                          title="Rename folder & manage subjects"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {folder.subtitle || 'Study folder'}
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0"
                    style={{
                      color: folder.color,
                      borderColor: `${folder.color}40`,
                      backgroundColor: `${folder.color}15`,
                    }}
                  >
                    {stats.completedTasks}/{stats.totalTasks} Done
                  </span>
                </div>

                {/* Study Time Metrics */}
                <div className="my-3">
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

                {/* Sub-Folders / Subjects Chips */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>Subjects / Topics ({folder.subjects?.length || 0})</span>
                    <button
                      onClick={() => handleOpenManageFolder(folder.id)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {(folder.subjects || []).slice(0, 3).map((subj) => (
                      <span
                        key={subj}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[150px]"
                      >
                        {subj}
                      </span>
                    ))}
                    {(folder.subjects || []).length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400">
                        +{(folder.subjects?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Filter Shortcut */}
              <button
                onClick={() => setSelectedFolderFilter(isSelected ? 'all' : folder.id)}
                className={`w-full mt-3 py-2 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 border ${
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

      <FolderManageModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setEditingFolderId(undefined);
        }}
        initialEditingFolderId={editingFolderId}
      />
    </div>
  );
};
