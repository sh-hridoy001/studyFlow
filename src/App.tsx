import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { AuthScreen } from './components/AuthScreen';
import { MobileAppHeader } from './components/MobileAppHeader';
import { MobileSidebarDrawer } from './components/MobileSidebarDrawer';
import { ProminentAddTaskBanner } from './components/ProminentAddTaskBanner';
import { CircularTimerDial } from './components/CircularTimerDial';
import { MobileTaskCardList } from './components/MobileTaskCardList';
import { ConsistencyMap } from './components/ConsistencyMap';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FoldersScreen } from './components/FoldersScreen';
import { StudyHistory } from './components/StudyHistory';
import { SalahTracker } from './components/SalahTracker';
import { ActiveStopwatchBar } from './components/ActiveStopwatchBar';
import { FolderDetailView } from './components/FolderDetailView';
import { AddTaskScreen } from './components/AddTaskScreen';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { StartNewDayModal } from './components/StartNewDayModal';
import { LogPastStudyModal } from './components/LogPastStudyModal';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { ResetAllDataModal } from './components/ResetAllDataModal';
import { MilestoneCountdownWidget } from './components/MilestoneCountdownWidget';
import { ExportReportModal } from './components/ExportReportModal';
import { PrivacyLegalScreen } from './components/PrivacyLegalScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ActiveMainTab, DailyTask } from './types';
import { Loader2, Timer } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    isDataLoading,
    selectedFolderId,
    setSelectedFolderId,
  } = useStudy();

  // Modal & Drawer States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [autoFocusCreateFolder, setAutoFocusCreateFolder] = useState(false);
  const [returnTabAfterAddTask, setReturnTabAfterAddTask] = useState<ActiveMainTab>('routine');
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
    setReturnTabAfterAddTask(activeTab === 'add-task' || activeTab === 'legal' ? 'routine' : activeTab);
    setDefaultFolder(folderId);
    setEditingTask(null);
    setActiveTab('add-task');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditTask = (task: DailyTask) => {
    setReturnTabAfterAddTask(activeTab === 'add-task' || activeTab === 'legal' ? 'routine' : activeTab);
    setEditingTask(task);
    setDefaultFolder(task.folderId);
    setActiveTab('add-task');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAddTask = () => {
    setEditingTask(null);
    setDefaultFolder(undefined);
    setActiveTab(returnTabAfterAddTask);
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

  const handleOpenFoldersPage = (autoCreate = false) => {
    setSelectedFolderId(null);
    setAutoFocusCreateFolder(autoCreate);
    setActiveTab('folders');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#0a0b10] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-[#ff4757] selection:text-white w-full overflow-x-hidden font-sans">
      {/* Mobile App Top Header with user greeting, avatar, and sidebar drawer toggle */}
      <MobileAppHeader
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAddTask={() => handleOpenAddTask()}
      />

      {/* Offline Mode Indicator Banner */}
      <OfflineIndicator />

      {/* Sticky Active Stopwatch Bar when timer is running on other tabs or views */}
      {activeTab !== 'routine' && activeTab !== 'add-task' && activeTab !== 'legal' && <ActiveStopwatchBar />}

      {/* Cloud Loading Banner if fetching initial Firestore state */}
      {isDataLoading && (
        <div className="bg-[#ff4757] text-white text-xs py-1 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing study records from Firebase Firestore...</span>
        </div>
      )}

      {/* Mobile-Centric Main Container (Optimized for phones & tablet/desktop app view) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-x-hidden pb-20">
        {activeTab === 'add-task' ? (
          <AddTaskScreen
            defaultFolderId={defaultFolder}
            editingTask={editingTask}
            onCancel={handleCloseAddTask}
            onSaved={handleCloseAddTask}
          />
        ) : activeTab === 'routine' ? (
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
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 1. Timer at the TOP */}
              <CircularTimerDial
                onOpenAddTask={() => handleOpenAddTask()}
              />

              {/* 2. Add Task Banner directly below the Timer */}
              <ProminentAddTaskBanner
                onOpenAddTask={() => handleOpenAddTask()}
              />

              {/* 3. Today's Tasks (completed tasks automatically disappear from Home) */}
              <MobileTaskCardList
                homeMode={true}
                onOpenAddTask={() => handleOpenAddTask()}
                onEditTask={handleEditTask}
                onViewTask={handleViewTask}
              />

              {/* 4. Compact Consistency Map with Day Click Activity Breakdown */}
              <ConsistencyMap />
            </div>
          )
        ) : activeTab === 'folders' ? (
          /* Genuine Full-Screen Folders Explorer & Inline Creator */
          <FoldersScreen
            autoFocusCreate={autoFocusCreateFolder}
            onBackHome={() => {
              setAutoFocusCreateFolder(false);
              setActiveTab('routine');
            }}
            onOpenFolderDetail={(fId) => {
              setAutoFocusCreateFolder(false);
              setSelectedFolderId(fId);
              setActiveTab('routine');
            }}
          />
        ) : activeTab === 'tasks' ? (
          /* Dedicated Tasks View (shows both active and completed tasks) */
          <div className="space-y-4 animate-in fade-in duration-200">
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
          <div className="space-y-4 animate-in fade-in duration-200">
            <MilestoneCountdownWidget />
          </div>
        ) : activeTab === 'legal' ? (
          /* Store Compliance: Privacy Policy, Terms & Account Deletion */
          <PrivacyLegalScreen
            showAccountDeletion={true}
            onBack={() => setActiveTab('routine')}
          />
        ) : (
          /* Study History & Past Records Section */
          <div className="space-y-4 animate-in fade-in duration-200">
            <ConsistencyMap />
            <StudyHistory
              onOpenLogPastModal={handleOpenLogPast}
              onOpenSyncCalendar={(dateKey) => handleOpenSyncCalendar(dateKey)}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (hidden on full-screen Add Task & Legal views) */}
      {activeTab !== 'add-task' && activeTab !== 'legal' && <MobileBottomNav />}

      {/* Mobile Slide-Out Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenFoldersPage={handleOpenFoldersPage}
        onOpenResetDay={() => setIsResetDayOpen(true)}
        onOpenSyncCalendar={() => handleOpenSyncCalendar()}
        onOpenExportReport={() => setIsExportReportOpen(true)}
        onOpenResetAllData={() => setIsResetAllOpen(true)}
      />

      {/* Modals & Dialogs */}
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
