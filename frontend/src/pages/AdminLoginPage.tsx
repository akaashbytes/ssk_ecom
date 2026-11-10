import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoImg } from '../assets';
import { useAppStore } from '../stores/useAppStore';
import { useToastStore } from '../stores/useToastStore';
import { MOCK_ADMIN } from '../mock';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state: any) => state.setCurrentUser);
  const addToast = useToastStore((state: any) => state.addToast);

  const [email, setEmail] = useState('admin@ssknaturalgold.com');
  const [password, setPassword] = useState('tenkasi2026');
  const [twoFactorCode, setTwoFactorCode] = useState('849201');
  const [loading, setLoading] = useState(false);
  const [simulatedState, setSimulatedState] = useState<'default' | 'error' | 'loading' | 'success'>('default');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (simulatedState === 'error') {
      addToast({ type: 'error', title: 'Access Denied', message: 'Simulated 2FA Authentication Failed.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentUser(MOCK_ADMIN);
      addToast({
        type: 'success',
        title: 'Admin Session Authenticated',
        message: 'Welcome to Tenkasi Mill Operations Console.',
      });
      navigate('/admin/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-brand-slate flex flex-col justify-between text-white antialiased">
      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="SSK Natural Gold" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-sm tracking-tight text-white">
            SSK NATURAL GOLD • SECURE DESK
          </span>
        </div>
        <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white transition">
          ← Public Storefront
        </Link>
      </header>

      {/* Main Console Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-black uppercase tracking-wider">
              DEVELOPMENT DEMO ONLY — MOCK AUTHENTICATION
            </span>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl text-brand-amber">
              🏛️
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400">
              Tenkasi Extraction Facility • Prototype Operations Console
            </p>
          </div>

          {/* Development Security Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed space-y-1">
            <p className="font-bold">⚠️ Non-Production Safety Notice:</p>
            <p className="text-amber-200/90 text-[10px]">
              This screen provides client-side simulated authentication only. 2FA simulation is for UI workflow evaluation and provides no production security. Do not reuse these demo credentials in production environments.
            </p>
          </div>

          {/* Dev State Switcher (Stitch Screen 84e1b83c... Feature) */}
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] space-y-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider block">
              Stitch State Preview:
            </span>
            <div className="grid grid-cols-4 gap-1 font-semibold text-center">
              {(['default', 'error', 'loading', 'success'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSimulatedState(st)}
                  className={`py-1 rounded capitalize transition cursor-pointer ${
                    simulatedState === st
                      ? 'bg-brand-amber text-white font-bold'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Admin Email / Employee ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-amber"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Master Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-brand-amber"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                2FA Hardware Authenticator Key
              </label>
              <input
                type="text"
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-amber text-center tracking-widest"
              />
            </div>

            {simulatedState === 'error' && (
              <p className="text-rose-400 font-semibold text-xs text-center">
                Invalid Master Passkey or Hardware Token.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || simulatedState === 'loading'}
              className="w-full py-3.5 rounded-xl bg-brand-amber hover:bg-amber-600 active:scale-98 text-white font-black text-sm shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading || simulatedState === 'loading'
                ? 'Authenticating Mill Token...'
                : 'Access Console (உள்நுழைக)'}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            Internal Operations Portal • IP Logged for Tenkasi Facility Security
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-800">
        © 2026 SSK Natural Gold (Sivasakthi Enterprises). Central FSSAI Lic. 22426293000431 [Demo Placeholder].
      </footer>
    </div>
  );
};
