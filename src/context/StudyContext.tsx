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
  ChapterNote,
  SubjectFolder,
} from '../types';
import { DEFAULT_DYNAMIC_FOLDERS, ensureFolderSubjectStructure } from '../utils/folderConstants';
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
  addChapterToSubject: (
    folderId: string,
    subjectName: string,
    chapter: { title: string; notes?: string; importantPoints?: string }
  ) => void;
  updateChapterInSubject: (
    folderId: string,
    subjectName: string,
    chapterId: string,
    updates: Partial<ChapterNote>
  ) => void;
  deleteChapterFromSubject: (
    folderId: string,
    subjectName: string,
    chapterId: string
  ) => void;
  toggleChapterCompleted: (
    folderId: string,
    subjectName: string,
    chapterId: string
  ) => void;

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

  // Selected Folder Drill-down (mobile-app like view)
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;

  // Active Stopwatch
  stopwatch: ActiveStopwatchState;
  startStopwatch: (taskId: string, folderId: string) => void;
  startFolderTimer: (folderId: string, subjectName?: string) => void;
  pauseStopwatch: () => void;
  toggleStopwatch: (taskId?: string, folderId?: string) => void;
  resetStopwatch: () => void;
  stopAndSaveStopwatch: () => void;

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

  // Filter selection
  selectedFolderFilter: string | 'all';
  setSelectedFolderFilter: (filter: string | 'all') => void;

  // Historical Records state
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

  // Computed metrics
  folderStats: Record<string, FolderStats>;
  totalTargetMinutes: number;
  totalActualMinutes: number;
  overallPercent: number;
  completedTasksCount: number;
  totalTasksCount: number;

  // Aggregates for History View
  weeklySummary: PeriodSummary;
  monthlySummary: PeriodSummary;
  allTimeTotalMinutes: number;
  streakDays: number;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const StudyContext = createContext<StudyContextType | null>(null);

const STORAGE_THEME_KEY = 'studytracker_theme_v2';
const GUEST_DATA_KEY = 'focustrack_guest_data_';
const CACHE_KEY_PREFIX = 'focustrack_data_cache_';
const ACTIVE_TAB_KEY = 'focustrack_active_tab_v2';

function safeStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function safeStorageSet(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
    return false;
  }
}

