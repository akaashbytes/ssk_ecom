import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToastStore } from '../stores/useToastStore';
import { adminService } from '../services/adminService';

export const ContactWholesalePage: React.FC = () => {
  const location = useLocation();
  const isWholesaleInitial = location.pathname.includes('wholesale');
  const [activeTab, setActiveTab] = useState<'contact' | 'wholesale'>(
    isWholesaleInitial ? 'wholesale' : 'contact'
  );
  const { language: _lang } = useLanguageStore(); void _lang;
  const addToast = useToastStore((state) => state.addToast);

  // Wholesale Form State
  const [wholesaleForm, setWholesaleForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    city: '',
    state: 'Tamil Nadu',
    oilCategories: ['groundnut'] as string[],
    estimatedMonthlyVolume: '200 Litres (Tins)',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesaleForm.companyName || !wholesaleForm.contactPerson || !wholesaleForm.phone) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill enterprise name, contact person, and mobile number.',
      });
      return;
    }
    setSubmitting(true);
    await adminService.submitWholesaleLead(wholesaleForm);
    setSubmitting(false);
    setSubmitted(true);
    addToast({
      type: 'success',
      title: 'Wholesale Enquiry Logged',
      message: 'Our Tenkasi B2B desk will contact you within 4 business hours.',
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Message Sent',
      message: 'Thank you! Our customer care representative will get back to you shortly.',
    });
    setContactForm({ name: '', phone: '', email: '', subject: '', message: '' });
  };

  const toggleCategory = (cat: string) => {
    const current = [...wholesaleForm.oilCategories];
    const index = current.indexOf(cat);
    if (index > -1) {
      if (current.length > 1) current.splice(index, 1);
    } else {
      current.push(cat);
    }
    setWholesaleForm({ ...wholesaleForm, oilCategories: current });
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
            {activeTab === 'wholesale' ? 'Wholesale & B2B Supply' : 'Contact Us'}
          </span>
        </nav>

        {/* Tab Toggle Switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('contact');
                setSubmitted(false);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-brand-slate text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📞 Customer Support (தொடர்பு கொள்ள)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('wholesale');
                setSubmitted(false);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'wholesale'
                  ? 'bg-brand-slate text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ Wholesale B2B Supply (மொத்த விற்பனை)
            </button>
          </div>
        </div>

        {activeTab === 'wholesale' ? (
          /* Wholesale B2B Form (Matching Stitch Screen d9575b01...) */
          <div className="space-y-8 animate-fadeIn">
            {/* Banner */}
            <div className="bg-brand-slate text-white rounded-3xl p-6 sm:p-10 shadow-card space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Direct Mill Supply to Sweet Shops, Caterers & Retailers
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Commercial Bulk Wood-Pressed Oil Supply
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Source genuine unadulterated sesame, groundnut, and coconut oils in 15-Litre commercial tins directly from our Tenkasi extraction facility at wholesale mill rates.
              </p>
            </div>

            {submitted ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-surface-border shadow-card space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center mx-auto text-3xl font-black">
                  ✓
                </div>
                <h2 className="text-xl font-black text-brand-slate">Wholesale Enquiry Submitted</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you! Our commercial B2B sales manager will reach out to{' '}
                  <strong>{wholesaleForm.contactPerson}</strong> at <strong>{wholesaleForm.phone}</strong> with wholesale rate slabs.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2.5 bg-brand-slate text-white text-xs font-bold rounded-xl"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleWholesaleSubmit}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card space-y-5 text-xs"
              >
                <h2 className="text-base font-black text-brand-slate pb-3 border-b border-slate-100">
                  Business & Requirement Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Enterprise Name *</label>
                    <input
                      type="text"
                      required
                      value={wholesaleForm.companyName}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, companyName: e.target.value })}
                      placeholder="e.g. Sri Krishna Sweets / Hotel Heritage"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={wholesaleForm.contactPerson}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, contactPerson: e.target.value })}
                      placeholder="e.g. K. Rajagopalan"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number (Phone/WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={wholesaleForm.phone}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, phone: e.target.value })}
                      placeholder="e.g. 9443189201"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={wholesaleForm.email}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, email: e.target.value })}
                      placeholder="purchase@company.com"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={wholesaleForm.gstin}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, gstin: e.target.value })}
                      placeholder="e.g. 33AABCS1429E1Z8"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destination City & State *</label>
                    <input
                      type="text"
                      required
                      value={wholesaleForm.city}
                      onChange={(e) => setWholesaleForm({ ...wholesaleForm, city: e.target.value })}
                      placeholder="e.g. Madurai / Coimbatore"
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Oil Variety Pills */}
                <div>
                  <label className="font-bold text-slate-700 block mb-2">
                    Required Oil Varieties (Select all that apply):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'groundnut', label: 'Groundnut Oil (கடலை)' },
                      { id: 'sesame', label: 'Sesame Oil (நல்லெண்ணெய்)' },
                      { id: 'coconut', label: 'Coconut Oil (தேங்காய்)' },
                    ].map((cat) => {
                      const selected = wholesaleForm.oilCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                            selected
                              ? 'bg-brand-slate text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {cat.label} {selected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Monthly Volume */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estimated Monthly Volume:
                  </label>
                  <select
                    value={wholesaleForm.estimatedMonthlyVolume}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, estimatedMonthlyVolume: e.target.value })}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
                  >
                    <option value="100-200 Litres">100 – 200 Litres (7 to 14 Commercial Tins)</option>
                    <option value="200-500 Litres">200 – 500 Litres (15 to 35 Tins)</option>
                    <option value="500-1000 Litres">500 – 1000 Litres (Bulk Sweet Maker Tier)</option>
                    <option value="1000+ Litres">1000+ Litres (Distributor Tier)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Additional Requirements / Notes</label>
                  <textarea
                    rows={3}
                    value={wholesaleForm.message}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, message: e.target.value })}
                    placeholder="Provide details about packaging type, delivery schedule, or recurring batches..."
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-slate text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-brand-amber text-white font-black text-sm shadow-md hover:bg-amber-600 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Transmitting to Mill Desk...' : 'Submit Wholesale Enquiry (செய்தி அனுப்புக)'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Customer Retail Support Form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Mill Extraction Facility
                </span>
                <p className="font-black text-base text-brand-slate">Sivasakthi Enterprises</p>
                <p className="text-slate-600 leading-relaxed">
                  Mettupatti Main Road, Ramanathapuram, Tenkasi District, Tamil Nadu — 627760
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p>
                    <strong>Helpline:</strong>{' '}
                    <a href="tel:+919994072837" className="text-amber-800 font-bold hover:underline">
                      +91 9994072837
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong> support@ssknaturalgold.com
                  </p>
                  <p>
                    <strong>FSSAI Central Lic:</strong> 22426293000431{' '}
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                      [DEMO / NOT VERIFIED]
                    </span>
                  </p>
                  <p>
                    <strong>Hours:</strong> Mon – Sat 8:00 AM – 7:30 PM IST
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form
                onSubmit={handleContactSubmit}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs"
              >
                <h2 className="text-base font-black text-brand-slate pb-2 border-b border-slate-100">
                  Send Customer Care Message
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Product inquiry / Order query"
                    className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Write your message..."
                    className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-brand-slate text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Send Message (செய்தி அனுப்புக)
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
