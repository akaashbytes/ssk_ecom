import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { useToastStore } from '../stores/useToastStore';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const addToast = useToastStore((state) => state.addToast);

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp');
  const [identifier, setIdentifier] = useState('9840123456');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginMethod === 'otp') {
      // Navigate to OTP verification page
      navigate(`/verify-otp?phone=${encodeURIComponent(identifier)}&redirect=${encodeURIComponent(from)}`);
      setLoading(false);
      return;
    }

    try {
      const user = await authService.loginWithPassword(identifier, password);
      setCurrentUser(user);
      addToast({
        type: 'success',
        title: language === 'ta' ? 'வெற்றிகரமாக உள்நுழைந்தது' : 'Signed In Successfully',
        message: `Welcome back, ${user.name}!`,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Login Error',
        message: err.message || 'Invalid credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      addToast({
        type: 'success',
        title: 'Demo Customer Logged In',
        message: 'Logged in as Muthuraj K.',
      });
      navigate(from);
    }
  };

  return (
    <AuthLayout
      title={language === 'ta' ? 'நல்வரவு' : 'Welcome Back'}
      subtitle="Sign in to your SSK Natural Gold account"
      tamilSubtitle="உங்கள் கணக்கில் உள்நுழைக"
    >
      {/* Login Mode Toggle (OTP vs Password) */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setLoginMethod('otp')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            loginMethod === 'otp'
              ? 'bg-white text-brand-slate shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Instant Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('password')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            loginMethod === 'password'
              ? 'bg-white text-brand-slate shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Password
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            {loginMethod === 'otp' ? 'Mobile Number / மொபைல் எண்' : 'Email or Mobile Number'}
          </label>
          <div className="relative">
            {loginMethod === 'otp' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                +91
              </span>
            )}
            <input
              type={loginMethod === 'otp' ? 'tel' : 'text'}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={loginMethod === 'otp' ? '98401 23456' : 'muthuraj.k@gmail.com'}
              className={`w-full bg-slate-50 py-2.5 pr-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium ${
                loginMethod === 'otp' ? 'pl-12' : 'pl-3'
              }`}
            />
          </div>
        </div>

        {loginMethod === 'password' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Password / கடவுச்சொல்</label>
              <Link to="/forgot-password" className="text-amber-700 hover:underline font-semibold">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-brand-amber focus:ring-brand-amber"
            />
            <span>Remember Me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-slate text-white font-bold text-sm shadow-md hover:bg-slate-800 active:scale-98 transition cursor-pointer disabled:opacity-50"
        >
          {loading
            ? 'Processing...'
            : loginMethod === 'otp'
            ? 'Send OTP Code (சரிபார்ப்பு குறியீடு)'
            : 'Sign In (உள்நுழைக)'}
        </button>

        {/* Quick Demo Bypass Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleQuickDemoCustomer}
            className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition border border-amber-200 cursor-pointer"
          >
            ⚡ One-Click Demo Sign-In (Muthuraj K.)
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:underline">
            Create Account (பதிவு செய்க)
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