function getInitialCachedPayload() {
  if (typeof window === 'undefined') {
    return {
      folders: DEFAULT_DYNAMIC_FOLDERS,
      tasks: [],
      dateRecords: {},
      salahRecords: {},
    };
  }
  try {
    const guestUid = localStorage.getItem('focustrack_guest_uid');
    const isGuestActive = localStorage.getItem('focustrack_guest_session_active') === 'true';

    const storageKey = isGuestActive && guestUid
      ? GUEST_DATA_KEY + 'guest_' + guestUid
      : localStorage.getItem('focustrack_last_active_cache_key') || 'focustrack_active_data';

    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawFolders = Array.isArray(parsed.folders) && parsed.folders.length > 0 ? parsed.folders : DEFAULT_DYNAMIC_FOLDERS;
      return {
        folders: rawFolders.map(ensureFolderSubjectStructure),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        dateRecords: parsed.dateRecords && typeof parsed.dateRecords === 'object' ? parsed.dateRecords : {},
        salahRecords: parsed.salahRecords && typeof parsed.salahRecords === 'object' ? parsed.salahRecords : {},
      };
    }
  } catch (e) {
    console.error('Error getting initial cached payload:', e);
  }
  return {
    folders: DEFAULT_DYNAMIC_FOLDERS.map(ensureFolderSubjectStructure),
    tasks: [],
    dateRecords: {},
    salahRecords: {},
  };
}

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

  // Main active tab ('routine' | 'salah' | 'history') with persistence
  const [activeTab, setActiveTabState] = useState<ActiveMainTab>(() => {
    if (typeof window === 'undefined') return 'routine';
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (saved === 'routine' || saved === 'salah' || saved === 'history') {
      return saved as ActiveMainTab;
    }
    return 'routine';
  });

  const setActiveTab = (tab: ActiveMainTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tab);
    } catch {}
  };

  // Synchronously hydrated state from localStorage cache for instant refresh without data loss
  const initialData = useMemo(() => getInitialCachedPayload(), []);

  // Dynamic Folders state
  const [folders, setFolders] = useState<FolderDefinition[]>(initialData.folders);

  // Selected Folder Drill-down (mobile-app like view)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Filter selection in routine planner
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | 'all'>('all');

  // Selected date in history view (defaults to today)
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => toDateKey(new Date()));

  // Selected date in Salah tracker (defaults to today)
  const [selectedSalahDate, setSelectedSalahDate] = useState<string>(() => toDateKey(new Date()));

  // Daily Salah records
  const [salahRecords, setSalahRecords] = useState<Record<string, DailySalahRecord>>(initialData.salahRecords);

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('synced');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const isInitialLoadDoneRef = useRef<boolean>(true);
  const saveTimeoutRef = useRef<number | null>(null);

  // Daily Tasks state
  const [tasks, setTasks] = useState<DailyTask[]>(initialData.tasks);

  // Date-Categorized Study Records state
  const [dateRecords, setDateRecords] = useState<Record<string, DateStudyRecord>>(initialData.dateRecords);

  // Stopwatch state
  const [stopwatch, setStopwatch] = useState<ActiveStopwatchState>({
    taskId: null,
    folderId: null,
    isRunning: false,
    secondsElapsed: 0,
    lastTimestamp: Date.now(),
  });

  const isLocalUpdateRef = useRef<boolean>(false);
  const stopwatchRef = useRef<ActiveStopwatchState>(stopwatch);
  useEffect(() => {
    stopwatchRef.current = stopwatch;
  }, [stopwatch]);

  // Helper to persist current snapshot to localStorage cache
  const saveSnapshotToLocalStorage = useCallback(
    (
      currentFolders: FolderDefinition[],
      currentTasks: DailyTask[],
      currentDateRecords: Record<string, DateStudyRecord>,
      currentSalahRecords: Record<string, DailySalahRecord>,
      customStopwatch?: ActiveStopwatchState
    ) => {
      const payload = {
        folders: currentFolders,
        tasks: currentTasks,
        dateRecords: currentDateRecords,
        salahRecords: currentSalahRecords,
        // In persistent storage, timer is always stored with isRunning: false
        stopwatch: customStopwatch || { ...stopwatchRef.current, isRunning: false },
      };

      if (user?.uid) {
        const key = user.uid.startsWith('guest_')
          ? GUEST_DATA_KEY + user.uid
          : CACHE_KEY_PREFIX + user.uid;
        safeStorageSet(key, payload);
        safeStorageSet('focustrack_last_active_cache_key', key);
      }
      safeStorageSet('focustrack_active_data', payload);
    },
    [user]
  );

  // Push changes to Firestore (or LocalStorage if Guest) with debouncing & safety
  const scheduleSaveToFirestore = useCallback(
    (
      newFolders: FolderDefinition[],
      newTasks: DailyTask[],
      newDateRecords: Record<string, DateStudyRecord>,
      newSalahRecords: Record<string, DailySalahRecord>,
      customStopwatch?: ActiveStopwatchState
    ) => {
      // 1. Immediately persist to localStorage so refresh never loses data!
      saveSnapshotToLocalStorage(newFolders, newTasks, newDateRecords, newSalahRecords, customStopwatch);

      if (!user) return;

      // Guest mode writes entirely to local storage
      if (user.uid.startsWith('guest_')) {
        setSyncStatus('synced');
        return;
      }

      // Authenticated user: debounced push to Firebase Firestore
      setSyncStatus('saving');
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        try {
          const swToSave = customStopwatch || { ...stopwatchRef.current, isRunning: false };
          await saveUserStudyDataToFirestore(user.uid, {
            folders: newFolders,
            tasks: newTasks,
            dateRecords: newDateRecords,
            salahRecords: newSalahRecords,
            stopwatch: swToSave,
          });
          setSyncStatus('synced');
        } catch (error) {
          console.error('Failed to sync study data to Firestore:', error);
          setSyncStatus('offline');
        }
      }, 500);
    },
    [user, saveSnapshotToLocalStorage]
  );

  // Load and subscribe to data when user state changes
  useEffect(() => {
    if (!user) {
      setSyncStatus('offline');
      setIsDataLoading(false);
      return;
    }

    // 1. Guest Mode: Load from LocalStorage
    if (user.uid.startsWith('guest_')) {
      setIsDataLoading(true);
      const storageKey = GUEST_DATA_KEY + user.uid;
      const cached = safeStorageGet<any>(storageKey, null);
      if (cached) {
        if (Array.isArray(cached.folders) && cached.folders.length > 0) setFolders(cached.folders);
        if (Array.isArray(cached.tasks)) setTasks(cached.tasks);
        if (cached.dateRecords && typeof cached.dateRecords === 'object') setDateRecords(cached.dateRecords);
        if (cached.salahRecords && typeof cached.salahRecords === 'object') setSalahRecords(cached.salahRecords);
        if (cached.stopwatch) setStopwatch({ ...cached.stopwatch, isRunning: false });
      } else {
        // Initialize fresh guest data
        const initialGuest = {
          folders: DEFAULT_DYNAMIC_FOLDERS,
          tasks: [],
          dateRecords: {},
          salahRecords: {},
          stopwatch: { taskId: null, folderId: null, isRunning: false, secondsElapsed: 0, lastTimestamp: Date.now() },
        };
        safeStorageSet(storageKey, initialGuest);
        setFolders(DEFAULT_DYNAMIC_FOLDERS);
        setTasks([]);
        setDateRecords({});
        setSalahRecords({});
      }
      setIsDataLoading(false);
      setSyncStatus('synced');
      isInitialLoadDoneRef.current = true;
      return;
    }

    // 2. Authenticated Mode: Load from Local Cache first (instant), then listen to Firestore
    const userCacheKey = CACHE_KEY_PREFIX + user.uid;
    const localUserCache = safeStorageGet<any>(userCacheKey, null);
    if (localUserCache) {
      if (Array.isArray(localUserCache.folders) && localUserCache.folders.length > 0) setFolders(localUserCache.folders);
      if (Array.isArray(localUserCache.tasks)) setTasks(localUserCache.tasks);
      if (localUserCache.dateRecords && typeof localUserCache.dateRecords === 'object') setDateRecords(localUserCache.dateRecords);
      if (localUserCache.salahRecords && typeof localUserCache.salahRecords === 'object') setSalahRecords(localUserCache.salahRecords);
    }

    setIsDataLoading(true);
    setSyncStatus('loading');

    const unsubscribe = subscribeToUserStudyData(
      user.uid,
      (cloudData) => {
        if (cloudData) {
          // Cloud document exists: apply updates & cache locally
          const rawCloudFolders = Array.isArray(cloudData.folders) && cloudData.folders.length > 0 ? cloudData.folders : DEFAULT_DYNAMIC_FOLDERS;
          const updatedFolders = rawCloudFolders.map(ensureFolderSubjectStructure);
          const updatedTasks = Array.isArray(cloudData.tasks) ? cloudData.tasks : [];
          const updatedRecords = cloudData.dateRecords && typeof cloudData.dateRecords === 'object' ? cloudData.dateRecords : {};
          const updatedSalah = cloudData.salahRecords && typeof cloudData.salahRecords === 'object' ? cloudData.salahRecords : {};

          setFolders(updatedFolders);
          setTasks(updatedTasks);
          setDateRecords(updatedRecords);
          setSalahRecords(updatedSalah);

          // Never override active local stopwatch from remote Firestore snapshot!
          // The local stopwatch is interactive user UI state and must never auto-restart from snapshot events.

          // Save to local cache
          safeStorageSet(userCacheKey, {
            folders: updatedFolders,
            tasks: updatedTasks,
            dateRecords: updatedRecords,
            salahRecords: updatedSalah,
            stopwatch: { ...stopwatchRef.current, isRunning: false },
          });

          setSyncStatus('synced');
        } else {
          // No cloud document yet: check if local cache had data before clearing!
          const existingLocal = safeStorageGet<any>(userCacheKey, null);
          const initialFolders = existingLocal?.folders?.length ? existingLocal.folders : DEFAULT_DYNAMIC_FOLDERS;
          const initialTasks = existingLocal?.tasks || [];
          const initialRecords = existingLocal?.dateRecords || {};
          const initialSalah = existingLocal?.salahRecords || {};

          setFolders(initialFolders);
          setTasks(initialTasks);
          setDateRecords(initialRecords);
          setSalahRecords(initialSalah);

          saveUserStudyDataToFirestore(user.uid, {
            folders: initialFolders,
            tasks: initialTasks,
            dateRecords: initialRecords,
            salahRecords: initialSalah,
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
    setSyncStatus('saving');
    try {
      if (user.uid.startsWith('guest_')) {
        localStorage.removeItem(GUEST_DATA_KEY + user.uid);
        localStorage.removeItem('focustrack_active_data');
      } else {
        await resetUserStudyDataInFirestore(user.uid);
        localStorage.removeItem(CACHE_KEY_PREFIX + user.uid);
      }

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

  // Decoupled ref for background saving to avoid interval recreation loops
  const latestStudyStateRef = useRef({
    folders,
    dateRecords,
    salahRecords,
    scheduleSaveToFirestore,
  });
  useEffect(() => {
    latestStudyStateRef.current = {
      folders,
      dateRecords,
      salahRecords,
      scheduleSaveToFirestore,
    };
  }, [folders, dateRecords, salahRecords, scheduleSaveToFirestore]);

  // Active Stopwatch tick effect (supports both task-based timer and folder-level timer)
  useEffect(() => {
    let interval: number | null = null;

    if (stopwatch.isRunning && (stopwatch.taskId || stopwatch.folderId)) {
      interval = window.setInterval(() => {
        setStopwatch((prev) => {
          if (!prev.isRunning) return prev;
          const now = Date.now();
          const deltaSec = Math.max(1, Math.round((now - prev.lastTimestamp) / 1000));
          const newElapsed = prev.secondsElapsed + deltaSec;

          // Check if one or more full minutes were completed
          const prevMinute = Math.floor(prev.secondsElapsed / 60);
          const newMinute = Math.floor(newElapsed / 60);
          const minutesToAdd = newMinute - prevMinute;

          if (minutesToAdd > 0) {
            setTasks((currentTasks) => {
              let updatedTasks = currentTasks;
              let targetTaskId = prev.taskId;

              if (targetTaskId) {
                const found = currentTasks.some((t) => String(t.id) === String(targetTaskId));
                if (found) {
                  updatedTasks = currentTasks.map((t) =>
                    String(t.id) === String(targetTaskId)
                      ? { ...t, actualMinutes: t.actualMinutes + minutesToAdd }
                      : t
                  );
                } else if (prev.folderId) {
                  const targetSubj = prev.subjectName || 'Study Session';
                  const existingTask = currentTasks.find(
                    (t) =>
                      String(t.folderId) === String(prev.folderId) &&
                      t.subjectName.toLowerCase() === targetSubj.toLowerCase()
                  );
                  if (existingTask) {
                    updatedTasks = currentTasks.map((t) =>
                      String(t.id) === String(existingTask.id)
                        ? { ...t, actualMinutes: t.actualMinutes + minutesToAdd }
                        : t
                    );
                  }
                }
              } else if (prev.folderId) {
                const targetSubj = prev.subjectName || 'Study Session';
                const existingTask = currentTasks.find(
                  (t) =>
                    String(t.folderId) === String(prev.folderId) &&
                    t.subjectName.toLowerCase() === targetSubj.toLowerCase()
                );
                if (existingTask) {
                  updatedTasks = currentTasks.map((t) =>
                    String(t.id) === String(existingTask.id)
                      ? { ...t, actualMinutes: t.actualMinutes + minutesToAdd }
                      : t
                  );
                } else {
                  const newTask: DailyTask = {
                    id: `task-timer-${Date.now()}`,
                    folderId: prev.folderId,
                    subjectName: targetSubj,
                    topics: 'Folder study session',
                    targetMinutes: 60,
                    actualMinutes: minutesToAdd,
                    completed: false,
                    createdAt: new Date().toISOString(),
                  };
                  updatedTasks = [newTask, ...currentTasks];
                }
              }

              const { folders: f, dateRecords: dr, salahRecords: sr, scheduleSaveToFirestore: saveFn } =
                latestStudyStateRef.current;
              saveFn(f, updatedTasks, dr, sr);
              return updatedTasks;
            });
          }

          // Monotonically increasing elapsed seconds (e.g. 59, 60, 61... 120... 180)
          return {
            ...prev,
            secondsElapsed: newElapsed,
            lastTimestamp: now,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [stopwatch.isRunning, stopwatch.taskId, stopwatch.folderId]);

  // Dynamic Folder Operations
  const addFolder = (folderData: {
    name: string;
    subtitle?: string;
    color: string;
    subjects?: string[];
  }): FolderDefinition => {
    const newId = `folder_${Date.now()}`;
    const newFolder: FolderDefinition = {
      id: newId,
      name: folderData.name.trim(),
      subtitle: folderData.subtitle?.trim() || 'Custom study folder',
      color: folderData.color,
      badgeClass: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      subjects: folderData.subjects || [],
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
      const nextFolders = prev.map((f) => (String(f.id) === String(id) ? { ...f, ...updates } : f));
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => {
      const nextFolders = prev.filter((f) => String(f.id) !== String(id));
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
    if (String(selectedFolderFilter) === String(id)) {
      setSelectedFolderFilter('all');
    }
  };

  const addSubjectToFolder = (folderId: string, subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        if (normalized.subjects.includes(trimmed)) return normalized;

        const nextSubjects = [...normalized.subjects, trimmed];
        const nextSubjectFolders = [
          ...(normalized.subjectFolders || []),
          {
            id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: trimmed,
            chapters: [],
            createdAt: new Date().toISOString(),
          },
        ];

        return {
          ...normalized,
          subjects: nextSubjects,
          subjectFolders: nextSubjectFolders,
        };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const deleteSubjectFromFolder = (folderId: string, subjectName: string) => {
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        return {
          ...normalized,
          subjects: normalized.subjects.filter((s) => s !== subjectName),
          subjectFolders: (normalized.subjectFolders || []).filter((s) => s.name !== subjectName),
        };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const addChapterToSubject = (
    folderId: string,
    subjectName: string,
    chapter: { title: string; notes?: string; importantPoints?: string }
  ) => {
    if (!chapter.title.trim()) return;
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        const nextSubjectFolders = (normalized.subjectFolders || []).map((sf) => {
          if (sf.name.toLowerCase() !== subjectName.toLowerCase()) return sf;
          const newChap: ChapterNote = {
            id: `chap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: chapter.title.trim(),
            notes: chapter.notes?.trim() || '',
            importantPoints: chapter.importantPoints?.trim() || '',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...sf,
            chapters: [...sf.chapters, newChap],
          };
        });
        return {
          ...normalized,
          subjectFolders: nextSubjectFolders,
        };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const updateChapterInSubject = (
    folderId: string,
    subjectName: string,
    chapterId: string,
    updates: Partial<ChapterNote>
  ) => {
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        const nextSubjectFolders = (normalized.subjectFolders || []).map((sf) => {
          if (sf.name.toLowerCase() !== subjectName.toLowerCase()) return sf;
          const updatedChapters = sf.chapters.map((ch) => {
            if (String(ch.id) !== String(chapterId)) return ch;
            return {
              ...ch,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...sf, chapters: updatedChapters };
        });
        return { ...normalized, subjectFolders: nextSubjectFolders };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const deleteChapterFromSubject = (
    folderId: string,
    subjectName: string,
    chapterId: string
  ) => {
    setFolders((prev) => {
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        const nextSubjectFolders = (normalized.subjectFolders || []).map((sf) => {
          if (sf.name.toLowerCase() !== subjectName.toLowerCase()) return sf;
          return {
            ...sf,
            chapters: sf.chapters.filter((ch) => String(ch.id) !== String(chapterId)),
          };
        });
        return { ...normalized, subjectFolders: nextSubjectFolders };
      });
      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  const toggleChapterCompleted = (
    folderId: string,
    subjectName: string,
    chapterId: string
  ) => {
    setFolders((prev) => {
      let isNowComplete = false;
      const nextFolders = prev.map((f) => {
        if (String(f.id) !== String(folderId)) return f;
        const normalized = ensureFolderSubjectStructure(f);
        const nextSubjectFolders = (normalized.subjectFolders || []).map((sf) => {
          if (sf.name.toLowerCase() !== subjectName.toLowerCase()) return sf;
          const updatedChapters = sf.chapters.map((ch) => {
            if (String(ch.id) !== String(chapterId)) return ch;
            isNowComplete = !ch.completed;
            return {
              ...ch,
              completed: !ch.completed,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...sf, chapters: updatedChapters };
        });
        return { ...normalized, subjectFolders: nextSubjectFolders };
      });

      if (isNowComplete) {
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
        } catch {}
      }

      scheduleSaveToFirestore(nextFolders, tasks, dateRecords, salahRecords);
      return nextFolders;
    });
  };

  // Task CRUD operations with String() ID matching
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

    // Also register subject under folder's subject list if not present
    let nextFolders = folders;
    if (data.subjectName.trim()) {
      nextFolders = folders.map((f) => {
        if (String(f.id) !== String(data.folderId)) return f;
        if (f.subjects.includes(data.subjectName.trim())) return f;
        return { ...f, subjects: [...f.subjects, data.subjectName.trim()] };
      });
      setFolders(nextFolders);
    }

    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = [newTask, ...prev];
      scheduleSaveToFirestore(nextFolders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<DailyTask>) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (String(t.id) === String(id) ? { ...t, ...updates } : t));
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
  };

  const deleteTask = (id: string) => {
    if (String(stopwatch.taskId) === String(id)) {
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
      const nextTasks = prev.filter((t) => String(t.id) !== String(id));
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
  };

  const toggleTaskComplete = (id: string) => {
    isLocalUpdateRef.current = true;
    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (String(t.id) !== String(id)) return t;
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
        String(t.id) === String(taskId)
          ? { ...t, actualMinutes: Math.max(0, t.actualMinutes + minutes) }
          : t
      );
      scheduleSaveToFirestore(folders, nextTasks, dateRecords, salahRecords);
      return nextTasks;
    });
  };

  // Flush accumulated timer seconds into task/folder records immediately
  // Flush uncredited timer seconds into task records on unload or session switch
  const flushStopwatchTimeToTasks = useCallback(
    (swState: ActiveStopwatchState) => {
      const uncredited = swState.secondsElapsed % 60;
      const shouldRoundUp = uncredited >= 30 || (swState.secondsElapsed >= 25 && swState.secondsElapsed < 60);
      if (!shouldRoundUp) return;

      isLocalUpdateRef.current = true;
      setTasks((prevTasks) => {
        let updatedTasks = prevTasks;
        if (swState.taskId) {
          updatedTasks = prevTasks.map((t) =>
            String(t.id) === String(swState.taskId)
              ? { ...t, actualMinutes: t.actualMinutes + 1 }
              : t
          );
        } else if (swState.folderId) {
          const targetSubj = (swState.subjectName || '').trim() || 'Study Session';
          const existing = prevTasks.find(
            (t) =>
              String(t.folderId) === String(swState.folderId) &&
              t.subjectName.toLowerCase() === targetSubj.toLowerCase()
          );
          if (existing) {
            updatedTasks = prevTasks.map((t) =>
              String(t.id) === String(existing.id)
                ? { ...t, actualMinutes: t.actualMinutes + 1 }
                : t
            );
          }
        }
        scheduleSaveToFirestore(folders, updatedTasks, dateRecords, salahRecords);
        return updatedTasks;
      });
    },
    [folders, dateRecords, salahRecords, scheduleSaveToFirestore]
  );

  // Flush on tab close or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stopwatch.secondsElapsed >= 25) {
        flushStopwatchTimeToTasks(stopwatch);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stopwatch, flushStopwatchTimeToTasks]);

  // Stopwatch controls (Task-level & Folder-level)
  const startStopwatch = (taskId: string, folderId: string) => {
    // If resuming the same task that was paused, continue from current elapsed seconds
    if (String(stopwatchRef.current.taskId) === String(taskId) && stopwatchRef.current.secondsElapsed > 0 && !stopwatchRef.current.isRunning) {
      const resumedState: ActiveStopwatchState = {
        ...stopwatchRef.current,
        isRunning: true,
        lastTimestamp: Date.now(),
      };
      stopwatchRef.current = resumedState;
      setStopwatch(resumedState);
      return;
    }

    const linkedTask = tasks.find((t) => String(t.id) === String(taskId));
    const newState: ActiveStopwatchState = {
      taskId,
      folderId,
      subjectName: linkedTask?.subjectName || null,
      isRunning: true,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    };
    stopwatchRef.current = newState;
    setStopwatch(newState);
  };

  const startFolderTimer = (folderId: string, subjectName?: string) => {
    const targetSubj = (subjectName || '').trim() || 'Study Session';

    // If already paused on the same folder and subject, resume seamlessly!
    if (
      String(stopwatchRef.current.folderId) === String(folderId) &&
      (!stopwatchRef.current.subjectName || stopwatchRef.current.subjectName.toLowerCase() === targetSubj.toLowerCase()) &&
      stopwatchRef.current.secondsElapsed > 0 &&
      !stopwatchRef.current.isRunning
    ) {
      const resumedState: ActiveStopwatchState = {
        ...stopwatchRef.current,
        isRunning: true,
        lastTimestamp: Date.now(),
      };
      stopwatchRef.current = resumedState;
      setStopwatch(resumedState);
      return;
    }

    // Immediately link or create a task for today so dashboard and routine display it live!
    let activeTaskId = '';
    const existingTask = tasks.find(
      (t) =>
        String(t.folderId) === String(folderId) &&
        t.subjectName.toLowerCase() === targetSubj.toLowerCase()
    );

    if (existingTask) {
      activeTaskId = existingTask.id;
    } else {
      const newTask: DailyTask = {
        id: `task-timer-${Date.now()}`,
        folderId,
        subjectName: targetSubj,
        topics: 'Live study session',
        targetMinutes: 60,
        actualMinutes: 0,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      activeTaskId = newTask.id;
      setTasks((prev) => {
        const next = [newTask, ...prev];
        scheduleSaveToFirestore(folders, next, dateRecords, salahRecords);
        return next;
      });
    }

    const newState: ActiveStopwatchState = {
      taskId: activeTaskId,
      folderId,
      subjectName: targetSubj,
      isRunning: true,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    };
    stopwatchRef.current = newState;
    setStopwatch(newState);
  };

  const pauseStopwatch = () => {
    // 1. Immediately cancel any scheduled debounced save that could have contained isRunning: true
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    const pausedState: ActiveStopwatchState = {
      ...stopwatchRef.current,
      isRunning: false,
      lastTimestamp: Date.now(),
    };
    stopwatchRef.current = pausedState;
    setStopwatch(pausedState);

    // Save stopped/paused state with isRunning: false to storage immediately
    saveSnapshotToLocalStorage(folders, tasks, dateRecords, salahRecords, pausedState);
    if (user && !user.uid.startsWith('guest_')) {
      saveUserStudyDataToFirestore(user.uid, {
        folders,
        tasks,
        dateRecords,
        salahRecords,
        stopwatch: pausedState,
      }).catch(console.error);
    }
  };

  const stopAndSaveStopwatch = () => {
    // 1. Immediately cancel any scheduled debounced save
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    const currentElapsed = stopwatchRef.current.secondsElapsed;
    const currentTaskId = stopwatchRef.current.taskId;
    const uncreditedSeconds = currentElapsed % 60;
    const shouldRoundUp = uncreditedSeconds >= 30 || (currentElapsed >= 25 && currentElapsed < 60);

    const stoppedState: ActiveStopwatchState = {
      taskId: null,
      folderId: null,
      subjectName: null,
      isRunning: false,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    };
    stopwatchRef.current = stoppedState;
    setStopwatch(stoppedState);

    setTasks((currentTasks) => {
      let updated = currentTasks;
      if (shouldRoundUp && currentTaskId) {
        updated = currentTasks.map((t) =>
          String(t.id) === String(currentTaskId)
            ? { ...t, actualMinutes: t.actualMinutes + 1 }
            : t
        );
      }

      saveSnapshotToLocalStorage(folders, updated, dateRecords, salahRecords, stoppedState);
      if (user && !user.uid.startsWith('guest_')) {
        saveUserStudyDataToFirestore(user.uid, {
          folders,
          tasks: updated,
          dateRecords,
          salahRecords,
          stopwatch: stoppedState,
        }).catch(console.error);
      }
      return updated;
    });

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

  const toggleStopwatch = (taskId?: string, folderId?: string) => {
    if (stopwatchRef.current.isRunning) {
      pauseStopwatch();
    } else if (stopwatchRef.current.secondsElapsed > 0) {
      // Resume current active timer
      const resumedState: ActiveStopwatchState = {
        ...stopwatchRef.current,
        isRunning: true,
        lastTimestamp: Date.now(),
      };
      stopwatchRef.current = resumedState;
      setStopwatch(resumedState);
    } else if (taskId && folderId) {
      startStopwatch(taskId, folderId);
    } else if (folderId) {
      startFolderTimer(folderId);
    }
  };

  const resetStopwatch = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    const stoppedState: ActiveStopwatchState = {
      taskId: null,
      folderId: null,
      subjectName: null,
      isRunning: false,
      secondsElapsed: 0,
      lastTimestamp: Date.now(),
    };
    stopwatchRef.current = stoppedState;
    setStopwatch(stoppedState);

    saveSnapshotToLocalStorage(folders, tasks, dateRecords, salahRecords, stoppedState);
    if (user && !user.uid.startsWith('guest_')) {
      saveUserStudyDataToFirestore(user.uid, {
        folders,
        tasks,
        dateRecords,
        salahRecords,
        stopwatch: stoppedState,
      }).catch(console.error);
    }
  };

  // Start New Day / Archive Today
  const startNewDay = (archiveFirst = true) => {
    const today = toDateKey(new Date());

    if (archiveFirst && (tasks.length > 0 || totalActualMinutes > 0)) {
      const dayTasks: HistoricalTaskRecord[] = tasks.map((t) => ({
        id: String(t.id),
        folderId: t.folderId,
        subjectName: t.subjectName,
        topics: t.topics,
        targetMinutes: t.targetMinutes,
        actualMinutes: t.actualMinutes,
        completed: t.completed,
        notes: t.notes,
      }));

      const folderBreakdown: Record<string, { targetMinutes: number; actualMinutes: number; tasksCount: number; completedTasksCount: number }> = {};
      folders.forEach((f) => {
        const stats = folderStats[f.id];
        if (stats) {
          folderBreakdown[f.id] = {
            targetMinutes: stats.targetMinutes,
            actualMinutes: stats.actualMinutes,
            tasksCount: stats.totalTasks,
            completedTasksCount: stats.completedTasks,
          };
        }
      });

      const todayRecord: DateStudyRecord = {
        date: today,
        totalTargetMinutes,
        totalActualMinutes,
        tasks: dayTasks,
        folderBreakdown,
      };

      setDateRecords((prev) => {
        const nextRecords = {
          ...prev,
          [today]: todayRecord,
        };
        return nextRecords;
      });
    }

    // Reset today's active progress counters while keeping configured subjects/folders
    resetStopwatch();
    setTasks((prev) => {
      const resetTasks = prev.map((t) => ({
        ...t,
        actualMinutes: 0,
        completed: false,
      }));
      scheduleSaveToFirestore(folders, resetTasks, dateRecords, salahRecords);
      return resetTasks;
    });

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

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
      const updated: DailySalahRecord = {
        ...existing,
        [prayer]: willBeComplete,
        updatedAt: new Date().toISOString(),
      };

      const nextRecords = {
        ...prev,
        [dateStr]: updated,
      };

      // Confetti celebration if all 5 prayers completed for this day!
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

      const taskToDelete = dayRecord.tasks.find((t) => String(t.id) === String(taskId));
      if (!taskToDelete) return prev;

      const remainingTasks = dayRecord.tasks.filter((t) => String(t.id) !== String(taskId));
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
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const totalTasksCount = tasks.length;

  // Aggregate stats for History View
  const weeklySummary: PeriodSummary = useMemo(() => {
    const today = new Date();
    const start = getStartOfWeek(today);
    const end = getEndOfWeek(today);
    const dates = getDatesInRange(start, end);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<string, number> = {};

    dates.forEach((d) => {
      const rec = dateRecords[d];
      if (rec && rec.totalActualMinutes > 0) {
        actual += rec.totalActualMinutes;
        target += rec.totalTargetMinutes;
        activeDays += 1;
        Object.entries(rec.folderBreakdown || {}).forEach(([fId, data]) => {
          folderBreakdown[fId] = (folderBreakdown[fId] || 0) + data.actualMinutes;
        });
      }
    });

    return {
      totalActualMinutes: actual,
      totalTargetMinutes: target,
      percent: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0,
      activeDaysCount: activeDays,
      folderBreakdown,
    };
  }, [dateRecords]);

  const monthlySummary: PeriodSummary = useMemo(() => {
    const today = new Date();
    const start = getStartOfMonth(today);
    const end = getEndOfMonth(today);
    const dates = getDatesInRange(start, end);

    let actual = 0;
    let target = 0;
    let activeDays = 0;
    const folderBreakdown: Record<string, number> = {};

    dates.forEach((d) => {
      const rec = dateRecords[d];
      if (rec && rec.totalActualMinutes > 0) {
        actual += rec.totalActualMinutes;
        target += rec.totalTargetMinutes;
        activeDays += 1;
        Object.entries(rec.folderBreakdown || {}).forEach(([fId, data]) => {
          folderBreakdown[fId] = (folderBreakdown[fId] || 0) + data.actualMinutes;
        });
      }
    });

    return {
      totalActualMinutes: actual,
      totalTargetMinutes: target,
      percent: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0,
      activeDaysCount: activeDays,
      folderBreakdown,
    };
  }, [dateRecords]);

  const allTimeTotalMinutes = useMemo(() => {
    return Object.values(dateRecords).reduce((sum, r) => sum + r.totalActualMinutes, 0);
  }, [dateRecords]);

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
        addChapterToSubject,
        updateChapterInSubject,
        deleteChapterFromSubject,
        toggleChapterCompleted,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addStudyTimeToTask,
        selectedFolderId,
        setSelectedFolderId,
        stopwatch,
        startStopwatch,
        startFolderTimer,
        pauseStopwatch,
        toggleStopwatch,
        resetStopwatch,
        stopAndSaveStopwatch,
        startNewDay,
        salahRecords,
        selectedSalahDate,
        setSelectedSalahDate,
        toggleSalahPrayer,
        updateSalahNotes,
        salahStreakDays,
        todaySalahCount,
        selectedFolderFilter,
        setSelectedFolderFilter,
        dateRecords,
        selectedHistoryDate,
        setSelectedHistoryDate,
        addPastStudyEntry,
        deletePastTaskRecord,
        folderStats,
        totalTargetMinutes,
        totalActualMinutes,
        overallPercent,
        completedTasksCount,
        totalTasksCount,
        weeklySummary,
        monthlySummary,
        allTimeTotalMinutes,
        streakDays,
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
