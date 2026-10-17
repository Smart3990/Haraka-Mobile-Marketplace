'use dom';

/**
 * Runs the original Haraka web app (App.tsx) inside the native Expo app as an
 * Expo DOM component, without the desktop simulator chrome.
 */
import { useEffect } from 'react';
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

  return <App native nativeBridge={{ registerForPush, sendPush, openRoute }} />;
}
