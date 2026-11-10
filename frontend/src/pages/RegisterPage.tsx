import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { useToastStore } from '../stores/useToastStore';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      addToast({
        type: 'error',
        title: 'Terms Required',
        message: 'Please agree to terms and privacy policy.',
      });
      return;
    }

    setLoading(true);
    try {
      const user = await authService.registerUser(formData);
      setCurrentUser(user);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: `Welcome to SSK Natural Gold, ${user.name}!`,
      });
      navigate('/account');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Could not create account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={language === 'ta' ? 'புதிய கணக்கு துவங்க' : 'Create Customer Account'}
      subtitle="Join SSK Natural Gold for genuine Tenkasi wood-pressed oils"
      tamilSubtitle="இயற்கை எண்ணெய் வாடிக்கையாளராக இணையுங்கள்"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Full Name / முழு பெயர் *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Muthuraj K."
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Mobile Number / மொபைல் எண் *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="98401 23456"
              className="w-full bg-slate-50 pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Email Address / மின்னஞ்சல்</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Password / கடவுச்சொல் *</label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
          />
        </div>

        <label className="flex items-start gap-2 text-slate-600 text-[11px] cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded text-brand-amber focus:ring-brand-amber"
          />
          <span>
            I agree to SSK Natural Gold's{' '}
            <Link to="/policies?tab=terms" className="text-amber-700 underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/policies?tab=privacy" className="text-amber-700 underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-slate text-white font-bold text-sm shadow-md hover:bg-slate-800 active:scale-98 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Agree & Create Account'}
        </button>

        <div className="pt-4 border-t border-slate-100 text-center text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-700 hover:underline">
            Sign In (உள்நுழைக)
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
