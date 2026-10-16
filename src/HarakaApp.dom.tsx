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
