/// <reference types="vite/client" />
import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initRumMonitoring } from './utils/perfMonitor';

const bootStartMs = typeof performance !== 'undefined' ? performance.now() : Date.now();

const overlayId = 'dajjah-debug-overlay';
const isProduction = Boolean(import.meta.env?.PROD);
let reloadQueued = false;

function removeStartupOverlay() {
  const overlay = document.getElementById(overlayId);
  if (overlay) overlay.remove();
}

function getErrorText(payload: unknown): string {
  if (payload instanceof Error) {
    return payload.stack || payload.message || 'Unknown error';
  }
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload ?? 'Unknown error');
  }
}

function showDiagnostic(label: string, payload: unknown) {
  const message = getErrorText(payload);

  if (isProduction) {
    console.error(label, message);
    return;
  }

  const existing = document.getElementById(overlayId) as HTMLPreElement | null;
  const node = existing ?? document.createElement('pre');

  node.id = overlayId;
  node.style.position = 'fixed';
  node.style.left = '12px';
  node.style.right = '12px';
  node.style.bottom = '12px';
  node.style.zIndex = '999999';
  node.style.maxHeight = '40vh';
  node.style.overflow = 'auto';
  node.style.background = 'rgba(12, 12, 12, 0.92)';
  node.style.color = '#facc15';
  node.style.fontSize = '12px';
  node.style.lineHeight = '1.5';
  node.style.whiteSpace = 'pre-wrap';
  node.style.wordBreak = 'break-word';
  node.style.border = '1px solid rgba(250, 204, 21, 0.4)';
  node.style.borderRadius = '10px';
  node.style.padding = '12px';
  node.textContent = `${label}\n${message}`;

  if (!existing) {
    document.body.appendChild(node);
  }

  console.error(label, payload);
}

function renderStartupFallback(label: string, payload: unknown) {
  const root = document.getElementById('root');
  const message = getErrorText(payload)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const fallbackHtml = `
    <div dir="rtl" style="min-height:100vh;background:radial-gradient(circle at top,#1d1a16 0%,#0a0a0b 45%,#07060a 100%);color:#fef3c7;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Cairo,Tahoma,Arial,sans-serif;">
      <div style="width:min(92vw, 520px);background:rgba(19,17,18,0.96);border:1px solid rgba(245,158,11,0.45);border-radius:24px;padding:24px 20px 20px;box-shadow:0 18px 45px rgba(0,0,0,0.45);text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
          <div style="width:72px;height:72px;border-radius:22px;background:linear-gradient(135deg,#fbbf24,#d97706);display:flex;align-items:center;justify-content:center;color:#111827;font-size:32px;font-weight:900;box-shadow:0 12px 28px rgba(245,158,11,0.35);">ض</div>
        </div>
        <h2 style="margin:0 0 12px;color:#fbbf24;font-size:24px;line-height:1.3;font-weight:900;">تعذر تشغيل التطبيق</h2>
        <p style="margin:0 0 16px;color:#f5f5f4;line-height:1.8;font-size:14px;">
          حدث خطأ أثناء تهيئة التطبيق. سيتم إعادة المحاولة تلقائياً في لحظات، وإذا استمر الأمر يرجى إعادة فتح التطبيق.
        </p>
        <div style="margin-top:12px;padding:12px;border-radius:14px;background:rgba(0,0,0,0.18);border:1px solid rgba(245,158,11,0.18);text-align:right;max-height:200px;overflow:auto;">
          <pre style="margin:0;white-space:pre-wrap;word-break:break-word;color:#fef3c7;font-size:11px;line-height:1.6;">${message}</pre>
        </div>
        <button type="button" style="margin-top:18px;width:100%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#111827;border:none;border-radius:12px;padding:12px 16px;font-weight:800;cursor:pointer;box-shadow:0 10px 22px rgba(245,158,11,0.28);">إعادة المحاولة</button>
      </div>
    </div>
  `;

  if (root) {
    root.innerHTML = fallbackHtml;
    const retryButton = root.querySelector('button');
    if (retryButton) {
      retryButton.addEventListener('click', () => window.location.reload());
    }
  } else {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('dir', 'rtl');
    wrapper.innerHTML = fallbackHtml;
    const retryButton = wrapper.querySelector('button');
    if (retryButton) {
      retryButton.addEventListener('click', () => window.location.reload());
    }
    document.body.appendChild(wrapper);
  }

  showDiagnostic(label, payload);
}

