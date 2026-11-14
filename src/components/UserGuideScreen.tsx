import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  ArrowLeft,
  BookOpen,
  Timer,
  Folders,
  Moon,
  Flame,
  Palette,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Crown,
} from 'lucide-react';

interface UserGuideScreenProps {
  onBack: () => void;
  onOpenSidebar?: () => void;
}

export const UserGuideScreen: React.FC<UserGuideScreenProps> = ({
  onBack,
  onOpenSidebar,
}) => {
  const { setActiveTab, setSelectedFolderId } = useStudy();
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  const steps =
    lang === 'bn'
      ? [
          {
            num: '01',
            icon: <Folders className="w-5 h-5" />,
            color: '#4f46e5',
            title: 'ফোল্ডার, সাব-ফোল্ডার ও চ্যাপ্টার সাজান',
            desc: 'Settings বা Folders ট্যাব থেকে আপনার ক্লাস/পরীক্ষা অনুযায়ী ফোল্ডার বানান। যেকোনো ফোল্ডারের ভেতরে আরও সাব-ফোল্ডার বা সাবজেক্ট যোগ করতে পারবেন। কোনো ফোল্ডারে চেপে ধরে রাখলে (Long-press) রিনেম, কালার বা ডিলিট মেনু পাবেন। সাবজেক্টের ভেতরে চ্যাপ্টার যোগ করে পাশের টিক চিহ্নে ক্লিক করে Complete মার্ক করতে পারবেন।',
            cta: 'Folders খুলুন',
            action: () => {
              setSelectedFolderId(null);
              setActiveTab('folders');
            },
          },
          {
            num: '02',
            icon: <Timer className="w-5 h-5" />,
            color: 'var(--app-accent, #ff4757)',
            title: 'ফোকাস টাইমার ও কাস্টম সময় ব্যবহার করুন',
            desc: 'হোম স্ক্রিনের টাইমার থেকে প্লে বাটনে চাপলে ফোল্ডার অনুযায়ী আপনার বিষয় বাছাই করতে পারবেন। Stopwatch-এর পাশাপাশি Focus মোডে ১৫, ২৫, ৪৫, ৬০ বা ৯০ মিনিটের সেশন এবং ৫ মিনিটের ব্রেক ব্যবহার করতে পারবেন। সাথে Soundscapes (বৃষ্টির শব্দ, ওশান) ও OLED Zen Mode-ও রয়েছে।',
            cta: 'Timer-এ যান',
            action: () => {
              setSelectedFolderId(null);
              setActiveTab('routine');
            },
          },
          {
            num: '03',
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: '#10b981',
            title: 'দৈনিক টাস্ক ও হিটম্যাপ স্ট্রিক গড়ুন',
            desc: '"Add Today\'s Target Task" বা + বাটনে ক্লিক করে প্রতিদিনের পড়ার টার্গেট সেট করুন (ফোল্ডারের ভেতরে বা সাধারণ টাস্ক হিসেবে)। টাস্ক শেষ হলে টিক দিন — হোম থেকে সরে গিয়ে Tasks ও History-তে সেভ হবে। আপনি যেদিন যত বেশি পড়বেন, Consistency Heatmap-এর ঘরটি তত গাঢ় সবুজ হবে।',
            cta: 'Task যোগ করুন',
            action: () => setActiveTab('add-task'),
          },
          {
            num: '04',
            icon: <Moon className="w-5 h-5" />,
            color: '#0d9488',
            title: '৫ ওয়াক্ত নামাজ ও শহরের ওয়াক্ত ট্র্যাকিং',
            desc: 'নিচের "Salah" ট্যাবে গিয়ে আপনার শহর সেট করুন অথবা GPS চাপুন — প্রতিদিনের ফজর থেকে এশা পর্যন্ত শুরু ও শেষ সময় দেখতে পাবেন। Hanafi বা Shafi আসর পদ্ধতিও বেছে নিতে পারবেন এবং প্রতিদিন নামাজ মার্ক করলে Salah Streak তৈরি হবে।',
            cta: 'Salah ট্র্যাকার দেখুন',
            action: () => setActiveTab('salah'),
          },
          {
            num: '05',
            icon: <Palette className="w-5 h-5" />,
            color: '#d97706',
            title: 'চোখের আরামদায়ক থিম ও কাস্টম কালার',
            desc: 'Settings সাইডবার থেকে Soft Light, Warm Paper (পড়ার জন্য চোখের আরাম), Midnight Dark বা Pure AMOLED থিম বেছে নিন। শুধু তাই নয়, আপনার পছন্দমতো যেকোনো কালার দিয়ে নিজের কাস্টম থিমও তৈরি করে সেভ করতে পারবেন।',
            cta: 'Theme সেটিংস খুলুন',
            action: () => {
              if (onOpenSidebar) onOpenSidebar();
            },
          },
          {
            num: '06',
            icon: <Smartphone className="w-5 h-5" />,
            color: '#7c3aed',
            title: 'মোবাইল অ্যাপ ইনস্টল ও Pro আনলক',
            desc: 'ফোনে সরাসরি অ্যাপের মতো ব্যবহার করতে Settings থেকে "Install App" চাপুন। আপনার সব ডেটা Google অ্যাকাউন্টে ক্লাউড সিঙ্ক থাকে। নতুন ইউজাররা প্রথম ৩০ দিন সব প্রো ফিচার ফ্রি ব্যবহার করতে পারবেন; এরপর শুধু Timer ও Salah ফ্রি থাকবে এবং bKash, Nagad বা Play Billing-এর মাধ্যমে FocusTrack Pro নিয়ে আনলিমিটেড ফোল্ডার, হিটম্যাপ, হিস্ট্রি ও কাস্টম থিম আনলক করতে পারবেন।',
            cta: 'হোমে ফিরে যান',
            action: onBack,
          },
        ]
      : [
          {
            num: '01',
            icon: <Folders className="w-5 h-5" />,
            color: '#4f46e5',
            title: 'Organize Folders, Sub-Folders & Chapters',
            desc: 'Create study folders in Settings or the Folders tab. Inside any folder you can freely add nested sub-folders or subjects. Press and hold any folder to rename, recolor, or delete it. Inside subjects, add chapters and check them off as you finish.',
            cta: 'Open Folders',
            action: () => {
              setSelectedFolderId(null);
              setActiveTab('folders');
            },
          },
          {
            num: '02',
            icon: <Timer className="w-5 h-5" />,
            color: 'var(--app-accent, #ff4757)',
            title: 'Focus Timer, Soundscapes & Zen Mode',
            desc: 'Tap Play on the home dial to pick your exact folder and subject before starting. Switch between Stopwatch, customizable Focus durations (15m–90m), and Break timers. Use Focus Soundscapes and full-screen Zen Mode for distraction-free study.',
            cta: 'Go to Timer',
            action: () => {
              setSelectedFolderId(null);
              setActiveTab('routine');
            },
          },
          {
            num: '03',
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: '#10b981',
            title: 'Daily Tasks & Activity Heatmap',
            desc: 'Tap "+ Add Today\'s Target Task" to plan a subject and target duration (inside a folder or standalone). Checking off a task clears it from Home while saving progress in Tasks & History. Higher study hours glow brighter green on your Consistency Map.',
            cta: 'Add a Task',
            action: () => setActiveTab('add-task'),
          },
          {
            num: '04',
            icon: <Moon className="w-5 h-5" />,
            color: '#0d9488',
            title: '5-Time Daily Salah & City Prayer Windows',
            desc: 'Open the Salah tab and enter your city or use GPS to view exact daily start and end times for Fajr, Dhuhr, Asr, Maghrib, and Isha. Toggle Hanafi/Shafi Asr calculation and track your daily prayer streak.',
            cta: 'Open Salah',
            action: () => setActiveTab('salah'),
          },
          {
            num: '05',
            icon: <Palette className="w-5 h-5" />,
            color: '#d97706',
            title: 'Eye-Care Themes & Custom Theme Studio',
            desc: 'Open Settings to switch between Soft Light, Warm Paper, Midnight Dark, and Pure AMOLED Black. You can also pick any custom accent hex color and save your own custom themes.',
            cta: 'Customize Theme',
            action: () => {
              if (onOpenSidebar) onOpenSidebar();
            },
          },
          {
            num: '06',
            icon: <Smartphone className="w-5 h-5" />,
            color: '#7c3aed',
            title: 'Install as Mobile App & Cloud Sync',
            desc: 'Install FocusTrack to your home screen from Settings for full-screen mobile use. Your study history syncs automatically with Google Sign-In. New accounts enjoy a 30-day full free trial; afterward, Timer & Salah stay free while FocusTrack Pro unlocks unlimited folders, heatmap, history, soundscapes, and custom themes.',
            cta: 'Back Home',
            action: onBack,
          },
        ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Sub-Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242636] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {lang === 'bn' ? 'অ্যাপ ব্যবহারের নির্দেশিকা' : 'How to Use FocusTrack'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'সকল ফিচার সহজে ব্যবহার করার ধাপে ধাপে গাইড'
                : 'Step-by-step quick start guide for every feature'}
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-[#191b27] border border-slate-300/70 dark:border-[#272a3d]">
          <button
            type="button"
            onClick={() => setLang('bn')}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              lang === 'bn'
                ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              lang === 'en'
                ? 'bg-white dark:bg-[#262a3d] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Quick Welcome Card */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
        <div
          className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: 'var(--app-accent, #ff4757)' }}
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {lang === 'bn'
              ? '১ মিনিটে FocusTrack-এর পুরো ব্যবহার শিখুন'
              : 'Master FocusTrack in 60 Seconds'}
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'প্রতিটি ধাপের নিচে থাকা বাটনে ক্লিক করে সরাসরি সেই ফিচারটি সাথে সাথে ট্রাই করে দেখতে পারবেন।'
              : 'Tap the action button on any step below to jump straight into that tool and try it out.'}
          </p>
        </div>
      </div>

      {/* Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {steps.map((step) => (
          <article
            key={step.num}
            className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.icon}
                  </div>
                  <span className="font-mono tabular-nums text-xs font-extrabold text-slate-400 dark:text-slate-500">
                    STEP {step.num}
                  </span>
                </div>
              </div>

              <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                {step.title}
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={step.action}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1b1e2c] hover:bg-slate-200/80 dark:hover:bg-[#23273a] border border-slate-200 dark:border-[#2a2e44] text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>{step.cta}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </article>
        ))}
      </div>

      {/* Pro & Streaks Tip */}
      <div className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'দৈনিক টিপস' : 'Daily Pro Tip'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'দিন শেষে নতুন দিনের জন্য Settings থেকে "Start New Day" ব্যবহার করলে আজকের সব পড়া History-তে সেভ থাকবে।'
                : 'Use "Start New Day" in Settings to archive today cleanly into Study History before tomorrow begins.'}
            </p>
          </div>
        </div>
        <Crown className="w-4 h-4 text-amber-500 shrink-0 hidden sm:block" />
      </div>
    </div>
  );
};
