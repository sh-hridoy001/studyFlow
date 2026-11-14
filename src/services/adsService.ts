// Unified Web (AdSense) + Android APK (Capacitor AdMob Bridge) Ads Helper
// Respects Pro users, active focus sessions, and Salah tab.

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        AdMob?: {
          initialize?: (opts?: Record<string, unknown>) => Promise<void>;
          showBanner?: (opts?: Record<string, unknown>) => Promise<void>;
          hideBanner?: () => Promise<void>;
          prepareRewardVideoAd?: (opts?: Record<string, unknown>) => Promise<void>;
          showRewardVideoAd?: () => Promise<{ type?: string; amount?: number } | boolean>;
        };
      };
    };
  }
}

let adSenseScriptLoadedFor: string | null = null;

export function isNativeCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

export function ensureAdSenseScript(publisherId?: string): boolean {
  if (typeof document === 'undefined' || !publisherId) return false;
  const cleanId = publisherId.trim();
  if (!/^ca-pub-\d{10,20}$/.test(cleanId)) return false;

  if (adSenseScriptLoadedFor === cleanId) return true;

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-focustrack-adsense="true"]'
  );
  if (existing) {
    adSenseScriptLoadedFor = cleanId;
    return true;
  }

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.focustrackAdsense = 'true';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    cleanId
  )}`;
  document.head.appendChild(script);
  adSenseScriptLoadedFor = cleanId;
  return true;
}

export async function showNativeRewardedAd(adUnitId?: string): Promise<boolean> {
  if (!isNativeCapacitor()) return false;
  const admob = window.Capacitor?.Plugins?.AdMob;
  if (!admob?.prepareRewardVideoAd || !admob?.showRewardVideoAd) return false;
  const unitId = (adUnitId || '').trim();
  if (!unitId) return false;

  try {
    await admob.prepareRewardVideoAd({ adId: unitId });
    const reward = await admob.showRewardVideoAd();
    return Boolean(reward);
  } catch (err) {
    console.warn('Native AdMob rewarded ad unavailable:', err);
    return false;
  }
}
