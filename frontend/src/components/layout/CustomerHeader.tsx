import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ShoppingBagIcon, SearchIcon, MenuIcon, XIcon, TruckIcon } from '../common/Icons';
import { logoImg } from '../../assets';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useCartStore } from '../../stores/useCartStore';

export interface CustomerHeaderProps {
  isSticky?: boolean;
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  isSticky = true,
  cartItemCount: propCartCount,
  onCartClick,
  onSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguageStore();
  const storeCartCount = useCartStore((state) => state.getItemCount());
  const cartItemCount = propCartCount !== undefined ? propCartCount : storeCartCount;
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
      setSearchOpen(false);
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop All', tamil: 'அனைத்து எண்ணெய்கள்', to: '/shop' },
    { label: 'Groundnut Oil', tamil: 'கடலை எண்ணெய்', to: '/shop?category=groundnut' },
    { label: 'Sesame Oil', tamil: 'நல்லெண்ணெய்', to: '/shop?category=sesame' },
    { label: 'Coconut Oil', tamil: 'தேங்காய் எண்ணெய்', to: '/shop?category=coconut' },
    { label: 'Wholesale B2B', tamil: 'மொத்த விற்பனை', to: '/wholesale' },
    { label: 'Our Mill', tamil: 'ஆலை பற்றி', to: '/about' },
    { label: 'FAQ', tamil: 'கேள்வி பதில்', to: '/faq' },
  ];

  return (
    <header
      className={`w-full bg-white border-b border-surface-border shadow-subtle ${
        isSticky ? 'sticky top-0 z-40' : 'relative z-10'
      }`}
    >
      {/* Top Utility Banner (Desktop only) */}
      <div className="hidden md:block bg-brand-slate text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-page mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-[11px] truncate">
            <span>
              {language === 'ta'
                ? '🌿 100% பாரம்பரிய மரச்செக்கு எண்ணெய் • நேரடி தென்காசி ஆலை தயாரிப்பு'
                : '🌿 100% Traditional Marachekku Cold Pressed • Direct Tenkasi Mill'}
            </span>
            <span className="text-amber-400 font-medium">
              {language === 'ta'
                ? '⚡ ₹500க்கு மேல் தமிழ்நாடு முழுவதும் இலவச டெலிவரி'
                : '⚡ Free Shipping across Tamil Nadu on orders above ₹500'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <Link to="/wholesale" className="hover:text-white transition">
              {language === 'ta' ? 'மொத்த விற்பனை / B2B' : 'Wholesale / B2B Inquiry'}
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">FSSAI: 22426293000431 <span className="text-amber-400 font-mono text-[9px]">[Demo]</span></span>
            <span className="text-slate-600">|</span>
            <Link to="/admin/login" className="text-slate-400 hover:text-amber-400 transition">
              Admin Portal
            </Link>
            <span className="text-slate-600">|</span>
            <LanguageSwitcher size="sm" />
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-page mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface p-1 border border-brand-amber/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <img
                  src={logoImg}
                  alt="SSK Natural Gold Master Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-brand-slate leading-tight truncate">
                  SSK NATURAL GOLD
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-amber-700 tracking-wider font-tamil uppercase truncate">
                  {language === 'ta' ? 'மரச்செக்கு எண்ணெய் நிறுவனம்' : 'Pure Wood Pressed Oils • Tenkasi'}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="hover:text-brand-amber transition-colors flex flex-col items-center py-1 group"
              >
                <span>{link.label}</span>
                <span className="text-[10px] font-normal text-slate-400 font-tamil group-hover:text-amber-600">
                  {link.tamil}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              aria-label="Search products"
            >
              <SearchIcon size={20} />
            </button>

            {/* Mobile Language Switcher */}
            <div className="md:hidden">
              <LanguageSwitcher size="sm" />
            </div>

            {/* Track Order Icon */}
            <Link
              to="/track"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Track Order Status"
              title={language === 'ta' ? 'ஆர்டர் கண்காணிப்பு' : 'Track Order Status'}
            >
              <TruckIcon size={20} />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              onClick={onCartClick ? (e) => { e.preventDefault(); onCartClick(); } : undefined}
              className="relative p-2 text-slate-700 hover:text-brand-amber hover:bg-amber-50/60 rounded-lg transition flex items-center gap-1.5 font-bold text-xs"
              aria-label={`Shopping Cart with ${cartItemCount} items`}
            >
              <ShoppingBagIcon size={22} />
              {cartItemCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-brand-amber text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs tnum">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="py-3 border-t border-slate-100 flex items-center gap-2 animate-fadeIn"
          >
            <div className="relative flex-1">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'எண்ணெய் பெயர் மூலம் தேடுக (எ.கா. கடலை, நல்லெண்ணெய்)...'
                    : 'Search pure oils (e.g. Groundnut, Sesame, Coconut)...'
                }
                autoFocus
                className="w-full bg-slate-50 pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-slate text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
            >
              {language === 'ta' ? 'தேடுக' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <XIcon size={18} />
            </button>
          </form>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="SSK Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-brand-slate text-sm">SSK Natural Gold</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-200"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-brand-amber transition"
              >
                <span>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-brand-amber transition"
              >
                <span>{language === 'ta' ? 'அனைத்து தயாரிப்புகள்' : 'Shop All Products'}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                  3 Pure Oils
                </span>
              </Link>
              <Link
                to="/shop?category=groundnut"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 pl-6 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
              >
                <span>Groundnut Oil (கடலை எண்ணெய்)</span>
              </Link>
              <Link
                to="/shop?category=sesame"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 pl-6 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
              >
                <span>Sesame Oil (நல்லெண்ணெய்)</span>
              </Link>
              <Link
                to="/shop?category=coconut"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 pl-6 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
              >
                <span>Coconut Oil (தேங்காய் எண்ணெய்)</span>
              </Link>

              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100 transition mt-1"
              >
                <span className="flex items-center gap-2">
                  <TruckIcon size={16} className="text-amber-700" />
                  <span>{language === 'ta' ? 'ஆர்டர் நிலை அறிதல்' : 'Track Order Status'}</span>
                </span>
                <span className="text-[10px] bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  Track
                </span>
              </Link>

              <div className="pt-2 border-t border-slate-100 my-2" />

              <Link
                to="/wholesale"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50"
              >
                <span>{language === 'ta' ? 'மொத்த விற்பனை (B2B)' : 'Wholesale / B2B Supply'}</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50"
              >
                <span>{language === 'ta' ? 'எங்கள் ஆலை பற்றி' : 'About Our Mill'}</span>
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50"
              >
                <span>{language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'FAQ Hub'}</span>
              </Link>
              <Link
                to="/policies"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50"
              >
                <span>{language === 'ta' ? 'விதிகள் & கொள்கைகள்' : 'Policies & Certifications'}</span>
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50"
              >
                <span>{language === 'ta' ? 'தொடர்பு கொள்ள' : 'Contact Us'}</span>
              </Link>

              <div className="pt-2 border-t border-slate-100 my-2" />

              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                <span>Admin Console</span>
                <span className="text-[10px] text-slate-400">Staff only</span>
              </Link>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-subtle">
              <p className="text-[11px] text-slate-500 text-center">FSSAI Lic. 22426293000431 <span className="text-[9px] text-amber-700 font-bold">[Demo]</span></p>
              <p className="text-[11px] text-slate-500 text-center font-medium mt-1">Tenkasi, Tamil Nadu</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
