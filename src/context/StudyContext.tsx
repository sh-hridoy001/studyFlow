import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DailyTask,
  FolderDefinition,
  ActiveStopwatchState,
  DateStudyRecord,
  ActiveMainTab,
  HistoricalTaskRecord,
  DailySalahRecord,
  SalahPrayerName,
} from '../types';
import { DEFAULT_DYNAMIC_FOLDERS } from '../utils/folderConstants';
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
  resetUserStudyDataInFirestore,
} from '../services/firebase';

export interface FolderStats {
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
  folderBreakdown: Record<string, number>;
}

export type CloudSyncStatus = 'synced' | 'saving' | 'offline' | 'loading';

interface StudyContextType {
  // Navigation
  activeTab: ActiveMainTab;
  setActiveTab: (tab: ActiveMainTab) => void;

  // Cloud Sync & Reset
  syncStatus: CloudSyncStatus;
  isDataLoading: boolean;
  refreshFromCloud: () => Promise<void>;
  resetAllUserData: () => Promise<void>;

  // Dynamic Folders & Subjects
  folders: FolderDefinition[];
  addFolder: (folder: { name: string; subtitle?: string; color: string; subjects?: string[] }) => FolderDefinition;
  updateFolder: (id: string, updates: Partial<FolderDefinition>) => void;
  deleteFolder: (id: string) => void;
  addSubjectToFolder: (folderId: string, subjectName: string) => void;
  deleteSubjectFromFolder: (folderId: string, subjectName: string) => void;

  // Tasks state
  tasks: DailyTask[];
  addTask: (data: {
    folderId: string;
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
  startStopwatch: (taskId: string, folderId: string) => void;
  pauseStopwatch: () => void;
  toggleStopwatch: (taskId?: string, folderId?: string) => void;
  resetStopwatch: () => void;

  // Start New Day / Reset Daily Progress
  startNewDay: (archiveFirst?: boolean) => void;

  // 5-Time Daily Salah Tracker
  salahRecords: Record<string, DailySalahRecord>;
  selectedSalahDate: string;
  setSelectedSalahDate: (dateStr: string) => void;
  toggleSalahPrayer: (dateStr: string, prayer: SalahPrayerName) => void;
  updateSalahNotes: (dateStr: string, notes: string) => void;
  salahStreakDays: number;
  todaySalahCount: number;

  // History & Date Records
  dateRecords: Record<string, DateStudyRecord>;
  selectedHistoryDate: string;
  setSelectedHistoryDate: (dateKey: string) => void;
  addPastStudyEntry: (data: {
    date: string;
    folderId: string;
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
  folderStats: Record<string, FolderStats>;
  totalTargetMinutes: number;
  totalActualMinutes: number;
  overallPercent: number;
  totalTasksCount: number;
  completedTasksCount: number;

  // Filters & Theme
  selectedFolderFilter: string | 'all';
  setSelectedFolderFilter: (filter: string | 'all') => void;
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

  // Main active tab ('routine' | 'salah' | 'history')
  const [activeTab, setActiveTab] = useState<ActiveMainTab>('routine');

  // Dynamic Folders state
  const [folders, setFolders] = useState<FolderDefinition[]>(DEFAULT_DYNAMIC_FOLDERS);

  // Filter selection in routine planner
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | 'all'>('all');

  // Selected date in history view (defaults to today)
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => toDateKey(new Date()));

  // Selected date in Salah tracker (defaults to today)
  const [selectedSalahDate, setSelectedSalahDate] = useState<string>(() => toDateKey(new Date()));

  // Daily Salah records
  const [salahRecords, setSalahRecords] = useState<Record<string, DailySalahRecord>>({});

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('loading');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const isInitialLoadDoneRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Daily Tasks state
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  // Date-Categorized Study Records state
  const [dateRecords, setDateRecords] = useState<Record<string, DateStudyRecord>>({});

  // Stopwatch state
  const [stopwatch, setStopwatch] = useState<ActiveStopwatchState>({
    taskId: null,
    folderId: null,
    isRunning: false,
    secondsElapsed: 0,
    lastTimestamp: Date.now(),
  });

  const isLocalUpdateRef = useRef<boolean>(false);

  // Push local changes to Firestore with debounce
  const scheduleSaveToFirestore = useCallback(
    (
      newFolders: FolderDefinition[],
      newTasks: DailyTask[],
      newDateRecords: Record<string, DateStudyRecord>,
      newSalahRecords: Record<string, DailySalahRecord>
    ) => {
      if (!user || !isInitialLoadDoneRef.current) return;

      if (user.uid.startsWith('guest_')) {
        try {
          const guestPayload = {
            folders: newFolders,
            tasks: newTasks,
            dateRecords: newDateRecords,
            salahRecords: newSalahRecords,
            stopwatch,
          };
          localStorage.setItem('focustrack_guest_data_' + user.uid, JSON.stringify(guestPayload));
          setSyncStatus('synced');
        } catch (e) {
          console.error('Failed to save guest study data:', e);
        }
        return;
      }

      setSyncStatus('saving');
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        try {
          await saveUserStudyDataToFirestore(user.uid, {
            folders: newFolders,
            tasks: newTasks,
            dateRecords: newDateRecords,
            salahRecords: newSalahRecords,
            stopwatch,
          });
          setSyncStatus('synced');
        } catch (error) {
          console.error('Failed to sync study data to Firestore:', error);
          setSyncStatus('offline');
        }
      }, 500);
    },
    [user, stopwatch]
  );

  // Firestore Real-Time Listener: Initializes fresh & isolated for new users under users/{userId}
  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      setSyncStatus('offline');
      isInitialLoadDoneRef.current = false;
      return;
    }

