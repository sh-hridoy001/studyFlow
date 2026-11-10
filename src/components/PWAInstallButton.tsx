import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'menu-item' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, hasNativePrompt, isIOS, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed in standalone mode, do not show install prompt
  if (isInstalled) {
    return null;
  }

  // Show if installable or in browser environment
  const handleClick = async () => {
    if (hasNativePrompt) {
      await installApp();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt for Chrome / Edge
      alert('To install FocusTrack, click the install icon in your browser address bar or menu (Install App).');
    }
  };

  return (
    <>
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap ${className}`}
          title="Install FocusTrack as a standalone App on your Phone or PC"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'menu-item' && (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center gap-2 px-3.5 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left font-medium cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          <span>Install App on Device</span>
        </button>
      )}

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-base mb-1">Install on iPhone / iPad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Install FocusTrack directly to your iOS Home Screen for a fullscreen, distraction-free study app experience:
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <span>
                  Tap the Safari <strong>Share</strong> icon (
                  <Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" />) in the bottom navigation toolbar.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong> (
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" />).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right corner. FocusTrack will appear right on your phone!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
