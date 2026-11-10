import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { orderService } from '../services/orderService';
import { PaymentPreference } from '../types';
import { ShieldCheckIcon, CheckCircleIcon, TruckIcon } from '../components/common/Icons';

export const CheckoutPaymentPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const { guestCustomerDetails, paymentPreference, setPaymentPreference } = useAppStore();
  const { items, getSubtotal, getDiscount, clearCart } = useCartStore();

  const [selectedPreference, setSelectedPreference] = useState<PaymentPreference>(paymentPreference || 'UPI');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const estimatedPayable = Math.max(0, subtotal - discount);

  // If user accesses directly without details or empty cart
  if (items.length === 0) {
    return (
      <CustomerLayout>
        <div className="w-full max-w-page mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-surface-border shadow-card">
            <p className="text-base font-bold text-slate-800">Your basket is currently empty.</p>
            <p className="text-xs text-slate-500 mt-1">Please select products before submitting an order request.</p>
            <Link
              to="/shop"
              className="mt-5 inline-block px-5 py-2.5 bg-brand-slate text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 transition"
            >
              Browse Pure Oils (அங்காடி)
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!guestCustomerDetails || !guestCustomerDetails.fullName || !guestCustomerDetails.phone) {
    return (
      <CustomerLayout>
        <div className="w-full max-w-page mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-surface-border shadow-card">
            <p className="text-base font-bold text-slate-800">Customer Details Missing</p>
            <p className="text-xs text-slate-500 mt-1">Please enter your delivery details before reviewing your request.</p>
            <Link
              to="/checkout/address"
              className="mt-5 inline-block px-5 py-2.5 bg-brand-amber text-white text-xs font-bold rounded-xl shadow-md hover:bg-amber-600 transition"
            >
              Enter Customer Details
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const handlePreferenceChange = (pref: PaymentPreference) => {
    setSelectedPreference(pref);
    setPaymentPreference(pref);
  };

  const handleSubmitOrderRequest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const createdRequest = await orderService.submitOrderRequest({
        items,
        subtotal,
        discount,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          fullName: guestCustomerDetails.fullName,
          phone: guestCustomerDetails.phone,
          pincode: guestCustomerDetails.pincode,
          addressLine1: guestCustomerDetails.addressLine1,
          addressLine2: guestCustomerDetails.addressLine2,
          landmark: guestCustomerDetails.landmark,
          city: guestCustomerDetails.city,
          state: guestCustomerDetails.state,
          isDefault: true,
          addressType: 'HOME',
        },
        guestDetails: guestCustomerDetails,
        paymentPreference: selectedPreference,
      });

      clearCart();
      setSubmitting(false);

      addToast({
        type: 'success',
        title: language === 'ta' ? 'கோரிக்கை பதிவு செய்யப்பட்டது' : 'Order Request Submitted',
        message: `Request #${createdRequest.orderNumber} received. We will contact you on WhatsApp.`,
        duration: 4000,
      });

      navigate(`/checkout/success?orderId=${createdRequest.orderNumber}`);
    } catch (err: any) {
      setSubmitting(false);
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Could not submit request. Please try again.',
      });
    }
  };

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Step Indicator */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between text-xs font-bold">
            <Link to="/checkout/address" className="flex items-center gap-2 text-brand-green hover:underline">
              <span className="w-6 h-6 rounded-full bg-brand-green text-white flex items-center justify-center text-xs shadow-xs">
                ✓
              </span>
              <span>{language === 'ta' ? 'வாடிக்கையாளர் விவரம்' : 'Customer Details'}</span>
            </Link>
            <div className="flex-1 h-0.5 bg-brand-amber mx-3" />
            <div className="flex items-center gap-2 text-brand-amber">
              <span className="w-6 h-6 rounded-full bg-brand-amber text-white flex items-center justify-center text-xs shadow-xs">
                2
              </span>
              <span>{language === 'ta' ? 'மதிப்பாய்வு மற்றும் கட்டணம்' : 'Review & Payment'}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Order Review & Payment Preference Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Destination Review */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-xs flex items-start justify-between gap-4">
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Delivery Destination (டெலிவரி முகவரி)
                </span>
                <p className="font-black text-sm text-brand-slate">{guestCustomerDetails.fullName}</p>
                <p className="text-slate-700 leading-relaxed">
                  {guestCustomerDetails.addressLine1}
                  {guestCustomerDetails.addressLine2 && `, ${guestCustomerDetails.addressLine2}`}
                  {guestCustomerDetails.landmark && ` (Landmark: ${guestCustomerDetails.landmark})`}
                </p>
                <p className="text-slate-600 font-semibold">
                  {guestCustomerDetails.city}, {guestCustomerDetails.state} — <span className="font-mono text-slate-900">{guestCustomerDetails.pincode}</span>
                </p>
                <p className="text-slate-500 font-medium">WhatsApp Mobile: <span className="font-mono font-bold text-slate-800">+91 {guestCustomerDetails.phone}</span></p>
                {guestCustomerDetails.deliveryInstructions && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded inline-block mt-1 font-medium">
                    Note: {guestCustomerDetails.deliveryInstructions}
                  </p>
                )}
              </div>
              <Link
                to="/checkout/address"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-700 hover:bg-amber-50 shrink-0 transition"
              >
                Edit
              </Link>
            </div>

            {/* Selected Items Review */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-brand-slate">
                  {language === 'ta' ? 'தேர்ந்தெடுத்த தயாரிப்புகள்' : 'Selected Products & Quantities'}
                </h2>
                <Link to="/cart" className="text-xs font-bold text-amber-700 hover:underline">
                  Edit Basket
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{language === 'ta' ? it.nameTa : it.name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {it.volume} • Qty: <span className="font-bold text-slate-900">{it.quantity}</span>
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0 font-mono text-sm">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Preference Selector */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-brand-slate">
                    {language === 'ta' ? 'கட்டண விருப்பம் (Payment Preference)' : 'Select Payment Preference'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how you prefer to pay after our team confirms fresh batch stock and final delivery charges.
                  </p>
                </div>
                <span className="text-[11px] text-brand-green font-bold flex items-center gap-1 shrink-0">
                  <ShieldCheckIcon size={14} />
                  Safe & Direct
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Option 1: UPI QR Payment */}
                <div
                  onClick={() => handlePreferenceChange('UPI')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedPreference === 'UPI'
                      ? 'border-brand-slate bg-slate-50/70 ring-2 ring-slate-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="payment_pref"
                        checked={selectedPreference === 'UPI'}
                        onChange={() => handlePreferenceChange('UPI')}
                        className="mt-0.5 text-brand-slate focus:ring-brand-slate cursor-pointer"
                      />
                      <div>
                        <span className="font-black text-sm text-slate-900 block">
                          UPI QR Payment (Google Pay / PhonePe / Paytm / BHIM)
                        </span>
                        <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                          Pay directly to our Tenkasi mill account using any UPI app. Our team will verify batch stock, add destination courier charges, and send you the exact total with the UPI QR code on WhatsApp.
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          📌 UPI QR will be displayed on your tracking link once reviewed
                        </span>
                      </div>
                    </label>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0">
                      Recommended
                    </span>
                  </div>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div
                  onClick={() => handlePreferenceChange('COD')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedPreference === 'COD'
                      ? 'border-brand-slate bg-slate-50/70 ring-2 ring-slate-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/40'
                  }`}
                >
                  <label className="flex items-start gap-3 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="payment_pref"
                      checked={selectedPreference === 'COD'}
                      onChange={() => handlePreferenceChange('COD')}
                      className="mt-0.5 text-brand-slate focus:ring-brand-slate cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-sm text-slate-900 block">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                        Pay cash to the courier representative when the parcel arrives at your doorstep. The mill desk will call or WhatsApp you to confirm your address and final amount before dispatch.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Transparency Notice (Mandatory Workflow Requirement) */}
            <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <TruckIcon size={18} className="text-brand-amber" />
                <span>Important Purchase Notice:</span>
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                "Your order request will be reviewed by our Tenkasi mill team. Product availability and final delivery charges will be confirmed before payment."
              </p>
              <div className="pt-1 flex flex-wrap gap-4 text-[11px] text-amber-950/80">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircleIcon size={13} className="text-brand-green" /> No immediate charge
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircleIcon size={13} className="text-brand-green" /> WhatsApp confirmation first
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircleIcon size={13} className="text-brand-green" /> Genuine 100% cold-pressed oils
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Submission CTA */}
          <div className="p-6 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
            <h3 className="font-black text-sm text-brand-slate pb-3 border-b border-slate-100">
              {language === 'ta' ? 'ஆர்டர் கோரிக்கை விபரம்' : 'Order Request Summary'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 font-mono">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-brand-green font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between items-start text-slate-600">
                <div>
                  <span>Courier / Shipping Charges</span>
                  <span className="text-[10px] text-slate-400 block">PIN: {guestCustomerDetails.pincode}</span>
                </div>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                  Pending Confirmation
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Selected Preference</span>
                <span className="font-bold text-slate-900">
                  {selectedPreference === 'UPI' ? 'UPI QR Payment' : 'Cash on Delivery (COD)'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="font-black text-base text-brand-slate block">Estimated Total</span>
                  <span className="text-[10px] text-slate-400">Exclusive of courier charges</span>
                </div>
                <span className="font-black text-2xl text-brand-slate font-mono">₹{estimatedPayable}</span>
              </div>
            </div>

            {/* Submission CTA Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitOrderRequest}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-slate hover:bg-slate-800 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>Submit Order Request</span>
                  <span>✓</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              By submitting, you request our mill to reserve this batch and send courier payment details.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Demonstration Phase Notice:</span>
              <p>
                All courier estimates, merchant UPI VPAs, and delivery timings shown during this stage are development demonstration values subject to final commercial confirmation by the business owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
