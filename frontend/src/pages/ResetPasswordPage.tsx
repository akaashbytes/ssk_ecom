import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToastStore } from '../stores/useToastStore';

export const ResetPasswordPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast({ type: 'error', title: 'Mismatch', message: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been reset successfully. Please sign in.',
      });
      navigate('/login');
    }, 400);
  };

  return (
    <AuthLayout
      title={language === 'ta' ? 'புதிய கடவுச்சொல்' : 'Set New Password'}
      subtitle="Create a secure password for your account"
      tamilSubtitle="புதிய கடவுச்சொல்லை உள்ளிடவும்"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">New Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type password"
            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-slate text-white font-bold text-sm shadow-md hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password & Sign In'}
        </button>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="font-bold text-slate-600 hover:text-slate-900">
            Cancel
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
