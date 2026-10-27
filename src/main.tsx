import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

const overlayId = 'dajjah-debug-overlay';

function showDiagnostic(label: string, payload: unknown) {
  const message = payload instanceof Error ? payload.stack || payload.message : String(payload ?? 'Unknown error');
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
  node.style.border = '1px solid rgba(250, 204, 21, 0.4)';
  node.style.borderRadius = '10px';
  node.style.padding = '12px';
  node.textContent = `${label}\n${message}`;

  if (!existing) {
    document.body.appendChild(node);
  }

  console.error(label, payload);
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = (event?.message || '').toLowerCase();
    if (msg.includes('closing') || msg.includes('hidden') || msg.includes('database is closing') || msg.includes('indexeddb') || msg.includes('abort') || msg.includes('quota') || msg.includes('offline')) {
      event.preventDefault();
      console.warn('Suppressed transient background database error:', msg);
      return;
    }

    event.preventDefault();
    showDiagnostic('window.onerror', event.error ?? event.message ?? 'Unknown runtime error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (reason instanceof Error ? reason.message : String(reason || '')).toLowerCase();
    if (msg.includes('closing') || msg.includes('hidden') || msg.includes('database is closing') || msg.includes('indexeddb') || msg.includes('abort') || msg.includes('quota') || msg.includes('offline')) {
      event.preventDefault();
      console.warn('Suppressed transient background database event:', msg);
      return;
    }

    event.preventDefault();
    showDiagnostic('unhandledrejection', reason ?? 'Unhandled Promise rejection');
  });
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  showDiagnostic('React render failed', error);
  throw error;
}
