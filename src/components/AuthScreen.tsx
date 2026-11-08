import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Timer,
  GraduationCap,
  Target,
  Languages,
  Cloud,
  CheckCircle2,
  Calendar,
  Flame,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';

interface AuthScreenProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ theme, onToggleTheme }) => {
  const {
    signInWithGoogle,
    continueAsGuest,
    error,
    isDomainUnauthorized,
    currentDomain,
    clearError,
  } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const firebaseAuthSettingsUrl = 'https://console.firebase.google.com/project/study-traker-4cf8d/authentication/settings';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top mini navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
              FocusTrack
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Daily Study Routine & Planner
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl w-full">
          {/* Card Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-10 shadow-xl relative overflow-hidden backdrop-blur-xs">
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Cloud Sync & Authentication</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Master Your Study Routine & Daily Prayers
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Plan your morning goals, track live study hours with a stopwatch, log your 5 daily prayers,
              and keep all your records securely saved under your user account.
            </p>

            {/* Domain Authorization Helper Box (When auth/unauthorized-domain occurs) */}
            {isDomainUnauthorized ? (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Firebase Authorized Domain Required</span>
                </div>
                
                <p className="leading-relaxed mb-3 text-amber-800/90 dark:text-amber-300/90">
                  Google Sign-In requires your current app domain to be allowlisted in your Firebase project (<strong className="font-mono">study-traker-4cf8d</strong>):
                </p>

                {/* Domain Copy Row */}
                <div className="flex items-center gap-2 mb-3 bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/80 p-2 rounded-xl">
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold truncate flex-1 select-all">
                    {currentDomain || 'run.app'}
                  </span>
                  <button
                    onClick={handleCopyDomain}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                  </button>
                </div>

                <div className="text-[11px] space-y-1 mb-4 text-amber-800/80 dark:text-amber-300/80">
                  <p>1. Open <strong className="font-semibold">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong></p>
                  <p>2. Click <strong className="font-semibold">Add domain</strong> and paste <code className="font-mono font-bold bg-amber-100/60 dark:bg-amber-900/40 px-1 rounded">{currentDomain}</code></p>
                  <p>3. Save and return here to Continue with Google.</p>
                </div>

                {/* Actions: Open Console & Continue in Guest Mode */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={firebaseAuthSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={continueAsGuest}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white hover:bg-amber-100/50 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Continue in Local Mode Now</span>
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold block">Authentication Note:</span>
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            {/* Google Sign In Call-to-Action */}
            <div className="mt-8 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google G Logo SVG */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Instant Guest / Local Mode Button */}
                <button
                  onClick={continueAsGuest}
                  className="px-5 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer flex items-center justify-center gap-2"
                  title="Use all tracker features with local browser storage"
                >
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Try in Local Mode</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your study and prayer data is isolated under your private account</span>
              </div>
            </div>

            {/* 3 Core Folders Showcase Grid */}
            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                Core Dynamic Folders & Disciplines
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Folder 1: Academic */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                    <GraduationCap className="w-4 h-4" />
                    <span>Academic</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Campus subjects, assignments & semester exam prep
                  </p>
                </div>

                {/* Folder 2: Admission */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Target className="w-4 h-4" />
                    <span>Admission</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Competitive test prep, question banks & mock exams
                  </p>
                </div>

                {/* Folder 3: English Learning */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <Languages className="w-4 h-4" />
                    <span>English</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Vocabulary, IELTS, reading & fluency practice
                  </p>
                </div>
              </div>
            </div>

            {/* Quick feature highlights */}
            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-loads on Mobile & PC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>5-Time Daily Salah Tracker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Habit Streak & Time Logs</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-400 dark:text-slate-600">
        FocusTrack · Secured with Firebase Firestore & Authentication
      </footer>
    </div>
  );
};
