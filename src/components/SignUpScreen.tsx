import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { friendlyAuthError, signUpWithEmail } from '../lib/backend';
import { BRAND_LOGO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface SignUpScreenProps {
  onSuccess: (userData: { fullName: string; email: string }) => void;
  onNavigateLogin: () => void;
  /** Google/Apple popup sign-in only works in a browser, not inside the mobile app. */
  showSocialLogins?: boolean;
  /** Opens the Terms of Use or Privacy Policy page */
  onOpenPolicy?: (page: 'terms' | 'privacy') => void;
}

const HARAKA_LOGO_URL = BRAND_LOGO;

export default function SignUpScreen({
  onSuccess,
  onNavigateLogin,
  showSocialLogins = true,
  onOpenPolicy,
}: SignUpScreenProps) {
  // The system admin can replace the logo from the dashboard
  const brandLogo = useBranding().logoUrl || HARAKA_LOGO_URL;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const nameClean = fullName.trim();
    const emailClean = email.trim();

    if (!nameClean) {
      setError('Please enter your full name');
      return;
    }
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept Haraka\'s Terms of Service and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(nameClean, emailClean, password);
      onSuccess({
        fullName: nameClean,
        email: emailClean,
      });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: 'Google' | 'Apple') => {
    setError('');
    setIsSocialLoading(true);

    if (provider === 'Google') {
      try {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        onSuccess({
          fullName: user.displayName || fullName.trim() || 'Google User',
          email: user.email || 'user@gmail.com',
        });
      } catch (err: any) {
        console.warn('Google Sign-Up note:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Google sign-up popup was closed.');
        } else if (err.code === 'auth/popup-blocked') {
          setError('Browser popup was blocked. Please enable popups to continue.');
        } else {
          setError(err.message || 'Unable to sign up with Google.');
        }
      } finally {
        setIsSocialLoading(false);
      }
    } else {
      // Apple Sign-In
      try {
        const appleProvider = new OAuthProvider('apple.com');
        appleProvider.addScope('email');
        appleProvider.addScope('name');
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        onSuccess({
          fullName: user.displayName || fullName.trim() || 'Apple User',
          email: user.email || 'user@icloud.com',
        });
      } catch (err: any) {
        console.warn('Apple Sign-Up note:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Apple sign-up was closed.');
        } else if (
          err.code === 'auth/operation-not-allowed' ||
          err.code === 'auth/configuration-not-found'
        ) {
          setError(
            'Apple Sign-In requires an Apple Service ID in your Firebase Console. Email sign-up and Google Sign-In are ready.'
          );
        } else {
          setError(err.message || 'Unable to complete Apple Sign-Up.');
        }
      } finally {
        setIsSocialLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-full flex-1 bg-white flex flex-col font-['Inter',sans-serif] select-none text-slate-800 antialiased">
      <div className="w-full max-w-[430px] mx-auto flex-1 flex flex-col justify-between px-6 pt-3 pb-12">
        {/* Inner Content Wrapper */}
        <div className="w-full">
          {/* BEGIN: NavigationHeader */}
          <header className="flex flex-col items-center justify-center w-full pt-6 pb-2">
            <img
              alt="Haraka"
              className="h-12 w-auto object-contain mx-auto mb-2"
              src={brandLogo}
            />
          </header>
          {/* END: NavigationHeader */}

          {/* BEGIN: HeroHeadline */}
          <section className="mt-6 mb-5 text-center">
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Create your account
            </h1>
            <p className="text-[14px] leading-snug text-slate-500 font-normal mt-2.5">
              Join Ghana's marketplace community to buy, sell, and discover verified local deals in a flash.
            </p>
          </section>
          {/* END: HeroHeadline */}

          {/* Clean Error Message without background card or icon */}
          {error && (
            <p className="mb-4 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

        {/* BEGIN: SignUpForm */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide">
              Full Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                className="w-full h-12 bg-[#F1F4F9] border-0 rounded-xl pl-11 pr-4 text-[15px] text-slate-800 placeholder-slate-400 font-normal focus:ring-2 focus:ring-brand focus:bg-white transition outline-none"
                placeholder="e.g. Kwame Mensah"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Field 2: Email Address (Active Mode) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect height="16" rx="2" strokeWidth="1.8" width="20" x="2" y="4" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </div>
              <input
                className="w-full h-12 bg-[#F1F4F9] border-0 rounded-xl pl-11 pr-4 text-[15px] text-slate-800 placeholder-slate-400 font-normal focus:ring-2 focus:ring-brand focus:bg-white transition outline-none"
                placeholder="kwame.mensah@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Field 3: Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect height="11" rx="2" ry="2" strokeWidth="1.8" width="18" x="3" y="11" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </div>
              <input
                className={`w-full h-12 bg-[#F1F4F9] border-0 rounded-xl pl-11 pr-11 text-[15px] text-slate-800 placeholder-slate-400 font-normal focus:ring-2 focus:ring-brand focus:bg-white transition outline-none ${
                  !showPassword && password ? 'tracking-widest' : ''
                }`}
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Toggle Password Visibility Icon */}
              <button
                aria-label="Toggle password visibility"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            {/* Helper Rule */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="text-[12px] text-slate-600 font-medium">At least 8 characters with numbers & symbols</span>
            </div>
          </div>

          {/* Agreement Terms Checkbox */}
          <div className="flex items-start gap-2.5 pt-1.5 pb-2">
            <input
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-[#006B44] focus:ring-0 focus:ring-offset-0 border-gray-300 cursor-pointer accent-[#006B44]"
              id="terms"
              type="checkbox"
            />
            <label className="text-xs text-slate-600 leading-snug select-none cursor-pointer" htmlFor="terms">
              I agree to Haraka's{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPolicy?.('terms');
                }}
                className="font-bold text-[#006B44] hover:underline cursor-pointer"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPolicy?.('privacy');
                }}
                className="font-bold text-[#006B44] hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Primary CTA: Create Account */}
          <button
            className="w-full h-13 py-3.5 bg-[#006B44] hover:bg-[#005435] active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0px_8px_20px_-4px_rgba(0,107,68,0.35)] transition-all text-base cursor-pointer disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Creating Account…' : 'Create Account'}</span>
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        {/* END: SignUpForm */}

        {showSocialLogins && (<>
        {/* BEGIN: SocialDivider */}
        <div className="relative my-6 text-center">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-white px-3 text-slate-500">OR SIGN UP WITH</span>
          </div>
        </div>
        {/* END: SocialDivider */}

        {/* BEGIN: SocialAuthButtons */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Google Signup Button */}
          <button
            onClick={() => handleSocialSignUp('Google')}
            disabled={isSocialLoading}
            className={`h-12 border border-slate-200/80 bg-white rounded-2xl flex items-center justify-center gap-2.5 shadow-[0px_2px_8px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer ${
              isSocialLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
            type="button"
          >
            {/* Official Google "G" Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" fill="#4285F4" />
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" fill="#34A853" />
              <path d="M5.28 14.27a7.17 7.17 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15Z" fill="#FBBC05" />
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Google</span>
          </button>

          {/* Apple Signup Button */}
          <button
            onClick={() => handleSocialSignUp('Apple')}
            disabled={isSocialLoading}
            className={`h-12 border border-slate-200/80 bg-white rounded-2xl flex items-center justify-center gap-2 shadow-[0px_2px_8px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer ${
              isSocialLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
            type="button"
          >
            {/* Apple Logo Icon */}
            <svg className="w-5 h-5 fill-current text-slate-900 mb-0.5 shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.72-7.85-12.06-14.42-6.53-9.87-11.59-21.2-15.17-34.02-3.59-12.82-5.38-24.89-5.38-36.21 0-14.88 3.59-27.42 10.77-37.62 7.18-10.2 16.5-15.42 27.97-15.66 4.35 0 9.42 1.25 15.22 3.76 5.8 2.5 9.42 3.82 10.87 3.96 1.89-.28 5.79-1.67 11.7-4.18 5.91-2.51 11.04-3.69 15.4-3.53 11.45.65 20.89 4.79 28.32 12.42-9.87 5.98-14.73 14.28-14.58 24.89.15 8.35 3.33 15.41 9.55 21.19 6.22 5.78 13.67 9.17 22.35 10.18-2.03 6.23-4.57 12.85-7.62 19.86zM119.22 32.74c0-7.39 2.59-14.48 7.77-21.27 5.18-6.79 11.75-11.08 19.71-12.88.33 1.25.49 2.45.49 3.6 0 7.33-2.67 14.5-8.02 21.52-5.35 7.02-12.04 11.19-20.08 12.51-.13-1.12-.2-2.29-.2-3.48z" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Apple</span>
          </button>
        </div>
        {/* END: SocialAuthButtons */}
        </>)}
      </div>

      {/* BEGIN: Footer */}
      <footer className="mt-8 text-center pb-2">
        <p className="text-sm font-medium text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-bold text-[#FF7A00] hover:text-[#E66E00] ml-0.5 cursor-pointer underline-offset-2 hover:underline"
          >
            Log In
          </button>
        </p>
      </footer>
      {/* END: Footer */}
      </div>
    </div>
  );
}
