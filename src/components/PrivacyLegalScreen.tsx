import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  MapPin,
  Cloud,
} from 'lucide-react';

interface PrivacyLegalScreenProps {
  onBack: () => void;
  showAccountDeletion?: boolean;
}

export const PrivacyLegalScreen: React.FC<PrivacyLegalScreenProps> = ({
  onBack,
  showAccountDeletion = true,
}) => {
  const { user, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
    } catch (err: any) {
      setDeleteError(
        err?.message || 'Unable to delete account right now. Please sign in again and retry.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#242636] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy, Terms &amp; Account
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Data safety, permissions &amp; account deletion controls
          </p>
        </div>
      </div>

      {/* Privacy Policy Card */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <h2>Privacy Policy</h2>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b]">
            <Cloud className="w-4 h-4 text-[#ff4757] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Study &amp; Prayer Data</p>
              <p className="mt-0.5">
                Your folders, tasks, focus durations, and Salah logs are saved privately under your
                account using Google Firebase Firestore (or locally on your device in Guest/Offline
                Mode). We never sell, rent, or show third-party ads using your data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b]">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Location (Optional)</p>
              <p className="mt-0.5">
                Location permission or manual city entry is used solely to calculate accurate daily
                Salah prayer timings via Aladhan API. Coordinates are stored only in your device
                cache and are never uploaded or shared with advertisers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#181a25] border border-slate-200/80 dark:border-[#26293b]">
            <Lock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Authentication &amp; Security</p>
              <p className="mt-0.5">
                Sign-in is handled securely by Google Firebase Authentication. Your data is isolated
                by strict Firestore security rules so only your authenticated account can read or
                modify it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service */}
      <section className="bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
          <h2>Terms of Service</h2>
        </div>
        <p>
          FocusTrack is a personal productivity, study planning, and daily Salah tracking tool.
          Prayer timings are provided for convenience and may vary slightly from local mosque
          timetables. You retain full ownership of all notes, chapters, and study logs you create.
        </p>
      </section>

      {/* In-App Account Deletion (Required for Google Play & Apple App Store) */}
      {showAccountDeletion && user && (
        <section className="bg-white dark:bg-[#13141d] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h2>Delete Account &amp; All Data</h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Permanently delete your FocusTrack account ({user.email || 'Local Guest'}) and erase all
            synced study tasks, folders, notes, and prayer logs from Firebase Firestore and this
            device. This action cannot be undone.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {deleteError}
            </div>
          )}

          {!isConfirmingDelete ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2.5">
              <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-300">
                Type <span className="font-mono">DELETE</span> to permanently erase your account:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-white dark:bg-[#12131b] border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    setConfirmText('');
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#191b27] border border-slate-200 dark:border-[#272a3d] text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
