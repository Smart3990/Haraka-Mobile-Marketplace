import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './lib/firebase.ts';

// Test Firestore connection on boot per Firebase skill guidelines
testConnection();

// The desktop simulator (phone frame + code panel) is a local development tool only.
// Everywhere else, and locally with ?native, show the app exactly as on a phone.
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
let native = !isLocalDev || new URLSearchParams(window.location.search).has('native');
try {
  // Remember ?native for this tab, because the app rewrites the address bar while navigating
  if (native) sessionStorage.setItem('haraka-native', '1');
  else native = sessionStorage.getItem('haraka-native') === '1';
} catch {
  // Storage can be unavailable (private mode); the address bar flag still works
}

createRoot(document.getElementById('root')!).render(<App native={native} />);
