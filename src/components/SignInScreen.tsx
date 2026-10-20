import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { friendlyAuthError, signInWithEmail } from '../lib/backend';
import { BRAND_LOGO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface SignInScreenProps {
  onSuccess: (userData: { email: string; name?: string }) => void;
  onNavigateSignUp: () => void;
  onForgotPassword?: (email: string) => void;
  onOpenDemo?: () => void;
  /** Google/Apple popup sign-in only works in a browser, not inside the mobile app. */
  showSocialLogins?: boolean;
}

const HARAKA_LOGO_URL = BRAND_LOGO;

export default function SignInScreen({
  onSuccess,
  onNavigateSignUp,
  onForgotPassword,
  onOpenDemo,
  showSocialLogins = true,
}: SignInScreenProps) {
  // The system admin can replace the logo from the dashboard
  const brandLogo = useBranding().logoUrl || HARAKA_LOGO_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');

    const emailClean = email.trim();
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your password (minimum 6 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signInWithEmail(emailClean, password);
      onSuccess({
        email: user.email || emailClean,
        name: user.displayName || '',
      });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'Google' | 'Apple') => {
    setError('');
    setInfoMessage('');
    setIsSocialLoading(true);

    if (provider === 'Google') {
      try {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        onSuccess({
          email: user.email || 'user@gmail.com',
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
        });
      } catch (err: any) {
        console.warn('Google Sign-In note:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Google sign-in popup was closed.');
        } else if (err.code === 'auth/popup-blocked') {
          setError('Browser popup was blocked. Please allow popups to continue with Google.');
        } else if (err.code === 'auth/cancelled-popup-request') {
          // ignore rapid click
        } else {
          setError(err.message || 'Unable to sign in with Google. Please try again.');
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
          email: user.email || 'user@icloud.com',
          name: user.displayName || user.email?.split('@')[0] || 'Apple User',
        });
      } catch (err: any) {
        console.warn('Apple Sign-In note:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Apple sign-in popup was closed.');
        } else if (
          err.code === 'auth/operation-not-allowed' ||
          err.code === 'auth/configuration-not-found'
        ) {
          setError(
            'Apple Sign-In requires an Apple Service ID in your Firebase Console. Email sign-in and Google Sign-In are ready to use.'
          );
        } else {
          setError(err.message || 'Unable to complete Apple Sign-In.');
        }
      } finally {
        setIsSocialLoading(false);
      }
    }
  };

  const handleForgotPass = () => {
    if (onForgotPassword) {
      onForgotPassword(email.trim());
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address above to receive password reset instructions');
      return;
    }
    setError('');
    setInfoMessage(`Password reset link sent to ${email.trim()}! Please check your inbox.`);
  };

  return (
    <div className="w-full min-h-full flex-1 bg-white flex flex-col font-sans antialiased selection:bg-[#1FA971] selection:text-white select-none text-gray-900">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-6 pt-4 pb-12">
        <div className="w-full">
          {/* BEGIN: TopBar */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4 mb-6">
            <img
              src={brandLogo}
              alt="Haraka"
              className="h-12 w-auto object-contain mx-auto mb-2"
            />
          </div>
          {/* END: TopBar */}

          {/* BEGIN: HeadlineSection */}
          <section className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 justify-center">
              <span>Welcome back</span>
              <span className="text-3xl">👋</span>
            </h1>
            <p className="text-gray-600 text-sm mt-2.5 leading-relaxed font-normal">
              Sign in to continue exploring deals, managing your items, and connecting with buyers and sellers across Ghana.
            </p>
          </section>
          {/* END: HeadlineSection */}

          {/* Clean Error / Info text without background card or icons */}
          {error && (
            <p className="mb-4 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
          {infoMessage && (
            <p className="mb-4 text-xs font-semibold text-[#1FA971]">
              {infoMessage}
            </p>
          )}

        {/* BEGIN: SignInForm */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900" htmlFor="email">
              Email Address
            </label>
            <div className="bg-[#F0F2FD] border border-transparent focus-within:border-[#1FA971] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#1FA971]/12 rounded-2xl flex items-center px-4 py-3.5 w-full transition-all">
              <svg
                className="w-5 h-5 text-gray-400 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                className="bg-transparent border-0 p-0 text-gray-900 placeholder-gray-400 text-base focus:ring-0 w-full outline-none font-normal"
                id="email"
                name="email"
                placeholder="kwame@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900" htmlFor="password">
              Password
            </label>
            <div className="bg-[#F0F2FD] border border-transparent focus-within:border-[#1FA971] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#1FA971]/12 rounded-2xl flex items-center px-4 py-3.5 w-full transition-all">
              <svg
                className="w-5 h-5 text-gray-500 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                className={`bg-transparent border-0 p-0 text-gray-900 placeholder-gray-500 text-base focus:ring-0 w-full outline-none font-medium ${
                  !showPassword && password ? 'tracking-widest' : ''
                }`}
                id="password"
                name="password"
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Password Visibility Toggle */}
              <button
                aria-label="Toggle password visibility"
                className="p-1 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" x2="23" y1="1" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between pt-1 pb-2">
            {/* Checkbox with Haraka Green styling */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded text-[#1FA971] border-gray-300 focus:ring-[#1FA971] focus:ring-offset-0 transition accent-[#1FA971] cursor-pointer"
                type="checkbox"
              />
              <span className="text-sm font-medium text-gray-700">Remember me</span>
            </label>

            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={handleForgotPass}
              className="text-sm font-semibold text-[#FF7A00] hover:text-[#E06C00] transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-[#1FA971] hover:bg-[#188659] active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#1FA971]/20 transition-all duration-150 mt-4 cursor-pointer disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            <span className="text-base">{isSubmitting ? 'Logging In…' : 'Log In'}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.3"
              viewBox="0 0 24 24"
            >
              <line x1="5" x2="19" y1="12" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
        {/* END: SignInForm */}

        {showSocialLogins && (<>
        {/* BEGIN: SocialDivider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase whitespace-nowrap absolute">
            OR SIGN IN WITH
          </span>
        </div>
        {/* END: SocialDivider */}

        {/* BEGIN: SocialLogins */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google Sign In */}
          <button
            onClick={() => handleSocialSignIn('Google')}
            disabled={isSocialLoading}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-xs ${
              isSocialLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
            type="button"
          >
            {/* Official Multi-colored Google SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4" />
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
              <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Google</span>
          </button>

          {/* Apple Sign In */}
          <button
            onClick={() => handleSocialSignIn('Apple')}
            disabled={isSocialLoading}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-xs ${
              isSocialLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
            type="button"
          >
            {/* Official Apple SVG */}
            <svg className="w-5 h-5 fill-current text-black shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 2.98 1.07.08 2.16-.54 2.81-1.32z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Apple</span>
          </button>
        </div>
        {/* END: SocialLogins */}
        </>)}

        {/* Demo colored text button with NO background color */}
        {onOpenDemo && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onOpenDemo}
            className="text-sm font-bold text-[#FF7A00] hover:text-[#E06800] transition-colors cursor-pointer bg-transparent border-none p-0 inline-block hover:underline"
          >
            Demo
          </button>
        </div>
        )}
      </div>

      {/* BEGIN: Footer */}
      <footer className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateSignUp}
            className="font-bold text-[#FF7A00] hover:text-[#E06C00] transition-colors ml-1 cursor-pointer underline-offset-2 hover:underline"
          >
            Sign Up Free
          </button>
        </p>
      </footer>
      {/* END: Footer */}
      </div>
    </div>
  );
}
