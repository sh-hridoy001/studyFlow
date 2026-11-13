import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  Flame,
  Coffee,
  Timer as TimerIcon,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  X,
  Award,
  Zap,
  Folder,
  Plus,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type TimerMode = 'stopwatch' | 'pomodoro' | 'shortBreak' | 'longBreak';
type SoundscapeType = 'rain' | 'ocean' | 'cafe' | 'forest' | 'clock';

interface CircularTimerDialProps {
  onOpenAddTask?: () => void;
}

// Gentle UI Haptic / Sound click feedback via Web Audio API
const playUiClickSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio context errors
  }
};

// Gentle 2-note chime when a Pomodoro or Break completes
const playTimerCompleteChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [587.33, 880]; // D5 -> A5 gentle interval
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  } catch {
    // Ignore audio context errors
  }
};

export const CircularTimerDial: React.FC<CircularTimerDialProps> = ({ onOpenAddTask }) => {
  const {
    tasks,
    folders,
    stopwatch,
    startStopwatch,
    startFolderTimer,
    pauseStopwatch,
    resetStopwatch,
    stopAndSaveStopwatch,
    addStudyTimeToTask,
    totalActualMinutes,
    totalTargetMinutes,
  } = useStudy();

  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
  const [hasPickedSubjectThisSession, setHasPickedSubjectThisSession] = useState(false);
  const [selectedSessionTarget, setSelectedSessionTarget] = useState<{
    taskId?: string;
    folderId: string;
    subjectName: string;
  } | null>(null);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customSubjectFolderId, setCustomSubjectFolderId] = useState<string>('');
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);

  // Premium Feature 1: Multi-Track Soundscapes Studio
  const [soundscapePlaying, setSoundscapePlaying] = useState<boolean>(false);
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('rain');
  const [soundVolume, setSoundVolume] = useState<number>(0.12);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Premium Feature 2: Fullscreen Zen Focus Mode
  const [isZenModeOpen, setIsZenModeOpen] = useState<boolean>(false);

  // Active task & folder resolution (prioritize running stopwatch, then user's explicit session selection, then first pending task)
  const effectiveTaskId = stopwatch.taskId || selectedSessionTarget?.taskId || null;
  const activeTask = effectiveTaskId
    ? tasks.find((t) => String(t.id) === String(effectiveTaskId)) || null
    : !selectedSessionTarget
    ? tasks.find((t) => !t.completed) || tasks[0] || null
    : null;

  const activeFolderId =
    stopwatch.folderId ||
    selectedSessionTarget?.folderId ||
    activeTask?.folderId ||
    folders[0]?.id;

  const activeFolder =
    activeFolderId === 'general'
      ? { id: 'general', name: 'General Study', color: '#6366F1' }
      : folders.find((f) => String(f.id) === String(activeFolderId)) ||
        folders[0] || {
          id: 'default',
          name: 'General Study',
          color: '#ff4757',
        };

  const activeSubjectLabel = activeTask
    ? activeTask.topics
      ? `${activeTask.subjectName}: ${activeTask.topics}`
      : activeTask.subjectName
    : stopwatch.subjectName ||
      selectedSessionTarget?.subjectName ||
      `${activeFolder.name} Study Session`;

  const [expandedPickerFolders, setExpandedPickerFolders] = useState<Record<string, boolean>>({});

  const openSubjectPicker = () => {
    const initialFolder = activeFolderId || folders[0]?.id || null;
    const nextExpanded: Record<string, boolean> = {};
    if (initialFolder) {
      nextExpanded[initialFolder] = true;
      // Also expand ancestors if active folder is a nested sub-folder
      let curr = folders.find((f) => String(f.id) === String(initialFolder));
      while (curr?.parentId) {
        nextExpanded[curr.parentId] = true;
        curr = folders.find((f) => String(f.id) === String(curr?.parentId));
      }
    }
    setExpandedPickerFolders(nextExpanded);
    setCustomSubjectFolderId(initialFolder || 'general');
    setCustomSubjectInput('');
    setIsSubjectPickerOpen(true);
  };

  // Soundscape audio synthesizer
  const startSoundscape = (type: SoundscapeType, volume: number) => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 0.18;
        }
      } else if (type === 'ocean') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.01 * white) / 1.01;
          const slowWave = 0.5 + 0.5 * Math.sin((i / bufferSize) * Math.PI * 4);
          data[i] = lastOut * slowWave * 0.25;
        }
      } else if (type === 'cafe') {
        for (let i = 0; i < bufferSize; i++) {
          const crackle = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.5 : 0;
          const hum = Math.sin((i / 44100) * 120 * Math.PI * 2) * 0.02;
          data[i] = crackle + hum;
        }
      } else if (type === 'forest') {
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          last = 0.98 * last + 0.02 * white;
          const rustle = Math.random() < 0.001 ? Math.sin(i * 0.1) * 0.08 : 0;
          data[i] = (last + rustle) * 0.12;
        }
      } else {
        // Clock tick
        for (let i = 0; i < bufferSize; i++) {
          const isTick = i % 44100 < 50;
          data[i] = isTick ? (Math.random() * 2 - 1) * 0.15 : 0;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = gain;

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      setSoundscapePlaying(true);
    } catch (err) {
      console.warn('AudioContext error:', err);
    }
  };

  const stopSoundscape = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setSoundscapePlaying(false);
  };

  const toggleSoundscape = () => {
    playUiClickSound();
    if (soundscapePlaying) {
      stopSoundscape();
    } else {
      startSoundscape(activeSoundscape, soundVolume);
    }
  };

  const handleSelectSoundscape = (type: SoundscapeType) => {
    playUiClickSound();
    setActiveSoundscape(type);
    if (soundscapePlaying) {
      startSoundscape(type, soundVolume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioContextRef.current.currentTime);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPomodoroRunning && pomodoroSecondsLeft > 0) {
      interval = setInterval(() => {
        setPomodoroSecondsLeft((prev) => {
          if (prev <= 1) {
            confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
            playTimerCompleteChime();
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try {
                new Notification('FocusTrack Timer Complete', {
                  body: mode === 'pomodoro' ? '25-minute focus session saved! Take a short break.' : 'Break finished! Ready to focus again.',
                  icon: '/pwa-192x192.png',
                });
              } catch {
                // Ignore Notification constructor failures inside restricted WebViews
              }
            }
            setIsPomodoroRunning(false);
            if (mode === 'pomodoro' && activeTask) {
              addStudyTimeToTask(activeTask.id, 25);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroRunning, pomodoroSecondsLeft, mode, activeTask, addStudyTimeToTask]);

  // Handle Mode Selection
  const handleSelectMode = (newMode: TimerMode) => {
    playUiClickSound();
    setMode(newMode);
    setIsPomodoroRunning(false);
    if (newMode === 'pomodoro') {
      setPomodoroSecondsLeft(25 * 60);
      if (stopwatch.isRunning) pauseStopwatch();
    } else if (newMode === 'shortBreak') {
      setPomodoroSecondsLeft(5 * 60);
      if (stopwatch.isRunning) pauseStopwatch();
    } else if (newMode === 'longBreak') {
      setPomodoroSecondsLeft(15 * 60);
      if (stopwatch.isRunning) pauseStopwatch();
    }
  };

  // Time calculations (Always include Hours in HH:MM:SS format)
  let displayMinutes = 0;
  let displaySeconds = 0;
  let displayHours = 0;
  let isTimerActive = false;
  let progressFraction = 0;

  if (mode === 'stopwatch') {
    isTimerActive = stopwatch.isRunning;
    displayHours = Math.floor(stopwatch.secondsElapsed / 3600);
    displayMinutes = Math.floor((stopwatch.secondsElapsed % 3600) / 60);
    displaySeconds = stopwatch.secondsElapsed % 60;
    const targetSec = (activeTask?.targetMinutes || 60) * 60;
    progressFraction = Math.min(1, stopwatch.secondsElapsed / targetSec);
  } else {
    isTimerActive = isPomodoroRunning;
    displayHours = Math.floor(pomodoroSecondsLeft / 3600);
    displayMinutes = Math.floor((pomodoroSecondsLeft % 3600) / 60);
    displaySeconds = pomodoroSecondsLeft % 60;
    const totalSec = mode === 'pomodoro' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    progressFraction = 1 - pomodoroSecondsLeft / totalSec;
  }

  const formattedTime = `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  const startTimerWithSelection = (selection: {
    taskId?: string;
    folderId: string;
    subjectName: string;
  }) => {
    setSelectedSessionTarget(selection);
    setHasPickedSubjectThisSession(true);
    setIsSubjectPickerOpen(false);

    if (mode === 'stopwatch') {
      if (stopwatch.isRunning && stopwatch.taskId !== selection.taskId) {
        stopAndSaveStopwatch();
      }
      if (selection.taskId) {
        startStopwatch(selection.taskId, selection.folderId);
      } else {
        startFolderTimer(selection.folderId, selection.subjectName);
      }
    } else {
      if (pomodoroSecondsLeft <= 0) {
        setPomodoroSecondsLeft(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
      }
      setIsPomodoroRunning(true);
    }
  };

  const handleToggleTimer = () => {
    playUiClickSound();
    if (mode === 'stopwatch') {
      if (stopwatch.isRunning) {
        pauseStopwatch();
      } else if (stopwatch.secondsElapsed > 0 || hasPickedSubjectThisSession) {
        if (activeTask) {
          startStopwatch(activeTask.id, activeTask.folderId);
        } else if (selectedSessionTarget) {
          startFolderTimer(selectedSessionTarget.folderId, selectedSessionTarget.subjectName);
        } else if (activeFolder) {
          startFolderTimer(activeFolder.id);
        }
      } else {
        // Fresh timer turn-on: ask user which subject/task they want to study
        openSubjectPicker();
      }
    } else {
      if (isPomodoroRunning) {
        setIsPomodoroRunning(false);
      } else if (mode === 'pomodoro' && !hasPickedSubjectThisSession && pomodoroSecondsLeft === 25 * 60) {
        openSubjectPicker();
      } else {
        if (pomodoroSecondsLeft <= 0) {
          setPomodoroSecondsLeft(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
        }
        setIsPomodoroRunning(true);
      }
    }
  };

  const handleReset = () => {
    playUiClickSound();
    setHasPickedSubjectThisSession(false);
    setSelectedSessionTarget(null);
    if (mode === 'stopwatch') {
      resetStopwatch();
    } else {
      setIsPomodoroRunning(false);
      setPomodoroSecondsLeft(mode === 'pomodoro' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60);
    }
  };

  // Productivity Tier Calculation (S Tier, A Tier, B Tier)
  const productivityScore =
    totalTargetMinutes > 0
      ? Math.min(100, Math.round((totalActualMinutes / totalTargetMinutes) * 100))
      : totalActualMinutes > 0
      ? 100
      : 0;

  const productivityTier =
    productivityScore >= 90 ? 'S-Rank Focus 🔥' : productivityScore >= 60 ? 'A-Rank Deep Work ⭐' : 'Building Momentum ⚡';

  // Circular SVG constants (sized cleanly so HH:MM:SS fits with generous inner margin)
  const size = 228;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;
  const themeRed = '#ff4757';

  return (
    <div className="relative w-full bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center text-slate-900 dark:text-white overflow-hidden transition-all">
      {/* Ambient background glow matching active timer */}
      <div
        className="absolute -top-24 -left-24 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: isTimerActive ? themeRed : activeFolder.color }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: activeFolder.color }}
      />

      {isSubjectPickerOpen ? (
        /* Inline Folder-by-Folder Structured Subject Selector (Zero Pop-up) */
        <div className="w-full space-y-3 relative z-10 animate-in fade-in duration-150">
          {/* Inline Header with Back to Timer */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-[#222536]">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  playUiClickSound();
                  setIsSubjectPickerOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1b1c28] hover:bg-slate-200 dark:hover:bg-[#232536] border border-slate-200 dark:border-[#2a2c3e] flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                aria-label="Back to timer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  Select Subject to Study
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Open a folder and tap a subject to start timer
                </p>
              </div>
            </div>

            {onOpenAddTask && (
              <button
                type="button"
                onClick={() => {
                  setIsSubjectPickerOpen(false);
                  onOpenAddTask();
                }}
                className="text-[11px] font-bold text-[#ff4757] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3 h-3" /> New Task
              </button>
            )}
          </div>

          {/* Folder-by-Folder Structured Tree List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
            {(() => {
              const folderIds = new Set(folders.map((f) => String(f.id)));
              const rootList = folders.filter(
                (f) => !f.parentId || !folderIds.has(String(f.parentId))
              );

              const renderPickerFolderNode = (folder: typeof folders[number], depth = 0): React.ReactNode => {
                const isExpanded = !!expandedPickerFolders[folder.id];
                const childSubFolders = folders.filter(
                  (f) => String(f.parentId || '') === String(folder.id)
                );
                const folderTasks = tasks.filter(
                  (t) => !t.completed && String(t.folderId) === String(folder.id)
                );
                const subjects = folder.subjects || [];

                return (
                  <div
                    key={folder.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-slate-50/90 dark:bg-[#171925] border-slate-300 dark:border-[#32364d]'
                        : 'bg-slate-50/50 dark:bg-[#161822] border-slate-200 dark:border-[#232638]'
                    }`}
                  >
                    {/* Folder Row Header */}
                    <button
                      type="button"
                      onClick={() => {
                        playUiClickSound();
                        setExpandedPickerFolders((prev) => ({
                          ...prev,
                          [folder.id]: !prev[folder.id],
                        }));
                        setCustomSubjectFolderId(folder.id);
                      }}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-left cursor-pointer hover:bg-slate-100/70 dark:hover:bg-[#1d2030] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: folder.color }}
                        >
                          <Folder className="w-3.5 h-3.5 fill-white/25" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {folder.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {childSubFolders.length > 0 ? `${childSubFolders.length} folders · ` : ''}
                            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                            {folderTasks.length > 0 ? ` · ${folderTasks.length} pending` : ''}
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Expanded Folder Contents: Sub-Folders -> Subjects -> Folder Tasks -> Custom Subject */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1.5 border-t border-slate-200/70 dark:border-[#24273a] space-y-2.5">
                        {/* Nested Sub-Folders */}
                        {childSubFolders.length > 0 && (
                          <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-[#2c3047]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Sub-Folders
                            </span>
                            {childSubFolders.map((child) => renderPickerFolderNode(child, depth + 1))}
                          </div>
                        )}

                        {/* Subjects inside this folder */}
                        {subjects.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Subjects
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {subjects.map((subject) => (
                                <button
                                  key={subject}
                                  type="button"
                                  onClick={() => {
                                    playUiClickSound();
                                    const matchingPending = folderTasks.find(
                                      (t) => t.subjectName.toLowerCase() === subject.toLowerCase()
                                    );
                                    startTimerWithSelection({
                                      taskId: matchingPending?.id,
                                      folderId: folder.id,
                                      subjectName: subject,
                                    });
                                  }}
                                  className="flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] hover:border-[#ff4757] text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-[#ff4757] transition-all cursor-pointer active:scale-95"
                                >
                                  <span className="truncate">{subject}</span>
                                  <Play className="w-3 h-3 text-[#ff4757] fill-[#ff4757] shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Active Tasks inside this folder */}
                        {folderTasks.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Today&apos;s Tasks in {folder.name}
                            </span>
                            {folderTasks.map((task) => (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => {
                                  playUiClickSound();
                                  startTimerWithSelection({
                                    taskId: task.id,
                                    folderId: folder.id,
                                    subjectName: task.subjectName,
                                  });
                                }}
                                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] hover:border-[#ff4757] text-left text-xs transition-all cursor-pointer"
                              >
                                <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                  {task.topics ? `${task.subjectName} — ${task.topics}` : task.subjectName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                                  {task.actualMinutes}/{task.targetMinutes}m
                                  <Play className="w-3 h-3 text-[#ff4757] fill-[#ff4757]" />
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Custom Subject input or General Study inside this folder */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!customSubjectInput.trim()) return;
                            startTimerWithSelection({
                              folderId: folder.id,
                              subjectName: customSubjectInput.trim(),
                            });
                          }}
                          className="flex items-center gap-1.5 pt-0.5"
                        >
                          <input
                            type="text"
                            value={customSubjectFolderId === folder.id ? customSubjectInput : ''}
                            onFocus={() => setCustomSubjectFolderId(folder.id)}
                            onChange={(e) => {
                              setCustomSubjectFolderId(folder.id);
                              setCustomSubjectInput(e.target.value);
                            }}
                            placeholder={`Other subject in ${folder.name}...`}
                            className="flex-1 bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#ff4757]"
                          />
                          {customSubjectFolderId === folder.id && customSubjectInput.trim() ? (
                            <button
                              type="submit"
                              className="px-2.5 py-1.5 rounded-xl bg-[#ff4757] hover:bg-[#ff3344] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Start</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                playUiClickSound();
                                startTimerWithSelection({
                                  folderId: folder.id,
                                  subjectName: `${folder.name} Study`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>General</span>
                            </button>
                          )}
                        </form>
                      </div>
                    )}
                  </div>
                );
              };

              return rootList.map((folder) => renderPickerFolderNode(folder, 0));
            })()}

            {/* Outside Folder / Standalone Quick Study Option */}
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-[#2c3045] bg-slate-50/40 dark:bg-[#151722] p-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const subj =
                    customSubjectFolderId === 'general' && customSubjectInput.trim()
                      ? customSubjectInput.trim()
                      : 'General Study';
                  startTimerWithSelection({
                    folderId: 'general',
                    subjectName: subj,
                  });
                }}
                className="flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 ml-1" />
                <input
                  type="text"
                  value={customSubjectFolderId === 'general' ? customSubjectInput : ''}
                  onFocus={() => setCustomSubjectFolderId('general')}
                  onChange={(e) => {
                    setCustomSubjectFolderId('general');
                    setCustomSubjectInput(e.target.value);
                  }}
                  placeholder="Outside folder (quick subject name)..."
                  className="flex-1 bg-white dark:bg-[#11121b] border border-slate-200 dark:border-[#2a2e42] rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Controls Row: Task Pill + Soundscape Studio Button + Zen Fullscreen Mode */}
          <div className="w-full flex items-center justify-between gap-2 mb-3 relative z-10">
            {/* Subject / Task Selector Pill */}
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => {
                  playUiClickSound();
                  openSubjectPicker();
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-[#1b1c28] hover:bg-slate-200/80 dark:hover:bg-[#232536] border border-slate-200 dark:border-[#2a2c3e] rounded-xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/40 dark:ring-white/20"
                    style={{ backgroundColor: activeFolder.color || themeRed }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {activeSubjectLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform shrink-0" />
              </button>
            </div>

            {/* Premium Feature: Multi-Track Soundscape Trigger */}
            <button
              onClick={() => {
                playUiClickSound();
                setIsSoundModalOpen(true);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundscapePlaying
                  ? 'bg-[#ff4757]/15 border-[#ff4757] text-[#ff4757] animate-pulse'
                  : 'bg-slate-100 dark:bg-[#1b1c28] border-slate-200 dark:border-[#2a2c3e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Multi-Track Ambient Soundscapes"
              aria-label="Soundscapes"
            >
              {soundscapePlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Premium Feature: Zen Fullscreen Mode Trigger */}
            <button
              onClick={() => {
                playUiClickSound();
                setIsZenModeOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#1b1c28] border border-slate-200 dark:border-[#2a2c3e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-90"
              title="Full-Screen OLED Zen Mode"
              aria-label="Zen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-[#171822] p-1 rounded-xl border border-slate-200 dark:border-[#242636] mb-3 w-full max-w-[280px]">
            <button
              onClick={() => handleSelectMode('stopwatch')}
              className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-[#ff4757] text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Stopwatch
            </button>
            <button
              onClick={() => handleSelectMode('pomodoro')}
              className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-[#ff4757] text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleSelectMode('shortBreak')}
              className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'shortBreak'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              5m Break
            </button>
          </div>

          {/* Circular Progress Ring & Dial */}
          <div className="relative my-1 flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-200 dark:stroke-[#1a1c27]"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius - 11}
                className="stroke-slate-300/70 dark:stroke-[#242637]"
                strokeWidth={1}
                strokeDasharray="2 8"
                fill="transparent"
              />

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={mode === 'shortBreak' || mode === 'longBreak' ? '#10b981' : themeRed}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out"
                style={{
                  filter: isTimerActive ? `drop-shadow(0 0 8px ${themeRed}70)` : 'none',
                }}
              />
            </svg>

            {/* Center Digital Clock */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <div className="flex items-center gap-1 text-[11px] font-semibold mb-0.5">
                {isTimerActive ? (
                  <>
                    <Flame className="w-3 h-3 text-[#ff4757] fill-[#ff4757] animate-pulse" />
                    <span className="text-[#ff4757] font-bold tracking-wide">
                      {mode === 'shortBreak' ? 'Resting...' : 'Deep Focus'}
                    </span>
                  </>
                ) : (
                  <>
                    <TimerIcon className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400 tracking-wide">
                      {mode === 'stopwatch' ? 'Ready to Study' : 'Pomodoro'}
                    </span>
                  </>
                )}
              </div>

              <div className="font-mono tabular-nums text-[26px] sm:text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                {formattedTime}
              </div>

              <div className="flex items-center justify-center gap-5 text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                <span>HR</span>
                <span>MIN</span>
                <span>SEC</span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate max-w-[155px] px-2">
                {activeTask ? (activeTask.topics || activeTask.subjectName) : activeSubjectLabel}
              </div>
            </div>
          </div>

          {/* Control Buttons (Reset, Play/Pause, Save) */}
          <div className="flex items-center justify-center gap-3.5 mt-2 mb-1 relative z-10">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1b1c28] hover:bg-slate-200 dark:hover:bg-[#232637] border border-slate-200 dark:border-[#292c3d] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-90"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Play/Pause Button */}
            <button
              onClick={handleToggleTimer}
              className={`w-13 h-13 rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer active:scale-90 ${
                isTimerActive
                  ? 'bg-[#e03848] ring-4 ring-[#ff4757]/25 shadow-[#ff4757]/35'
                  : 'bg-[#ff4757] hover:bg-[#ff3344] shadow-[#ff4757]/30'
              }`}
              title={isTimerActive ? 'Pause Study Timer' : 'Start Study Timer'}
              aria-label={isTimerActive ? 'Pause' : 'Play'}
            >
              {isTimerActive ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            {mode === 'stopwatch' && stopwatch.secondsElapsed > 0 ? (
              <button
                onClick={() => {
                  playUiClickSound();
                  setHasPickedSubjectThisSession(false);
                  setSelectedSessionTarget(null);
                  stopAndSaveStopwatch();
                }}
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-600/50 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer shadow-2xs active:scale-90"
                title="Finish & Save Session"
                aria-label="Save and finish"
              >
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>

          {/* Productivity Tier & Daily Summary */}
          <div className="w-full mt-2 pt-2.5 border-t border-slate-100 dark:border-[#202232] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Today:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.floor(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1b1d2b] border border-slate-200 dark:border-[#282b3d] text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{productivityTier}</span>
            </div>
          </div>
        </>
      )}

      {/* Premium Modal 1: Multi-Track Ambient Soundscapes Studio */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#161723] border border-slate-200 dark:border-[#282b3d] rounded-3xl p-5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#242738] mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#ff4757]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Focus Soundscapes Studio</h3>
              </div>
              <button
                onClick={() => setIsSoundModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Synthesized ambient audio to block distractions while studying.
            </p>

            {/* Soundscape Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'rain', label: 'Rain on Window' },
                { id: 'ocean', label: 'Ocean Waves' },
                { id: 'cafe', label: 'Coffeehouse Vinyl' },
                { id: 'forest', label: 'Night Forest' },
                { id: 'clock', label: 'Gentle Clock' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSelectSoundscape(sound.id as SoundscapeType)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left cursor-pointer ${
                    activeSoundscape === sound.id
                      ? 'bg-[#ff4757]/12 border-[#ff4757] text-[#ff4757]'
                      : 'bg-slate-50 dark:bg-[#1d1f2d] border-slate-200 dark:border-[#292c3e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252839]'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-[#1d1f2d] border border-slate-200 dark:border-[#292c3e]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Volume</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">{Math.round(soundVolume * 100 * 5)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.30"
                step="0.01"
                value={soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[#ff4757] cursor-pointer"
              />
            </div>

            {/* Toggle Play / Stop button */}
            <button
              onClick={toggleSoundscape}
              className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                soundscapePlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#ff4757] hover:bg-[#ff3344] text-white'
              }`}
            >
              {soundscapePlaying ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
            </button>
          </div>
        </div>
      )}

      {/* Premium Modal 2: Fullscreen Zen OLED Focus Mode */}
      {isZenModeOpen && (
        <div className="fixed inset-0 z-50 bg-[#08080c] text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200">
          {/* Top Bar in Zen Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: activeFolder.color || themeRed }}
              />
              <span className="text-sm font-bold text-slate-300">
                {activeTask
                  ? activeTask.topics
                    ? `${activeTask.subjectName}: ${activeTask.topics}`
                    : activeTask.subjectName
                  : activeFolder.name}
              </span>
            </div>

            <button
              onClick={() => {
                playUiClickSound();
                setIsZenModeOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Zen</span>
            </button>
          </div>

          {/* Huge Central Digital Clock */}
          <div className="flex flex-col items-center justify-center my-auto text-center">
            <div className="text-[12px] font-extrabold uppercase tracking-widest text-[#ff4757] mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-[#ff4757] animate-bounce" />
              <span>Deep Zen Focus</span>
            </div>

            <div className="font-mono text-7xl sm:text-9xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,71,87,0.4)]">
              {formattedTime}
            </div>

            <p className="text-sm sm:text-base text-slate-400 font-medium mt-4 max-w-md">
              "Focus is a muscle. The deeper your attention, the higher your achievement."
            </p>

            {/* Play/Pause in Zen Mode */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleToggleTimer}
                className="px-8 py-4 rounded-full bg-[#ff4757] hover:bg-[#ff3344] text-white font-extrabold text-sm shadow-2xl shadow-[#ff4757]/50 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                {isTimerActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleSoundscape}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Toggle Ambient Audio"
              >
                {soundscapePlaying ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Bottom Bar in Zen Mode */}
          <div className="text-center text-xs text-slate-500 font-mono">
            FocusTrack OLED Zen Mode · Tap Exit to return
          </div>
        </div>
      )}
    </div>
  );
};
