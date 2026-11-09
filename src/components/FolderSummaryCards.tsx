import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import {
  GraduationCap,
  Target,
  Languages,
  Plus,
  Settings2,
  FolderPlus,
  BookOpen,
  Folder,
  ArrowRight,
  Play,
  Pause,
  Timer,
} from 'lucide-react';
import { FolderManageModal } from './FolderManageModal';
import { SubjectWorkspaceModal } from './SubjectWorkspaceModal';

export const FolderSummaryCards: React.FC = () => {
  const {
    folders,
    folderStats,
    selectedFolderFilter,
    setSelectedFolderFilter,
    setSelectedFolderId,
    startFolderTimer,
    pauseStopwatch,
    stopwatch,
  } = useStudy();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | undefined>();
  const [workspaceSubject, setWorkspaceSubject] = useState<{ folderId: string; subjectName: string } | null>(null);

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
    <div className="space-y-3 w-full overflow-x-hidden">
      {/* Top bar above cards to manage folders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Study Folders & Subjects ({folders.length})
          </span>
          {selectedFolderFilter !== 'all' && (
            <button
              onClick={() => setSelectedFolderFilter('all')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <button
          onClick={() => handleOpenManageFolder()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
          <span>+ Add / Manage Folders</span>
        </button>
      </div>

      {/* Grid of Dynamic Folder Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
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
              className={`group bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs flex flex-col justify-between ${
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
                  <div
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group/title"
                    title={`Open ${folder.name} workspace`}
                  >
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 group-hover/title:scale-105 transition-transform"
                      style={{ backgroundColor: folder.color }}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                          {folder.name}
                        </h3>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/title:translate-x-0.5 transition-transform" />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {folder.subtitle || 'Study category'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManageFolder(folder.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Folder settings"
                      aria-label="Manage folder"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
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
                </div>

                {/* Study Time Metrics */}
                <div className="my-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatDuration(stats.actualMinutes)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Target: {formatDuration(stats.targetMinutes)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${stats.percent}%`,
                        backgroundColor: folder.color,
                      }}
                    />
                  </div>
                </div>

                {/* Dynamic Subjects / Course Sub-folders Workspace Chips */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Subject Workspaces ({folder.subjects?.length || 0}):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenManageFolder(folder.id)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
                    {(folder.subjects || []).length === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenManageFolder(folder.id)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline italic flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add your first subject</span>
                      </button>
                    ) : (
                      (folder.subjects || []).map((subject) => {
                        const sf = folder.subjectFolders?.find(
                          (item) => item.name.toLowerCase() === subject.toLowerCase()
                        );
                        const chCount = sf?.chapters?.length || 0;

                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() =>
                              setWorkspaceSubject({
                                folderId: folder.id,
                                subjectName: subject,
                              })
                            }
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all font-semibold cursor-pointer shadow-2xs group/chip"
                            title={`Open "${subject}" Notebook: ${chCount} chapters & notes`}
                          >
                            <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[130px] group-hover/chip:text-indigo-600 dark:group-hover/chip:text-indigo-400 transition-colors">
                              {subject}
                            </span>
                            {chCount > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                                {chCount} ch
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Open Folder + Timer + Filter */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>Open Folder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {(() => {
                    const isRunningHere = String(stopwatch.folderId) === String(folder.id) && stopwatch.isRunning;
                    const isPausedHere = String(stopwatch.folderId) === String(folder.id) && !stopwatch.isRunning && stopwatch.secondsElapsed > 0;

                    if (isRunningHere) {
                      return (
                        <button
                          type="button"
                          onClick={() => pauseStopwatch()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-xs animate-pulse"
                          title="Pause study timer for this folder"
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Pause</span>
                        </button>
                      );
                    }

                    if (isPausedHere) {
                      return (
                        <button
                          type="button"
                          onClick={() => startFolderTimer(folder.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                          title="Resume study timer for this folder"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => startFolderTimer(folder.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Start study timer for this folder"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Timer</span>
                      </button>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() => setSelectedFolderFilter(isSelected ? 'all' : folder.id)}
                    className={`font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Filter tasks list below"
                  >
                    {isSelected ? '✓ Filter' : 'Filter'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Folder Management Modal */}
      <FolderManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        initialFolderId={editingFolderId}
      />

      {/* Subject Workspace Modal with Chapters & Notes */}
      {workspaceSubject && (
        <SubjectWorkspaceModal
          isOpen={!!workspaceSubject}
          folderId={workspaceSubject.folderId}
          subjectName={workspaceSubject.subjectName}
          onClose={() => setWorkspaceSubject(null)}
        />
      )}
    </div>
  );
};
