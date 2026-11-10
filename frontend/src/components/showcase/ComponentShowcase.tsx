import React, { useState } from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { Radio } from '../common/Radio';
import { Badge } from '../common/Badge';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Modal } from '../common/Modal';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ProductCard } from '../product/ProductCard';
import { PriceDisplay } from '../product/PriceDisplay';
import { QuantitySelector } from '../product/QuantitySelector';
import { RatingDisplay } from '../product/RatingDisplay';
import { StockStatus } from '../product/StockStatus';
import { CustomerHeader } from '../layout/CustomerHeader';
import { CustomerFooter } from '../layout/CustomerFooter';
import { MobileBottomNavigation } from '../layout/MobileBottomNavigation';
import { AdminHeader } from '../layout/AdminHeader';
import { AdminSidebar } from '../layout/AdminSidebar';
import { PageContainer } from '../layout/PageContainer';

export const ComponentShowcase: React.FC = () => {
  const { language } = useLanguageStore();
  const { addToast } = useToastStore();

  // Interactive Demo States
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [demoQuantity, setDemoQuantity] = useState(1);
  const [demoInput, setDemoInput] = useState('Kavitha Muthuraj');
  const [demoPhone, setDemoPhone] = useState('98421 87654');
  const [demoPin, setDemoPin] = useState('6278');
  const [viewportWidth, setViewportWidth] = useState<string>('100%');

  // Real bottle catalog assets from Stitch design system
  const sesameBottleImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAF2tg9rvqk1UC5GWxVUIq11u5_q1fXoovW0I0kBCsUllIIcmD864IFuOaGfcvDk20t-Ot88LmrK9rROiayMT5hwuKpaC9XN30slPi2y_uVsFIGVzZi4x6tXMZ1zMI-sXib8IR-HvDaluogALm4t4LhP4iEYjjS8exciWY0xAvI2AnRuDatXWP8sr17Q1fftXKOZ5yvetDNxqmKEw1E_mMsoeOZoQghfySUookKvcusOIkgjebeC8NUgw';
  const groundnutBottleImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuACH6L6QLM9hE58dCSc3foxJqvyz4geqyj8sN8vQ-kmt_IKKvXRtksP1pJqhSdjGa54rNbAkFSu2Kav66vO9-CXFqPH0KTL7RcKW_9L_WVRJHvSzp4F9WbkMzyp_FHpUCTNiOBkKX_NFrD91Mrswg3ZfgVbjWUxBvRLf58ncILfR2GhnHit4yp39hrGjOaNzPOsI32_PvzEqxhNay1AmZ2Ci-fS26yltTf82te3E6xymEWv_azlFEjalg';
  const coconutBottleImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCvfYoMY78qGcf3L7XXNINEs9lpwRciPgizkhLsGnVrYUgYMRWgcFQy3MKF1S7qD_bVDi23betp_dbjwguIUL3Lot0VX_47_W8bDcs1OlZMUCeot-4M7VSjFtsQ3NJsV8DVou6iYFuY_32c5d0qoFNiX62fowu54xfcPkAsRvI6Bwi4AwZBaLTMyEF2Xq6pNd2hVVuG_nFC9FHH9XGK4E6ImaRonpQDAf9HVOvQBcBB5bhcLKByBWHqlw';

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#1E293B] overflow-x-hidden w-full">
      {/* Top Showcase Toolbar */}
      <div className="sticky top-0 z-50 bg-[#1E293B] text-white px-3 sm:px-6 py-2.5 sm:py-3 shadow-md border-b border-slate-700">
        <div className="max-w-page mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-amber animate-pulse shrink-0" />
            <h1 className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
              SSK Natural Gold — Design System (P18)
            </h1>
            <span className="hidden md:inline text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
              Approved Stitch Tokens
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Viewport Width Emulation Picker (Desktop only) */}
            <div className="hidden lg:flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 font-semibold text-[11px]">Simulate Width:</span>
              {[
                { label: 'Fluid', w: '100%' },
                { label: '360px', w: '360px' },
                { label: '375px', w: '375px' },
                { label: '390px', w: '390px' },
                { label: '430px', w: '430px' },
                { label: '768px', w: '768px' },
                { label: '1024px', w: '1024px' },
                { label: '1440px', w: '1440px' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setViewportWidth(item.w)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                    viewportWidth === item.w
                      ? 'bg-brand-amber text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Locale:</span>
              <LanguageSwitcher size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Viewport Wrapper */}
      <div
        style={{ maxWidth: viewportWidth, margin: '0 auto', transition: 'max-width 0.25s ease' }}
        className="w-full bg-[#F8F9FF] overflow-x-hidden"
      >
        <PageContainer size="lg" className="space-y-12 sm:space-y-16 py-6 sm:py-8">
          {/* Quick Jump Navigation */}
          <nav className="p-3 sm:p-4 bg-white border border-surface-border rounded-xl shadow-subtle flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-600">
            <a href="#tokens" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              01. Tokens
            </a>
            <a href="#typography" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              02. Typography
            </a>
            <a href="#spacing" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              03. Spacing & Elevation
            </a>
            <a href="#buttons" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              04. Buttons
            </a>
            <a href="#forms" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              05. Form Controls
            </a>
            <a href="#products" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              06. Products
            </a>
            <a href="#feedback" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              07. Feedback & Overlays
            </a>
            <a href="#layouts" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-amber hover:text-white transition">
              08. Layout Shells
            </a>
          </nav>

          {/* ========================================================================= */}
          {/* SECTION 1: Authoritative Design Tokens */}
          {/* ========================================================================= */}
          <section id="tokens" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                01. Authoritative Design Tokens
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Centralized color tokens verified against Stitch reference designs with WCAG AA/AAA contrast.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Primary Slate */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#1E293B] flex items-end p-2.5 text-white font-mono text-[11px] sm:text-xs font-bold">
                  #1E293B
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Primary Slate</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Headings & Base</p>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded block truncate">
                    14.1:1 AAA on White
                  </span>
                </div>
              </div>

              {/* Harvest Amber */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#D48817] flex items-end p-2.5 text-white font-mono text-[11px] sm:text-xs font-bold">
                  #D48817
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Harvest Amber</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Primary CTA & Glow</p>
                  <span className="text-[9px] sm:text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded block truncate">
                    Cold Oil Gold
                  </span>
                </div>
              </div>

              {/* Forest Green */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#166534] flex items-end p-2.5 text-white font-mono text-[11px] sm:text-xs font-bold">
                  #166534
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Forest Green</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">100% Purity & Eco</p>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded block truncate">
                    7.8:1 AAA on White
                  </span>
                </div>
              </div>

              {/* Background */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#F8F9FF] border-b border-surface-border flex items-end p-2.5 text-slate-700 font-mono text-[11px] sm:text-xs font-bold">
                  #F8F9FF
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Background</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Master Canvas</p>
                  <span className="text-[9px] sm:text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded block truncate">
                    Clean Comfort
                  </span>
                </div>
              </div>

              {/* White Surface */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#FFFFFF] border-b border-surface-border flex items-end p-2.5 text-slate-700 font-mono text-[11px] sm:text-xs font-bold">
                  #FFFFFF
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">White</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Card & Modal Base</p>
                  <span className="text-[9px] sm:text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded block truncate">
                    Food-Grade Clean
                  </span>
                </div>
              </div>

              {/* Border Outlines */}
              <div className="rounded-xl border border-surface-border bg-white overflow-hidden shadow-subtle">
                <div className="h-16 sm:h-20 bg-[#E2E8F0] flex items-end p-2.5 text-slate-700 font-mono text-[11px] sm:text-xs font-bold">
                  #E2E8F0
                </div>
                <div className="p-2.5 sm:p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Border</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Structural Divider</p>
                  <span className="text-[9px] sm:text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded block truncate">
                    Low-Contrast Rule
                  </span>
                </div>
              </div>
            </div>

            {/* Functional Semantic Tokens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-2.5 sm:p-3 rounded-lg border border-functional-success-border bg-functional-success-light/60 flex items-center justify-between">
                <span className="font-bold text-functional-success text-[11px] sm:text-xs">Success: #15803D</span>
                <span className="w-2.5 h-2.5 rounded-full bg-functional-success shrink-0" />
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg border border-functional-warning-border bg-functional-warning-light/60 flex items-center justify-between">
                <span className="font-bold text-functional-warning text-[11px] sm:text-xs">Warning: #D97706</span>
                <span className="w-2.5 h-2.5 rounded-full bg-functional-warning shrink-0" />
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg border border-functional-error-border bg-functional-error-light/60 flex items-center justify-between">
                <span className="font-bold text-functional-error text-[11px] sm:text-xs">Critical: #DC2626</span>
                <span className="w-2.5 h-2.5 rounded-full bg-functional-error shrink-0" />
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg border border-functional-info-border bg-functional-info-light/60 flex items-center justify-between">
                <span className="font-bold text-functional-info text-[11px] sm:text-xs">Info: #2563EB</span>
                <span className="w-2.5 h-2.5 rounded-full bg-functional-info shrink-0" />
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2: Bilingual Typography Scale */}
          {/* ========================================================================= */}
          <section id="typography" className="space-y-4 sm:space-y-6">
            <div className="border-b border-surface-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                  02. Bilingual Typography Scale (Inter + Noto Sans Tamil)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Engineered with matching line-heights, descender allowances, and tabular numerals.
                </p>
              </div>
              <Badge variant="amber" size="sm" className="shrink-0">Active Locale: {language.toUpperCase()}</Badge>
            </div>

            {/* Mobile horizontal scroll guidance badge */}
            <div className="md:hidden text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span>👉</span>
              <span>Swipe table horizontally to inspect all bilingual columns</span>
            </div>

            {/* Controlled Horizontal Scrolling Container */}
            <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl shadow-subtle overflow-x-auto w-full">
              <table className="w-full text-left min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-[11px] font-bold uppercase text-slate-400 bg-surface-subtle/50">
                    <th className="py-3 px-3 sm:px-4">Level</th>
                    <th className="py-3 px-3 sm:px-4">Desktop / Mobile Spec</th>
                    <th className="py-3 px-3 sm:px-4">English String (Inter)</th>
                    <th className="py-3 px-3 sm:px-4 font-tamil">Tamil String (Noto Sans Tamil)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-700 whitespace-nowrap">Display Hero</td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">36px / 44px</td>
                    <td className="py-3.5 px-3 sm:px-4 text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-slate whitespace-nowrap sm:whitespace-normal">
                      Pure Cold Pressed Gold
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-xl sm:text-2xl md:text-3xl font-bold text-brand-slate font-tamil leading-relaxed whitespace-nowrap sm:whitespace-normal">
                      பாரம்பரிய செக்கு எண்ணெய்
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-700 whitespace-nowrap">Page Heading</td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">28px / 36px</td>
                    <td className="py-3.5 px-3 sm:px-4 text-lg sm:text-xl md:text-2xl font-bold text-brand-slate whitespace-nowrap sm:whitespace-normal">
                      Sesame & Groundnut Oils
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-lg sm:text-xl md:text-2xl font-bold text-brand-slate font-tamil leading-relaxed whitespace-nowrap sm:whitespace-normal">
                      நல்லெண்ணெய் & கடலை எண்ணெய்
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-700 whitespace-nowrap">Section Header</td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">20px / 28px</td>
                    <td className="py-3.5 px-3 sm:px-4 text-base sm:text-lg md:text-xl font-semibold text-brand-slate whitespace-nowrap sm:whitespace-normal">
                      Tenkasi Traditional Extraction
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-base sm:text-lg md:text-xl font-semibold text-brand-slate font-tamil leading-relaxed whitespace-nowrap sm:whitespace-normal">
                      தென்காசி பாரம்பரிய மரச்செக்கு முறை
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-700 whitespace-nowrap">Body Standard</td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">16px / 24px</td>
                    <td className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm text-slate-600">
                      Extracted slowly at low temperature to retain nutrients.
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm text-slate-600 font-tamil leading-relaxed">
                      சத்துக்கள் குறையாமல் இயற்கையான முறையில் ஆட்டப்பட்டது.
                    </td>
                  </tr>
                  <tr className="bg-amber-50/40">
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-brand-amber whitespace-nowrap">Price Figures (tnum)</td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-amber-700 whitespace-nowrap">Tabular Figures (₹)</td>
                    <td className="py-3.5 px-3 sm:px-4" colSpan={2}>
                      <PriceDisplay price={249} originalPrice={279} size="card" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: Spacing & Elevation */}
          {/* ========================================================================= */}
          <section id="spacing" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                03. 8px Baseline Spacing & Elevation Shadows
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Strict 8px grid intervals paired with ambient diffused drop shadows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spacing intervals */}
              <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  8px Grid Interval Scale
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '4px (space-xs)', w: '4px', desc: 'Micro tags, pill gaps' },
                    { label: '8px (space-sm)', w: '8px', desc: 'Atomic baseline token' },
                    { label: '16px (space-md)', w: '16px', desc: 'Card padding, input gutter' },
                    { label: '24px (space-lg)', w: '24px', desc: 'Modal margins, section stacks' },
                    { label: '32px (space-xl)', w: '32px', desc: 'Container horizontal gutter' },
                    { label: '48px (space-2xl)', w: '48px', desc: 'Hero section separation' },
                  ].map((s) => (
                    <div key={s.label} className="grid grid-cols-[85px_36px_1fr] sm:grid-cols-[110px_48px_1fr] items-center gap-2 sm:gap-4 text-xs">
                      <span className="font-mono font-bold text-slate-500 truncate">{s.label}</span>
                      <div className="h-4 sm:h-5 bg-brand-amber rounded shrink-0" style={{ width: s.w }} />
                      <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadow Elevation Hierarchy (Stacked vertically on narrow screens) */}
              <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Elevation Shadows & Radii
                </h3>
                {/* 1 column on narrow screens (< 640px), 3 columns on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 sm:p-4 bg-white border border-surface-border rounded-lg shadow-subtle text-center">
                    <span className="block text-xs font-bold text-slate-800">Level 1</span>
                    <span className="text-[10px] text-slate-400">shadow-subtle (Cards)</span>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-white border border-surface-border rounded-xl shadow-card text-center">
                    <span className="block text-xs font-bold text-slate-800">Level 2</span>
                    <span className="text-[10px] text-slate-400">shadow-card (Interactive)</span>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-white border border-surface-border rounded-2xl shadow-elevated text-center">
                    <span className="block text-xs font-bold text-slate-800">Level 3</span>
                    <span className="text-[10px] text-slate-400">shadow-elevated (Modals)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-600">
                  <span><strong>Radius sm (4px):</strong> Badges</span>
                  <span><strong>Radius md (8px):</strong> Inputs & Buttons</span>
                  <span><strong>Radius xl (16px):</strong> Product Cards</span>
                  <span><strong>Radius full:</strong> Pills</span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: Interactive Button Matrix */}
          {/* ========================================================================= */}
          <section id="buttons" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                04. Interactive Button Matrix & Flexible Wrapping
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Touch-friendly controls with focus rings, hover, loading spinner, and disabled states.
              </p>
            </div>

            <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-6">
              {/* Primary Variants */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Primary Variants
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button variant="primary">Primary Slate</Button>
                  <Button variant="amber">Harvest Amber (Buy Now)</Button>
                  <Button variant="green">🌿 Forest Green (Pure Spec)</Button>
                  <Button variant="secondary">Secondary Outline</Button>
                  <Button variant="ghost">Ghost Action</Button>
                  <Button variant="danger">Critical Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button size="sm" variant="amber">Small (36px)</Button>
                  <Button size="md" variant="amber">Medium (40px/44px Touch)</Button>
                  <Button size="lg" variant="amber">Large (48px Hero)</Button>
                </div>
              </div>

              {/* Loading & Disabled States */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Operational States
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button variant="amber" isLoading loadingText="Updating Mill Order...">
                    Default Text
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled Slate
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled Outline
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: Bilingual Form Controls */}
          {/* ========================================================================= */}
          <section id="forms" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                05. Bilingual Form Controls & Responsive Validation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Single column on mobile viewports; 2-3 columns on tablet and desktop screens.
              </p>
            </div>

            <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle">
              <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" onSubmit={(e) => e.preventDefault()}>
                {/* Full Name */}
                <Input
                  label="Full Name / முழு பெயர்"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  helperText="As printed on delivery recipient identity"
                  required
                />

                {/* Mobile Phone +91 */}
                <Input
                  label="Mobile Number / அலைபேசி எண்"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  leftAddon="🇮🇳 +91"
                  helperText="✓ Verified for delivery WhatsApp SMS tracking"
                  required
                />

                {/* Search Input */}
                <Input
                  label="Product Search / தேடுதல்"
                  placeholder="Search Sesame, Groundnut..."
                  leftAddon="🔍"
                  helperText="Search by Tamil or English oil title"
                />

                {/* Packaging Volume Dropdown */}
                <Select
                  label="Select Packaging Volume / அளவு"
                  helperText="Bottled in food-grade virgin containers"
                  defaultValue="1-litre"
                >
                  <option value="500ml">500 ml Bottle (Family Trial)</option>
                  <option value="1-litre">1 Litre PET Food-Grade Bottle (Popular)</option>
                  <option value="5-litre">5 Litre Commercial Bulk Tin (Save 15%)</option>
                </Select>

                {/* Error Field */}
                <Input
                  label="Tamil Nadu Pincode / அஞ்சல் குறியீடு"
                  value={demoPin}
                  onChange={(e) => setDemoPin(e.target.value)}
                  error="Please enter a valid 6-digit Indian PIN code (e.g. 627811)"
                />

                {/* Validated Field */}
                <Input
                  label="Email Address / மின்னஞ்சல்"
                  value="customer@example.in"
                  isValid
                  helperText="Valid e-invoice email address"
                  readOnly
                />
              </form>

              {/* Checkboxes & Radios (Vertical stacking on mobile, flex row on sm+) */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 items-start sm:items-center text-xs sm:text-sm">
                <Checkbox
                  label="Send WhatsApp Delivery & Batch Updates"
                  description="Real-time dispatch alerts from Tenkasi Mill"
                  defaultChecked
                />
                <Checkbox
                  label="I require GST invoice for wholesale business"
                  description="Include 5% edible oil GST invoice"
                />
                <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dispatch:</span>
                  <Radio name="dispatch_opt" label="Standard (2-3 Days)" defaultChecked />
                  <Radio name="dispatch_opt" label="Express Direct" />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 6: E-Commerce Product Components */}
          {/* ========================================================================= */}
          <section id="products" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3 flex flex-wrap justify-between items-end gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                  06. E-Commerce Components (Real Catalog Specs)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  1 column at 360px & 390px; 2 columns on tablet; 3 columns on desktop.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-surface-border px-3 py-1.5 rounded-lg shadow-xs">
                <span>FSSAI Lic. No:</span>
                <span className="font-mono text-brand-slate font-bold">22426293000431</span>
              </div>
            </div>

            {/* Live Cards Grid: strictly 1 column on mobile (< 768px), 2 columns on tablet (768px-1279px), 3 columns on xl (1280px+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {/* Card 1: Sesame Oil */}
              <ProductCard
                id="sesame-500"
                title="Pure Cold-Pressed Sesame Oil"
                tamilTitle="நல்லெண்ணெய்"
                subtitle="செக்கு நல்லெண்ணெய்"
                batchId="Tenkasi Mill Batch #TM-402"
                description="Wood-pressed with black sesame & palm jaggery. Unrefined traditional cold filtration retaining micro-nutrients."
                imageUrl={sesameBottleImg}
                badgeText="🌱 100% Cold-Pressed"
                badgeVariant="green"
                packSizes={[
                  { id: '500ml', label: '500 ml', price: 249, originalPrice: 279 },
                  { id: '1L', label: '1 Litre', price: 479, originalPrice: 529 },
                  { id: '5L', label: '5 Litre', price: 2299, originalPrice: 2499 },
                ]}
                onAddToCart={(_pid, _packId, qty) => {
                  addToast({
                    type: 'success',
                    title: 'Added to Basket',
                    message: `${qty}x Cold-Pressed Sesame Oil added successfully.`,
                  });
                }}
              />

              {/* Card 2: Groundnut Oil */}
              <ProductCard
                id="groundnut-1L"
                title="Traditional Groundnut Oil"
                tamilTitle="கடலை எண்ணெய்"
                subtitle="செக்கு கடலை எண்ணெய்"
                batchId="Tenkasi Mill Batch #TM-398"
                description="Extracted from sun-dried Saurashtra groundnuts. High smoke point ideal for authentic South Indian cooking."
                imageUrl={groundnutBottleImg}
                badgeText="⭐ Best Seller"
                badgeVariant="amber"
                packSizes={[
                  { id: '500ml', label: '500 ml', price: 199, originalPrice: 229 },
                  { id: '1L', label: '1 Litre', price: 389, originalPrice: 429 },
                  { id: '5L', label: '5 Litre', price: 1849, originalPrice: 1999 },
                ]}
                onAddToCart={(_pid, _packId, qty) => {
                  addToast({
                    type: 'success',
                    title: 'Added to Basket',
                    message: `${qty}x Traditional Groundnut Oil added successfully.`,
                  });
                }}
              />

              {/* Card 3: Out of Stock Card */}
              <ProductCard
                id="coconut-out-of-stock"
                title="Raw Cold-Pressed Coconut Oil"
                tamilTitle="தேங்காய் எண்ணெய்"
                subtitle="செக்கு தேங்காய் எண்ணெய்"
                batchId="Tenkasi Mill Batch #TM-395"
                description="Naturally prepared from mature copra coconuts. 100% sulfur-free, pure aroma for cooking & wellness."
                imageUrl={coconutBottleImg}
                isOutOfStock
                packSizes={[
                  { id: '500ml', label: '500 ml', price: 279, originalPrice: 299 },
                  { id: '1L', label: '1 Litre', price: 539, originalPrice: 579 },
                  { id: '5L', label: '5 Litre', price: 2599, originalPrice: 2799 },
                ]}
              />
            </div>

            {/* Standalone E-Commerce Primitives */}
            <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Individual E-Commerce Component Primitives
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Display Varieties */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">PriceDisplay Variants:</span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Hero:</span>
                      <PriceDisplay price={747} originalPrice={837} size="hero" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Card:</span>
                      <PriceDisplay price={249} originalPrice={279} size="card" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Small:</span>
                      <PriceDisplay price={199} originalPrice={229} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">QuantitySelector:</span>
                  <div className="space-y-3">
                    <QuantitySelector
                      value={demoQuantity}
                      onChange={setDemoQuantity}
                      size="md"
                    />
                    <p className="text-[11px] text-slate-500">
                      Minimum 44x44px mobile tap target with active feedback.
                    </p>
                  </div>
                </div>

                {/* Stock Status & Ratings */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">StockStatus Indicators:</span>
                  <div className="flex flex-col gap-2">
                    <StockStatus status="in_stock" />
                    <StockStatus status="low_stock" stockCount={4} />
                    <StockStatus status="out_of_stock" />
                  </div>

                  <span className="text-xs font-bold text-slate-700 block pt-2 border-t border-slate-100">
                    Verified Ratings (Only when present):
                  </span>
                  <RatingDisplay rating={4.8} reviewCount={142} />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 7: Feedback, Overlays & Dialogs */}
          {/* ========================================================================= */}
          <section id="feedback" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                07. Feedback, Overlays & Zero-Data Recovery States
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Vertically stacked previews on mobile & tablet; 3 columns on desktop.
              </p>
            </div>

            {/* Interactive Triggers Row */}
            <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Interactive Notification & Modal Triggers
              </h3>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <Button
                  variant="green"
                  size="sm"
                  onClick={() =>
                    addToast({
                      type: 'success',
                      title: 'Order Confirmed',
                      message: 'Batch #TM-402 reserved for dispatch.',
                    })
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() =>
                    addToast({
                      type: 'warning',
                      title: 'Low Stock Notice',
                      message: 'Only 4 cans left for 5 Litre Groundnut Tin batch.',
                    })
                  }
                >
                  Trigger Warning Toast
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    addToast({
                      type: 'error',
                      title: 'Invalid Mobile Format',
                      message: 'Please provide a 10-digit Indian telephone number.',
                    })
                  }
                >
                  Trigger Error Toast
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
                  Open Modal Dialog
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>
                  Open Confirmation Dialog
                </Button>
              </div>
            </div>

            {/* Stacked Vertically on narrow screens (< 1024px); 3 columns on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Loading Spinner */}
              <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-6 shadow-subtle flex flex-col items-center justify-center gap-4 text-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Loading Spinner Variants
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                  <LoadingSpinner size="sm" color="amber" label="Small" />
                  <LoadingSpinner size="md" color="amber" label="Milling..." />
                  <LoadingSpinner size="lg" color="green" label="Large" />
                </div>
              </div>

              {/* Column 2: Product Skeleton Placeholder */}
              <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Skeleton Loading Placeholder
                </h4>
                <SkeletonLoader variant="product-card" />
              </div>

              {/* Column 3: Empty Basket State */}
              <div className="bg-white border border-surface-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-subtle">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Empty State Component
                </h4>
                <EmptyState
                  title="Your Basket is Empty"
                  description="No traditional oils currently in your basket."
                  tamilDescription="கூடையில் எண்ணெய்கள் எதுவும் இல்லை. எங்கள் பாரம்பரிய தயாரிப்புகளைப் பாருங்கள்."
                  actionText="Explore Oils"
                  onAction={() => alert('Navigate to catalog')}
                />
              </div>
            </div>

            {/* Error State Banner Sample */}
            <ErrorState
              title="Connection Interrupted"
              message="Unable to connect to Tenkasi Mill dispatch service. Please check your network and retry."
              technicalError="ERR_NETWORK_DISCONNECTED: failed to resolve dispatch.ssk-natural-gold.in"
              onRetry={() => alert('Retrying connection...')}
            />
          </section>

          {/* ========================================================================= */}
          {/* SECTION 8: Layout Shells Preview */}
          {/* ========================================================================= */}
          <section id="layouts" className="space-y-5 sm:space-y-6">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-brand-slate flex items-center gap-2">
                <span className="w-2.5 h-6 bg-brand-amber rounded-full shrink-0" />
                08. Responsive Layout Shells Preview
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Customer Header, Customer Footer, Mobile Bottom Navigation, Admin Header, and Admin Sidebar.
              </p>
            </div>

            {/* Customer Header Preview (non-sticky in preview to prevent covering content) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CustomerHeader Component:
              </span>
              <CustomerHeader
                cartItemCount={3}
                onCartClick={() => alert('Open cart drawer')}
                isSticky={false}
              />
            </div>

            {/* Admin Header & Sidebar Preview */}
            <div className="space-y-2 pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Admin Header & Sidebar Components:
              </span>
              <div className="border border-surface-border rounded-2xl overflow-hidden shadow-card flex flex-col md:flex-row min-h-[360px]">
                <AdminSidebar activeId="dashboard" className="hidden lg:flex shrink-0" />
                <div className="flex-1 flex flex-col bg-[#F8F9FF] min-w-0">
                  <AdminHeader adminName="Muthuraj K." role="Mill Master" isSticky={false} />
                  <div className="p-4 sm:p-6">
                    <Card elevation="subtle" radius="xl">
                      <CardHeader>
                        <h4 className="text-sm font-bold text-slate-800">Admin Canvas Viewport</h4>
                      </CardHeader>
                      <CardBody>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          This admin shell demonstrates modular integration of the AdminSidebar, AdminHeader,
                          and PageContainer matching the Stitch operations console specifications.
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Navigation Preview (non-fixed inside preview container) */}
            <div className="space-y-2 pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                MobileBottomNavigation Preview (Embedded Non-Fixed Simulation):
              </span>
              <div className="max-w-[390px] mx-auto border border-surface-border rounded-2xl overflow-hidden shadow-card bg-white p-3 sm:p-4">
                <p className="text-xs text-center text-slate-500 mb-3">
                  Simulated 390px Mobile Viewport Bottom Nav
                </p>
                <div className="relative border-t border-slate-100">
                  <MobileBottomNavigation activeTab="home" cartCount={3} isFixed={false} />
                </div>
              </div>
            </div>

            {/* Customer Footer Preview */}
            <div className="space-y-2 pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CustomerFooter Component:
              </span>
              <CustomerFooter />
            </div>
          </section>
        </PageContainer>
      </div>

      {/* Demo Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tenkasi Mill Extraction Certificate"
        subtitle="Batch #TM-2026-OCT-26 • 100% Cold-Pressed Verification"
        footer={
          <Button variant="amber" onClick={() => setModalOpen(false)}>
            Close Certificate
          </Button>
        }
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800">
            <span className="text-lg">🌱</span>
            <span>Vaagai Wood Marachekku extracted at maximum 34°C (Safe Purity Zone).</span>
          </div>
          <p>
            Every single batch undergoes testing for free fatty acids, peroxide value, and natural density.
            Unrefined and unadulterated cold pressed edible oil.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>FSSAI Lic: 22426293000431</div>
            <div>Acid Value: 0.8% (Purity Max 1.5%)</div>
            <div>Extraction Date: 26 Oct 2026</div>
            <div>Mill Location: Tenkasi, TN</div>
          </div>
        </div>
      </Modal>

      {/* Demo Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          addToast({
            type: 'info',
            title: 'Cart Updated',
            message: 'All items removed from basket.',
          });
        }}
        title="Clear Shopping Basket?"
        message="Are you sure you want to remove all cold-pressed oils from your shopping basket? This action cannot be undone."
        confirmLabel="Yes, Clear Basket"
        cancelLabel="Keep Items"
        isDestructive
      />
    </div>
  );
};
