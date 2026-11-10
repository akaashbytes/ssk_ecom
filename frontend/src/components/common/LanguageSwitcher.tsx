import React from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';

export interface LanguageSwitcherProps {
  variant?: 'pill' | 'segmented';
  size?: 'sm' | 'md';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'segmented',
  size = 'md',
  className = '',
}) => {
  const { language, setLanguage } = useLanguageStore();

  const sizeStyles = {
    sm: 'text-[11px] p-0.5',
    md: 'text-xs p-1',
  };

  const btnPadding = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
        className={`inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white text-slate-700 font-bold hover:border-brand-amber transition-colors ${btnPadding[size]} text-xs shadow-subtle ${className}`}
        aria-label="Toggle language between English and Tamil"
      >
        <span className="text-[10px] text-slate-400">🌐</span>
        <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center rounded-lg border border-surface-border bg-slate-100 ${sizeStyles[size]} ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded font-bold transition-all duration-150 ${btnPadding[size]} ${
          language === 'en'
            ? 'bg-white text-brand-slate shadow-xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ta')}
        aria-pressed={language === 'ta'}
        className={`rounded font-bold font-tamil transition-all duration-150 ${btnPadding[size]} ${
          language === 'ta'
            ? 'bg-white text-brand-slate shadow-xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
};
