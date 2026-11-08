export type PrimaryFolderId = 'academic' | 'admission' | 'english';

export interface FolderDefinition {
  id: PrimaryFolderId;
  name: string;
  subtitle: string;
  color: string; // primary accent
  lightBg: string;
  darkBg: string;
  borderClass: string;
  badgeClass: string;
  icon: 'academic' | 'admission' | 'english';
}

export interface DailyTask {
  id: string;
  folderId: PrimaryFolderId;
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
  folderId: PrimaryFolderId;
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
    PrimaryFolderId,
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
  folderId: PrimaryFolderId | null;
  isRunning: boolean;
  secondsElapsed: number;
  lastTimestamp: number; // ms timestamp
}

export type ActiveMainTab = 'routine' | 'history';