interface StartupErrorBoundaryProps {
  children?: React.ReactNode;
}

interface StartupErrorBoundaryState {
  hasError: boolean;
}

class StartupErrorBoundary extends Component<StartupErrorBoundaryProps, StartupErrorBoundaryState> {
  constructor(props: StartupErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): StartupErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const text = `${getErrorText(error)}\n\nComponent stack:\n${info.componentStack ?? 'n/a'}`;
    console.error('React startup failure', error, info);
    showDiagnostic('React startup failure', text);
    renderStartupFallback('React startup failure', text);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#07060A] text-amber-300 flex items-center justify-center p-4 font-sans select-none">
          <div className="max-w-md w-full bg-neutral-900/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-amber-500/10">
              ض
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ضَجّة مول</h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              حدث تأخر مؤقت في الاتصال أو تجهيز واجهة المتجر. اضغط على الزر أدناه لإعادة تشغيل المتجر بسلاسة.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black text-sm hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-98"
            >
              إعادة تحميل المتجر الآن
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

let isAppMounted = false;

function isBenignOrIgnoredError(payload: unknown): boolean {
  const msg = getErrorText(payload).toLowerCase();
  const ignoredTokens = [
    'websocket',
    'closed without opened',
    'connection closed',
    'connection failed',
    'failed to connect',
    'sockjs',
    'vite',
    'hmr',
    'closing',
    'hidden',
    'database is closing',
    'indexeddb',
    'abort',
    'quota',
    'offlinedata',
    'resizeobserver',
    'networkerror',
    'err_connection_refused',
    'audiocontext',
    'closed before a pending resume',
    'not allowed to start',
    'gesture',
    'user gesture',
    'webgl',
    'lost context',
    'canvas',
    'script error',
    'resourcetiming',
    'permission',
    'geolocation',
    'could not reach cloud firestore',
    'offline mode',
  ];
  return ignoredTokens.some((token) => msg.includes(token));
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const text = event?.error ?? event?.message ?? 'Unknown runtime error';

    if (isBenignOrIgnoredError(text)) {
      event.preventDefault();
      console.warn('Suppressed benign runtime error:', text);
      return;
    }

    const msg = String(text).toLowerCase();
    const chunkLoadFailure = msg.includes('loading chunk') || msg.includes('failed to fetch dynamically imported module');

    if (chunkLoadFailure && !reloadQueued) {
      reloadQueued = true;
      console.warn('Chunk load failed; reloading app once:', text);
      window.setTimeout(() => window.location.reload(), 800);
      return;
    }

    if (isAppMounted) {
      console.error('Post-mount runtime error (preserved UI):', text);
      return;
    }

    event.preventDefault();
    showDiagnostic('window.onerror', text);
    renderStartupFallback('window.onerror', text);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason ?? 'Unknown promise rejection';

    if (isBenignOrIgnoredError(reason)) {
      event.preventDefault();
      console.warn('Suppressed benign promise rejection:', reason);
      return;
    }

    const msg = String(reason).toLowerCase();
    const chunkLoadFailure = msg.includes('loading chunk') || msg.includes('failed to fetch dynamically imported module');

    if (chunkLoadFailure && !reloadQueued) {
      reloadQueued = true;
      console.warn('Chunk load failed; reloading app once:', reason);
      window.setTimeout(() => window.location.reload(), 800);
      return;
    }

    if (isAppMounted) {
      event.preventDefault();
      console.warn('Post-mount unhandled rejection (preserved UI):', reason);
      return;
    }

    event.preventDefault();
    showDiagnostic('unhandledrejection', reason);
    renderStartupFallback('unhandledrejection', reason);
  });
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Missing required #root element in index.html');
  }

  const root = createRoot(rootElement);
  root.render(
    <StartupErrorBoundary>
      <StrictMode>
        <App />
      </StrictMode>
    </StartupErrorBoundary>,
  );

  isAppMounted = true;
  initRumMonitoring(bootStartMs);
  window.setTimeout(() => removeStartupOverlay(), 400);
} catch (error) {
  const text = getErrorText(error);
  console.error('React startup bootstrap failed', error);
  showDiagnostic('React startup bootstrap failed', text);
  renderStartupFallback('React startup bootstrap failed', text);
}
