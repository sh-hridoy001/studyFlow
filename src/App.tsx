import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { DailyOverviewHero } from './components/DailyOverviewHero';
import { FolderSummaryCards } from './components/FolderSummaryCards';
import { TasksList } from './components/TasksList';
import { StudyHistory } from './components/StudyHistory';
import { ActiveStopwatchBar } from './components/ActiveStopwatchBar';
import { NewTaskModal } from './components/NewTaskModal';
import { StartNewDayModal } from './components/StartNewDayModal';
import { LogPastStudyModal } from './components/LogPastStudyModal';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { DailyTask, PrimaryFolderId } from './types';
import { Cloud, Calendar, Download, Loader2, Timer } from 'lucide-react';
import { downloadSingleFileApp } from './utils/singleFileGenerator';

function AppContent() {
  const { activeTab, setActiveTab, isDataLoading, syncStatus } = useStudy();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultFolder, setDefaultFolder] = useState<PrimaryFolderId | undefined>();
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [isResetDayOpen, setIsResetDayOpen] = useState(false);
  const [isLogPastOpen, setIsLogPastOpen] = useState(false);
  const [pastLogTargetDate, setPastLogTargetDate] = useState<string | undefined>();
  const [isSyncCalendarOpen, setIsSyncCalendarOpen] = useState(false);
  const [syncCalendarTargetDate, setSyncCalendarTargetDate] = useState<string | undefined>();
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);

  const handleOpenAddTask = (folderId?: PrimaryFolderId) => {
    setDefaultFolder(folderId);
    setEditingTask(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setDefaultFolder(task.folderId);
    setIsAddTaskOpen(true);
  };

  const handleOpenLogPast = (dateKey: string) => {
    setPastLogTargetDate(dateKey);
    setIsLogPastOpen(true);
  };

  const handleOpenSyncCalendar = (dateKey?: string) => {
    setSyncCalendarTargetDate(dateKey);
    setIsSyncCalendarOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Header with User Profile and Logout */}
      <Header
        onOpenAddTask={() => handleOpenAddTask()}
        onOpenResetDay={() => setIsResetDayOpen(true)}
        onOpenSyncCalendar={() => handleOpenSyncCalendar()}
        onOpenCalendarSettings={() => setIsCalendarSettingsOpen(true)}
      />

      {/* Cloud Loading Banner if fetching initial Firestore state */}
      {isDataLoading && (
        <div className="bg-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing study records from Firebase Firestore...</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {activeTab === 'routine' ? (
          <>
            {/* 1. Daily Overview Hero with Total Target vs Actual Study Time */}
            <DailyOverviewHero
              onOpenAddTask={() => handleOpenAddTask()}
              onOpenResetDay={() => setIsResetDayOpen(true)}
              onOpenSyncCalendar={() => handleOpenSyncCalendar()}
            />

            {/* 2. Three Primary Folder Cards: Academic, Admission, English Learning */}
            <FolderSummaryCards />

            {/* 3. Daily Target Tasks List with Checkboxes & Interactive Stopwatch */}
            <TasksList
              onOpenAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
            />
          </>
        ) : (
          /* Study History & Past Records Section */
          <StudyHistory
            onOpenLogPastModal={handleOpenLogPast}
            onOpenSyncCalendar={(dateKey) => handleOpenSyncCalendar(dateKey)}
          />
        )}
      </main>

      {/* Active Stopwatch Floating Bar */}
      <ActiveStopwatchBar />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">FocusTrack</span>
            <span aria-hidden="true">·</span>
            <span>Academic · Admission · English Learning</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab(activeTab === 'routine' ? 'history' : 'routine')}
              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{activeTab === 'routine' ? 'View Study History' : 'Back to Today’s Routine'}</span>
            </button>

            <button
              onClick={downloadSingleFileApp}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Standalone .html</span>
            </button>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-3.5 h-3.5" />
              <span>Firestore Synced</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditingTask(null);
        }}
        defaultFolderId={defaultFolder}
        editingTask={editingTask}
      />

      <StartNewDayModal
        isOpen={isResetDayOpen}
        onClose={() => setIsResetDayOpen(false)}
      />

      <LogPastStudyModal
        isOpen={isLogPastOpen}
        onClose={() => {
          setIsLogPastOpen(false);
          setPastLogTargetDate(undefined);
        }}
        targetDateKey={pastLogTargetDate}
      />

      {/* Google Calendar Sync Modal */}
      <SyncCalendarModal
        isOpen={isSyncCalendarOpen}
        onClose={() => {
          setIsSyncCalendarOpen(false);
          setSyncCalendarTargetDate(undefined);
        }}
        targetDateKey={syncCalendarTargetDate}
        onOpenSettings={() => setIsCalendarSettingsOpen(true)}
      />

      {/* Google OAuth & Client ID Settings Modal */}
      <CalendarSettingsModal
        isOpen={isCalendarSettingsOpen}
        onClose={() => setIsCalendarSettingsOpen(false)}
      />
    </div>
  );
}

function AppRouter() {
  const { user, loading: authLoading } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('studytracker_theme_v2');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('studytracker_theme_v2', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              FocusTrack
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Checking authentication...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in: show introductory Google Sign-In screen
  if (!user) {
    return <AuthScreen theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Signed in: show main study tracker connected to Firestore
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