    if (user.uid.startsWith('guest_')) {
      setIsDataLoading(true);
      const raw = localStorage.getItem('focustrack_guest_data_' + user.uid);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.folders) && parsed.folders.length > 0) setFolders(parsed.folders);
          if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
          if (parsed.dateRecords) setDateRecords(parsed.dateRecords);
          if (parsed.salahRecords) setSalahRecords(parsed.salahRecords);
          if (parsed.stopwatch) setStopwatch(parsed.stopwatch);
        } catch (e) {
          console.error('Failed parsing guest data:', e);
        }
      } else {
        setFolders(DEFAULT_DYNAMIC_FOLDERS);
        setTasks([]);
        setDateRecords({});
        setSalahRecords({});
      }
      isInitialLoadDoneRef.current = true;
      setIsDataLoading(false);
      setSyncStatus('synced');
      return;
    }

    setIsDataLoading(true);
    setSyncStatus('loading');

    const unsubscribe = subscribeToUserStudyData(
      user.uid,
      (cloudData) => {
        if (cloudData) {
          // User already has an existing document
          if (Array.isArray(cloudData.folders) && cloudData.folders.length > 0) {
            setFolders(cloudData.folders);
          } else {
            setFolders(DEFAULT_DYNAMIC_FOLDERS);
          }

          if (Array.isArray(cloudData.tasks)) {
            setTasks(cloudData.tasks);
          } else {
            setTasks([]);
          }

          if (cloudData.dateRecords && typeof cloudData.dateRecords === 'object') {
            setDateRecords(cloudData.dateRecords);
          } else {
            setDateRecords({});
          }

          if (cloudData.salahRecords && typeof cloudData.salahRecords === 'object') {
            setSalahRecords(cloudData.salahRecords);
          } else {
            setSalahRecords({});
          }

          if (cloudData.stopwatch) {
            setStopwatch((prev) => (prev.isRunning ? prev : cloudData.stopwatch || prev));
          }
          setSyncStatus('synced');
        } else {
          // Fresh start for a new user: cleanly initialize isolated under users/{userId}
          const freshFolders = DEFAULT_DYNAMIC_FOLDERS;
          const freshTasks: DailyTask[] = [];
          const freshRecords = {};
          const freshSalah = {};

          setFolders(freshFolders);
          setTasks(freshTasks);
          setDateRecords(freshRecords);
          setSalahRecords(freshSalah);

          saveUserStudyDataToFirestore(user.uid, {
            folders: freshFolders,
            tasks: freshTasks,
            dateRecords: freshRecords,
            salahRecords: freshSalah,
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

  // Manual refresh from cloud
  const refreshFromCloud = async () => {
    if (!user) return;
    if (user.uid.startsWith('guest_')) {
      setSyncStatus('synced');
      return;
    }
    setIsDataLoading(true);
    setSyncStatus('loading');
    try {
      const data = await fetchUserStudyDataFromFirestore(user.uid);
      if (data) {
        if (data.folders) setFolders(data.folders);
        if (data.tasks) setTasks(data.tasks);
        if (data.dateRecords) setDateRecords(data.dateRecords);
        if (data.salahRecords) setSalahRecords(data.salahRecords);
        setSyncStatus('synced');
      }
    } catch (e) {
      console.error('Refresh from cloud failed:', e);
      setSyncStatus('offline');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Reset all user data back to clean zero & defaults
  const resetAllUserData = async () => {
    if (!user) return;
    if (user.uid.startsWith('guest_')) {
      localStorage.removeItem('focustrack_guest_data_' + user.uid);
      setFolders(DEFAULT_DYNAMIC_FOLDERS);
      setTasks([]);
      setDateRecords({});
      setSalahRecords({});
      resetStopwatch();
      setSyncStatus('synced');
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch {}
      return;
    }
    setSyncStatus('saving');
    try {
      await resetUserStudyDataInFirestore(user.uid);
      setFolders(DEFAULT_DYNAMIC_FOLDERS);
      setTasks([]);
      setDateRecords({});
      setSalahRecords({});
      resetStopwatch();
      setSyncStatus('synced');
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch {}
    } catch (error) {
      console.error('Failed to reset user study data:', error);
      setSyncStatus('offline');
      throw error;
    }
  };

  // Synchronize today's live study progress into dateRecords[todayKey]
  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return;

    const todayKey = toDateKey(new Date());
    const totalTarget = tasks.reduce((sum, t) => sum + t.targetMinutes, 0);
    const totalActual = tasks.reduce((sum, t) => sum + t.actualMinutes, 0);

    const folderBreakdown: Record<
      string,
      { targetMinutes: number; actualMinutes: number; tasksCount: number; completedTasksCount: number }
    > = {};

    folders.forEach((f) => {
      folderBreakdown[f.id] = { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 };
    });

    tasks.forEach((t) => {
      if (!folderBreakdown[t.folderId]) {
        folderBreakdown[t.folderId] = { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 };
      }
      const f = folderBreakdown[t.folderId];
      f.targetMinutes += t.targetMinutes;
      f.actualMinutes += t.actualMinutes;
      f.tasksCount += 1;
      if (t.completed) f.completedTasksCount += 1;
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
        scheduleSaveToFirestore(folders, tasks, nextRecords, salahRecords);
        isLocalUpdateRef.current = false;
      }

      return nextRecords;
    });
  }, [tasks, folders, salahRecords, scheduleSaveToFirestore]);

  // Stopwatch Ticking Engine
  useEffect(() => {
    let interval: number | null = null;

    if (stopwatch.isRunning && stopwatch.taskId) {
      interval = window.setInterval(() => {
        setStopwatch((prev) => {
          if (!prev.isRunning) return prev;
          const nextSeconds = prev.secondsElapsed + 1;

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

  // Dynamic Folder CRUD Operations
  const addFolder = (data: { name: string; subtitle?: string; color: string; subjects?: string[] }): FolderDefinition => {
    const newId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newFolder: FolderDefinition = {
      id: newId,
      name: data.name.trim(),
      subtitle: data.subtitle?.trim() || 'Custom study folder',
      color: data.color || '#4F46E5',
      badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      subjects: data.subjects || [],
    };

    setFolders((prev) => {
      const nextFolders = [...prev, newFolder];
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<FolderDefinition>) => {
    setFolders((prev) => {
      const nextFolders = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => {
      const nextFolders = prev.filter((f) => f.id !== id);
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
    if (selectedFolderFilter === id) {
      setSelectedFolderFilter('all');
    }
  };

  const addSubjectToFolder = (folderId: string, subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (f.id !== folderId) return f;
        if (f.subjects.includes(trimmed)) return f;
        return { ...f, subjects: [...f.subjects, trimmed] };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const deleteSubjectFromFolder = (folderId: string, subjectName: string) => {
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (f.id !== folderId) return f;
        return { ...f, subjects: f.subjects.filter((s) => s !== subjectName) };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  // Task CRUD operations
  const addTask = (data: {
    folderId: string;
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

    // If subject is not yet in the folder's subjects list, add it dynamically!
    if (data.subjectName.trim()) {
      addSubjectToFolder(data.folderId, data.subjectName.trim());
    }

    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = [newTask, ...prev];
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<DailyTask>) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
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
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
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
          } catch {}
        }
        return { ...t, completed: willComplete };
      });
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
  };

  const addStudyTimeToTask = (taskId: string, minutes: number) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) =>
        t.id === taskId ? { ...t, actualMinutes: Math.max(0, t.actualMinutes + minutes) } : t
      );
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
  };

  // Stopwatch controls
  const startStopwatch = (taskId: string, folderId: string) => {
    if (stopwatch.taskId && stopwatch.taskId !== taskId && stopwatch.secondsElapsed >= 30) {
      const leftoverMinutes = Math.round(stopwatch.secondsElapsed / 60);
      if (leftoverMinutes > 0) {
        isLocalUpdateRef.current = true;
        setTasks((prev) => {
          const nextTasks = prev.map((t) =>
            t.id === stopwatch.taskId ? { ...t, actualMinutes: t.actualMinutes + leftoverMinutes } : t
          );
          scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
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
          scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
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

  const toggleStopwatch = (taskId?: string, folderId?: string) => {
    if (stopwatch.isRunning) {
      pauseStopwatch();
    } else {
      const targetId = taskId || stopwatch.taskId || tasks[0]?.id;
      const targetFolder = folderId || stopwatch.folderId || tasks[0]?.folderId || folders[0]?.id || 'academic';
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
          string,
          { targetMinutes: number; actualMinutes: number; tasksCount: number; completedTasksCount: number }
        > = {};

        folders.forEach((f) => {
          folderBreakdown[f.id] = { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 };
        });

        tasks.forEach((t) => {
          if (!folderBreakdown[t.folderId]) {
            folderBreakdown[t.folderId] = { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 };
          }
          const f = folderBreakdown[t.folderId];
          f.targetMinutes += t.targetMinutes;
          f.actualMinutes += t.actualMinutes;
          f.tasksCount += 1;
          if (t.completed) f.completedTasksCount += 1;
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
      scheduleSaveToFirestore(folders, resetTasks, nextDateRecords, salahRecords);

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      } catch {}
    },
    [tasks, dateRecords, folders, salahRecords, scheduleSaveToFirestore]
  );

  // 5-Time Daily Salah Tracker Handlers
  const toggleSalahPrayer = (dateStr: string, prayer: SalahPrayerName) => {
    setSalahRecords((prev) => {
      const existing = prev[dateStr] || {
        date: dateStr,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      };

      const willBeComplete = !existing[prayer];
      const updated = {
        ...existing,
        [prayer]: willBeComplete,
        updatedAt: new Date().toISOString(),
      };

      const nextRecords = {
        ...prev,
        [dateStr]: updated,
      };

      // Confetti if all 5 prayers completed for this day!
      if (
        updated.fajr &&
        updated.dhuhr &&
        updated.asr &&
        updated.maghrib &&
        updated.isha &&
        willBeComplete
      ) {
        try {
          confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
        } catch {}
      }

      scheduleSaveToFirestore(folders, tasks, dateRecords, nextRecords);
      return nextRecords;
    });
  };

  const updateSalahNotes = (dateStr: string, notes: string) => {
    setSalahRecords((prev) => {
      const existing = prev[dateStr] || {
        date: dateStr,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      };

      const nextRecords = {
        ...prev,
        [dateStr]: {
          ...existing,
          notes,
          updatedAt: new Date().toISOString(),
        },
      };

      scheduleSaveToFirestore(folders, tasks, dateRecords, nextRecords);
      return nextRecords;
    });
  };

  // Salah streak & today's progress
  const todayKey = toDateKey(new Date());
  const todaySalahRecord = salahRecords[todayKey];
  const todaySalahCount = useMemo(() => {
    if (!todaySalahRecord) return 0;
    return (
      (todaySalahRecord.fajr ? 1 : 0) +
      (todaySalahRecord.dhuhr ? 1 : 0) +
      (todaySalahRecord.asr ? 1 : 0) +
      (todaySalahRecord.maghrib ? 1 : 0) +
      (todaySalahRecord.isha ? 1 : 0)
    );
  }, [todaySalahRecord]);

  const salahStreakDays = useMemo(() => {
    const perfectDates = Object.entries(salahRecords)
      .filter(([_, rec]) => rec.fajr && rec.dhuhr && rec.asr && rec.maghrib && rec.isha)
      .map(([k]) => k);
    return calculateStreakFromDates(perfectDates);
  }, [salahRecords]);

  // Add past study entry
  const addPastStudyEntry = (data: {
    date: string;
    folderId: string;
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
        folderBreakdown: {},
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
      if (!folderBreakdown[data.folderId]) {
        folderBreakdown[data.folderId] = { targetMinutes: 0, actualMinutes: 0, tasksCount: 0, completedTasksCount: 0 };
      }
      const f = folderBreakdown[data.folderId];
      f.actualMinutes += data.durationMinutes;
      f.targetMinutes += data.durationMinutes;
      f.tasksCount += 1;
      if (data.completed) f.completedTasksCount += 1;

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

      scheduleSaveToFirestore(folders, tasks, nextRecords, salahRecords);
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

      scheduleSaveToFirestore(folders, tasks, nextRecords, salahRecords);
      return nextRecords;
    });
  };

  // Dynamic Folder Statistics for today
  const folderStats = useMemo(() => {
    const stats: Record<string, FolderStats> = {};

    folders.forEach((f) => {
      stats[f.id] = { targetMinutes: 0, actualMinutes: 0, percent: 0, totalTasks: 0, completedTasks: 0 };
    });

    tasks.forEach((t) => {
      if (!stats[t.folderId]) {
        stats[t.folderId] = { targetMinutes: 0, actualMinutes: 0, percent: 0, totalTasks: 0, completedTasks: 0 };
      }
      const f = stats[t.folderId];
      f.targetMinutes += t.targetMinutes;
      f.actualMinutes += t.actualMinutes;
      f.totalTasks += 1;
      if (t.completed) f.completedTasks += 1;
    });

    folders.forEach((folder) => {
      const f = stats[folder.id];
      if (f) {
        f.percent =
          f.targetMinutes > 0 ? Math.min(100, Math.round((f.actualMinutes / f.targetMinutes) * 100)) : 0;
      }
    });

    return stats;
  }, [tasks, folders]);

  const totalTargetMinutes = useMemo(() => tasks.reduce((sum, t) => sum + t.targetMinutes, 0), [tasks]);
  const totalActualMinutes = useMemo(() => tasks.reduce((sum, t) => sum + t.actualMinutes, 0), [tasks]);
  const overallPercent = useMemo(
    () =>
      totalTargetMinutes > 0 ? Math.min(100, Math.round((totalActualMinutes / totalTargetMinutes) * 100)) : 0,
    [totalActualMinutes, totalTargetMinutes]
  );
  const totalTasksCount = tasks.length;
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  // Weekly summary calculation
  const weeklySummary = useMemo<PeriodSummary>(() => {
    const now = new Date();
    const startWeek = getStartOfWeek(now);
    const endWeek = getEndOfWeek(now);
    const weekDates = getDatesInRange(startWeek, endWeek);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<string, number> = {};
    folders.forEach((f) => (folderBreakdown[f.id] = 0));

    weekDates.forEach((dKey) => {
      const record = dateRecords[dKey];
      if (record && record.totalActualMinutes > 0) {
        actual += record.totalActualMinutes;
        target += record.totalTargetMinutes;
        activeDays++;
        folders.forEach((f) => {
          folderBreakdown[f.id] = (folderBreakdown[f.id] || 0) + (record.folderBreakdown?.[f.id]?.actualMinutes || 0);
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
  }, [dateRecords, folders]);

  // Monthly summary calculation
  const monthlySummary = useMemo<PeriodSummary>(() => {
    const now = new Date();
    const startMonth = getStartOfMonth(now);
    const endMonth = getEndOfMonth(now);
    const monthDates = getDatesInRange(startMonth, endMonth);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<string, number> = {};
    folders.forEach((f) => (folderBreakdown[f.id] = 0));

    monthDates.forEach((dKey) => {
      const record = dateRecords[dKey];
      if (record && record.totalActualMinutes > 0) {
        actual += record.totalActualMinutes;
        target += record.totalTargetMinutes;
        activeDays++;
        folders.forEach((f) => {
          folderBreakdown[f.id] = (folderBreakdown[f.id] || 0) + (record.folderBreakdown?.[f.id]?.actualMinutes || 0);
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
  }, [dateRecords, folders]);

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
        resetAllUserData,
        folders,
        addFolder,
        updateFolder,
        deleteFolder,
        addSubjectToFolder,
        deleteSubjectFromFolder,
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
        salahRecords,
        selectedSalahDate,
        setSelectedSalahDate,
        toggleSalahPrayer,
        updateSalahNotes,
        salahStreakDays,
        todaySalahCount,
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
