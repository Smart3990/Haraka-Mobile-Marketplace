'use dom';

/**
 * Runs the original Haraka web app (App.tsx) inside the native Expo app as an
 * Expo DOM component, without the desktop simulator chrome.
 */
import { Component, useEffect, type ReactNode } from 'react';
import type { DOMProps } from 'expo/dom';
import App, { type NativeBridge } from './App';
import './index.css';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

/**
 * Fit the app to the phone screen exactly: no page zoom or page scrolling (only the
 * screen content scrolls), no sideways overflow, and text sizes not changed by the browser.
 */
function setUpPhoneScreen() {
  let viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

  if (document.getElementById('haraka-phone-screen')) return;
  const style = document.createElement('style');
  style.id = 'haraka-phone-screen';
  style.textContent = `
    html, body { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; overscroll-behavior: none;
      -webkit-text-size-adjust: 100%; text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
    body > div, #root { height: 100%; width: 100%; overflow: hidden; }
  `;
  document.head.appendChild(style);
}

if (typeof document !== 'undefined') setUpPhoneScreen();

/** Shows what went wrong (instead of a blank screen) if the app fails to start. */
class StartupErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: 'sans-serif', background: '#fff' }}>
        <h2 style={{ fontSize: 18, margin: 0, color: '#0f172a' }}>Haraka could not start</h2>
        <p style={{ fontSize: 13, color: '#475569', margin: '8px 0 16px' }}>Please send this message to support:</p>
        <code style={{ fontSize: 11, color: '#b91c1c', wordBreak: 'break-word', maxWidth: 320 }}>{this.state.error}</code>
        <button
          onClick={() => location.reload()}
          style={{ marginTop: 20, padding: '10px 22px', borderRadius: 12, border: 0, background: '#FF6A00', color: '#fff', fontWeight: 700 }}
        >
          Try again
        </button>
      </div>
    );
  }
}

// Errors outside React (e.g. while loading) are shown too, rather than a blank page
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const root = document.getElementById('root');
    if (root && !root.childElementCount) {
      root.innerHTML = `<div style="padding:24px;font-family:sans-serif;text-align:center"><h2 style="font-size:18px">Haraka could not start</h2><code style="font-size:11px;color:#b91c1c;word-break:break-word">${String(event.message).replace(/</g, '&lt;')}</code></div>`;
    }
  });
}

export default function HarakaApp({
  registerForPush,
  sendPush,
  openRoute,
}: NativeBridge & { dom?: DOMProps }) {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  return (
    <StartupErrorBoundary>
      <App native nativeBridge={{ registerForPush, sendPush, openRoute }} />
    </StartupErrorBoundary>
  );
}
