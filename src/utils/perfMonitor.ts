/**
 * Silent Real User Monitoring (RUM) observer for Web Vitals (FCP, LCP, CLS)
 * Records timings passively without impacting UI rendering or frame rate.
 */

export interface RumSnapshot {
  bootMs?: number;
  fcpMs?: number;
  lcpMs?: number;
  cls?: number;
  connectionType?: string;
}

declare global {
  interface Window {
    __DAJJAH_PERF__?: RumSnapshot;
  }
}

export function initRumMonitoring(bootStartMs: number): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }

  const snapshot: RumSnapshot = {
    bootMs: Math.round(performance.now() - bootStartMs),
    cls: 0,
    connectionType: (navigator as any)?.connection?.effectiveType || 'unknown',
  };
  window.__DAJJAH_PERF__ = snapshot;

  try {
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          snapshot.fcpMs = Math.round(entry.startTime);
          paintObserver.disconnect();
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });
  } catch {}

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        snapshot.lcpMs = Math.round(last.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value || 0;
          snapshot.cls = Number(clsValue.toFixed(4));
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {}
}
