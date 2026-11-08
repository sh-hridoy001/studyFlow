import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DailyTask,
  PrimaryFolderId,
  ActiveStopwatchState,
  DateStudyRecord,
  ActiveMainTab,
  HistoricalTaskRecord,
} from '../types';
import { INITIAL_DAILY_TASKS } from '../utils/folderConstants';
import { INITIAL_DATE_RECORDS } from '../utils/initialHistory';
import {
  toDateKey,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDatesInRange,
  calculateStreakFromDates,
} from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import {
  saveUserStudyDataToFirestore,
  subscribeToUserStudyData,
  fetchUserStudyDataFromFirestore,
} from '../services/firebase';

interface FolderStats {
  targetMinutes: number;
  actualMinutes: number;
  percent: number;
  totalTasks: number;
  completedTasks: number;
}

export interface PeriodSummary {
  totalActualMinutes: number;
  totalTargetMinutes: number;
  percent: number;
  activeDaysCount: number;
  folderBreakdown: Record<PrimaryFolderId, number>;
}

export type CloudSyncStatus = 'synced' | 'saving' | 'offline' | 'loading';

interface StudyContextType {
  // Navigation
  activeTab: ActiveMainTab;
  setActiveTab: (tab: ActiveMainTab) => void;

  // Cloud Sync
  syncStatus: CloudSyncStatus;
  isDataLoading: boolean;
  refreshFromCloud: () => Promise<void>;

  // Tasks state
  tasks: DailyTask[];
  addTask: (data: {
    folderId: PrimaryFolderId;
    subjectName: string;
    topics: string;
    targetMinutes: number;
    notes?: string;
  }) => DailyTask;
  updateTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addStudyTimeToTask: (taskId: string, minutes: number) => void;

  // Active Stopwatch
  stopwatch: ActiveStopwatchState;
  startStopwatch: (taskId: string, folderId: PrimaryFolderId) => void;
  pauseStopwatch: () => void;
  toggleStopwatch: (taskId?: string, folderId?: PrimaryFolderId) => void;
  resetStopwatch: () => void;

  // Start New Day / Reset Daily Progress
  startNewDay: (archiveFirst?: boolean) => void;

  // History & Date Records
  dateRecords: Record<string, DateStudyRecord>;
  selectedHistoryDate: string;
  setSelectedHistoryDate: (dateKey: string) => void;
  addPastStudyEntry: (data: {
    date: string;
    folderId: PrimaryFolderId;
    subjectName: string;
    topics: string;
    durationMinutes: number;
    completed: boolean;
    notes?: string;
  }) => void;
  deletePastTaskRecord: (dateKey: string, taskId: string) => void;

  // Summaries
  weeklySummary: PeriodSummary;
  monthlySummary: PeriodSummary;
  allTimeTotalMinutes: number;
  streakDays: number;

  // Today Statistics
  folderStats: Record<PrimaryFolderId, FolderStats>;
  totalTargetMinutes: number;
  totalActualMinutes: number;
  overallPercent: number;
  totalTasksCount: number;
  completedTasksCount: number;

  // Filters & Theme
  selectedFolderFilter: PrimaryFolderId | 'all';
  setSelectedFolderFilter: (filter: PrimaryFolderId | 'all') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const StudyContext = createContext<StudyContextType | null>(null);

const STORAGE_THEME_KEY = 'studytracker_theme_v2';

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Main active tab ('routine' vs 'history')
  const [activeTab, setActiveTab] = useState<ActiveMainTab>('routine');

  // Filter selection in routine planner
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<PrimaryFolderId | 'all'>('all');

