import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { GuestCustomerDetails } from '../types';
import { ShieldCheckIcon } from '../components/common/Icons';

export const CheckoutAddressPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const { guestCustomerDetails, setGuestCustomerDetails } = useAppStore();
  const { items, getSubtotal, getDiscount, getItemCount } = useCartStore();

  const [formData, setFormData] = useState<GuestCustomerDetails>({
    fullName: guestCustomerDetails?.fullName || '',
    phone: guestCustomerDetails?.phone || '',
    email: guestCustomerDetails?.email || '',
    addressLine1: guestCustomerDetails?.addressLine1 || '',
    addressLine2: guestCustomerDetails?.addressLine2 || '',
    landmark: guestCustomerDetails?.landmark || '',
    city: guestCustomerDetails?.city || 'Tenkasi',
    state: guestCustomerDetails?.state || 'Tamil Nadu',
    pincode: guestCustomerDetails?.pincode || '',
    deliveryInstructions: guestCustomerDetails?.deliveryInstructions || '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const estimatedPayable = Math.max(0, subtotal - discount);
  const itemCount = getItemCount();

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: cleaned }));
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Please enter a valid 10-digit WhatsApp mobile number');
    } else {
      setPhoneError('');
    }
  };

  const handlePincodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleaned }));
    if (cleaned.length > 0 && cleaned.length < 6) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code');
    } else {
      setPincodeError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Please enter your full name.' });
      return;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      setPhoneError('10-digit mobile number is required for WhatsApp payment details');
      addToast({ type: 'error', title: 'Invalid Mobile Number', message: 'Please enter a 10-digit WhatsApp number.' });
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      setPincodeError('6-digit PIN code is required for courier checking');
      addToast({ type: 'error', title: 'Invalid PIN Code', message: 'Please enter a 6-digit PIN code.' });
      return;
    }

    if (!formData.addressLine1.trim()) {
      addToast({ type: 'error', title: 'Address Required', message: 'Please enter your street address / building.' });
      return;
    }

    if (!formData.city.trim()) {
      addToast({ type: 'error', title: 'City Required', message: 'Please enter your town or city.' });
      return;
    }

    // Save guest details in store
    setGuestCustomerDetails(formData);

    addToast({
      type: 'success',
      title: 'Details Saved',
      message: 'Proceeding to review your order request.',
      duration: 2500,
    });

    navigate('/checkout/payment');
  };

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Step Indicator */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-brand-amber">
              <span className="w-6 h-6 rounded-full bg-brand-amber text-white flex items-center justify-center text-xs shadow-xs">
                1
              </span>
              <span>{language === 'ta' ? 'வாடிக்கையாளர் விவரம்' : 'Customer Details'}</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-3" />
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                2
              </span>
              <span>{language === 'ta' ? 'ஆர்டர் மதிப்பாய்வு' : 'Review & Payment'}</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-3" />
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                3
              </span>
              <span>{language === 'ta' ? 'கோரிக்கை பதிவு' : 'Request Received'}</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-surface-border shadow-card">
            <p className="text-sm font-bold text-slate-800">Your basket is currently empty.</p>
            <p className="text-xs text-slate-500 mt-1">Please select your cold-pressed oils before checkout.</p>
            <Link
              to="/shop"
              className="mt-5 inline-block px-5 py-2.5 bg-brand-slate text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 transition"
            >
              Explore Pure Oils (அங்காடி)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Guest Customer Information Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Informational Guest Notice */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-brand-amber flex items-center justify-center text-lg shrink-0">
                  ⚡
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-amber-400">
                    {language === 'ta' ? 'நேரடி ஆலை விநியோகம் • உள்நுழைவு தேவையில்லை' : 'Direct Mill Request • No Password or Login Required'}
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {language === 'ta'
                      ? 'உங்கள் பெயர் மற்றும் வாட்ஸ்அப் எண்ணை மட்டும் பதிவு செய்யுங்கள். ஆலை நிர்வாகி சரிபார்த்து கட்டண விபரம் அனுப்புவார்.'
                      : 'Simply provide your delivery address and WhatsApp mobile number. No account creation or password needed.'}
                  </p>
                </div>
              </div>

              {/* Guest Form */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-3xl bg-white border border-surface-border shadow-card space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-black text-brand-slate">
                    {language === 'ta' ? 'டெலிவரி முகவரி மற்றும் தொடர்பு விவரம்' : 'Delivery Address & Contact Details'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Essential details required to deliver cold-pressed oils safely to your doorstep.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 block mb-1">
                      Full Name (முழு பெயர்) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Muthuraj K."
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                  </div>

                  {/* WhatsApp Mobile */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      WhatsApp Mobile Number (வாட்ஸ்அப் எண்) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="9840123456"
                        className="w-full bg-slate-50 pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-slate focus:bg-white transition"
                      />
                    </div>
                    {phoneError && <p className="text-[11px] text-rose-600 mt-1">{phoneError}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">UPI QR & delivery updates will be sent here</p>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Email Address (மின்னஞ்சல்) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@gmail.com"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">For digital tax invoice & dispatch receipt</p>
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 block mb-1">
                      Door No., Building, Street Address (முகவரி) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="e.g. Door 14/B, Sannathi Street, Near Temple Arch"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Landmark (அடையாளம்) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="Opposite Library / Behind School"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      City / Town (நகரம்) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Tenkasi / Madurai / Chennai"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      State (மாநிலம்) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      6-Digit PIN Code (அஞ்சல் குறியீடு) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 627811"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-slate focus:bg-white transition"
                    />
                    {pincodeError && <p className="text-[11px] text-rose-600 mt-1">{pincodeError}</p>}
                  </div>

                  {/* Delivery Instructions */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 block mb-1">
                      Delivery Instructions (சிறப்பு குறிப்புகள்) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                      placeholder="e.g. Call before delivery / Fragile oil bottles / Leave with neighbor"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate focus:bg-white transition resize-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to="/cart"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    ← Back to Basket
                  </Link>

                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-brand-amber hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Order Review</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Order Basket Summary */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-sm text-brand-slate">
                  {language === 'ta' ? 'கூடை விவரம்' : 'Basket Summary'}
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? 'bottle' : 'bottles'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.id} className="pt-2.5 first:pt-0 flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                      <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{it.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {it.volume} × {it.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-brand-green font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-start text-slate-600">
                  <div>
                    <span>Courier / Delivery Fee</span>
                    <span className="text-[10px] text-slate-400 block">Based on destination pincode</span>
                  </div>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                    To be confirmed
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-100">
                  <div>
                    <span className="font-black text-sm text-brand-slate block">Estimated Total</span>
                    <span className="text-[10px] text-slate-400">Exclusive of courier charges</span>
                  </div>
                  <span className="font-black text-xl text-brand-slate">₹{estimatedPayable}</span>
                </div>
              </div>

              {/* Security Pill */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-brand-slate">
                  <ShieldCheckIcon size={14} className="text-brand-green" />
                  <span>No Upfront Payment Required</span>
                </div>
                <p>
                  You will review your final amount after stock & courier confirmation before paying.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
