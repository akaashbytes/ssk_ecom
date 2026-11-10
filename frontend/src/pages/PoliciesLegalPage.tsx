import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';

export const PoliciesLegalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'shipping';
  const [currentTab, setCurrentTab] = useState<'shipping' | 'returns' | 'privacy' | 'terms' | 'fssai'>(
    (tabParam as any) || 'shipping'
  );
  const { language: _lang } = useLanguageStore(); void _lang;

  const handleTabChange = (t: typeof currentTab) => {
    setCurrentTab(t);
    setSearchParams({ tab: t });
  };

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-brand-slate transition">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">
            Legal & Customer Assurance
          </span>
        </nav>

        {/* Header */}
        <div className="pb-4 border-b border-surface-border mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-brand-slate tracking-tight">
            Policies & Fair Trade Commitments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            SSK Natural Gold operates transparently under Indian Food Safety & Standards (FSSAI) and Consumer Protection Regulations.
          </p>
        </div>

        {/* Tab Buttons (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-100 no-scrollbar text-xs font-bold">
          {[
            { id: 'shipping', label: 'Shipping & Delivery' },
            { id: 'returns', label: 'Damages & Returns' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'terms', label: 'Terms of Service' },
            { id: 'fssai', label: 'FSSAI Credentials' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id as any)}
              className={`px-4 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                currentTab === t.id
                  ? 'bg-brand-slate text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          {currentTab === 'shipping' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-brand-slate">Shipping & Delivery Guidelines</h2>
              <p>
                All orders placed on SSK Natural Gold are dispatched directly from our extraction facility in Tenkasi, Tamil Nadu. We partner with established logistics providers including The Professional Couriers and ST Courier for regional Tamil Nadu dispatches.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">Dispatch Timelines:</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Orders received before 1:00 PM IST are bottled, checked, and dispatched on the same business day.</li>
                <li>Delivery within Tamil Nadu typically completes within 24 to 48 hours.</li>
                <li>Delivery to other South Indian states takes 2 to 4 business days; rest of India takes 4 to 6 business days.</li>
              </ul>
              <h3 className="font-bold text-slate-900 pt-2">Free Delivery Eligibility:</h3>
              <p>
                All cart values of ₹500 and above qualify for 100% Free Doorstep Delivery across Tamil Nadu. Standard nominal delivery of ₹50 applies on smaller baskets.
              </p>
            </div>
          )}

          {currentTab === 'returns' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-brand-slate">Damage Protection & Replacement Guarantee</h2>
              <p>
                Because edible oils are sensitive perishable goods, we do not accept arbitrary returns once the induction seal is broken. However, we take 100% responsibility for shipping damages!
              </p>
              <h3 className="font-bold text-slate-900 pt-2">Damaged in Transit Protocol:</h3>
              <p>
                If your bottle arrives with any outer leakage, broken cap, or dented tin, simply WhatsApp a photo of the damaged parcel to our helpline <strong>+91 9994072837</strong> within 24 hours of delivery. We will immediately dispatch a fresh replacement bottle at zero cost to you!
              </p>
            </div>
          )}

          {currentTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-brand-slate">Consumer Data & Privacy Policy</h2>
              <p>
                We respect your personal privacy. When you register or place an order on SSK Natural Gold:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Your phone number and delivery address are strictly utilized for delivery routing and shipment SMS/WhatsApp tracking alerts.</li>
                <li>We never rent, trade, or sell customer contact information to third-party telemarketing networks.</li>
                <li>All payment data is handled through PCI-DSS compliant secure banking gateways; no raw credit card details are stored on our servers.</li>
              </ul>
            </div>
          )}

          {currentTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-brand-slate">Terms & Conditions</h2>
              <p>
                This platform is owned and operated by Sivasakthi Enterprises, Tenkasi District, Tamil Nadu. By browsing or purchasing from this website, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Use accurate recipient contact details for delivery fulfillment.</li>
                <li>All disputes are subject exclusively to the jurisdiction of courts in Tenkasi District, Tamil Nadu.</li>
                <li>Prices displayed are in Indian Rupees (INR) and include applicable GST taxes.</li>
              </ul>
            </div>
          )}

          {currentTab === 'fssai' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-brand-slate">Statutory Food Safety (FSSAI) Declarations</h2>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <p className="font-bold text-amber-900">Central FSSAI Registration Number:</p>
                <p className="font-mono text-xl font-black text-slate-900">
                  22426293000431{' '}
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 ml-2">
                    DEMO / NOT VERIFIED
                  </span>
                </p>
                <p className="text-[11px] text-amber-800 font-medium">
                  * Non-Production Placeholder: Statutory licensing records are for demonstration purposes only.
                </p>
                <p className="text-slate-600 text-xs">
                  Manufacturer: Sivasakthi Enterprises, Mettupatti Main Road, Ramanathapuram, Tenkasi — 627760.
                </p>
              </div>
              <p className="text-xs text-slate-600">
                Our mill operates under strict hygiene standards. Samples of every extraction batch are analyzed for acid value, moisture %, and zero argemone presence.
              </p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};
