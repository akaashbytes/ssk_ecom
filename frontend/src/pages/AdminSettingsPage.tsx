import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { settingsService, BusinessSettings, DEFAULT_BUSINESS_SETTINGS } from '../services/settingsService';
import { useToastStore } from '../stores/useToastStore';

export const AdminSettingsPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await settingsService.updateSettings(settings);
    setSaving(false);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Business settings and payment details successfully updated in local state.',
    });
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all business settings back to standard mill factory defaults?')) return;
    const reset = await settingsService.resetSettings();
    setSettings(reset);
    addToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Restored factory defaults for SSK Natural Gold Tenkasi Mill.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/dashboard" className="hover:text-slate-600">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Settings</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Business Settings & Operational Rules
            </h1>
            <p className="text-xs text-slate-500">
              Configure merchant UPI details, customer support contact numbers, and regional courier calculation rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : '✓ Save Settings'}
            </button>
          </div>
        </div>

        {/* Operational Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
          <span className="text-xl">⚠️</span>
          <div className="space-y-1">
            <p className="font-bold text-amber-950">Demonstration Operational Settings Notice</p>
            <p className="text-amber-800 leading-relaxed">
              All settings here are persisted in local browser storage (`localStorage`). Updating the Merchant UPI ID,
              WhatsApp helpline, or courier delivery fees allows you to test different business scenarios without altering
              server environments.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading operational settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Business Identity */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
              <h2 className="font-black text-sm text-brand-slate uppercase tracking-wider flex items-center gap-2">
                <span>🏛️</span>
                <span>Mill Identity & FSSAI Licensing</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Name (English)</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-brand-slate"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Name (Tamil / தமிழ்)</label>
                  <input
                    type="text"
                    value={settings.businessNameTa}
                    onChange={(e) => handleChange('businessNameTa', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-tamil font-bold focus:outline-none focus:border-brand-slate"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Central FSSAI License Number
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO / NOT VERIFIED
                    </span>
                  </label>
                  <input
                    type="text"
                    value={settings.fssaiLicense}
                    onChange={(e) => handleChange('fssaiLicense', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Placeholder registration number. Subject to business owner verification.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mill Working Hours</label>
                  <input
                    type="text"
                    value={settings.workingHours}
                    onChange={(e) => handleChange('workingHours', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Mill & Dispatch Facility Address</label>
                <input
                  type="text"
                  value={settings.millAddress}
                  onChange={(e) => handleChange('millAddress', e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate"
                />
              </div>
            </div>

            {/* Section 2: Merchant Payment Details (UPI & COD) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
              <h2 className="font-black text-sm text-brand-slate uppercase tracking-wider flex items-center gap-2">
                <span>💳</span>
                <span>Payment Configuration (UPI QR & Cash on Delivery)</span>
              </h2>

              <p className="text-slate-500">
                Configure the merchant UPI ID presented to customers after order review, and enable or disable Cash on Delivery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Merchant UPI ID / VPA *
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO / NOT VERIFIED
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.merchantUpiId}
                    onChange={(e) => handleChange('merchantUpiId', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-brand-amber focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Demonstration VPA placeholder. Must be confirmed with bank before live payments.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Merchant Payee Account Name *
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO / NOT VERIFIED
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.merchantPayeeName}
                    onChange={(e) => handleChange('merchantPayeeName', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Placeholder payee name. Subject to final merchant bank settlement account.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      Cash on Delivery (COD) Acceptance
                      <span className="ml-2 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        CONFIGURABLE DEMO
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Allow customers in serviceable regions to choose doorstep cash payment.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={(e) => handleChange('codEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {settings.codEnabled && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="font-bold text-slate-700 block mb-1">
                      Maximum Allowed COD Order Limit (₹)
                      <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        DEMO LIMIT
                      </span>
                    </label>
                    <input
                      type="number"
                      value={settings.maxCodOrderValue}
                      onChange={(e) => handleChange('maxCodOrderValue', Number(e.target.value))}
                      className="w-48 bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-brand-slate"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Placeholder threshold. Higher order requests require advance payment confirmation.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Customer Support & Communication Channels */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
              <h2 className="font-black text-sm text-brand-slate uppercase tracking-wider flex items-center gap-2">
                <span>📱</span>
                <span>Customer Helpdesk & WhatsApp Channels</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official WhatsApp Helpline *
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO / NOT VERIFIED
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.whatsappPhone}
                    onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Placeholder contact number. Subject to official SIM card registration.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mill Phone Support Helpline
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO
                    </span>
                  </label>
                  <input
                    type="text"
                    value={settings.helpdeskPhone}
                    onChange={(e) => handleChange('helpdeskPhone', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-brand-slate"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Support Email Address
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO
                    </span>
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-brand-slate"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Regional Courier Delivery Fee Rules */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
              <h2 className="font-black text-sm text-brand-slate uppercase tracking-wider flex items-center gap-2">
                <span>🚚</span>
                <span>Regional Courier Delivery Fee Rules</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Default Local / TN Courier Fee (₹)
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      ESTIMATE / DEMO
                    </span>
                  </label>
                  <input
                    type="number"
                    value={settings.defaultLocalCourierFee}
                    onChange={(e) => handleChange('defaultLocalCourierFee', Number(e.target.value))}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Indicative fee. Admin manually confirms or adjusts per order based on actual destination.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Default National Courier Fee (₹)
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      ESTIMATE / DEMO
                    </span>
                  </label>
                  <input
                    type="number"
                    value={settings.defaultNationalCourierFee}
                    onChange={(e) => handleChange('defaultNationalCourierFee', Number(e.target.value))}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Indicative fee for outstation dispatches.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Free Delivery Minimum Basket (₹)
                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DEMO THRESHOLD
                    </span>
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-brand-slate"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Subject to commercial policy review by business owner.
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Illustrative Serviceable PIN Code Prefixes
                  <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    ESTIMATE ONLY / NOT GUARANTEED
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.serviceablePinPrefixes.map((pfx) => (
                    <span
                      key={pfx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700"
                    >
                      {pfx}xxxx
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Broad prefixes represent indicative dispatch zones only. Doorstep courier serviceability must be confirmed manually by the mill desk manager for every order.
                </span>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand-slate hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer shadow-md"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
