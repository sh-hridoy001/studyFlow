import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppControlProvider, useAppControl, ADMIN_EMAIL } from './context/AppControlContext';
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
import { PrivacyLegalScreen } from './components/PrivacyLegalScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { UserGuideScreen } from './components/UserGuideScreen';
import { OnboardingGuideModal } from './components/OnboardingGuideModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { AdBannerSlot } from './components/AdBannerSlot';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ActiveMainTab, DailyTask } from './types';
import { Loader2, Timer, Megaphone, Wrench, Ban, LogOut } from 'lucide-react';

function AppContent() {
  const { user, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isDataLoading,
    selectedFolderId,
    setSelectedFolderId,
    surfaceTheme,
    glassMode,
  } = useStudy();
  const {
    globalConfig,
    isAdmin,
    isPro,
    isSuspended,
    openUpgradeModal,
  } = useAppControl();

  // Modal & Drawer States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [autoFocusCreateFolder, setAutoFocusCreateFolder] = useState(false);
  const [navHistory, setNavHistory] = useState<Array<{ tab: ActiveMainTab; folderId: string | null; reopenSidebar?: boolean }>>([]);
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Automatically launch sequential step-by-step guidelines when a user opens an account for the first time
  useEffect(() => {
    if (!user?.uid || isDataLoading) return;
    const key = `focustrack_onboarding_v1_${user.uid}`;
    if (!localStorage.getItem(key)) {
      setIsOnboardingOpen(true);
    }
  }, [user?.uid, isDataLoading]);

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (user?.uid) {
      localStorage.setItem(`focustrack_onboarding_v1_${user.uid}`, '1');
    }
  };

  // Push current view location before opening any sidebar view, folder workspace, or Add Task
  const pushAndNavigate = (
    targetTab: ActiveMainTab,
    targetFolderId: string | null = null,
    reopenSidebar = false
  ) => {
    if (activeTab === targetTab && selectedFolderId === targetFolderId) return;
    setNavHistory((prev) => [
      ...prev.slice(-9),
      { tab: activeTab, folderId: selectedFolderId, reopenSidebar },
    ]);
    setSelectedFolderId(targetFolderId);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to the exact screen & folder the user came from (and reopen sidebar if entered from sidebar)
  const popNavigateBack = () => {
    setAutoFocusCreateFolder(false);
    setEditingTask(null);
    setDefaultFolder(undefined);

    const last = navHistory[navHistory.length - 1];
    if (last) {
      setNavHistory((prev) => prev.slice(0, -1));
      setSelectedFolderId(last.folderId);
      setActiveTab(last.tab);
      if (last.reopenSidebar) {
        setIsSidebarOpen(true);
      }
    } else {
      setSelectedFolderId(null);
      setActiveTab('routine');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRootTab = (tab: ActiveMainTab) => {
    setAutoFocusCreateFolder(false);
    setNavHistory([]);
    setSelectedFolderId(null);
    setActiveTab(tab);
  };

  const getFolderBackLabel = () => {
    const prev = navHistory[navHistory.length - 1];
    if (!prev) return 'All Folders';
    switch (prev.tab) {
      case 'folders':
        return 'All Folders';
      case 'tasks':
        return 'Tasks';
      case 'salah':
        return 'Salah';
      case 'milestones':
        return 'Goals';
      case 'history':
        return 'History';
      default:
        return 'Home';
    }
  };

  const handleOpenAddTask = (folderId?: string) => {
    setDefaultFolder(folderId);
    setEditingTask(null);
    pushAndNavigate('add-task', selectedFolderId);
  };

  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setDefaultFolder(task.folderId);
    pushAndNavigate('add-task', selectedFolderId);
  };

  const handleCloseAddTask = () => {
    popNavigateBack();
  };

  const handleViewTask = (task: DailyTask) => {
    setViewingTask(task);
  };

  const handleOpenLogPast = (dateKey: string) => {
    setPastLogTargetDate(dateKey);
    setIsLogPastOpen(true);
  };

  const handleOpenSyncCalendar = (dateKey?: string) => {
    if (!isPro) {
      openUpgradeModal('Google Calendar Sync');
      return;
    }
    setSyncCalendarTargetDate(dateKey);
    setIsSyncCalendarOpen(true);
  };

  const handleOpenFoldersPage = (autoCreate = false, fromSidebar = false) => {
    setAutoFocusCreateFolder(autoCreate);
    pushAndNavigate('folders', null, fromSidebar);
  };

  // Account Suspended Screen (Controlled from Admin Panel)
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#0a0b10] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#13141d] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
            <Ban className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Account Access Paused
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your access to FocusTrack is currently suspended by the administrator. If you think
              this is a mistake, contact support at{' '}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {globalConfig.supportEmail || ADMIN_EMAIL}
              </span>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Maintenance Mode Screen (Bypassed automatically for Admins)
  if (globalConfig.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#0a0b10] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#13141d] border border-amber-200 dark:border-amber-800/40 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Scheduled Maintenance
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {globalConfig.maintenanceMessage ||
                'FocusTrack is currently being upgraded. Please check back shortly.'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Support: {globalConfig.supportEmail || ADMIN_EMAIL}
          </p>
        </div>
      </div>
    );
  }

  const mainWidthClass = 'max-w-4xl';

  return (
    <div className="min-h-screen relative bg-transparent text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-[var(--app-accent)] selection:text-white w-full overflow-x-clip font-sans">
      {/* Soft Ambient Frosted Backdrop Shapes (Visible in Twilight Glass, Arctic Glass, or Glassy UI Modes) */}
      {(surfaceTheme === 'midnight-glass' || surfaceTheme === 'arctic-glass' || glassMode !== 'off') && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
          <div
            className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-3xl opacity-55 dark:opacity-50 transition-all duration-700"
            style={{
              background:
                surfaceTheme === 'arctic-glass'
                  ? 'radial-gradient(circle at 35% 35%, rgba(56,189,248,0.48), rgba(129,140,248,0.22), transparent 72%)'
                  : 'radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--app-accent) 55%, transparent), rgba(56,189,248,0.22), transparent 72%)',
            }}
          />
          <div
            className="absolute top-1/4 -right-20 w-88 h-88 rounded-full blur-3xl opacity-45 dark:opacity-45 transition-all duration-700"
            style={{
              background:
                surfaceTheme === 'arctic-glass'
                  ? 'radial-gradient(circle at 45% 45%, rgba(167,139,250,0.42), color-mix(in srgb, var(--app-accent) 26%, transparent), transparent 72%)'
                  : 'radial-gradient(circle at 45% 45%, rgba(34,211,238,0.34), rgba(99,102,241,0.2), transparent 72%)',
            }}
          />
          <div
            className="absolute bottom-20 left-1/5 w-72 h-72 rounded-full blur-3xl opacity-40 dark:opacity-35 transition-all duration-700"
            style={{
              background:
                surfaceTheme === 'arctic-glass'
                  ? 'radial-gradient(circle at 50% 50%, rgba(45,212,191,0.32), transparent 70%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(129,140,248,0.28), transparent 70%)',
            }}
          />
          <div
            className="hidden sm:block absolute bottom-12 right-1/4 w-60 h-60 rounded-full blur-3xl opacity-35 dark:opacity-35 transition-all duration-700"
            style={{ background: 'var(--app-accent-soft)' }}
          />
        </div>
      )}

      {/* Mobile App Top Header with user greeting, avatar, and sidebar drawer toggle */}
      <MobileAppHeader
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAddTask={() => handleOpenAddTask()}
        containerWidthClass={mainWidthClass}
      />

      {/* Offline Mode Indicator Banner */}
      <OfflineIndicator />

      {/* Global Announcement Banner (Controlled from Admin Panel) */}
      {globalConfig.announcementEnabled && globalConfig.announcementText.trim().length > 0 && (
        <div className="relative z-10 bg-indigo-600 dark:bg-indigo-950/90 border-b border-indigo-500/40 text-white px-4 py-2 text-xs font-semibold">
          <div className={`${mainWidthClass} mx-auto flex items-center justify-center gap-2 text-center`}>
            <Megaphone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{globalConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Sticky Active Stopwatch Bar when timer is running on other tabs or views */}
      {activeTab !== 'routine' &&
        activeTab !== 'add-task' &&
        activeTab !== 'legal' &&
        activeTab !== 'admin' &&
        activeTab !== 'guide' && <ActiveStopwatchBar />}

      {/* Cloud Loading Banner if fetching initial Firestore state */}
      {isDataLoading && (
        <div className="relative z-10 bg-[var(--app-accent)] text-white text-xs py-1 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing study records from Firebase Firestore...</span>
        </div>
      )}

      {/* Responsive App Container */}
      <main className={`relative z-10 flex-1 w-full ${mainWidthClass} mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-x-clip pb-36`}>
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
              backLabel={getFolderBackLabel()}
              onBack={popNavigateBack}
              onOpenFolder={(targetFolderId) => setSelectedFolderId(targetFolderId)}
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

              {/* 5. Respectful Ad Slot (auto-hidden when Pro or timer active) */}
              <AdBannerSlot />
            </div>
          )
        ) : activeTab === 'folders' ? (
          /* Genuine Full-Screen Folders Explorer & Inline Creator */
          <FoldersScreen
            autoFocusCreate={autoFocusCreateFolder}
            onBackHome={popNavigateBack}
            onOpenFolderDetail={(fId) => {
              setAutoFocusCreateFolder(false);
              pushAndNavigate('routine', fId);
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
            <AdBannerSlot />
          </div>
        ) : activeTab === 'salah' ? (
          /* 5-Time Daily Salah Tracker Section (Strictly Ad-Free) */
          <div className="animate-in fade-in duration-200">
            <SalahTracker />
          </div>
        ) : activeTab === 'milestones' ? (
          /* Exam & Milestone Countdown Targets */
          <div className="space-y-4 animate-in fade-in duration-200">
            <MilestoneCountdownWidget />
            <AdBannerSlot />
          </div>
        ) : activeTab === 'legal' ? (
          /* Store Compliance: Privacy Policy, Terms & Account Deletion */
          <PrivacyLegalScreen
            showAccountDeletion={true}
            onBack={popNavigateBack}
          />
        ) : activeTab === 'admin' ? (
          /* Admin Control Center */
          <AdminDashboardScreen onBack={popNavigateBack} />
        ) : activeTab === 'guide' ? (
          /* Interactive Bilingual User Guidelines */
          <UserGuideScreen
            onBack={popNavigateBack}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          /* Study History & Past Records Section */
          <div className="space-y-4 animate-in fade-in duration-200">
            <ConsistencyMap />
            <StudyHistory
              onOpenLogPastModal={handleOpenLogPast}
              onOpenSyncCalendar={(dateKey) => handleOpenSyncCalendar(dateKey)}
            />
            <AdBannerSlot />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (hidden on full-screen Add Task, Legal, Admin & Guide views) */}
      {activeTab !== 'add-task' &&
        activeTab !== 'legal' &&
        activeTab !== 'admin' &&
        activeTab !== 'guide' && (
          <MobileBottomNav onSelectRootTab={handleSelectRootTab} />
        )}

      {/* Mobile Slide-Out Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenFoldersPage={handleOpenFoldersPage}
        onNavigateSubView={(tab, folderId = null) => pushAndNavigate(tab, folderId, true)}
        onNavigateRootTab={handleSelectRootTab}
        onOpenResetDay={() => setIsResetDayOpen(true)}
        onOpenSyncCalendar={() => handleOpenSyncCalendar()}
        onOpenResetAllData={() => setIsResetAllOpen(true)}
        onStartTour={() => setIsOnboardingOpen(true)}
      />

      {/* Automatic Step-by-Step User Guidelines Walkthrough */}
      <OnboardingGuideModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        onOpenSidebar={() => setIsSidebarOpen(true)}
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

      {/* Pro Upgrade & Payment Verification Sheet */}
      <ProUpgradeModal />
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
      <div className="min-h-screen bg-[var(--app-bg,#0d0e14)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--app-accent,#ff4757)] flex items-center justify-center text-white shadow-xl animate-pulse">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              FocusTrack
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--app-accent,#ff4757)]" />
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

  // Signed in: show main study tracker connected to Firestore & AppControl
  return (
    <AppControlProvider>
      <StudyProvider>
        <AppContent />
      </StudyProvider>
    </AppControlProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