  // Selected date in history view (defaults to today)
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => toDateKey(new Date()));

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('loading');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const isInitialLoadDoneRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Daily Tasks state (synced with Firestore)
  const [tasks, setTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);

  // Date-Categorized Study Records state (synced with Firestore)
  const [dateRecords, setDateRecords] = useState<Record<string, DateStudyRecord>>(INITIAL_DATE_RECORDS);

  // Stopwatch state
  const [stopwatch, setStopwatch] = useState<ActiveStopwatchState>({
    taskId: null,
    folderId: null,
    isRunning: false,
    secondsElapsed: 0,
    lastTimestamp: Date.now(),
  });

  // Track if state has been modified locally so we can push to Firestore
  const isLocalUpdateRef = useRef<boolean>(false);

  // Firestore Real-Time Listener: Loads automatically for both PC and mobile browsers immediately after login
  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      setSyncStatus('offline');
      isInitialLoadDoneRef.current = false;
      return;
    }

    setIsDataLoading(true);
    setSyncStatus('loading');

    const unsubscribe = subscribeToUserStudyData(
      user.uid,
      (cloudData) => {
        if (cloudData) {
          // Received updated data from Firestore
          if (Array.isArray(cloudData.tasks)) {
            setTasks(cloudData.tasks);
          }
          if (cloudData.dateRecords && typeof cloudData.dateRecords === 'object') {
            setDateRecords(cloudData.dateRecords);
          }
          if (cloudData.stopwatch) {
            setStopwatch((prev) => {
              // Only overwrite stopwatch if not currently ticking locally
              if (prev.isRunning) return prev;
              return cloudData.stopwatch || prev;
            });
          }
          setSyncStatus('synced');
        } else {
          // First time user with empty Firestore document: seed with initial tasks and save to Firestore
          saveUserStudyDataToFirestore(user.uid, {
            tasks: INITIAL_DAILY_TASKS,
            dateRecords: INITIAL_DATE_RECORDS,
          })
            .then(() => setSyncStatus('synced'))
            .catch(() => setSyncStatus('offline'));
        }

        isInitialLoadDoneRef.current = true;
        setIsDataLoading(false);
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setSyncStatus('offline');
        setIsDataLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Push local changes to Firestore with a short debounce to avoid excessive writes
  const scheduleSaveToFirestore = useCallback(
    (newTasks: DailyTask[], newDateRecords: Record<string, DateStudyRecord>) => {
      if (!user || !isInitialLoadDoneRef.current) return;

      setSyncStatus('saving');
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        try {
          await saveUserStudyDataToFirestore(user.uid, {
            tasks: newTasks,
            dateRecords: newDateRecords,
            stopwatch,
          });
          setSyncStatus('synced');
        } catch (error) {
          console.error('Failed to sync study data to Firestore:', error);
          setSyncStatus('offline');
        }
      }, 600);
    },
    [user, stopwatch]
  );

  // Manual refresh from cloud
  const refreshFromCloud = async () => {
    if (!user) return;
    setIsDataLoading(true);
    setSyncStatus('loading');
    try {
      const data = await fetchUserStudyDataFromFirestore(user.uid);
      if (data) {
        if (data.tasks) setTasks(data.tasks);
        if (data.dateRecords) setDateRecords(data.dateRecords);
        setSyncStatus('synced');
      }
    } catch (e) {
      console.error('Refresh from cloud failed:', e);
      setSyncStatus('offline');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Synchronize today's live study progress into dateRecords[todayKey]
  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return;

    const todayKey = toDateKey(new Date());
    const totalTarget = tasks.reduce((sum, t) => sum + t.targetMinutes, 0);
    const totalActual = tasks.reduce((sum, t) => sum + t.actualMinutes, 0);

    const folderBreakdown: Record<
      PrimaryFolderId,
      { targetMinutes: number; actualMinutes: number; tasksCount: number; completedTasksCount: number }
    > = {
      academic: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
      admission: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
      english: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
    };

    tasks.forEach((t) => {
      const f = folderBreakdown[t.folderId];
      if (f) {
        f.targetMinutes += t.targetMinutes;
        f.actualMinutes += t.actualMinutes;
        f.tasksCount += 1;
        if (t.completed) f.completedTasksCount += 1;
      }
    });

    const historicalTasks: HistoricalTaskRecord[] = tasks.map((t) => ({
      id: t.id,
      folderId: t.folderId,
      subjectName: t.subjectName,
      topics: t.topics,
      targetMinutes: t.targetMinutes,
      actualMinutes: t.actualMinutes,
      completed: t.completed,
      notes: t.notes,
    }));

    setDateRecords((prev) => {
      const currentToday = prev[todayKey];
      if (
        currentToday &&
        currentToday.totalActualMinutes === totalActual &&
        currentToday.totalTargetMinutes === totalTarget &&
        currentToday.tasks.length === historicalTasks.length
      ) {
        return prev;
      }

      const nextRecords = {
        ...prev,
        [todayKey]: {
          date: todayKey,
          totalTargetMinutes: totalTarget,
          totalActualMinutes: totalActual,
          tasks: historicalTasks,
          folderBreakdown,
          notes: currentToday?.notes,
        },
      };

      if (isLocalUpdateRef.current) {
        scheduleSaveToFirestore(tasks, nextRecords);
        isLocalUpdateRef.current = false;
      }

      return nextRecords;
    });
  }, [tasks, scheduleSaveToFirestore]);

  // Stopwatch Ticking Engine
  useEffect(() => {
    let interval: number | null = null;

    if (stopwatch.isRunning && stopwatch.taskId) {
      interval = window.setInterval(() => {
        setStopwatch((prev) => {
          if (!prev.isRunning) return prev;
          const nextSeconds = prev.secondsElapsed + 1;

          // Every 60 seconds of elapsed stopwatch time, increment actualMinutes on the task
          if (nextSeconds > 0 && nextSeconds % 60 === 0 && prev.taskId) {
            isLocalUpdateRef.current = true;
            setTasks((currentTasks) =>
              currentTasks.map((t) =>
                t.id === prev.taskId ? { ...t, actualMinutes: t.actualMinutes + 1 } : t
              )
            );
          }

          return {
            ...prev,
            secondsElapsed: nextSeconds,
            lastTimestamp: Date.now(),
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatch.isRunning, stopwatch.taskId]);

  // Task CRUD operations
  const addTask = (data: {
    folderId: PrimaryFolderId;
    subjectName: string;
    topics: string;
    targetMinutes: number;
    notes?: string;
  }): DailyTask => {
    const newTask: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      folderId: data.folderId,
      subjectName: data.subjectName.trim(),
      topics: data.topics.trim(),
      targetMinutes: Math.max(5, data.targetMinutes),
      actualMinutes: 0,
      completed: false,
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = [newTask, ...prev];
      scheduleSaveToFirestore(nextTasks, dateRecords);
      return nextTasks;
    });
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<DailyTask>) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      scheduleSaveToFirestore(nextTasks, dateRecords);
      return nextTasks;
    });
  };

  const deleteTask = (id: string) => {
    if (stopwatch.taskId === id) {
      setStopwatch({
        taskId: null,
        folderId: null,
        isRunning: false,
        secondsElapsed: 0,
        lastTimestamp: Date.now(),
      });
    }
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.filter((t) => t.id !== id);
      scheduleSaveToFirestore(nextTasks, dateRecords);
      return nextTasks;
    });
  };

  const toggleTaskComplete = (id: string) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (t.id !== id) return t;
        const willComplete = !t.completed;
        if (willComplete) {
          try {
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
          } catch {
            // ignore
          }
        }
        return { ...t, completed: willComplete };
      });
      scheduleSaveToFirestore(nextTasks, dateRecords);
      return nextTasks;
    });
  };

  const addStudyTimeToTask = (taskId: string, minutes: number) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) =>
        t.id === taskId ? { ...t, actualMinutes: Math.max(0, t.actualMinutes + minutes) } : t
      );
      scheduleSaveToFirestore(nextTasks, dateRecords);
      return nextTasks;
    });
  };

  // Stopwatch controls
  const startStopwatch = (taskId: string, folderId: PrimaryFolderId) => {
    if (stopwatch.taskId && stopwatch.taskId !== taskId && stopwatch.secondsElapsed >= 30) {
      const leftoverMinutes = Math.round(stopwatch.secondsElapsed / 60);
      if (leftoverMinutes > 0) {
        isLocalUpdateRef.current = true;
        setTasks((prev) => {
          const nextTasks = prev.map((t) =>
            t.id === stopwatch.taskId ? { ...t, actualMinutes: t.actualMinutes + leftoverMinutes } : t
          );
          scheduleSaveToFirestore(nextTasks, dateRecords);
          return nextTasks;
        });
      }
    }

    setStopwatch({
      taskId,
      folderId,
      isRunning: true,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    });
  };

  const pauseStopwatch = () => {
    if (stopwatch.taskId && stopwatch.secondsElapsed >= 30) {
      const leftoverMinutes = Math.round(stopwatch.secondsElapsed / 60);
      if (leftoverMinutes > 0) {
        isLocalUpdateRef.current = true;
        setTasks((prev) => {
          const nextTasks = prev.map((t) =>
            t.id === stopwatch.taskId ? { ...t, actualMinutes: t.actualMinutes + leftoverMinutes } : t
          );
          scheduleSaveToFirestore(nextTasks, dateRecords);
          return nextTasks;
        });
      }
    }

    setStopwatch((prev) => ({
      ...prev,
      isRunning: false,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    }));
  };

  const toggleStopwatch = (taskId?: string, folderId?: PrimaryFolderId) => {
    if (stopwatch.isRunning) {
      pauseStopwatch();
    } else {
      const targetId = taskId || stopwatch.taskId || tasks[0]?.id;
      const targetFolder = folderId || stopwatch.folderId || tasks[0]?.folderId || 'academic';
      if (targetId) {
        startStopwatch(targetId, targetFolder);
      }
    }
  };

  const resetStopwatch = () => {
    setStopwatch({
      taskId: null,
      folderId: null,
      isRunning: false,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    });
  };

  // Start New Day / Reset Daily Progress
  const startNewDay = useCallback(
    (archiveFirst: boolean = true) => {
      pauseStopwatch();

      const todayKey = toDateKey(new Date());
      let nextDateRecords = { ...dateRecords };

      if (archiveFirst && tasks.length > 0) {
        const totalTarget = tasks.reduce((sum, t) => sum + t.targetMinutes, 0);
        const totalActual = tasks.reduce((sum, t) => sum + t.actualMinutes, 0);

        const folderBreakdown: Record<
          PrimaryFolderId,
          { targetMinutes: number; actualMinutes: number; tasksCount: number; completedTasksCount: number }
        > = {
          academic: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
          admission: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
          english: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
        };

        tasks.forEach((t) => {
          const f = folderBreakdown[t.folderId];
          if (f) {
            f.targetMinutes += t.targetMinutes;
            f.actualMinutes += t.actualMinutes;
            f.tasksCount += 1;
            if (t.completed) f.completedTasksCount += 1;
          }
        });

        const dayTasks: HistoricalTaskRecord[] = tasks.map((t) => ({
          id: t.id,
          folderId: t.folderId,
          subjectName: t.subjectName,
          topics: t.topics,
          targetMinutes: t.targetMinutes,
          actualMinutes: t.actualMinutes,
          completed: t.completed,
          notes: t.notes,
        }));

        nextDateRecords[todayKey] = {
          date: todayKey,
          totalTargetMinutes: totalTarget,
          totalActualMinutes: totalActual,
          tasks: dayTasks,
          folderBreakdown,
        };
        setDateRecords(nextDateRecords);
      }

      // Reset today's actual study time and uncheck tasks while keeping subjects/tasks/folders
      const resetTasks = tasks.map((t) => ({
        ...t,
        actualMinutes: 0,
        completed: false,
      }));

      setTasks(resetTasks);
      resetStopwatch();
      scheduleSaveToFirestore(resetTasks, nextDateRecords);

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    },
    [tasks, dateRecords, scheduleSaveToFirestore]
  );

  // Add a study entry to a past date
  const addPastStudyEntry = (data: {
    date: string;
    folderId: PrimaryFolderId;
    subjectName: string;
    topics: string;
    durationMinutes: number;
    completed: boolean;
    notes?: string;
  }) => {
    setDateRecords((prev) => {
      const existing = prev[data.date] || {
        date: data.date,
        totalTargetMinutes: data.durationMinutes,
        totalActualMinutes: 0,
        tasks: [],
        folderBreakdown: {
          academic: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
          admission: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
          english: { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 },
        },
      };

      const newTask: HistoricalTaskRecord = {
        id: `hist-task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        folderId: data.folderId,
        subjectName: data.subjectName.trim(),
        topics: data.topics.trim(),
        targetMinutes: data.durationMinutes,
        actualMinutes: data.durationMinutes,
        completed: data.completed,
        notes: data.notes?.trim() || undefined,
      };

      const updatedTasks = [newTask, ...existing.tasks];
      const updatedActual = existing.totalActualMinutes + data.durationMinutes;
      const updatedTarget = Math.max(existing.totalTargetMinutes, updatedActual);

      const folderBreakdown = { ...existing.folderBreakdown };
      const f = folderBreakdown[data.folderId];
      if (f) {
        f.actualMinutes += data.durationMinutes;
        f.targetMinutes += data.durationMinutes;
        f.tasksCount += 1;
        if (data.completed) f.completedTasksCount += 1;
      }

      const nextRecords = {
        ...prev,
        [data.date]: {
          ...existing,
          totalActualMinutes: updatedActual,
          totalTargetMinutes: updatedTarget,
          tasks: updatedTasks,
          folderBreakdown,
        },
      };

      scheduleSaveToFirestore(tasks, nextRecords);
      return nextRecords;
    });
  };

  const deletePastTaskRecord = (dateKey: string, taskId: string) => {
    setDateRecords((prev) => {
      const dayRecord = prev[dateKey];
      if (!dayRecord) return prev;

      const taskToDelete = dayRecord.tasks.find((t) => t.id === taskId);
      if (!taskToDelete) return prev;

      const remainingTasks = dayRecord.tasks.filter((t) => t.id !== taskId);
      const newActual = Math.max(0, dayRecord.totalActualMinutes - taskToDelete.actualMinutes);
      const newTarget = Math.max(0, dayRecord.totalTargetMinutes - taskToDelete.targetMinutes);

      const folderBreakdown = { ...dayRecord.folderBreakdown };
      const f = folderBreakdown[taskToDelete.folderId];
      if (f) {
        f.actualMinutes = Math.max(0, f.actualMinutes - taskToDelete.actualMinutes);
        f.targetMinutes = Math.max(0, f.targetMinutes - taskToDelete.targetMinutes);
        f.tasksCount = Math.max(0, f.tasksCount - 1);
        if (taskToDelete.completed) {
          f.completedTasksCount = Math.max(0, f.completedTasksCount - 1);
        }
      }

      const nextRecords = {
        ...prev,
        [dateKey]: {
          ...dayRecord,
          totalActualMinutes: newActual,
          totalTargetMinutes: newTarget,
          tasks: remainingTasks,
          folderBreakdown,
        },
      };

      scheduleSaveToFirestore(tasks, nextRecords);
      return nextRecords;
    });
  };

  // Folder Statistics for today
  const folderStats = useMemo(() => {
    const stats: Record<PrimaryFolderId, FolderStats> = {
      academic: { targetMinutes: 0, actualMinutes: 0, percent: 0, totalTasks: 0, completedTasks: 0 },
      admission: { targetMinutes: 0, actualMinutes: 0, percent: 0, totalTasks: 0, completedTasks: 0 },
      english: { targetMinutes: 0, actualMinutes: 0, percent: 0, totalTasks: 0, completedTasks: 0 },
    };

    tasks.forEach((t) => {
      const f = stats[t.folderId];
      if (f) {
        f.targetMinutes += t.targetMinutes;
        f.actualMinutes += t.actualMinutes;
        f.totalTasks += 1;
        if (t.completed) f.completedTasks += 1;
      }
    });

    (['academic', 'admission', 'english'] as PrimaryFolderId[]).forEach((key) => {
      const f = stats[key];
      f.percent =
        f.targetMinutes > 0 ? Math.min(100, Math.round((f.actualMinutes / f.targetMinutes) * 100)) : 0;
    });

    return stats;
  }, [tasks]);

  const totalTargetMinutes = useMemo(() => tasks.reduce((sum, t) => sum + t.targetMinutes, 0), [tasks]);
  const totalActualMinutes = useMemo(() => tasks.reduce((sum, t) => sum + t.actualMinutes, 0), [tasks]);
  const overallPercent = useMemo(
    () =>
      totalTargetMinutes > 0 ? Math.min(100, Math.round((totalActualMinutes / totalTargetMinutes) * 100)) : 0,
    [totalActualMinutes, totalTargetMinutes]
  );
  const totalTasksCount = tasks.length;
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  // Weekly summary calculation (Monday to Sunday of current week)
  const weeklySummary = useMemo<PeriodSummary>(() => {
    const now = new Date();
    const startWeek = getStartOfWeek(now);
    const endWeek = getEndOfWeek(now);
    const weekDates = getDatesInRange(startWeek, endWeek);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<PrimaryFolderId, number> = { academic: 0, admission: 0, english: 0 };

    weekDates.forEach((dKey) => {
      const record = dateRecords[dKey];
      if (record && record.totalActualMinutes > 0) {
        actual += record.totalActualMinutes;
        target += record.totalTargetMinutes;
        activeDays++;
        (['academic', 'admission', 'english'] as PrimaryFolderId[]).forEach((fKey) => {
          folderBreakdown[fKey] += record.folderBreakdown?.[fKey]?.actualMinutes || 0;
        });
      }
    });

    const percent = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
    return {
      totalActualMinutes: actual,
      totalTargetMinutes: target,
      percent,
      activeDaysCount: activeDays,
      folderBreakdown,
    };
  }, [dateRecords]);

  // Monthly summary calculation (1st to last day of current month)
  const monthlySummary = useMemo<PeriodSummary>(() => {
    const now = new Date();
    const startMonth = getStartOfMonth(now);
    const endMonth = getEndOfMonth(now);
    const monthDates = getDatesInRange(startMonth, endMonth);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<PrimaryFolderId, number> = { academic: 0, admission: 0, english: 0 };

    monthDates.forEach((dKey) => {
      const record = dateRecords[dKey];
      if (record && record.totalActualMinutes > 0) {
        actual += record.totalActualMinutes;
        target += record.totalTargetMinutes;
        activeDays++;
        (['academic', 'admission', 'english'] as PrimaryFolderId[]).forEach((fKey) => {
          folderBreakdown[fKey] += record.folderBreakdown?.[fKey]?.actualMinutes || 0;
        });
      }
    });

    const percent = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
    return {
      totalActualMinutes: actual,
      totalTargetMinutes: target,
      percent,
      activeDaysCount: activeDays,
      folderBreakdown,
    };
  }, [dateRecords]);

  // All-time total study minutes
  const allTimeTotalMinutes = useMemo(() => {
    return Object.values(dateRecords).reduce((sum, r) => sum + r.totalActualMinutes, 0);
  }, [dateRecords]);

  // Active study streak in consecutive days
  const streakDays = useMemo(() => {
    const activeDates = Object.entries(dateRecords)
      .filter(([_, rec]) => rec.totalActualMinutes > 0)
      .map(([k]) => k);
    return calculateStreakFromDates(activeDates);
  }, [dateRecords]);

  return (
    <StudyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        syncStatus,
        isDataLoading,
        refreshFromCloud,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addStudyTimeToTask,
        stopwatch,
        startStopwatch,
        pauseStopwatch,
        toggleStopwatch,
        resetStopwatch,
        startNewDay,
        dateRecords,
        selectedHistoryDate,
        setSelectedHistoryDate,
        addPastStudyEntry,
        deletePastTaskRecord,
        weeklySummary,
        monthlySummary,
        allTimeTotalMinutes,
        streakDays,
        folderStats,
        totalTargetMinutes,
        totalActualMinutes,
        overallPercent,
        totalTasksCount,
        completedTasksCount,
        selectedFolderFilter,
        setSelectedFolderFilter,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
