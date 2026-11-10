import React from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguageStore();

  return (
    <CustomerLayout>
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center mx-auto text-4xl mb-4 shadow-sm">
          🥥
        </div>
        <span className="font-mono text-xs font-black text-amber-700 uppercase tracking-widest">
          Error 404 • Page Not Found
        </span>
        <h1 className="text-2xl font-black text-brand-slate tracking-tight mt-2">
          {language === 'ta' ? 'பக்கம் காணப்படவில்லை' : 'Lost in the Harvest Groves?'}
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The link you followed may be outdated or the page has moved. Let's take you back to our authentic cold-pressed oils.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-brand-slate text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            Return to Homepage
          </Link>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            Explore Pure Oils (அங்காடி)
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
};
