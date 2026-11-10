import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, TruckIcon } from '../common/Icons';
import { logoImg } from '../../assets';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const CustomerFooter: React.FC = () => {
  const { language } = useLanguageStore();

  return (
    <footer className="bg-white border-t border-surface-border text-slate-600 text-xs mt-16 w-full pb-16 md:pb-0">
      {/* Trust Badges Strip */}
      <div className="border-b border-surface-border bg-surface-subtle py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-page mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {language === 'ta' ? '100% மரச்செக்கு தயாரிப்பு' : '100% Marachekku Wood Pressed'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ta' ? 'கலப்படமற்றது, ரசாயனம் அற்றது' : 'Unrefined, Zero Chemicals or Additives'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center shrink-0 mt-0.5">
              <TruckIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {language === 'ta' ? 'நேரடி ஆலை டெலிவரி' : 'Direct Mill Dispatch'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ta' ? 'தென்காசியில் இருந்து உங்கள் வீட்டு வாசலுக்கு' : 'Tenkasi, Tamil Nadu to Your Doorstep'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-brand-slate flex items-center justify-center shrink-0 mt-0.5 text-base">
              🏛️
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {language === 'ta' ? 'FSSAI சான்றிதழ் பெற்றது' : 'FSSAI Certified Unit'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Lic. No. 22426293000431</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center shrink-0 mt-0.5 text-base">
              📦
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {language === 'ta' ? 'பாதுகாப்பான பேக்கேஜிங்' : 'Safe Food-Grade Packaging'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ta' ? 'கசிவு இல்லாத பாதுகாப்பான பார்சல்' : 'Leakproof, heavy corrugated shipment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-page mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="sm:col-span-2 lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface p-1 border border-brand-amber/40 flex items-center justify-center shrink-0 shadow-xs">
              <img src={logoImg} alt="SSK Natural Gold" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-brand-slate text-base tracking-tight block">
                SSK NATURAL GOLD
              </span>
              <span className="text-[11px] font-semibold text-amber-700 font-tamil block">
                {language === 'ta' ? 'சிவசக்தி என்டர்பிரைசஸ் • தென்காசி' : 'Sivasakthi Enterprises • Tenkasi'}
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
            {language === 'ta'
              ? 'தென்காசி பாரம்பரிய மரச்செக்கு முறைப்படி தயாரிக்கப்படும் தூய கடலை, நல்லெண்ணெய், மற்றும் தேங்காய் எண்ணெய்கள். இயற்கை சத்துக்கள் நிறைந்தவை.'
              : 'Rooted in Tenkasi traditional milling, SSK Natural Gold provides cold-pressed sesame, groundnut, and coconut oils retaining authentic aroma, vital nutrition, and zero refining.'}
          </p>
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p>
              <strong className="text-slate-700">Manufacturer:</strong> Sivasakthi Enterprises, Mettupatti Main Road, Ramanathapuram, Tenkasi District, Tamil Nadu — 627760
            </p>
            <p>
              <strong className="text-slate-700">Direct Mill Care:</strong> +91 9994072837 | support@ssknaturalgold.com
            </p>
          </div>
        </div>

        {/* Column 1: Pure Oils */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            {language === 'ta' ? 'எங்கள் தயாரிப்புகள்' : 'Pure Cold-Pressed'}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/shop?category=groundnut" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'கடலை எண்ணெய் (500ml / 1L / 5L)' : 'Groundnut Oil (500ml / 1L / 5L)'}
              </Link>
            </li>
            <li>
              <Link to="/shop?category=sesame" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'நல்லெண்ணெய் (கருப்பட்டி சேர்த்தது)' : 'Sesame Oil (Palm Jaggery Blend)'}
              </Link>
            </li>
            <li>
              <Link to="/shop?category=coconut" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'தேங்காய் எண்ணெய் (சல்பர் இல்லாதது)' : 'Coconut Oil (Sulphur-Free)'}
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-brand-amber transition font-semibold text-brand-amber">
                {language === 'ta' ? 'அனைத்தும் காண்க →' : 'View Complete Catalog →'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Mill & Enterprise */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            {language === 'ta' ? 'ஆலை & வணிகம்' : 'Our Mill & B2B'}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'பாரம்பரிய மரச்செக்கு வரலாறு' : 'Heritage & Extraction Process'}
              </Link>
            </li>
            <li>
              <Link to="/wholesale" className="hover:text-brand-amber transition font-medium text-amber-700">
                {language === 'ta' ? 'மொத்த விற்பனை (15L டின் / B2B)' : 'Wholesale Supply (15L Tins)'}
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'FAQ Hub'}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'ஆலை தொடர்பு' : 'Contact Mill Office'}
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="text-slate-400 hover:text-slate-700 transition">
                Admin Console
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Trust & Policies */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            {language === 'ta' ? 'விதிகள் & உறுதிப்பாடு' : 'Customer Care'}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/policies?tab=shipping" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'டெலிவரி & பார்சல் கொள்கை' : 'Shipping & Packaging Policy'}
              </Link>
            </li>
            <li>
              <Link to="/policies?tab=returns" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'திருப்பி அனுப்புதல் விதிமுறைகள்' : 'Damaged Bottle Replacement'}
              </Link>
            </li>
            <li>
              <Link to="/policies?tab=privacy" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'தனியுரிமை கொள்கை' : 'Privacy & Consumer Rights'}
              </Link>
            </li>
            <li>
              <Link to="/policies?tab=terms" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'சேவை விதிமுறைகள்' : 'Terms & Conditions'}
              </Link>
            </li>
            <li>
              <Link to="/account/orders" className="hover:text-brand-amber transition">
                {language === 'ta' ? 'ஆர்டர் நிலை அறிதல்' : 'Track Active Order'}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Copyright */}
      <div className="border-t border-surface-border bg-slate-50 py-4 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-500">
        <div className="max-w-page mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 SSK Natural Gold (Sivasakthi Enterprises). All rights reserved.</p>
          <p className="flex items-center gap-2 text-slate-400">
            <span>Tenkasi, Tamil Nadu</span>
            <span>•</span>
            <span className="font-mono">FSSAI: 22426293000431 <span className="text-amber-700 font-bold text-[9px]">[Demo]</span></span>
          </p>
        </div>
      </div>
    </footer>
  );
};
