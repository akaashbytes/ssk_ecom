import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { TruckIcon, CheckCircleIcon, InfoIcon } from '../components/common/Icons';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderId') || 'SSK-REQ-2026-1042';
  const { language } = useLanguageStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      const found = await orderService.getOrderById(orderNumber);
      if (found) setOrder(found);
    };
    load();
  }, [orderNumber]);

  const handleCopyOrderRef = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Vanakkam SSK Natural Gold, I have submitted an order request (${orderNumber}) for cold-pressed oil. Kindly confirm product availability and courier delivery charges.`
  );
  const whatsappUrl = `https://wa.me/919994072837?text=${whatsappMessage}`;

  return (
    <CustomerLayout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14 text-center">
        {/* Animated Success Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center mx-auto text-3xl sm:text-4xl mb-4 shadow-md ring-8 ring-emerald-50">
          ✓
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>🌿 Tenkasi Traditional Extraction Mill</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-brand-slate tracking-tight">
          {language === 'ta' ? 'ஆர்டர் கோரிக்கை பெறப்பட்டது!' : 'Order Request Received!'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
          {language === 'ta'
            ? `நன்றி! உங்கள் ஆர்டர் கோரிக்கை எண் #${orderNumber} பெறப்பட்டு பதிவாகியுள்ளது. எங்கள் தென்காசி ஆலை குழுவினர் இருப்பை சரிபார்த்து வாட்ஸ்அப் வழியாக உறுதி செய்வர்.`
            : `Thank you! Your order request #${orderNumber} has been received. Our Tenkasi mill team will verify fresh batch stock and calculate regional courier charges before payment.`}
        </p>

        {/* Reference Highlight Card */}
        <div className="mt-6 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Order Request Reference ID
            </span>
            <span className="text-lg sm:text-xl font-black text-brand-slate font-mono tracking-wide">
              {orderNumber}
            </span>
            <p className="text-[11px] text-amber-900/80 mt-0.5">
              Please save this reference number to track your delivery status.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyOrderRef}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100/60 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircleIcon size={14} className="text-brand-green" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Reference</span>
              </>
            )}
          </button>
        </div>

        {/* 3-Step Lifecycle Visualizer */}
        <div className="mt-6 bg-white rounded-3xl p-5 sm:p-7 border border-surface-border shadow-card text-left">
          <h2 className="text-xs sm:text-sm font-black text-brand-slate uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>Next Steps in Your Wood-Pressed Oil Journey</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 relative">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-green text-white text-[10px] font-black flex items-center justify-center">
                  ✓
                </span>
                <span className="font-bold text-xs text-brand-green">1. Request Received</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Your oil selection & delivery destination are recorded in our mill fulfillment ledger.
              </p>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block pt-1">
                Completed
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-brand-amber/40 space-y-1 relative ring-2 ring-amber-300/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-amber text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  2
                </span>
                <span className="font-bold text-xs text-amber-900">2. Mill Stock & Courier</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Our mill desk checks current cold-pressed extraction batch and calculates destination shipping.
              </p>
              <span className="text-[10px] font-bold text-brand-amber uppercase tracking-wider block pt-1">
                In Review Now
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 relative opacity-90">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-xs text-slate-700">3. Payment & Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {order?.paymentPreference === 'COD'
                  ? 'Confirmed for Cash on Delivery. Bottles packaged and dispatched with courier AWB.'
                  : 'You will receive UPI QR instructions on WhatsApp. Once paid, pure oil is packed & shipped.'}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                Upcoming
              </span>
            </div>
          </div>

          {/* Important Clarity Notice: No Immediate Payment Required */}
          <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
            <InfoIcon size={18} className="text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">No Immediate Payment Required Right Now</p>
              <p className="text-[11px] text-blue-900/90 leading-relaxed">
                {order?.paymentPreference === 'COD'
                  ? 'You selected Cash on Delivery. Our team will verify your contact number and dispatch your package.'
                  : 'Because courier charges depend on your destination pincode and fresh batch weight, we verify availability first. You will receive the verified UPI QR code and exact payable amount via WhatsApp from our mill care team.'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="mt-6 bg-white rounded-3xl p-5 sm:p-7 border border-surface-border shadow-card text-left space-y-6">
            <h2 className="text-xs sm:text-sm font-black text-brand-slate uppercase tracking-wider pb-3 border-b border-slate-100">
              Order Request Summary
            </h2>

            {/* Customer & Destination Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <p className="font-black text-slate-800 text-sm">
                  {order.guestDetails?.fullName || order.shippingAddress.fullName}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {order.guestDetails?.addressLine1 || order.shippingAddress.addressLine1}
                  {order.guestDetails?.addressLine2 && `, ${order.guestDetails.addressLine2}`}
                  <br />
                  {order.guestDetails?.city || order.shippingAddress.city}, {order.guestDetails?.state || order.shippingAddress.state} —{' '}
                  <span className="font-mono font-bold text-brand-slate">
                    {order.guestDetails?.pincode || order.shippingAddress.pincode}
                  </span>
                </p>
                {order.guestDetails?.landmark && (
                  <p className="text-[11px] text-slate-500">Landmark: {order.guestDetails.landmark}</p>
                )}
                <p className="text-slate-700 font-semibold pt-1">
                  WhatsApp Ph: +91 {order.guestDetails?.phone || order.shippingAddress.phone}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Preference
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-xs">
                    {order.paymentPreference === 'COD' ? '💵 Cash on Delivery' : '📱 UPI QR Transfer'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ({order.paymentStatus.replace(/_/g, ' ')})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Estimated Oils Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Regional Courier Delivery:</span>
                    <span className="font-semibold text-[11px]">Pending Mill Calculation</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-brand-slate text-sm">
                    <span>Estimated Payable:</span>
                    <span>₹{order.subtotal} + Courier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requested Oil Items */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Requested Oil Bottles ({order.items.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((it) => (
                  <div key={it.id} className="p-3 sm:p-4 flex items-center justify-between text-xs bg-white hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-10 h-10 object-contain rounded-lg bg-amber-50/50 p-1 border border-slate-100"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{it.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {it.volume} • Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Contact Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-emerald-900 flex items-center gap-1.5 text-sm">
                  <span>💬 Need Faster Priority Processing?</span>
                </span>
                <p className="text-emerald-800 text-[11px]">
                  Message our Tenkasi mill desk directly on WhatsApp with your request reference #{orderNumber}.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer text-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Demonstration Notice */}
            <p className="text-[10px] text-center text-slate-400">
              * Demonstration Phase: Mill helpline contact and order reference numbers are active mock configurations for review.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/orders/${orderNumber}`}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-slate text-white font-bold text-xs shadow-md hover:bg-slate-800 transition text-center flex items-center justify-center gap-2"
              >
                <TruckIcon size={16} />
                <span>Track Request Status Online</span>
              </Link>
              <Link
                to="/shop"
                className="py-3 px-4 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 transition text-center"
              >
                Explore More Pure Oils
              </Link>
              <Link
                to="/"
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition text-center"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
