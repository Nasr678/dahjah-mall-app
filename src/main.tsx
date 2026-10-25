import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Handle transient iframe environment errors such as "Database is closing/hidden" or IndexedDB aborts
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (reason instanceof Error ? reason.message : String(reason || '')).toLowerCase();
    if (
      msg.includes('closing') ||
      msg.includes('hidden') ||
      msg.includes('database is closing') ||
      msg.includes('indexeddb') ||
      msg.includes('abort') ||
      msg.includes('quota') ||
      msg.includes('offline')
    ) {
      // Prevent standard browser unhandled rejection crash dialog for transient sandbox connection teardowns
      event.preventDefault();
      console.warn('Suppressed transient background database event:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = (event?.message || '').toLowerCase();
    if (
      msg.includes('closing') ||
      msg.includes('hidden') ||
      msg.includes('database is closing') ||
      msg.includes('indexeddb') ||
      msg.includes('abort')
    ) {
      event.preventDefault();
      console.warn('Suppressed transient background database error:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
