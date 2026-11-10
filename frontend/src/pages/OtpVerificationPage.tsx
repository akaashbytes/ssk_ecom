import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { useToastStore } from '../stores/useToastStore';
import { authService } from '../services/authService';

export const OtpVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '9840123456';
  const redirect = searchParams.get('redirect') || '/account';

  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const addToast = useToastStore((state) => state.addToast);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(29);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setErrorMsg('');

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.loginWithOtp(phone, code);
      setCurrentUser(user);
      addToast({
        type: 'success',
        title: 'Phone Verified',
        message: 'Mobile number confirmed successfully.',
      });
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    inputRefs.current[0]?.focus();
    addToast({
      type: 'info',
      title: 'New OTP Sent',
      message: `A fresh 6-digit code has been dispatched to +91 ${phone}`,
    });
  };

  const handleAutoFillDemo = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <AuthLayout
      title={language === 'ta' ? 'மொபைல் எண் சரிபார்ப்பு' : 'Verify Mobile Number'}
      subtitle={`Enter the 6-digit verification code sent to +91 ${phone}`}
      tamilSubtitle="அனுப்பப்பட்ட 6-இலக்க குறியீட்டை உள்ளிடவும்"
    >
      <form onSubmit={handleVerify} className="space-y-6 text-xs text-center">
        {/* Phone Edit Link */}
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <span className="font-mono font-bold text-slate-800">+91 {phone}</span>
          <Link to="/login" className="text-amber-700 font-bold hover:underline">
            Edit (எண் மாற்ற)
          </Link>
        </div>

        {/* 6 Digit Input Group */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black font-mono bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-slate focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all shadow-2xs"
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-rose-600 font-semibold text-xs animate-shake">{errorMsg}</p>
        )}

        {/* Countdown & Resend */}
        <div className="text-slate-500">
          {timer > 0 ? (
            <p>
              Resend code in{' '}
              <span className="font-mono font-bold text-slate-800">0:{timer < 10 ? `0${timer}` : timer}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-amber-700 font-bold hover:underline cursor-pointer"
            >
              Didn't receive code? Resend OTP
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-slate text-white font-bold text-sm shadow-md hover:bg-slate-800 active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Continue (சரிபார்)'}
          </button>

          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Auto-fill Demo Code (123456)
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
