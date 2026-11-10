import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../utils/dateUtils';
import { Printer, Download, Copy, Check, X, FileText, BookOpen, Calendar, Award } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const {
    folders,
    tasks,
    totalActualMinutes,
    totalTargetMinutes,
    completedTasksCount,
    totalTasksCount,
    dateRecords,
    salahRecords,
    streakDays,
    milestones,
  } = useStudy();

  const { user } = useAuth();
  const [activeExportTab, setActiveExportTab] = useState<'print' | 'markdown'>('print');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate 30-day cumulative stats
  const totalHistoryMins = Object.values(dateRecords).reduce((acc, r) => acc + (r.totalActualMinutes || 0), 0);
  const totalAllTimeMins = totalHistoryMins + totalActualMinutes;

  // Generate clean Markdown representation
  const generateMarkdown = () => {
    let md = `# FocusTrack Study & Routine Progress Report\n`;
    md += `**Date:** ${todayStr}\n`;
    md += `**User:** ${user?.displayName || user?.email || 'FocusTrack Student'}\n\n`;

    md += `## 1. Study Summary Overview\n`;
    md += `- **Today's Actual Study Time:** ${formatDuration(totalActualMinutes)} (Target: ${formatDuration(totalTargetMinutes)})\n`;
    md += `- **Tasks Completed Today:** ${completedTasksCount} / ${totalTasksCount}\n`;
    md += `- **Cumulative Recorded Study Hours:** ${formatDuration(totalAllTimeMins)}\n`;
    md += `- **Active Study Streak:** ${streakDays} days\n\n`;

    md += `## 2. Study Folders & Subject Breakdown\n`;
    folders.forEach((f) => {
      md += `### 📁 ${f.name} (${f.subtitle || 'Folder'})\n`;
      const fTasks = tasks.filter((t) => t.folderId === f.id);
      const fActual = fTasks.reduce((s, t) => s + t.actualMinutes, 0);
      md += `- **Today's Tracked Time:** ${formatDuration(fActual)}\n`;
      md += `- **Subjects:** ${f.subjects.join(', ') || 'None'}\n\n`;

      if (f.subjectFolders && f.subjectFolders.length > 0) {
        md += `#### Chapter Notes & Key Takeaways:\n`;
        f.subjectFolders.forEach((sf) => {
          if (sf.chapters && sf.chapters.length > 0) {
            md += `##### 📖 Subject: ${sf.name}\n`;
            sf.chapters.forEach((ch, idx) => {
              md += `${idx + 1}. **${ch.title}** ${ch.completed ? '*(Completed)*' : '*(In Progress)*'}\n`;
              if (ch.importantPoints) {
                md += `   - **Key Formulas / Points:** ${ch.importantPoints}\n`;
              }
              if (ch.notes) {
                md += `   - **Notes:** ${ch.notes}\n`;
              }
            });
            md += `\n`;
          }
        });
      }
    });

    if (milestones && milestones.length > 0) {
      md += `## 3. Upcoming Target Deadlines & Exams\n`;
      milestones.forEach((m) => {
        md += `- **${m.title}** (${m.category || 'Target'}) - Target: ${m.targetDate} ${m.completed ? '*(Completed)*' : ''}\n`;
        if (m.notes) md += `  *Strategy:* ${m.notes}\n`;
      });
      md += `\n`;
    }

    md += `---\n*Generated via FocusTrack Study Planner on ${new Date().toISOString()}*\n`;
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FocusTrack_Study_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-slate-900 dark:text-white overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Study Report & Notes</h3>
              <p className="text-xs text-slate-400">Download formatted PDF report or Markdown export</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveExportTab('print')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeExportTab === 'print'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Printable / PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveExportTab('markdown')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeExportTab === 'markdown'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Markdown (.md)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
          {activeExportTab === 'print' ? (
            /* Printable Document Layout */
            <div id="focustrack-printable-report" className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
              {/* Report Header */}
              <div className="border-b-2 border-indigo-500/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    FocusTrack Academic Progress Report
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Prepared for: <strong className="text-slate-900 dark:text-white">{user?.displayName || user?.email || 'FocusTrack Student'}</strong>
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p className="font-mono">{todayStr}</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold">Confidential Study Log</p>
                </div>
              </div>

              {/* High-level metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Today Studied</span>
                  <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {formatDuration(totalActualMinutes)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasks Done</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {completedTasksCount} / {totalTasksCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Study Streak</span>
                  <span className="text-lg font-black font-mono text-amber-500">
                    {streakDays} Days
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Recorded</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {formatDuration(totalAllTimeMins)}
                  </span>
                </div>
              </div>

              {/* Folders & Subject Breakdown */}
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                  1. Study Folders & Subject Workspaces
                </h3>
                <div className="space-y-4">
                  {folders.map((f) => {
                    const fTasks = tasks.filter((t) => t.folderId === f.id);
                    const fMins = fTasks.reduce((sum, t) => sum + t.actualMinutes, 0);

                    return (
                      <div key={f.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-md"
                              style={{ backgroundColor: f.color }}
                            />
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {f.name}
                            </h4>
                            <span className="text-[11px] text-slate-400">({f.subjects.length} subjects)</span>
                          </div>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            Today: {formatDuration(fMins)}
                          </span>
                        </div>

                        {/* Subject Folders with Chapter Notes */}
                        {f.subjectFolders && f.subjectFolders.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                            {f.subjectFolders.map((sf) => (
                              <div key={sf.id} className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg">
                                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  📖 {sf.name} ({sf.chapters.length} chapters)
                                </p>
                                {sf.chapters.length > 0 && (
                                  <ul className="mt-1 space-y-1 pl-3 border-l-2 border-indigo-400/40">
                                    {sf.chapters.map((ch) => (
                                      <li key={ch.id} className="text-[11px]">
                                        <span className="font-semibold">{ch.title}</span>
                                        {ch.importantPoints && (
                                          <p className="text-slate-500 italic pl-1 mt-0.5">
                                            Formula/Takeaway: {ch.importantPoints}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Target Deadlines */}
              {milestones.length > 0 && (
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                    2. Upcoming Target Goals & Exam Deadlines
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {milestones.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs">{m.title}</p>
                          <p className="text-[10px] text-slate-400">{m.category} • Target Date: {m.targetDate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {m.completed ? 'Done ✓' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Markdown Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Markdown output ready for Obsidian, Notion, or text archives:</span>
                <span className="font-mono">{generateMarkdown().length} characters</span>
              </div>
              <textarea
                readOnly
                value={generateMarkdown()}
                rows={18}
                className="w-full p-4 bg-slate-950 font-mono text-[11px] text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <p className="text-slate-400 text-[11px] hidden sm:block">
            {activeExportTab === 'print' ? 'Click Print to save as PDF via your browser' : 'Copy or save as Markdown file'}
          </p>

          <div className="flex items-center gap-2 ml-auto">
            {activeExportTab === 'print' ? (
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .md</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
