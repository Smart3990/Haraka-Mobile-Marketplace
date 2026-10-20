import React, { useEffect, useState, useRef } from 'react';
import { BRAND_LOGO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface SplashScreenProps {
  onFinish?: () => void;
  autoDismissMs?: number;
  showDismissButton?: boolean;
}

export const HARAKA_SPLASH_LOGO_URL = BRAND_LOGO;

export default function SplashScreen({
  onFinish,
  autoDismissMs = 3000,
  showDismissButton = false,
}: SplashScreenProps) {
  // The system admin can replace the logo from the dashboard
  const brandLogo = useBranding().logoUrl || HARAKA_SPLASH_LOGO_URL;
  const [isPressed, setIsPressed] = useState(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(() => {
      onFinishRef.current?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  const handleTap = () => {
    onFinishRef.current?.();
  };

  return (
    <main
      onClick={handleTap}
      className="flex-1 flex flex-col relative w-full pt-safe pb-safe bg-[#faf8ff] text-[#131b2e] select-none h-full min-h-[520px] font-['Plus_Jakarta_Sans',sans-serif] cursor-pointer"
      title="Tap to continue"
    >
      <div
        className="flex flex-col w-full justify-between items-center px-4 py-6 relative overflow-hidden flex-1"
        style={{ minHeight: 'calc(100% - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Subtle Ambient Glow Rings */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#ff7a00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#006c45]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Spacing Anchor */}
        <div className="w-full h-6" />

        {/* Center Branded Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10 my-auto">
          <img
            src={brandLogo}
            alt="Haraka"
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            className={`h-28 w-auto object-contain mx-auto transition-transform duration-200 select-none ${
              isPressed ? 'scale-105' : 'scale-100 hover:scale-102'
            }`}
          />
        </div>

        {/* Bottom Brand Status & Tactile Loader */}
        <div className="flex flex-col items-center justify-center w-full pb-8 z-10">
          {/* Fluid Smooth Spinner */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <svg className="animate-spin w-7 h-7 text-[#ff7a00]" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
