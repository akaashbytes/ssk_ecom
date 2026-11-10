import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToastStore } from '../stores/useToastStore';

export const ForgotPasswordPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Reset Code Sent',
        message: 'A password reset instruction has been sent to your phone/email.',
      });
      navigate(`/reset-password?user=${encodeURIComponent(phoneOrEmail)}`);
    }, 400);
  };

  return (
    <AuthLayout
      title={language === 'ta' ? 'கடவுச்சொல் மீட்பு' : 'Forgot Password?'}
      subtitle="Enter your registered mobile number to receive a reset code"
      tamilSubtitle="பதிவுசெய்த மொபைல் எண்ணை உள்ளிடவும்"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Registered Mobile Number or Email
          </label>
          <input
            type="text"
            required
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            placeholder="e.g. 98401 23456"
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-slate text-white font-bold text-sm shadow-md hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Sending Code...' : 'Send Password Reset Code'}
        </button>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="font-bold text-slate-600 hover:text-slate-900">
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
