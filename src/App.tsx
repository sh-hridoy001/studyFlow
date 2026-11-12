import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { AuthScreen } from './components/AuthScreen';
import { MobileAppHeader } from './components/MobileAppHeader';
import { MobileSidebarDrawer } from './components/MobileSidebarDrawer';
import { ProminentAddTaskBanner } from './components/ProminentAddTaskBanner';
import { CircularTimerDial } from './components/CircularTimerDial';
import { MobileTaskCardList } from './components/MobileTaskCardList';
import { GitHubConsistencyHeatmap } from './components/GitHubConsistencyHeatmap';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FolderSummaryCards } from './components/FolderSummaryCards';
import { TasksList } from './components/TasksList';
import { StudyHistory } from './components/StudyHistory';
import { SalahTracker } from './components/SalahTracker';
import { ActiveStopwatchBar } from './components/ActiveStopwatchBar';
import { FolderDetailView } from './components/FolderDetailView';
import { FolderManageModal } from './components/FolderManageModal';
import { NewTaskModal } from './components/NewTaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { StartNewDayModal } from './components/StartNewDayModal';
import { LogPastStudyModal } from './components/LogPastStudyModal';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { ResetAllDataModal } from './components/ResetAllDataModal';
import { MilestoneCountdownWidget } from './components/MilestoneCountdownWidget';
import { ExportReportModal } from './components/ExportReportModal';
import { DailyTask } from './types';
import { Loader2, Timer } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    isDataLoading,
    syncStatus,
    selectedFolderId,
    setSelectedFolderId,
  } = useStudy();

  // Modal & Drawer States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [folderManagerTargetId, setFolderManagerTargetId] = useState<string | undefined>();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultFolder, setDefaultFolder] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [viewingTask, setViewingTask] = useState<DailyTask | null>(null);
  const [isResetDayOpen, setIsResetDayOpen] = useState(false);
  const [isLogPastOpen, setIsLogPastOpen] = useState(false);
  const [pastLogTargetDate, setPastLogTargetDate] = useState<string | undefined>();
  const [isSyncCalendarOpen, setIsSyncCalendarOpen] = useState(false);
  const [syncCalendarTargetDate, setSyncCalendarTargetDate] = useState<string | undefined>();
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isResetAllOpen, setIsResetAllOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);

  const handleOpenAddTask = (folderId?: string) => {
    setDefaultFolder(folderId);
    setEditingTask(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setDefaultFolder(task.folderId);
    setIsAddTaskOpen(true);
  };

  const handleViewTask = (task: DailyTask) => {
    setViewingTask(task);
  };

  const handleOpenLogPast = (dateKey: string) => {
    setPastLogTargetDate(dateKey);
    setIsLogPastOpen(true);
  };

  const handleOpenSyncCalendar = (dateKey?: string) => {
    setSyncCalendarTargetDate(dateKey);
    setIsSyncCalendarOpen(true);
  };

  const handleOpenFolderManager = (folderId?: string) => {
    setFolderManagerTargetId(folderId);
    setIsFolderManagerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0e14] dark:bg-[#0a0b10] text-slate-100 flex flex-col transition-colors selection:bg-[#ff4757] selection:text-white w-full overflow-x-hidden font-sans">
      {/* Mobile App Top Header with user greeting, avatar, and sidebar drawer toggle */}
      <MobileAppHeader
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAddTask={() => handleOpenAddTask()}
      />

      {/* Sticky Active Stopwatch Bar when timer is running on other tabs or views */}
      {activeTab !== 'routine' && <ActiveStopwatchBar />}

      {/* Cloud Loading Banner if fetching initial Firestore state */}
      {isDataLoading && (
        <div className="bg-[#ff4757] text-white text-xs py-1 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing study records from Firebase Firestore...</span>
        </div>
      )}

      {/* Mobile-Centric Main Container (Optimized for phones & tablet/desktop app view) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden pb-20">
        {activeTab === 'routine' ? (
          selectedFolderId ? (
            /* Folder Detail Drill-Down View (Mobile-style workspace) */
            <FolderDetailView
              folderId={selectedFolderId}
              onBack={() => setSelectedFolderId(null)}
              onOpenAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
            />
          ) : (
            /* Home Page as Requested by User:
               1. Big Add Task at the very top
               2. Current Study Time (Circular Dial Timer)
               3. Today's Task / Daily Task
               4. Sobar niche GitHub Consistency Heatmap
            */
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              {/* 1. Timer at the TOP per user request */}
              <CircularTimerDial
                onOpenAddTask={() => handleOpenAddTask()}
              />

              {/* 2. Add Task Banner directly below the Timer */}
              <ProminentAddTaskBanner
                onOpenAddTask={() => handleOpenAddTask()}
              />

              {/* 3. Today's Tasks / Daily Tasks */}
              <MobileTaskCardList
                onOpenAddTask={() => handleOpenAddTask()}
                onEditTask={handleEditTask}
                onViewTask={handleViewTask}
              />

              {/* 4. Sobar Niche GitHub Consistency Heatmap with Day Click Activity Breakdown */}
              <GitHubConsistencyHeatmap />
            </div>
          )
        ) : activeTab === 'tasks' ? (
          /* Dedicated Tasks View */
          <div className="space-y-5 animate-in fade-in duration-200">
            <ProminentAddTaskBanner onOpenAddTask={() => handleOpenAddTask()} />
            <MobileTaskCardList
              onOpenAddTask={() => handleOpenAddTask()}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
            />
          </div>
        ) : activeTab === 'salah' ? (
          /* 5-Time Daily Salah Tracker Section */
          <div className="animate-in fade-in duration-200">
            <SalahTracker />
          </div>
        ) : activeTab === 'milestones' ? (
          /* Exam & Milestone Countdown Targets */
          <div className="space-y-5 animate-in fade-in duration-200">
            <MilestoneCountdownWidget />
          </div>
        ) : (
          /* Study History & Past Records Section */
          <div className="space-y-5 animate-in fade-in duration-200">
            <GitHubConsistencyHeatmap />
            <StudyHistory
              onOpenLogPastModal={handleOpenLogPast}
              onOpenSyncCalendar={(dateKey) => handleOpenSyncCalendar(dateKey)}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Home, Tasks, Salah, Goals, History) */}
      <MobileBottomNav />

      {/* Mobile Slide-Out Sidebar Drawer (User requested: manage folder, create folder, theme, settings all here) */}
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenFolderManager={handleOpenFolderManager}
        onOpenResetDay={() => setIsResetDayOpen(true)}
        onOpenSyncCalendar={() => handleOpenSyncCalendar()}
        onOpenExportReport={() => setIsExportReportOpen(true)}
        onOpenResetAllData={() => setIsResetAllOpen(true)}
      />

      {/* Modals & Dialogs */}
      {/* Folder & Subject Manager Modal (accessible from sidebar) */}
      <FolderManageModal
        isOpen={isFolderManagerOpen}
        onClose={() => {
          setIsFolderManagerOpen(false);
          setFolderManagerTargetId(undefined);
        }}
        initialFolderId={folderManagerTargetId}
      />

      {/* Add / Edit Task Modal */}
      <NewTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditingTask(null);
        }}
        defaultFolderId={defaultFolder}
        editingTask={editingTask}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={!!viewingTask}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onEditTask={handleEditTask}
      />

      {/* Start New Day Modal */}
      <StartNewDayModal
        isOpen={isResetDayOpen}
        onClose={() => setIsResetDayOpen(false)}
      />

      {/* Log Past Study Modal */}
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

      {/* Google Calendar OAuth & Client Settings Modal */}
      <CalendarSettingsModal
        isOpen={isCalendarSettingsOpen}
        onClose={() => setIsCalendarSettingsOpen(false)}
      />

      {/* Reset All Data Confirmation Modal */}
      <ResetAllDataModal
        isOpen={isResetAllOpen}
        onClose={() => setIsResetAllOpen(false)}
      />

      {/* Export Printable Study Summary & Chapter Notes Modal */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
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
      <div className="min-h-screen bg-[#0d0e14] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff4757] via-[#f43f5e] to-amber-500 flex items-center justify-center text-white shadow-xl animate-pulse">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              FocusTrack
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff4757]" />
              <span>Connecting to cloud storage...</span>
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

  // Signed in: show main study tracker connected to Firestore / Local Mode
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
