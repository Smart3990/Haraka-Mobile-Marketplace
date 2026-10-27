import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { friendlyAuthError, sendPasswordReset } from '../lib/backend';
import { BRAND_LOGO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface ForgotPasswordScreenProps {
  initialEmail?: string;
  registeredEmails?: string[];
  onNavigateLogin: () => void;
  onNavigateSignUp?: () => void;
  onSuccess?: () => void;
}

const HARAKA_LOGO_URL = BRAND_LOGO;

const DEFAULT_KNOWN_EMAILS = [
  'user@gmail.com',
  'kwame.mensah@gmail.com',
  'kwame@example.com',
  'seller@haraka.gh',
  'artisan@haraka.gh',
  'admin@haraka.gh',
  'buyer@haraka.gh',
  'mensah.electronics@gmail.com',
];

type ResetViewStep = 'request' | 'link_sent' | 'reset_form' | 'completed';

export default function ForgotPasswordScreen({
  initialEmail = '',
  registeredEmails = DEFAULT_KNOWN_EMAILS,
  onNavigateLogin,
  onNavigateSignUp,
  onSuccess,
}: ForgotPasswordScreenProps) {
  // The system admin can replace the logo from the dashboard
  const brandLogo = useBranding().logoUrl || HARAKA_LOGO_URL;
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState<ResetViewStep>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate and submit email
  const handleSubmitEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    sendPasswordReset(cleanEmail)
      .then(() => {
        setStep('link_sent');
        setInfoMessage(`If an account exists for ${cleanEmail}, a password reset link is on its way.`);
      })
      .catch((err) => setError(friendlyAuthError(err)))
      .finally(() => setLoading(false));
  };

  // Open reset link directly in browser to let user set new password
  const handleOpenResetLink = () => {
    setStep('reset_form');
    setError('');
    setInfoMessage('');
  };

  // Resend reset link
  const handleResendLink = () => {
    setLoading(true);
    sendPasswordReset(email.trim().toLowerCase())
      .then(() => setInfoMessage(`A fresh reset link has been sent to ${email.trim()}`))
      .catch((err) => setError(friendlyAuthError(err)))
      .finally(() => setLoading(false));
  };

  // Save new password
  const handleSaveNewPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('completed');
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="w-full min-h-full flex-1 bg-white flex flex-col font-sans antialiased selection:bg-brand selection:text-white select-none text-gray-900">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-6 pt-4 pb-12">
        <div className="w-full">
          {/* BEGIN: TopBar with Centered Brand Logo (Back button removed per request) */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4 mb-6">
            <img
              src={brandLogo}
              alt="Haraka"
              className="h-12 w-auto object-contain mx-auto mb-2"
            />
          </div>
          {/* END: TopBar */}

          {/* STEP 1: Enter Email & Check Registration */}
          {step === 'request' && (
            <>
              {/* BEGIN: HeadlineSection */}
              <section className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 justify-center">
                  <span>Forgot Password?</span>
                  <span className="text-3xl">🔐</span>
                </h1>
                <p className="text-gray-600 text-sm mt-2.5 leading-relaxed font-normal">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </section>
              {/* END: HeadlineSection */}

              {/* Clean Error Message matching Sign In/Sign Up */}
              {error && (
                <div className="mb-4 text-center">
                  <p className="text-xs font-semibold text-red-600 mb-1">{error}</p>
                  {error.includes("isn't registered") && onNavigateSignUp && (
                    <button
                      type="button"
                      onClick={onNavigateSignUp}
                      className="text-xs font-bold text-accent hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Create a new Haraka account instead &rarr;</span>
                    </button>
                  )}
                </div>
              )}

              {/* Email Form */}
              <form className="space-y-4" onSubmit={handleSubmitEmail}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-900" htmlFor="recovery-email">
                    Email Address
                  </label>
                  <div className="bg-[#F0F2FD] border border-transparent focus-within:border-brand focus-within:bg-white focus-within:ring-3 focus-within:ring-brand/12 rounded-2xl flex items-center px-4 py-3.5 w-full transition-all">
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
                      id="recovery-email"
                      name="email"
                      placeholder="kwame@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all duration-150 mt-4 cursor-pointer disabled:opacity-75"
                  type="submit"
                  disabled={loading}
                >
                  <span className="text-base">{loading ? 'Sending…' : 'Send Reset Link'}</span>
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
            </>
          )}

          {/* STEP 2: Link Dispatched - Open Reset Link in Browser */}
          {step === 'link_sent' && (
            <div className="space-y-4 pt-2">
              <section className="mb-4 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 justify-center">
                  <span>Reset Link Sent</span>
                  <span className="text-3xl">✉️</span>
                </h1>
                <p className="text-gray-600 text-sm mt-2.5 leading-relaxed font-normal">
                  Open the link we sent to <strong className="text-gray-900">{email}</strong> to choose a new password, then log in. Check your spam folder if you don't see it.
                </p>
              </section>

              {infoMessage && (
                <p className="text-xs font-semibold text-brand text-center mb-2">
                  {infoMessage}
                </p>
              )}

              {/* Action Button: Opens the reset password link directly in browser */}
              <button
                className="w-full bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all duration-150 mt-2 cursor-pointer"
                type="button"
                onClick={onNavigateLogin}
              >
                <span className="text-base">Back to Log In</span>
              </button>

              <div className="flex flex-col items-center gap-2 pt-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendLink}
                  className="text-xs font-semibold text-gray-600 hover:text-brand transition-colors cursor-pointer underline-offset-2 hover:underline"
                >
                  {loading ? 'Sending fresh link...' : "Didn't receive the email? Resend link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setError('');
                  }}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Browser Reset Form (No OTP - direct new password creation) */}
          {step === 'reset_form' && (
            <div>
              <section className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 justify-center">
                  <span>New Password</span>
                  <span className="text-3xl">🔑</span>
                </h1>
                <p className="text-gray-600 text-sm mt-2.5 leading-relaxed font-normal">
                  Create a new secure password for <strong className="text-gray-900">{email}</strong>.
                </p>
              </section>

              {error && (
                <p className="mb-4 text-xs font-semibold text-red-600 text-center">
                  {error}
                </p>
              )}

              <form className="space-y-4" onSubmit={handleSaveNewPassword}>
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-900" htmlFor="new-password">
                    New Password
                  </label>
                  <div className="bg-[#F0F2FD] border border-transparent focus-within:border-brand focus-within:bg-white focus-within:ring-3 focus-within:ring-brand/12 rounded-2xl flex items-center px-4 py-3.5 w-full transition-all">
                    <Lock className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
                    <input
                      className="bg-transparent border-0 p-0 text-gray-900 placeholder-gray-400 text-base focus:ring-0 w-full outline-none font-normal"
                      id="new-password"
                      name="new-password"
                      placeholder="At least 8 characters"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-900" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <div className="bg-[#F0F2FD] border border-transparent focus-within:border-brand focus-within:bg-white focus-within:ring-3 focus-within:ring-brand/12 rounded-2xl flex items-center px-4 py-3.5 w-full transition-all">
                    <Lock className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
                    <input
                      className="bg-transparent border-0 p-0 text-gray-900 placeholder-gray-400 text-base focus:ring-0 w-full outline-none font-normal"
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="Repeat your new password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  className="w-full bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all duration-150 mt-4 cursor-pointer disabled:opacity-75"
                  type="submit"
                  disabled={loading}
                >
                  <span className="text-base">{loading ? 'Updating Password...' : 'Save New Password'}</span>
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
            </div>
          )}

          {/* STEP 4: Password Successfully Reset */}
          {step === 'completed' && (
            <div className="space-y-4 pt-2">
              <section className="mb-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand/10 flex items-center justify-center text-brand mb-3">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Password Updated!
                </h1>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed font-normal">
                  Your password has been securely reset. You can now log in to Haraka with your new credentials.
                </p>
              </section>

              <button
                className="w-full bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all duration-150 mt-4 cursor-pointer"
                type="button"
                onClick={onNavigateLogin}
              >
                <span className="text-base">Log In Now</span>
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
            </div>
          )}
        </div>

        {/* BEGIN: Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Remember your password?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-accent hover:text-[#E06C00] transition-colors ml-1 cursor-pointer underline-offset-2 hover:underline"
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
