import React from 'react';
import { Link } from 'react-router-dom';
import { logoImg } from '../../assets';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useLanguageStore } from '../../stores/useLanguageStore';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  tamilSubtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  tamilSubtitle,
}) => {
  const { language } = useLanguageStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 antialiased">
      {/* Header */}
      <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logoImg} alt="SSK Natural Gold" className="w-9 h-9 object-contain" />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-brand-slate tracking-tight">SSK NATURAL GOLD</span>
            <span className="text-[10px] text-amber-700 font-semibold font-tamil">தென்காசி மரச்செக்கு</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher size="sm" />
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            {language === 'ta' ? 'முகப்புக்கு திரும்பு' : 'Back to Store'}
          </Link>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6 sm:my-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-surface-border p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">{title}</h1>
            {(subtitle || tamilSubtitle) && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === 'ta' && tamilSubtitle ? tamilSubtitle : subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        © 2026 SSK Natural Gold • Sivasakthi Enterprises • Tenkasi
      </footer>
    </div>
  );
};
