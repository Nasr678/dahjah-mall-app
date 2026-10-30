import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const overlayId = 'dajjah-debug-overlay';
const STARTUP_DIAGNOSTIC_OVERLAY = false;

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

  if (STARTUP_DIAGNOSTIC_OVERLAY) {
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
  }

  console.error(label, payload);
}

function renderStartupFallback(label: string, payload: unknown) {
  const message = getErrorText(payload)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const root = document.getElementById('root');
  if (!root) {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('dir', 'rtl');
    wrapper.setAttribute('style', 'position:fixed;inset:0;background:#07060A;color:#fef3c7;display:flex;align-items:center;justify-content:center;padding:20px;z-index:999999;font-family:Tahoma,Arial,sans-serif;');
    wrapper.innerHTML = `
      <div style="width:100%;max-width:520px;background:rgba(17,17,17,0.97);border:1px solid rgba(245,158,11,0.55);border-radius:18px;padding:24px;box-shadow:0 18px 42px rgba(0,0,0,0.45);">
        <h2 style="margin:0 0 12px;color:#fbbf24;font-size:24px;">تعذر تشغيل التطبيق</h2>
        <p style="margin:0 0 16px;color:#f5f5f4;line-height:1.8;font-size:14px;">حدث خطأ أثناء تهيئة التطبيق. تم تسجيل التفاصيل لتسهيل التشخيص.</p>
        <pre style="margin:0;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.2);color:#fef3c7;border-radius:12px;padding:12px;overflow:auto;max-height:260px;font-size:11px;line-height:1.6;">${message}</pre>
        <button type="button" style="margin-top:18px;width:100%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#111827;border:none;border-radius:12px;padding:12px 16px;font-weight:800;cursor:pointer;">إعادة المحاولة</button>
      </div>
    `;
    const retryButton = wrapper.querySelector('button');
    if (retryButton) {
      retryButton.addEventListener('click', () => window.location.reload());
    }
    document.body.appendChild(wrapper);
    return;
  }

  root.innerHTML = `
    <div dir="rtl" style="min-height:100vh;background:#07060A;color:#fef3c7;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Tahoma,Arial,sans-serif;">
      <div style="width:100%;max-width:520px;background:rgba(17,17,17,0.97);border:1px solid rgba(245,158,11,0.55);border-radius:18px;padding:24px;box-shadow:0 18px 42px rgba(0,0,0,0.45);">
        <h2 style="margin:0 0 12px;color:#fbbf24;font-size:24px;">تعذر تشغيل التطبيق</h2>
        <p style="margin:0 0 16px;color:#f5f5f4;line-height:1.8;font-size:14px;">حدث خطأ أثناء تهيئة التطبيق. تم تسجيل التفاصيل لتسهيل التشخيص.</p>
        <pre style="margin:0;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.2);color:#fef3c7;border-radius:12px;padding:12px;overflow:auto;max-height:260px;font-size:11px;line-height:1.6;">${message}</pre>
        <button type="button" style="margin-top:18px;width:100%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#111827;border:none;border-radius:12px;padding:12px 16px;font-weight:800;cursor:pointer;">إعادة المحاولة</button>
      </div>
    </div>
  `;

  const retryButton = root.querySelector('button');
  if (retryButton) {
    retryButton.addEventListener('click', () => window.location.reload());
  }

  showDiagnostic(label, payload);
}

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
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
      return null;
    }
    return this.props.children;
  }
}

async function loadAppBundle() {
  const [{ default: App }, _cssModule, _leafletCssModule] = await Promise.all([
    import('./App.tsx'),
    import('./index.css'),
    import('leaflet/dist/leaflet.css'),
  ]);

  return App;
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const text = event?.error ?? event?.message ?? 'Unknown runtime error';
    const msg = String(text).toLowerCase();
    const transient = ['closing', 'hidden', 'database is closing', 'indexeddb', 'abort', 'quota', 'offlinedata'].some((token) => msg.includes(token));
    if (transient) {
      console.warn('Suppressed transient runtime error:', text);
      return;
    }
    event.preventDefault();
    showDiagnostic('window.onerror', text);
    renderStartupFallback('window.onerror', text);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason ?? 'Unknown promise rejection';
    const msg = String(reason).toLowerCase();
    const transient = ['closing', 'hidden', 'database is closing', 'indexeddb', 'abort', 'quota', 'offlinedata'].some((token) => msg.includes(token));
    if (transient) {
      console.warn('Suppressed transient promise rejection:', reason);
      return;
    }
    event.preventDefault();
    showDiagnostic('unhandledrejection', reason);
    renderStartupFallback('unhandledrejection', reason);
  });
}

console.info('Startup: registering handlers and loading app bundle...');

(async () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Missing required #root element in index.html');
    }

    const App = await loadAppBundle();
    const root = createRoot(rootElement);
    root.render(
      <StartupErrorBoundary>
        <StrictMode>
          <App />
        </StrictMode>
      </StartupErrorBoundary>,
    );
  } catch (error) {
    const text = getErrorText(error);
    showDiagnostic('React startup bootstrap failed', text);
    renderStartupFallback('React startup bootstrap failed', text);
  }
})();
