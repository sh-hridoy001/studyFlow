import React, { useEffect, useRef } from 'react';
import { useAppControl } from '../context/AppControlContext';
import { useStudy } from '../context/StudyContext';
import { ensureAdSenseScript } from '../services/adsService';
import { Crown, Sparkles } from 'lucide-react';

interface AdBannerSlotProps {
  className?: string;
}

/**
 * Respectful Study-Safe Banner Ad Slot:
 * - Never shown to Pro users (or active 24h Reward Pass holders)
 * - Never shown while Study Timer / Stopwatch is actively running
 * - Never shown on the Salah Prayer Tracker tab
 * - Uses real Google AdSense when Admin provides a valid ca-pub-... ID,
 *   and renders a clean zero-shift sponsored strip otherwise.
 */
export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ className = '' }) => {
  const { isPro, globalConfig, openUpgradeModal } = useAppControl();
  const { stopwatch, activeTab, accentColor } = useStudy();
  const adContainerRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const publisherId = (globalConfig.adsensePublisherId || '').trim();
  const hasValidAdSense = /^ca-pub-\d{10,20}$/.test(publisherId);

  const shouldHide =
    isPro ||
    globalConfig.adsEnabled === false ||
    stopwatch.isRunning ||
    activeTab === 'salah';

  useEffect(() => {
    if (shouldHide || !hasValidAdSense) return;
    const ok = ensureAdSenseScript(publisherId);
    if (!ok || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense script still loading or blocked by extension
    }
  }, [shouldHide, hasValidAdSense, publisherId]);

  if (shouldHide) return null;

  const accent = accentColor || '#ff4757';

  if (hasValidAdSense) {
    return (
      <div
        className={`w-full rounded-2xl bg-white/80 dark:bg-[#13141d]/90 border border-slate-200 dark:border-[#222434] p-2.5 overflow-hidden min-h-[76px] flex flex-col items-center justify-center ${className}`}
        aria-label="Sponsored Advertisement"
      >
        <div className="w-full flex items-center justify-between text-[10px] text-slate-400 px-1 mb-1">
          <span>Sponsored · Supports Free Tier</span>
          <button
            type="button"
            onClick={() => openUpgradeModal('Ad-Free Focus Experience')}
            className="font-bold hover:underline cursor-pointer"
            style={{ color: accent }}
          >
            Remove Ads
          </button>
        </div>
        <ins
          ref={adContainerRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: '50px' }}
          data-ad-client={publisherId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl bg-white dark:bg-[#13141d] border border-slate-200 dark:border-[#222434] px-3.5 py-3 shadow-2xs flex items-center justify-between gap-3 min-h-[60px] ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Free Plan · Study-Safe Ad Slot
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            Ads pause automatically during Focus Timer &amp; Salah. Upgrade or watch a short ad for 24h Pro.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openUpgradeModal('Ad-Free Study & 24h Free Pass')}
        className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-white shrink-0 flex items-center gap-1 cursor-pointer shadow-xs transition-opacity hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        <Crown className="w-3 h-3" />
        <span>Ad-Free</span>
      </button>
    </div>
  );
};
