import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { PrimaryFolderId, DailyTask } from '../types';
import { PRIMARY_FOLDERS } from '../utils/folderConstants';
import { formatDuration, formatFullDate, toDateKey } from '../utils/dateUtils';
import {
  signInWithGoogle,
  signOutGoogle,
  initGoogleAuth,
  getAccessToken,
  createGoogleCalendarEvent,
  buildEventsForTasks,
  FOLDER_CALENDAR_COLORS,
  CalendarEventPayload,
} from '../services/googleCalendar';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  LogOut,
  Clock,
  Layers,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SyncCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateKey?: string; // defaults to today
  onOpenSettings: () => void;
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({
  isOpen,
  onClose,
  targetDateKey,
  onOpenSettings,
}) => {
  const { tasks, dateRecords } = useStudy();

  const activeDate = targetDateKey || toDateKey(new Date());

  // Determine tasks for this date
  const candidateTasks = React.useMemo(() => {
    if (activeDate === toDateKey(new Date())) {
      // Use live tasks for today
      return tasks.filter((t) => t.actualMinutes > 0);
    } else {
      // Use history records
      const record = dateRecords[activeDate];
      return (record?.tasks || []).filter((t) => t.actualMinutes > 0);
    }
  }, [activeDate, tasks, dateRecords]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Selected task IDs to sync (all selected by default)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Base starting hour for the morning schedule
  const [startHour, setStartHour] = useState<number>(9); // 9:00 AM

  // Sync execution state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, cachedToken) => {
        setCurrentUser(user);
        setToken(cachedToken);
      },
      () => {
        setCurrentUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Initialize selected tasks whenever candidates change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTaskIds(candidateTasks.map((t) => t.id));
      setSyncSuccess(false);
      setErrorMessage(null);
      setSyncProgress(null);
    }
  }, [isOpen, candidateTasks]);

  if (!isOpen) return null;

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === candidateTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(candidateTasks.map((t) => t.id));
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setCurrentUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to sign in with Google. If popups are blocked in your browser, please enable them.'
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogle();
      setCurrentUser(null);
      setToken(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign out.');
    }
  };

  // Build preview of events to create
  const tasksToSync = candidateTasks.filter((t) => selectedTaskIds.includes(t.id));
  const plannedEvents = buildEventsForTasks(tasksToSync, activeDate, startHour);

  // Execute sync
  const handleExecuteSync = async () => {
    if (!token) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }
    if (tasksToSync.length === 0) {
      setErrorMessage('Please select at least one study session to export.');
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    setSyncSuccess(false);
    setSyncProgress({ current: 0, total: plannedEvents.length });

    try {
      let created = 0;
      for (let i = 0; i < plannedEvents.length; i++) {
        const item = plannedEvents[i];
        await createGoogleCalendarEvent(token, item.payload);
        created++;
        setSyncProgress({ current: created, total: plannedEvents.length });
      }

      setSyncedCount(created);
      setSyncSuccess(true);
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setErrorMessage(
        err.message || 'Failed to sync events to Google Calendar. Please check your credentials.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Google Calendar Export
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatFullDate(activeDate)}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              Sync Today's Log to Google Calendar
            </h2>
          </div>
        </div>

        {/* Google Authentication Account Card */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full ring-2 ring-indigo-500 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName || 'Google Account Connected'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                    {/* Official Google 'G' icon colors */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Sign in with Google
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Export sessions directly to your Primary Calendar
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-60"
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              )}

              <button
                onClick={onOpenSettings}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="OAuth 2.0 Client ID Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold block">Export Note:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {syncSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Successfully exported {syncedCount} study events to Google Calendar!</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80">
              Your study sessions have been color-coded according to each folder (Academic = Blueberry,
              Admission = Banana, English = Basil).
            </p>
            <div className="pt-1">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                <span>Open Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Study Sessions Selection Section */}
        {candidateTasks.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mb-6">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No completed study time recorded for {formatFullDate(activeDate)} yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Study with the stopwatch or log completed hours to export sessions to your calendar.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Select Sessions to Export ({selectedTaskIds.length}/{candidateTasks.length})
                </span>
              </div>
              <button
                onClick={handleSelectAll}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {selectedTaskIds.length === candidateTasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* List of Tasks / Sessions */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
              {candidateTasks.map((task) => {
                const folder = PRIMARY_FOLDERS[task.folderId];
                const isSelected = selectedTaskIds.includes(task.id);

                return (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTask(task.id)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {task.subjectName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${folder.badgeClass}`}
                        >
                          {folder.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {task.topics || 'Routine study session'}
                      </p>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatDuration(task.actualMinutes)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Schedule Start Time Option */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Base Start Time for Events:</span>
              </div>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value={7}>7:00 AM</option>
                <option value={8}>8:00 AM</option>
                <option value={9}>9:00 AM (Morning)</option>
                <option value={10}>10:00 AM</option>
                <option value={12}>12:00 PM (Noon)</option>
                <option value={14}>2:00 PM (Afternoon)</option>
                <option value={18}>6:00 PM (Evening)</option>
                <option value={20}>8:00 PM (Night)</option>
              </select>
            </div>

            {/* Workspace Confirmation Disclosure (Mandated by Workspace integration skill) */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Calendar Event Export Confirmation</span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Clicking export will create <strong>{tasksToSync.length}</strong> event
                {tasksToSync.length === 1 ? '' : 's'} on your primary Google Calendar starting at{' '}
                <strong>
                  {startHour % 12 === 0 ? 12 : startHour % 12}:00 {startHour >= 12 ? 'PM' : 'AM'}
                </strong>{' '}
                with 15-minute intervals.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={handleSignIn}
                disabled={isAuthLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Sign In to Sync</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleExecuteSync}
                disabled={isSyncing || tasksToSync.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Exporting ({syncProgress?.current || 0}/{syncProgress?.total || 0})...
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Export {tasksToSync.length} Event{tasksToSync.length === 1 ? '' : 's'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
