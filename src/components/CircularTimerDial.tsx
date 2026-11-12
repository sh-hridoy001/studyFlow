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
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
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

  // Active task & folder resolution
  const activeTask = stopwatch.taskId
    ? tasks.find((t) => String(t.id) === String(stopwatch.taskId))
    : tasks.find((t) => !t.completed) || tasks[0] || null;

  const activeFolderId = stopwatch.folderId || activeTask?.folderId || folders[0]?.id;
  const activeFolder = folders.find((f) => String(f.id) === String(activeFolderId)) || folders[0] || {
    id: 'default',
    name: 'General Study',
    color: '#ff4757',
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

  // Time calculations
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
    displayMinutes = Math.floor(pomodoroSecondsLeft / 60);
    displaySeconds = pomodoroSecondsLeft % 60;
    const totalSec = mode === 'pomodoro' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    progressFraction = 1 - pomodoroSecondsLeft / totalSec;
  }

  const formattedTime =
    mode === 'stopwatch' && displayHours > 0
      ? `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`
      : `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  const handleToggleTimer = () => {
    playUiClickSound();
    if (mode === 'stopwatch') {
      if (stopwatch.isRunning) {
        pauseStopwatch();
      } else {
        if (activeTask) {
          startStopwatch(activeTask.id, activeTask.folderId);
        } else if (activeFolder) {
          startFolderTimer(activeFolder.id);
        }
      }
    } else {
      if (pomodoroSecondsLeft <= 0) {
        setPomodoroSecondsLeft(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
      }
      setIsPomodoroRunning(!isPomodoroRunning);
    }
  };

  const handleReset = () => {
    playUiClickSound();
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

  // Circular SVG constants
  const size = 260;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;
  const themeRed = '#ff4757';

  return (
    <div className="relative w-full bg-[#12131b] dark:bg-[#0f1017] border border-[#222434] rounded-[32px] p-4 sm:p-6 shadow-2xl flex flex-col items-center text-white overflow-hidden transition-all">
      {/* Ambient background glow matching active timer */}
      <div
        className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: isTimerActive ? themeRed : activeFolder.color }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: activeFolder.color }}
      />

      {/* Top Controls Row: Task Pill + Soundscape Studio Button + Zen Fullscreen Mode */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 relative z-10">
        {/* Task Selector Pill */}
        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => {
              playUiClickSound();
              setIsTaskDropdownOpen(!isTaskDropdownOpen);
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#1b1c28] hover:bg-[#232536] border border-[#2a2c3e] rounded-2xl transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/20"
                style={{ backgroundColor: activeFolder.color || themeRed }}
              />
              <span className="text-xs font-bold text-slate-200 truncate">
                {activeTask ? `${activeTask.subjectName}: ${activeTask.topics}` : `${activeFolder.name} Study Session`}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isTaskDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#181924] border border-[#2b2d3f] rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Focus on Active Task
              </div>
              {tasks.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                  No tasks added today.
                  {onOpenAddTask && (
                    <button
                      onClick={() => {
                        setIsTaskDropdownOpen(false);
                        onOpenAddTask();
                      }}
                      className="block mx-auto mt-1 text-[#ff4757] font-bold hover:underline"
                    >
                      + Add Task
                    </button>
                  )}
                </div>
              ) : (
                tasks.map((task) => {
                  const taskFolder = folders.find((f) => String(f.id) === String(task.folderId));
                  const isCurrent = stopwatch.taskId === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        playUiClickSound();
                        setIsTaskDropdownOpen(false);
                        if (stopwatch.isRunning && stopwatch.taskId !== task.id) {
                          stopAndSaveStopwatch();
                        }
                        startStopwatch(task.id, task.folderId);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#ff4757]/15 text-white font-bold border border-[#ff4757]/30'
                          : 'text-slate-300 hover:bg-[#232536]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: taskFolder?.color || '#ff4757' }}
                        />
                        <span className="truncate">{task.subjectName} - {task.topics}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {task.actualMinutes}/{task.targetMinutes}m
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Premium Feature: Multi-Track Soundscape Trigger */}
        <button
          onClick={() => {
            playUiClickSound();
            setIsSoundModalOpen(true);
          }}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            soundscapePlaying
              ? 'bg-[#ff4757]/20 border-[#ff4757] text-[#ff4757] animate-pulse'
              : 'bg-[#1b1c28] border-[#2a2c3e] text-slate-400 hover:text-white'
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
          className="p-2 rounded-2xl bg-[#1b1c28] border border-[#2a2c3e] text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer shadow-xs active:scale-90"
          title="Full-Screen OLED Zen Mode"
          aria-label="Zen Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-1.5 bg-[#171822] p-1 rounded-2xl border border-[#242636] mb-3 w-full max-w-xs">
        <button
          onClick={() => handleSelectMode('stopwatch')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'stopwatch'
              ? 'bg-[#ff4757] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => handleSelectMode('pomodoro')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'pomodoro'
              ? 'bg-[#ff4757] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => handleSelectMode('shortBreak')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
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
            stroke="#1a1c27"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 12}
            stroke="#242637"
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
              filter: isTimerActive ? `drop-shadow(0 0 10px ${themeRed}80)` : 'none',
            }}
          />
        </svg>

        {/* Center Digital Clock */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
            {isTimerActive ? (
              <>
                <Flame className="w-3.5 h-3.5 text-[#ff4757] fill-[#ff4757] animate-pulse" />
                <span className="text-[#ff4757] font-bold tracking-wide">
                  {mode === 'shortBreak' ? 'Resting...' : 'Deep Focus'}
                </span>
              </>
            ) : (
              <>
                <TimerIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 tracking-wide">
                  {mode === 'stopwatch' ? 'Ready to Study' : 'Pomodoro Timer'}
                </span>
              </>
            )}
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            {formattedTime}
          </div>

          <div className="text-[11px] text-slate-400 font-medium mt-1 truncate max-w-[180px] px-2">
            {activeTask ? activeTask.topics : activeFolder.name}
          </div>
        </div>
      </div>

      {/* Control Buttons (Reset, Play/Pause, Save) */}
      <div className="flex items-center justify-center gap-4 mt-2 mb-2 relative z-10">
        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-[#1b1c28] hover:bg-[#232637] border border-[#292c3d] text-slate-400 hover:text-white transition-all cursor-pointer shadow-md active:scale-90"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Primary Play/Pause Button */}
        <button
          onClick={handleToggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer active:scale-90 ${
            isTimerActive
              ? 'bg-[#e03848] ring-4 ring-[#ff4757]/30 shadow-[#ff4757]/40'
              : 'bg-[#ff4757] hover:bg-[#ff3344] shadow-[#ff4757]/30'
          }`}
          title={isTimerActive ? 'Pause Study Timer' : 'Start Study Timer'}
          aria-label={isTimerActive ? 'Pause' : 'Play'}
        >
          {isTimerActive ? (
            <Pause className="w-7 h-7 fill-white" />
          ) : (
            <Play className="w-7 h-7 fill-white translate-x-0.5" />
          )}
        </button>

        {mode === 'stopwatch' && stopwatch.secondsElapsed > 0 ? (
          <button
            onClick={() => {
              playUiClickSound();
              stopAndSaveStopwatch();
            }}
            className="p-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-md active:scale-90"
            title="Finish & Save Session"
            aria-label="Save and finish"
          >
            <Check className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}
      </div>

      {/* Premium Productivity Tier & Daily Summary */}
      <div className="w-full mt-2 pt-3 border-t border-[#202232] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Today:</span>
          <span className="font-bold text-white">
            {Math.floor(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
          </span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1b1d2b] border border-[#282b3d] text-[10px] font-bold text-emerald-400">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{productivityTier}</span>
        </div>
      </div>

      {/* Premium Modal 1: Multi-Track Ambient Soundscapes Studio */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#161723] border border-[#282b3d] rounded-[32px] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#242738] mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#ff4757]" />
                <h3 className="text-base font-bold text-white">Focus Soundscapes Studio</h3>
              </div>
              <button
                onClick={() => setIsSoundModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Synthesized ambient white noise to block distractions while studying.
            </p>

            {/* Soundscape Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'rain', label: 'Rain on Window 🌧️' },
                { id: 'ocean', label: 'Deep Ocean Waves 🌊' },
                { id: 'cafe', label: 'Coffeehouse Vinyl ☕' },
                { id: 'forest', label: 'Night Forest Breeze 🌲' },
                { id: 'clock', label: 'Gentle Clock Ticks ⏱️' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSelectSoundscape(sound.id as SoundscapeType)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left cursor-pointer ${
                    activeSoundscape === sound.id
                      ? 'bg-[#ff4757]/20 border-[#ff4757] text-[#ff4757]'
                      : 'bg-[#1d1f2d] border-[#292c3e] text-slate-300 hover:bg-[#252839]'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="mb-5 p-3 rounded-2xl bg-[#1d1f2d] border border-[#292c3e]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Volume</span>
                <span className="text-slate-400 font-mono">{Math.round(soundVolume * 100 * 5)}%</span>
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
                {activeTask ? `${activeTask.subjectName}: ${activeTask.topics}` : activeFolder.name}
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
