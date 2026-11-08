import React, { useState, useEffect } from 'react';
import {
  getDefaultClientId,
  getCustomClientId,
  setCustomClientId,
  CALENDAR_SCOPES,
  signOutGoogle,
  auth,
} from '../services/googleCalendar';
import {
  Key,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const defaultClientId = getDefaultClientId();
  const [customIdInput, setCustomIdInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomIdInput(getCustomClientId());
      setSavedSuccess(false);
      setCopiedKey(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    setCustomClientId(customIdInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    setCustomIdInput('');
    setCustomClientId('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currentEffectiveClientId = customIdInput.trim() || defaultClientId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              OAuth 2.0 Integration Setup
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
              Google Cloud Client ID
            </h2>
          </div>
        </div>

        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Client ID configuration updated successfully!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Active Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Currently Active Client ID:
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  customIdInput.trim()
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {customIdInput.trim() ? 'Custom Client ID' : 'AI Studio Provisioned'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200 break-all select-all text-[11px] bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <span className="truncate">{currentEffectiveClientId || 'None configured'}</span>
              <button
                onClick={() => handleCopy(currentEffectiveClientId, 'active')}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy Client ID"
              >
                {copiedKey === 'active' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Custom Client ID Input Form */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Paste Custom Google Cloud Client ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={customIdInput}
                onChange={(e) => setCustomIdInput(e.target.value)}
                placeholder="e.g., 506048528218-xxx.apps.googleusercontent.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              If you have your own Google Cloud project with Google Calendar API enabled, you can paste
              your Web Application Client ID above. Leave empty to use the automatic built-in configuration.
            </p>
          </div>

          {/* Scopes Information */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Requested OAuth Scopes:</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all select-all">
              {CALENDAR_SCOPES.join('\n')}
            </div>
          </div>

          {/* Quick Help for Custom GCP Setup */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Google Cloud Console Quick Checklist</span>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                <span>Credentials Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500 dark:text-slate-400">
              <li>Enable "Google Calendar API" in APIs & Services.</li>
              <li>Add this app's origin domain to Authorized JavaScript Origins.</li>
              <li>Configure OAuth Consent Screen with the calendar.events scope.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reset to default provisioned Client ID"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
