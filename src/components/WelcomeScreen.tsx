import React from 'react';
import { WELCOME_HERO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onContinueGuest?: () => void;
  onRegisterPartner?: () => void;
}

export const WELCOME_HERO_IMAGE = WELCOME_HERO;

export default function WelcomeScreen({
  onSignIn,
  onSignUp,
}: WelcomeScreenProps) {
  // The system admin can replace this picture from the dashboard
  const { welcomeImageUrl } = useBranding();
  return (
    <main className="h-full w-full max-w-md mx-auto px-6 py-4 flex flex-col justify-between items-center bg-white font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased select-none overflow-hidden box-border">
      {/* Top subtle spacing anchor */}
      <div className="w-full h-2 sm:h-4 shrink-0" />

      {/* Center Content: Hero Image & Headings */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center py-1 sm:py-2">
        {/* 3D Marketplace Hero Illustration */}
        <div className="w-full max-w-[280px] max-h-[48%] aspect-[4/3] flex items-center justify-center mb-4 sm:mb-6 shrink min-h-0">
          <img
            alt="Welcome to Haraka - Buy and sell items locally"
            className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none select-none"
            src={welcomeImageUrl || WELCOME_HERO}
          />
        </div>

        {/* Welcome Headings */}
        <div className="text-center px-2 shrink-0">
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-snug mb-1.5">
            Welcome to Haraka!
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 font-medium">
            Buy and sell items locally in a flash!
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full shrink-0 flex flex-col items-center gap-3 pt-4 pb-10">
        {/* Sign Up Button */}
        <button
          type="button"
          onClick={onSignUp}
          id="btn-signup"
          className="w-full h-12 rounded-full bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-bold text-base transition-all shadow-xs flex items-center justify-center cursor-pointer"
        >
          Sign Up
        </button>

        {/* Log In Button */}
        <button
          type="button"
          onClick={onSignIn}
          id="btn-login"
          className="w-full h-12 rounded-full bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200/90 text-slate-700 font-semibold text-base transition-all flex items-center justify-center cursor-pointer"
        >
          Login
        </button>
      </div>
    </main>
  );
}
