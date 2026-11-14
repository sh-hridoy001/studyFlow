import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Folders,
  Timer,
  CheckCircle2,
  Moon,
  Palette,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSidebar?: () => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSidebar,
}) => {
  const { accentColor, setActiveTab, setSelectedFolderId } = useStudy();
  const [stepIndex, setStepIndex] = useState(0);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  if (!isOpen) return null;

  const accent = accentColor || '#ff4757';

  const steps =
    lang === 'bn'
      ? [
          {
            badge: 'ধাপ ১ / ৫ · ফোল্ডার ও চ্যাপ্টার',
            icon: <Folders className="w-6 h-6" />,
            color: '#4f46e5',
            title: 'ফোল্ডার, সাবজেক্ট ও চ্যাপ্টার সাজান',
            desc: 'Settings সাইডবার বা Folders ট্যাব থেকে আপনার ক্লাস/পরীক্ষা অনুযায়ী ফোল্ডার তৈরি করুন। প্রতিটি ফোল্ডারের ভেতরে সাব-ফোল্ডার, সাবজেক্ট ও চ্যাপ্টার যোগ করতে পারবেন। কোনো ফোল্ডারে চেপে ধরে রাখলে (Long-press) সহজেই এডিট বা ডিলিট করা যাবে।',
            tip: 'চ্যাপ্টারের পাশের টিক বাটনে চাপ দিলে সেটি Complete হিসেবে মার্ক হবে।',
          },
          {
            badge: 'ধাপ ২ / ৫ · স্মার্ট ফোকাস টাইমার',
            icon: <Timer className="w-6 h-6" />,
            color: accent,
            title: 'বিষয় সিলেক্ট করে পড়া শুরু করুন',
            desc: 'হোম স্ক্রিনের টাইমারে Play চাপলেই ফোল্ডার অনুযায়ী সাবজেক্ট বাছাইয়ের অপশন আসবে। আপনার সুবিধামতো Stopwatch অথবা ১৫, ২৫, ৪৫, ৬০ বা ৯০ মিনিটের Focus টাইমার ব্যবহার করতে পারবেন।',
            tip: 'Soundscapes ও Zen Mode দিয়ে সম্পূর্ণ নিরিবিলি পরিবেশে পড়তে পারবেন।',
          },
          {
            badge: 'ধাপ ৩ / ৫ · টাস্ক ও অ্যাক্টিভিটি হিস্ট্রি',
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: '#10b981',
            title: 'দৈনিক টাস্ক প্ল্যান ও স্মার্ট হিস্ট্রি',
            desc: 'উপরের "+ Add Task" থেকে প্রতিদিনের পড়ার টার্গেট সেট করুন (Tasks ট্যাবে সব টাস্ক পাবেন)। History ট্যাবে যেকোনো তারিখে ক্লিক করলে শুধু ওইদিন আপনি যা যা পড়েছেন বা কমপ্লিট করেছেন—কেবল সেগুলোই সুন্দরভাবে দেখাবে।',
            tip: 'হোম পেজের Heatmap-এ বেশি পড়ার দিনগুলো বেশি গাঢ় সবুজ দেখাবে।',
          },
          {
            badge: 'ধাপ ৪ / ৫ · ৫ ওয়াক্ত নামাজ ট্র্যাকার',
            icon: <Moon className="w-6 h-6" />,
            color: '#0d9488',
            title: 'শহর অনুযায়ী নামাজের ওয়াক্ত ও স্ট্রিক',
            desc: 'নিচের Salah ট্যাবে আপনার শহর বা GPS সেট করলে ফজর থেকে এশা পর্যন্ত প্রতিটি ওয়াক্তের শুরু ও শেষ সময় দেখতে পাবেন। প্রতিদিন নামাজ মার্ক করে নিজের Salah Streak ধরে রাখুন।',
            tip: 'প্রয়োজন অনুযায়ী Hanafi বা Shafi আসর পদ্ধতি পরিবর্তন করতে পারবেন।',
          },
          {
            badge: 'ধাপ ৫ / ৫ · থিম ও পূর্ণ কন্ট্রোল',
            icon: <Palette className="w-6 h-6" />,
            color: '#d97706',
            title: 'মেনু থেকে সবকিছু সহজে নিয়ন্ত্রণ করুন',
            desc: 'উপরের ডানদিকের মেনু (Sidebar) থেকে ফোল্ডার, Soft Light / Warm Paper / Dark / AMOLED থিম এবং আপনার নিজের Custom Theme কালার সেট করতে পারবেন। যেকোনো সময় Sidebar থেকেই এই গাইডলাইন আবার দেখা যাবে।',
            tip: 'আপনার সব ডেটা ক্লাউডে নিরাপদে সিঙ্ক থাকে — চলুন শুরু করা যাক!',
          },
        ]
      : [
          {
            badge: 'Step 1 of 5 · Organize',
            icon: <Folders className="w-6 h-6" />,
            color: '#4f46e5',
            title: 'Create Folders, Subjects & Chapters',
            desc: 'Build your study hierarchy from the Sidebar or Folders tab. Add sub-folders, subjects, and chapters freely. Press and hold any folder to rename, recolor, or delete it anytime.',
            tip: 'Tap the check circle beside any chapter to mark it complete.',
          },
          {
            badge: 'Step 2 of 5 · Focus Timer',
            icon: <Timer className="w-6 h-6" />,
            color: accent,
            title: 'Pick Your Subject & Start Studying',
            desc: 'Tap Play on the timer dial to pick your exact folder and subject before starting. Choose open-ended Stopwatch or 15m–90m Focus sessions with built-in Break timers.',
            tip: 'Explore Soundscapes and OLED Zen Mode for distraction-free study.',
          },
          {
            badge: 'Step 3 of 5 · Tasks & History',
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: '#10b981',
            title: 'Plan Tasks & Track Studied History',
            desc: 'Use "+ Add Task" to manage today’s goals in the Tasks tab. Open History and click any calendar date to view only the subjects and sessions you actually studied or completed that day.',
            tip: 'Longer study days glow brighter green on your Consistency Heatmap.',
          },
          {
            badge: 'Step 4 of 5 · Salah Tracker',
            icon: <Moon className="w-6 h-6" />,
            color: '#0d9488',
            title: 'City Prayer Windows & Daily Streak',
            desc: 'Open the Salah tab and set your city or GPS to view accurate start and end times for all 5 daily prayers, with Hanafi/Shafi Asr options and streak tracking.',
            tip: 'Your daily prayer progress is also reflected across your calendar log.',
          },
          {
            badge: 'Step 5 of 5 · Themes & Control',
            icon: <Palette className="w-6 h-6" />,
            color: '#d97706',
            title: 'Control Everything from the Sidebar',
            desc: 'Open the top-right Sidebar menu anytime to switch between Soft Light, Warm Paper, Midnight Dark, or AMOLED—or create your own custom theme colors and reopen this guide.',
            tip: 'Your progress syncs securely with your Google account.',
          },
        ];

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#26283a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="FocusTrack Quick Walkthrough"
      >
        {/* Top Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1e2130]">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              backgroundColor: currentStep.color,
            }}
          />
        </div>

        {/* Header Row: Language Toggle & Skip */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-[#1b1e2c] border border-slate-200 dark:border-[#282c40]">
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'bn'
                  ? 'bg-white dark:bg-[#272b3f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-[#272b3f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            <span>{lang === 'bn' ? 'এড়িয়ে যান' : 'Skip'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Step Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-md transition-colors duration-300"
              style={{
                backgroundColor: currentStep.color,
                boxShadow: `0 10px 22px -6px ${currentStep.color}66`,
              }}
            >
              {currentStep.icon}
            </div>
            <div className="min-w-0">
              <span
                className="text-[11px] font-extrabold uppercase tracking-wider block"
                style={{ color: currentStep.color }}
              >
                {currentStep.badge}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentStep.desc}
          </p>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#191b27] border border-slate-200 dark:border-[#272b3e] flex items-start gap-2.5">
            <Sparkles
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: currentStep.color }}
            />
            <p className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentStep.tip}
            </p>
          </div>
        </div>

        {/* Step Indicator Dots + Navigation Footer */}
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 space-y-3 border-t border-slate-100 dark:border-[#202334]">
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStepIndex(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === stepIndex ? 'w-6' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
                style={idx === stepIndex ? { backgroundColor: currentStep.color } : undefined}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-[#282c40] bg-slate-50 dark:bg-[#181a26] text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#222536] flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>

            {isLastStep && onOpenSidebar && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setSelectedFolderId(null);
                  setActiveTab('routine');
                  onOpenSidebar();
                }}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-[#282c40] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মেনু খুলুন' : 'Sidebar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 min-h-[44px] px-4 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              style={{
                backgroundColor: currentStep.color,
                boxShadow: `0 8px 18px -6px ${currentStep.color}66`,
              }}
            >
              <span>
                {isLastStep
                  ? lang === 'bn'
                    ? 'শুরু করুন'
                    : 'Get Started'
                  : lang === 'bn'
                  ? 'পরবর্তী ধাপ'
                  : 'Next Step'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
