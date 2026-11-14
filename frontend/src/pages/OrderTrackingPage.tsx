import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToastStore } from '../stores/useToastStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import {
  TruckIcon,
  CheckCircleIcon,
  InfoIcon,
  LockIcon,
  SearchIcon,
} from '../components/common/Icons';

export const OrderTrackingPage: React.FC = () => {
  const { orderId: routeOrderId } = useParams<{ orderId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryOrderId = searchParams.get('orderId');
  const initialRef = routeOrderId || queryOrderId || '';

  const { language } = useLanguageStore();
  const addToast = useToastStore((state) => state.addToast);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search input state - phone is never read from URL or auto-populated from query params
  const [searchRef, setSearchRef] = useState(initialRef);
  const [searchPhone, setSearchPhone] = useState('');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [acceptingQuotation, setAcceptingQuotation] = useState(false);
  const [decliningQuotation, setDecliningQuotation] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchOrder = async (ref: string, phone: string) => {
    const cleanRef = ref.trim().toUpperCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    if (!cleanRef) {
      addToast({
        type: 'warning',
        title: 'Missing Reference',
        message: 'Please enter your Order Reference (e.g., SSK-REQ-2026-1042)',
      });
      return;
    }

    // Privacy rule: 10-digit mobile number is mandatory to reveal order details
    if (!cleanPhone || cleanPhone.length !== 10) {
      setHasSearched(true);
      setOrder(null);
      addToast({
        type: 'warning',
        title: 'Mobile Number Required',
        message: 'For customer privacy, please enter your registered 10-digit mobile number to verify and track your order.',
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const found = await orderService.getOrderByPhoneAndRef(cleanRef, cleanPhone);
      setOrder(found);
      if (!found) {
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'No order located matching this Reference ID and Mobile Number combination.',
        });
      }
    } catch {
      // Intentionally omit logging error objects to prevent leaking customer inputs in console
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (initialRef) {
      setSearchRef(initialRef);
      // Privacy safeguard: Order details are NEVER revealed by URL reference alone.
      // The customer must explicitly enter their matching 10-digit registered mobile number.
      setOrder(null);
      setHasSearched(false);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Reference',
        message: 'Please enter your Order Reference (e.g., SSK-REQ-2026-1042)',
      });
      return;
    }
    const cleanPhone = searchPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      addToast({
        type: 'warning',
        title: 'Registered Mobile Required',
        message: 'Please enter the 10-digit mobile number registered with this order to verify ownership.',
      });
      return;
    }
    // Set ONLY orderId in URL query params; NEVER expose customer phone number in the URL!
    setSearchParams({ orderId: searchRef.trim() });
    fetchOrder(searchRef.trim(), cleanPhone);
  };

  const handleQuickDemoClick = (ref: string, demoPhone: string) => {
    setSearchRef(ref);
    setSearchPhone(demoPhone);
    // Set ONLY orderId in URL query params; NEVER expose phone number in URL parameters!
    setSearchParams({ orderId: ref });
    fetchOrder(ref, demoPhone);
  };

  const handleAcceptQuotation = async () => {
    if (!order) return;
    setAcceptingQuotation(true);
    const customerPhone = searchPhone || order.guestDetails?.phone || order.shippingAddress?.phone || '';
    try {
      const updated = await orderService.customerAcceptQuotation(order.orderNumber, customerPhone);
      if (updated) {
        setOrder(updated);
        addToast({
          type: 'success',
          title: language === 'ta' ? 'விலைப்புள்ளி ஏற்கப்பட்டது' : 'Quotation Accepted',
          message:
            updated.paymentPreference === 'UPI'
              ? 'Quoted delivery amount accepted. Stock reserved for 24h. Order is awaiting payment.'
              : 'Quoted delivery amount accepted. Your COD order is confirmed for bottling.',
        });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to accept quotation' });
    } finally {
      setAcceptingQuotation(false);
    }
  };

  const handleDeclineQuotation = async () => {
    if (!order) return;
    if (
      !window.confirm(
        language === 'ta'
          ? 'ஆர்டர் கோரிக்கையை ரத்து செய்ய விரும்புகிறீர்களா?'
          : 'Are you sure you want to decline this quotation and cancel the request?'
      )
    )
      return;
    setDecliningQuotation(true);
    const customerPhone = searchPhone || order.guestDetails?.phone || order.shippingAddress?.phone || '';
    try {
      const updated = await orderService.customerDeclineQuotation(
        order.orderNumber,
        'Customer declined quoted courier charges',
        customerPhone
      );
      if (updated) {
        setOrder(updated);
        addToast({
          type: 'info',
          title: language === 'ta' ? 'கோரிக்கை ரத்து செய்யப்பட்டது' : 'Quotation Declined',
          message: 'Order request has been cancelled.',
        });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to decline quotation' });
    } finally {
      setDecliningQuotation(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const cleanUtr = utrInput.trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 8) {
      addToast({
        type: 'warning',
        title: 'Invalid UTR',
        message: 'Please enter a valid 12-digit UPI transaction reference / UTR number (minimum 8 characters).',
      });
      return;
    }
    const customerPhone = searchPhone || order.guestDetails?.phone || order.shippingAddress?.phone || '';
    if (!customerPhone) {
      addToast({
        type: 'warning',
        title: 'Mobile Required',
        message: 'Please enter your registered mobile number to submit payment proof.',
      });
      return;
    }
    if (order.paymentStatus === 'UNPAID') {
      addToast({
        type: 'warning',
        title: 'Instructions Pending',
        message: 'Payment instructions have not been delivered yet. Please wait until verified payment instructions are issued to your registered mobile.',
      });
      return;
    }
    setSubmittingUtr(true);
    try {
      const updated = await orderService.submitPaymentReport(order.orderNumber, cleanUtr, customerPhone);
      if (updated) {
        setOrder(updated);
        setUtrInput('');
        addToast({
          type: 'success',
          title: language === 'ta' ? 'கட்டணம் பதிவு செய்யப்பட்டது' : 'Payment Reported',
          message: 'UPI payment reference submitted successfully. Our accounts desk is verifying bank credit.',
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: e.message || 'Failed to submit payment reference. Please try again.',
      });
    } finally {
      setSubmittingUtr(false);
    }
  };

  const whatsappInquiryUrl = order
    ? `https://wa.me/919994072837?text=${encodeURIComponent(
        `Vanakkam SSK Natural Gold, I am checking status for order request ${order.orderNumber}.`
      )}`
    : `https://wa.me/919994072837?text=${encodeURIComponent(
        'Vanakkam SSK Natural Gold, I would like to inquire about my cold-pressed oil order status.'
      )}`;

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-slate transition">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">Track Order</span>
          {order && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-mono text-amber-800 font-bold">#{order.orderNumber}</span>
            </>
          )}
        </nav>

        {/* Guest Tracking Search Box (Shown when no order is displayed or for switching) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card mb-8">
          <div className="max-w-xl mx-auto text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-brand-amber flex items-center justify-center shrink-0">
                <TruckIcon size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
                  {language === 'ta' ? 'ஆர்டர் கண்காணிப்பு (Track Order)' : 'Track Your Wood-Pressed Oil Order'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your order reference number (e.g. <span className="font-mono font-bold text-slate-700">SSK-REQ-2026-1042</span>) to view real-time mill fulfillment and payment status.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Order Reference ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                      placeholder="e.g. SSK-REQ-2026-1042"
                      className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-brand-amber focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Registered Mobile * <span className="text-[10px] text-amber-800 font-normal lowercase">(for privacy)</span>
                  </label>
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-amber focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-slate text-white text-xs font-bold hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <SearchIcon size={14} />
                  <span>{loading ? 'Verifying Mill Ledger...' : 'Verify & Track'}</span>
                </button>

                {/* Quick Demo Pre-seed Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Demo Orders:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('SSK-REQ-2026-1042', '9840123456')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono font-bold rounded-lg border border-amber-200 transition cursor-pointer"
                    title="Under Review"
                  >
                    #1042 (In Review)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('SSK-REQ-2026-7810', '9840123456')}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-mono font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                    title="Awaiting Payment (UPI QR)"
                  >
                    #7810 (UPI Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('SSK-REQ-2026-8942', '9789012345')}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-mono font-bold rounded-lg border border-blue-200 transition cursor-pointer"
                    title="Dispatched with AWB"
                  >
                    #8942 (Dispatched)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-brand-amber rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Retrieving mill extraction batch & dispatch timeline...</p>
          </div>
        )}

        {/* Order Not Found State */}
        {!loading && hasSearched && !order && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md mx-auto my-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center mx-auto text-xl font-black">
              🔒
            </div>
            <h2 className="text-base font-black text-slate-800">Order Verification Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We could not verify an order matching Reference <span className="font-mono font-bold text-slate-700">#{searchRef}</span> and the provided mobile number.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              For customer privacy, both the Order Reference and the 10-digit registered mobile number must match your order record exactly. Customer address and payment details are never exposed.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Inquire on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => handleQuickDemoClick('SSK-REQ-2026-1042', '9840123456')}
                className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition"
              >
                Load Sample (#1042)
              </button>
            </div>
          </div>
        )}

        {/* Active Order Details */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Top Order Status Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fulfillment Request
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      Tenkasi Mill Direct
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-brand-slate font-mono">
                    #{order.orderNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted: {order.orderDate}</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs border">
                    {order.status === 'REQUESTED' && (
                      <span className="bg-amber-100 text-amber-900 border-amber-200 px-3 py-1 rounded-full">
                        ⏳ Under Review by Mill
                      </span>
                    )}
                    {order.status === 'UNDER_REVIEW' && (
                      <span className="bg-amber-100 text-amber-900 border-amber-200 px-3 py-1 rounded-full">
                        🔍 Mill Desk Verification
                      </span>
                    )}
                    {order.status === 'AWAITING_PAYMENT' && (
                      <span className="bg-emerald-100 text-emerald-900 border-emerald-300 px-3 py-1 rounded-full animate-pulse">
                        📱 Awaiting UPI QR Payment
                      </span>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <span className="bg-emerald-100 text-brand-green border-emerald-300 px-3 py-1 rounded-full">
                        ✓ Order Confirmed
                      </span>
                    )}
                    {order.status === 'PROCESSING' && (
                      <span className="bg-blue-100 text-blue-900 border-blue-200 px-3 py-1 rounded-full">
                        🌿 Wood Pressing & Bottling
                      </span>
                    )}
                    {order.status === 'DISPATCHED' && (
                      <span className="bg-purple-100 text-purple-900 border-purple-200 px-3 py-1 rounded-full">
                        🚚 Dispatched with Courier
                      </span>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="bg-emerald-100 text-brand-green border-emerald-300 px-3 py-1 rounded-full">
                        🎉 Delivered
                      </span>
                    )}
                    {order.status === 'CANCELLED' && (
                      <span className="bg-red-100 text-red-900 border-red-200 px-3 py-1 rounded-full">
                        ✕ Cancelled
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Estimated Delivery: <span className="text-brand-slate font-bold">{order.estimatedDeliveryDate}</span>
                  </p>
                </div>
              </div>

              {/* Courier Dispatch Alert (If Dispatched) */}
              {order.courier && order.awbNumber && (
                <div className="mt-5 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                      Dispatched Courier Partner & Tracking Docket
                    </span>
                    <p className="font-black text-purple-950 text-sm mt-0.5">
                      {order.courier} — <span className="font-mono text-purple-800">{order.awbNumber}</span>
                    </p>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      Your parcel has left our Tenkasi mill. You can track transit directly with the courier docket.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.awbNumber || '', 'awb')}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-purple-300 font-bold text-purple-900 hover:bg-purple-100 transition shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    {copiedField === 'awb' ? '✓ Copied AWB' : 'Copy AWB Docket'}
                  </button>
                </div>
              )}
            </div>

            {/* ─── DYNAMIC PAYMENT & STATUS SECTION ───────────────────────── */}

            {/* CASE 1: ORDER REQUEST UNDER REVIEW (UPI QR STRICTLY HIDDEN) */}
            {(order.status === 'REQUESTED' || (order.status === 'UNDER_REVIEW' && order.paymentStatus !== 'PAYMENT_REPORTED')) && (
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-3xl p-6 sm:p-8 shadow-card text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                    <InfoIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-950">
                      Step 2 in Progress: Mill Availability & Courier Review
                    </h3>
                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                      Our Tenkasi mill desk is verifying that pure cold-pressed oil from today's extraction batch is reserved for your order. We are also calculating the regional courier charge for PIN code <strong className="font-mono">{order.guestDetails?.pincode || order.shippingAddress.pincode}</strong> (estimated destination routing).
                    </p>
                  </div>
                </div>

                {/* Locked UPI QR Explainer */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <LockIcon size={16} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">
                      🔒 UPI QR Payment Locked Until Mill Approval & Customer Acceptance
                    </span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      To ensure you never pay for unavailable stock, UPI QR payment instructions and the exact payable total will be unlocked here only after you review and accept the mill's quotation. You will also receive a direct WhatsApp notification from our care desk.
                    </p>
                    <div className="pt-2">
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-green font-bold text-xs hover:underline"
                      >
                        <span>Need urgent delivery? Chat with mill desk on WhatsApp &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 1.5: AWAITING CUSTOMER ACCEPTANCE (QUOTATION READY) */}
            {order.status === 'AWAITING_CUSTOMER_ACCEPTANCE' && (
              <div className="bg-indigo-50/90 border-2 border-indigo-400 rounded-3xl p-6 sm:p-8 shadow-lg text-left space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-indigo-200">
                  <div>
                    <span className="text-[10px] font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-300">
                      {language === 'ta' ? 'விலைப்புள்ளி தயார்' : 'Delivery Quotation Ready for Review'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-brand-slate mt-2">
                      {language === 'ta'
                        ? 'ஆலை மதிப்பீடு: இறுதி கட்டணத்தை உறுதி செய்யவும்'
                        : 'Please Review & Accept Your Delivery Quotation'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {language === 'ta'
                        ? 'எங்கள் ஆலை குழுவினர் இருப்பு மற்றும் உங்கள் முகவரிக்கான கூரியர் கட்டணத்தை உறுதி செய்துள்ளனர். கட்டணத்தை சரிபார்த்து உறுதி செய்யவும்.'
                        : 'Our Tenkasi mill desk has confirmed fresh oil batch availability and calculated regional courier delivery charges for your doorstep. Review the breakdown below and choose an action.'}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 text-right shrink-0 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {language === 'ta' ? 'மொத்த தொகை' : 'Final Quoted Total'}
                    </span>
                    <span className="text-2xl font-black text-brand-slate font-mono">₹{order.total}</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {order.paymentPreference === 'COD' ? 'Mode: Cash on Delivery' : 'Mode: UPI QR Payment'}
                    </span>
                  </div>
                </div>

                {/* Quoted Amount Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-indigo-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Requested Items Subtotal:</span>
                    <span className="font-bold">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Regional Courier Delivery Fee:</span>
                    <span className="font-bold text-indigo-700">+₹{order.deliveryFee}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promotional Discount:</span>
                      <span className="font-bold">-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-brand-slate">
                    <span>Total Quoted Amount:</span>
                    <span className="text-brand-amber">₹{order.total}</span>
                  </div>
                </div>

                {/* Explicit Customer Acceptance Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={acceptingQuotation || decliningQuotation}
                    onClick={handleAcceptQuotation}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-green hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>✓</span>
                    <span>
                      {acceptingQuotation
                        ? 'Processing...'
                        : order.paymentPreference === 'UPI'
                        ? (language === 'ta' ? 'விலைப்புள்ளியை ஏற்கவும் (இருப்பு ஒதுக்கீடு)' : 'Accept Quotation (Reserve Stock)')
                        : (language === 'ta' ? 'விலைப்புள்ளியை ஏற்கவும் (COD உறுதி)' : 'Accept Delivery Quotation (Confirm COD)')}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={acceptingQuotation || decliningQuotation}
                    onClick={handleDeclineQuotation}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs transition cursor-pointer"
                  >
                    {decliningQuotation ? 'Cancelling...' : '✕ Decline Quotation / Cancel Request'}
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                  <p>
                    <strong>Customer Protection Guarantee:</strong> Stock is transactionally reserved upon quotation acceptance. Unverified UPI credentials and payment destinations are never exposed.
                  </p>
                </div>
              </div>
            )}

            {/* CASE 2: AWAITING PAYMENT (QUOTATION ACCEPTED - STOCK RESERVED) */}
            {order.status === 'AWAITING_PAYMENT' && order.paymentPreference === 'UPI' && (
              <div className="bg-white border-2 border-brand-amber rounded-3xl p-6 sm:p-8 shadow-lg text-left space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                      ✓ Stock Reserved in Mill Ledger
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-brand-slate mt-1.5">
                      {language === 'ta' ? 'கட்டணத்திற்கு காத்திருக்கிறது (இருப்பு ஒதுக்கப்பட்டுள்ளது)' : 'Awaiting Payment (Inventory Reserved)'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Courier charge of ₹{order.deliveryFee} accepted. Total payable: <strong className="text-brand-slate text-sm font-black">₹{order.total}</strong>.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Confirmed Total
                    </span>
                    <span className="text-2xl font-black text-brand-amber font-mono">₹{order.total}</span>
                  </div>
                </div>

                {/* Protection & Safeguard Notice: Unverified UPI Credentials Kept Safe */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <span className="font-bold text-amber-950">
                      {language === 'ta' ? 'கட்டண சரிபார்ப்பு பாதுகாப்பு அறிவிப்பு' : 'Customer Payment Protection Notice'} — <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">DEMO / NOT VERIFIED</span>
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    {language === 'ta'
                      ? 'உங்கள் ஆர்டருக்கான எண்ணெய் இருப்பு 24 மணி நேரத்திற்கு வெற்றிகரமாக ஒதுக்கப்பட்டுள்ளது. வணிக UPI கணக்கு சரிபார்ப்பிற்கு உட்பட்டுள்ளதால், இணையதளத்தில் போலி QR குறியீடு அல்லது கணக்கு விவரங்கள் காட்டப்படாது.'
                      : 'Inventory for your wood-pressed oil has been transactionally reserved for 24 hours. Because the merchant UPI account is currently pending formal business verification, unverified payment details or QR codes are strictly suppressed to protect your funds.'}
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200/60">
                    📞 Our Tenkasi mill desk will contact your registered WhatsApp mobile (<span className="font-mono">{order.guestDetails?.phone || order.shippingAddress.phone}</span>) directly with verified payment instructions.
                  </p>
                </div>

                {/* UTR Reference Submission Form: Gated by Payment Instructions Delivery */}
                {order.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT' ? (
                  <form onSubmit={handleSubmitUtr} className="pt-2 border-t border-amber-100 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <span>✓</span>
                      <span>
                        {language === 'ta'
                          ? 'கட்டண விவரங்கள் வழங்கப்பட்டுள்ளன. பணப் பரிமாற்றம் செய்த பின் குறிப்பு எண்ணை பதிவு செய்யவும்:'
                          : 'Payment instructions have been delivered. Enter your transaction reference below:'}
                      </span>
                    </div>
                    <label htmlFor="customer-utr-input" className="block text-xs font-bold text-slate-700">
                      {language === 'ta' ? 'UPI பரிவர்த்தனை குறிப்பு எண் (UTR / Ref No.):' : 'Submit UPI Transaction Reference (UTR / 12-Digit Ref):'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="customer-utr-input"
                        type="text"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value.toUpperCase())}
                        placeholder="e.g. 202611099876 or UPI Ref"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs uppercase focus:ring-2 focus:ring-brand-amber focus:border-brand-amber outline-none transition"
                        disabled={submittingUtr}
                      />
                      <button
                        type="submit"
                        disabled={submittingUtr || !utrInput.trim()}
                        className="px-5 py-2.5 bg-brand-amber hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {submittingUtr ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <span>⚡</span>
                            <span>{language === 'ta' ? 'கட்டணத்தை பதிவு செய்' : 'Submit Payment Proof'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'ta'
                        ? 'குறிப்பு: சமர்ப்பிக்கப்பட்ட UTR எண் எங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்பட்ட பிறகுதான் ஆர்டர் உறுதி செய்யப்படும்.'
                        : 'Note: Submitted UTR is reconciled against mill bank account credit before order is confirmed for dispatch.'}
                    </p>
                  </form>
                ) : (
                  <div className="pt-2 border-t border-amber-100 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <span>⏳</span>
                    <span>
                      {language === 'ta'
                        ? 'கட்டண விவரங்கள் சரிபார்க்கப்பட்டு உங்கள் மொபைலுக்கு அனுப்பப்படும் வரை காத்திருக்கவும். அதன் பிறகு UTR எண்ணை இங்கு சமர்ப்பிக்கலாம்.'
                        : 'Awaiting Payment Instructions: Official payment instructions will be communicated directly to your mobile. You will be able to submit your transaction reference once instructions are issued.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CASE 3: PAYMENT REPORTED (AWAITING MILL VERIFICATION) */}
            {order.paymentStatus === 'PAYMENT_REPORTED' && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-card text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon size={20} className="text-brand-green shrink-0" />
                  <h3 className="text-base font-black text-emerald-950">
                    Payment Proof Received (UTR: {order.customerUtrNumber || 'Logged'})
                  </h3>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Thank you! Your UPI reference number has been received. Our Tenkasi accounts desk is reconciling the bank credit. Your oil bottles are already allocated for bottling and packaging.
                </p>
              </div>
            )}

            {/* CASE 4: CASH ON DELIVERY CONFIRMATION */}
            {order.paymentPreference === 'COD' && order.status !== 'REQUESTED' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-card text-left space-y-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Payment Mode: Cash on Delivery
                </span>
                <h3 className="text-base font-black text-brand-slate">
                  Doorstep Cash Collection: ₹{order.total}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your order is approved for Cash on Delivery. Please keep exact cash of ₹{order.total} ready when the courier delivery agent arrives at your door.
                </p>
              </div>
            )}

            {/* CASE 5: UPI PAYMENT VERIFIED & CONFIRMED */}
            {order.paymentPreference === 'UPI' && order.paymentStatus === 'VERIFIED' && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-card text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon size={20} className="text-brand-green shrink-0" />
                  <h3 className="text-base font-black text-emerald-950">
                    UPI Payment Verified & Confirmed
                  </h3>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Your UPI payment has been verified by our Tenkasi mill accounts desk. {order.customerUtrNumber ? `(Bank Ref: ${order.customerUtrNumber})` : ''} Your pure cold-pressed oil order is confirmed and scheduled for fresh wood-pressed extraction and dispatch.
                </p>
              </div>
            )}

            {/* Multi-Step Fulfillment Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card">
              <h2 className="text-sm font-black text-brand-slate uppercase tracking-wider pb-4 border-b border-slate-100">
                {language === 'ta' ? 'செக்கு முதல் இல்லம் வரை (Fulfillment Timeline)' : 'Extraction to Doorstep Timeline'}
              </h2>

              <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
                {order.trackingHistory.map((step, idx) => (
                  <div key={idx} className="relative z-10 flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        step.completed
                          ? 'bg-brand-green text-white shadow-xs'
                          : step.current
                          ? 'bg-brand-amber text-white ring-4 ring-amber-100 shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3 className={`font-black text-sm ${step.current ? 'text-amber-900' : 'text-slate-800'}`}>
                          {language === 'ta' ? step.titleTa : step.title}
                        </h3>
                        {step.timestamp && (
                          <span className="text-[11px] text-slate-400 font-medium">{step.timestamp}</span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {language === 'ta' ? step.subtitleTa : step.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination & Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card text-xs space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Delivery Destination (டெலிவரி முகவரி)
                </span>
                <p className="font-black text-sm text-slate-900">
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
                  Ph: +91 {order.guestDetails?.phone || order.shippingAddress.phone}
                </p>
              </div>

              {/* Order Cost Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card text-xs space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Pricing & Settlement
                </span>
                <div className="space-y-1.5 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Oils Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courier Delivery Fee:</span>
                    <span className="font-bold text-slate-800">
                      {order.isDeliveryFeeConfirmed ? `₹${order.deliveryFee}` : 'Pending Confirmation'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-black text-sm text-brand-slate">
                    <span>Total Amount:</span>
                    <span className="font-mono text-base text-brand-amber">₹{order.total}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-[11px]">
                    <span>Payment Mode:</span>
                    <span className="font-bold text-slate-700">{order.paymentPreference}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Payment Status:</span>
                    <span className="font-bold text-brand-green">{order.paymentStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Products Item List */}
            <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-3">
                Reserved Wood-Pressed Oils ({order.items.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((it) => (
                  <div key={it.id} className="p-3 sm:p-4 flex items-center justify-between bg-white hover:bg-slate-50/50 transition">
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

            {/* Tenkasi Customer Care Desk Card */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">Need Direct Help With Your Order?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Helpline: +91 9994072837 <span className="text-[10px] text-amber-400">(Demonstration Placeholder — Not Verified)</span> or send a WhatsApp message.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  WhatsApp Care
                </a>
                <a
                  href="tel:+919994072837"
                  className="px-4 py-2 bg-brand-amber hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Call +91 9994072837
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
