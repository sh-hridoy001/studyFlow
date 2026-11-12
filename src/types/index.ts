export type PrimaryFolderId = string;

export interface ChapterNote {
  id: string;
  title: string;
  notes?: string;
  importantPoints?: string; // formulas, key takeaways, shortcuts
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectFolder {
  id: string;
  name: string;
  description?: string;
  chapters: ChapterNote[];
  createdAt?: string;
}

export interface FolderDefinition {
  id: string;
  name: string;
  subtitle: string;
  color: string; // primary accent hex e.g. #4F46E5
  lightBg?: string;
  darkBg?: string;
  borderClass?: string;
  badgeClass?: string;
  icon?: string;
  subjects: string[]; // Dynamic sub-folders or subjects inside this folder
  subjectFolders?: SubjectFolder[]; // Enhanced sub-folders with chapters & notes
}

export interface DailyTask {
  id: string;
  folderId: string;
  subjectName: string; // e.g. "Data Structures", "GRE Math", "IELTS Speaking"
  topics: string; // specific topics to cover today
  targetMinutes: number; // planned time e.g. 90 mins (1.5h)
  actualMinutes: number; // tracked time today
  completed: boolean; // checkbox
  notes?: string;
  createdAt: string;
}

export interface HistoricalTaskRecord {
  id: string;
  folderId: string;
  subjectName: string;
  topics: string;
  targetMinutes: number;
  actualMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface DateStudyRecord {
  date: string; // YYYY-MM-DD
  totalTargetMinutes: number;
  totalActualMinutes: number;
  tasks: HistoricalTaskRecord[];
  folderBreakdown: Record<
    string,
    {
      targetMinutes: number;
      actualMinutes: number;
      tasksCount: number;
      completedTasksCount: number;
    }
  >;
  notes?: string;
}

export interface ActiveStopwatchState {
  taskId: string | null;
  folderId: string | null;
  subjectName?: string | null;
  isRunning: boolean;
  secondsElapsed: number;
  lastTimestamp: number; // ms timestamp
}

// 5-Time Daily Salah Tracker
export type SalahPrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface DailySalahRecord {
  date: string; // YYYY-MM-DD
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  tahajjud?: boolean;
  notes?: string;
  updatedAt?: string;
}

export type ActiveMainTab = 'routine' | 'tasks' | 'salah' | 'milestones' | 'history' | 'folders' | 'add-task' | 'legal';

// Upcoming Exam & Goal Countdown Targets
export interface MilestoneGoal {
  id: string;
  title: string; // e.g. "Campus Final Exam", "IELTS / GRE Exam", "Admission Test"
  targetDate: string; // YYYY-MM-DD
  targetDailyHours?: number;
  category?: string;
  completed?: boolean;
  notes?: string;
  createdAt?: string;
}
