import mixpanel from 'mixpanel-browser';

/**
 * Low-level Mixpanel Client SDK Manager.
 * Handles client-side safe execution, idempotent initialization,
 * browser/device property parsing, and error-trapped tracking calls.
 */

let isInitialized = false;

/**
 * Detect user browser safely from User Agent string.
 */
function getBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

/**
 * Detect Operating System safely from User Agent.
 */
function getOS(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('X11') || ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

/**
 * Detect Device Type (Desktop vs Mobile vs Tablet).
 */
function getDeviceType(): 'Mobile' | 'Tablet' | 'Desktop' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Collect standardized client metadata properties for every event.
 */
export function getCommonProperties(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};

  return {
    browser: getBrowser(),
    operating_system: getOS(),
    device_type: getDeviceType(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    page_url: window.location.href,
    referrer: document.referrer || 'Direct',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Idempotent initialization of Mixpanel Browser SDK.
 */
export const initMixpanel = (): void => {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

  if (!token || token === 'YOUR_MIXPANEL_TOKEN_HERE') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Mixpanel Analytics] NEXT_PUBLIC_MIXPANEL_TOKEN is not set in .env.local. Tracking paused.'
      );
    }
    return;
  }

  try {
    mixpanel.init(token, {
      api_host: "https://api-eu.mixpanel.com", // Directs events to EU data residency
      debug: process.env.NODE_ENV === 'development',
      track_pageview: false,
      persistence: 'localStorage',
      ignore_dnt: true, // Prevents Do Not Track headers from silently blocking events
    });
    isInitialized = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Mixpanel Analytics] Initialized successfully.');
    }
  } catch (err) {
    console.error('[Mixpanel Analytics] Failed to initialize Mixpanel SDK:', err);
  }
};

/**
 * Low-level event dispatch with error trapping.
 * Ensures analytics calls NEVER crash or disrupt user UI/experience.
 */
export const trackRawEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;

  try {
    if (!isInitialized) {
      initMixpanel();
    }

    if (isInitialized) {
      const mergedProps = {
        ...getCommonProperties(),
        ...properties,
      };
      mixpanel.track(eventName, mergedProps);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mixpanel Event] "${eventName}"`, mergedProps);
      }
    }
  } catch (err) {
    // Silently trap analytics errors in production so user experience is never degraded
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Mixpanel Analytics] Error tracking event "${eventName}":`, err);
    }
  }
};
