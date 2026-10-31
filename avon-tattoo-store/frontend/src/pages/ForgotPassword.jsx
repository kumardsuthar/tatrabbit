import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { authService } from '../services/authService';
import { SEO } from '../components/common/SEO';

export const ForgotPassword = () => {
  const navigate = useNavigate();

  // Multi-step flow state: 'email' -> 'otp' -> 'reset' -> 'completed'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  
  // 4-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputRefs = useRef([]);

  // Resend OTP cooldown timer
  const [resendTimer, setResendTimer] = useState(0);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reset Token from OTP verification
  const [resetToken, setResetToken] = useState('');

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Focus management when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Web Audio chime on success modal display
  useEffect(() => {
    if (!showSuccessModal) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Tone 1: C5 (523.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Tone 2: E5 (659.25 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1);
        gain2.gain.setValueAtTime(0.15, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);

        // Tone 3: C6 (1046.50 Hz) - Delightful high chime
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1046.5, now + 0.22);
        gain3.gain.setValueAtTime(0.18, now + 0.22);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.22);
        osc3.stop(now + 0.85);
      }
    } catch {
      // Audio playback fails silently if browser blocks autoplay
    }

    // Auto-proceed after 2 seconds if user does not click
    const timer = setTimeout(() => {
      handleProceedToSetPassword();
    }, 2200);

    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  // STEP 1: Handle Email Submission (Request OTP)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your registered account email.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.forgotPassword(cleanEmail);
      setStep('otp');
      setResendTimer(60);
      setOtp(['', '', '', '']);
      setInfoMessage('A 4-digit verification code has been dispatched to your email.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to dispatch verification code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await authService.forgotPassword(email.trim());
      setResendTimer(60);
      setOtp(['', '', '', '']);
      setInfoMessage('A fresh verification code has been sent to your email.');
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not resend code. Please wait a moment.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Handle 4-Digit OTP Input
  const handleOtpChange = (index, value) => {
    setError('');
    // Accept only numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // If pasted or multiple characters
    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 4).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((d, i) => {
        if (i < 4) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(pastedDigits.length, 3);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    // Single character entered
    const newOtp = [...otp];
    newOtp[index] = cleaned[0];
    setOtp(newOtp);

    // Auto-advance to next input
    if (index < 3 && cleaned[0]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasteData) return;

    const digits = pasteData.slice(0, 4).split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      if (i < 4) newOtp[i] = d;
    });
    setOtp(newOtp);
    const targetIdx = Math.min(digits.length, 3);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // STEP 2 Submit: Verify 4-digit OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the complete 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim(), fullOtp);
      if (res?.reset_token) {
        setResetToken(res.reset_token);
        // Trigger Success Popup with Animation!
        setShowSuccessModal(true);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid verification code. Please check and try again.';
      setError(msg);
      // Clear inputs for re-entry
      setOtp(['', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 Transition: Proceed from Success Popup to Set Password
  const handleProceedToSetPassword = () => {
    setShowSuccessModal(false);
    setStep('reset');
  };

  // STEP 4: Set New Password Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), resetToken, newPassword, confirmPassword);
      setStep('completed');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-blue-500' };
    return { score: 4, text: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-md mx-auto py-10 px-4 sm:px-0 space-y-6 font-sans">
      <SEO 
        title="Reset Password | TatRabbit Studio Store" 
        description="Securely reset your TatRabbit account password via 4-digit verification code" 
      />

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-1 shadow-xs">
          {step === 'reset' ? (
            <Lock className="w-6 h-6" />
          ) : step === 'otp' ? (
            <KeyRound className="w-6 h-6" />
          ) : step === 'completed' ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          ) : (
            <Mail className="w-6 h-6" />
          )}
        </div>
        <h1 className="font-heading font-semibold text-2xl text-slate-900">
          {step === 'email' && 'Reset Account Password'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === 'reset' && 'Create New Password'}
          {step === 'completed' && 'Password Updated!'}
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
          {step === 'email' && 'Enter your registered email address to receive a secure 4-digit OTP code.'}
          {step === 'otp' && (
            <span>
              We sent a 4-digit verification code to{' '}
              <strong className="text-slate-800 font-semibold">{email}</strong>
            </span>
          )}
          {step === 'reset' && 'Choose a strong new password with at least 6 characters for your account.'}
          {step === 'completed' && 'Your account security credentials have been updated successfully.'}
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold shadow-xs animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      {/* Info Notice */}
      {infoMessage && !error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3.5 rounded-2xl text-xs font-medium shadow-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* ================= STEP 1: ENTER EMAIL ================= */}
      {step === 'email' && (
        <form 
          onSubmit={handleRequestOtp} 
          className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 space-y-5 shadow-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Registered Studio Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@studio.com"
                className="w-full bg-slate-50 border border-slate-200 pl-4 pr-10 py-3 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              A 4-digit numeric verification code will be dispatched to this email address.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Verification Code...</span>
              </>
            ) : (
              <>
                <span>Send 4-Digit OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-1 border-t border-slate-100">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* ================= STEP 2: 4-DIGIT OTP VERIFICATION ================= */}
      {step === 'otp' && (
        <form 
          onSubmit={handleVerifyOtp} 
          className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Header & Change Email */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
            <span className="text-slate-500">Target Email: <strong className="text-slate-700">{email}</strong></span>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
                setInfoMessage('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Change
            </button>
          </div>

          {/* 4-Digit Input Boxes */}
          <div className="space-y-2">
            <label className="block text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Enter 4-Digit Code
            </label>
            <div 
              className="flex justify-center items-center gap-3 sm:gap-4 py-2" 
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold font-mono rounded-2xl border-2 transition-all outline-none ${
                    otp[index] 
                      ? 'border-blue-600 bg-blue-50/30 text-blue-900 shadow-sm shadow-blue-500/10' 
                      : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Valid for 10 minutes • Maximum 5 attempts allowed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code</span>
                </>
              )}
            </button>

            {/* Resend OTP Bar */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div>
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend code in <strong className="text-slate-600 font-mono">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ================= STEP 4: SET NEW PASSWORD ================= */}
      {step === 'reset' && (
        <form 
          onSubmit={handleResetPassword} 
          className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 space-y-5 shadow-sm"
        >
          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 pl-4 pr-11 py-3 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className="font-semibold text-slate-700">{passwordStrength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={`w-full bg-slate-50 border pl-4 pr-11 py-3 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== newPassword 
                    ? 'border-rose-300 focus:ring-rose-400' 
                    : confirmPassword && confirmPassword === newPassword 
                    ? 'border-emerald-300 focus:ring-emerald-400' 
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Realtime Match Feedback */}
            {confirmPassword.length > 0 && (
              <div className="mt-1.5 text-[11px] font-medium flex items-center gap-1.5">
                {confirmPassword === newPassword ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match perfectly
                  </span>
                ) : (
                  <span className="text-rose-500">
                    Passwords do not match yet
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Submit & Update Password</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ================= STEP 5: SUCCESS COMPLETED ================= */}
      {step === 'completed' && (
        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-8 text-center space-y-6 shadow-sm animate-gpay-bounce">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            {/* Ambient Ripple Rings with pointer-events-none */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-gpay-ripple-1 pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-gpay-ripple-2 pointer-events-none" />
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-gpay-check-pop" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-xl text-slate-900">
              Password Reset Successfully!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Your account password has been updated. You can now securely log in to your TatRabbit customer account.
            </p>
          </div>

          <Link
            to="/login"
            className="relative z-30 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer no-underline"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ================= STEP 3 MODAL: SUCCESS POPUP WITH ANIMATION ================= */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop with smooth blur */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={handleProceedToSetPassword}
          />

          {/* Animated Modal Dialog */}
          <div 
            className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 text-center space-y-6 relative z-[100000] animate-gpay-bounce overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-emerald-400/25 to-transparent rounded-full blur-xl pointer-events-none" />

            {/* Animated Icon with ripples */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center pt-2">
              <div className="absolute inset-0 rounded-full bg-emerald-500/25 animate-gpay-ripple-1 pointer-events-none" />
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-gpay-ripple-2 pointer-events-none" />
              <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-gpay-ripple-3 pointer-events-none" />
              
              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
                <svg 
                  className="w-10 h-10 animate-gpay-check-pop" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" className="animate-gpay-stroke" />
                </svg>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Confirmed</span>
              </div>
              <h2 className="font-heading font-semibold text-2xl text-slate-900 tracking-tight">
                OTP Verified!
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Your 4-digit code has been verified. Now set your new account password to regain full access.
              </p>
            </div>

            {/* Action button */}
            <div className="space-y-2 relative z-10 pt-1">
              <button
                type="button"
                onClick={handleProceedToSetPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue to Set Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400">
                Auto-advancing in a moment...
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
