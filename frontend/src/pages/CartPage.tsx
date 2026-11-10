import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { ShoppingBagIcon, TrashIcon, CheckCircleIcon, SparklesIcon, TruckIcon } from '../components/common/Icons';
import { MOCK_COUPONS } from '../mock';

export const CartPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const {
    items,
    appliedCoupon,
    priceNotices,
    acceptPriceChange,
    dismissPriceNotice,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    getItemCount,
    getSubtotal,
    getDiscount,
    getTax,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax();
  const estimatedPayable = Math.max(0, subtotal - discount);
  const itemCount = getItemCount();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      addToast({ type: 'success', title: 'Coupon Applied', message: res.message });
      setCouponCode('');
    } else {
      addToast({ type: 'error', title: 'Coupon Error', message: res.message });
    }
  };

  const handleApplyQuickCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      addToast({ type: 'success', title: 'Coupon Applied', message: res.message });
    }
  };

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-brand-slate transition">
            Home <span className="text-slate-400 font-tamil">(முகப்பு)</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">
            Harvest Basket <span className="font-tamil">(கூடை)</span>
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-baseline justify-between pb-4 border-b border-surface-border mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-slate tracking-tight">
              {language === 'ta' ? 'உங்கள் எண்ணெய் கூடை' : 'Your Harvest Basket'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <Link to="/shop" className="text-xs font-bold text-amber-700 hover:underline hidden sm:block">
            + Add More Oils
          </Link>
        </div>

        {/* Price Change Notifications (If any item price revised) */}
        {priceNotices.length > 0 && (
          <div className="mb-6 space-y-2">
            {priceNotices.map((notice) => (
              <div
                key={notice.itemId}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    ⚠️ Price Revision Notice: {notice.name}
                  </span>
                  <p className="text-amber-800">
                    The price for this oil changed from <span className="line-through">₹{notice.oldPrice}</span> to{' '}
                    <span className="font-bold font-mono text-slate-900">₹{notice.newPrice}</span>.
                    Please confirm acceptance of the revised price before proceeding.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => acceptPriceChange(notice.itemId)}
                    className="px-3 py-1.5 bg-brand-slate hover:bg-slate-800 text-white font-bold rounded-lg transition"
                  >
                    Accept New Price
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissPriceNotice(notice.itemId)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Basket State */
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center border border-surface-border max-w-lg mx-auto my-8 shadow-card">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center mx-auto text-3xl mb-4">
              🧺
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {language === 'ta' ? 'உங்கள் கூடை காலியாக உள்ளது' : 'Your Harvest Basket is Empty'}
            </h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              {language === 'ta'
                ? 'தென்காசி மரச்செக்கில் ஆட்டப்பட்ட பாரம்பரிய கடலை, நல்லெண்ணெய் அல்லது தேங்காய் எண்ணெய்களை தேர்வு செய்யுங்கள்.'
                : 'Experience traditional cold-pressed wellness with our pure, unrefined oils freshly bottled at our Tenkasi mill.'}
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-slate text-white text-xs font-bold shadow-md hover:bg-slate-800 transition cursor-pointer"
            >
              <ShoppingBagIcon size={16} />
              <span>Explore Pure Oils (அங்காடி)</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Informational Banner on Request Workflow */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <TruckIcon size={18} className="text-brand-amber" />
                  <span>
                    {language === 'ta'
                      ? 'ஆலை நேரடி விநியோகம் — கோரிக்கை முறை'
                      : 'Request-Based Ordering — Direct Tenkasi Mill Dispatch'}
                  </span>
                </div>
                <p className="text-amber-900/80 leading-relaxed text-[11px]">
                  {language === 'ta'
                    ? 'உங்கள் ஆர்டர் கோரிக்கை பெறப்பட்டவுடன் இருப்பு மற்றும் உங்கள் பகுதிக்குரிய சரியான கூரியர் கட்டணம் சரிபார்க்கப்பட்டு WhatsApp வழியாக பகிரப்படும்.'
                    : 'Submit your purchase request without immediate online payment. Our mill desk verifies fresh batch stock and applies exact courier charges before requesting payment.'}
                </p>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-surface-border shadow-xs overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/50 transition">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/products/${item.slug}`}>
                            <h3 className="font-black text-sm sm:text-base text-brand-slate hover:text-brand-amber transition-colors truncate">
                              {language === 'ta' ? item.nameTa : item.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-amber-700 font-tamil font-semibold">{item.nameTa}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {item.volume}
                          </span>
                        </div>

                        {/* Trash Action */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          aria-label="Remove item"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-slate-800 tnum">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-base text-brand-slate">
                            ₹{item.price * item.quantity}
                          </div>
                          <div className="text-[10px] text-slate-400">₹{item.price} each</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Promo Chips Available */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SparklesIcon size={16} className="text-brand-amber" />
                  Available Mill Coupons:
                </span>
                <div className="flex flex-wrap gap-2">
                  {MOCK_COUPONS.map((cp) => (
                    <button
                      key={cp.code}
                      type="button"
                      onClick={() => handleApplyQuickCoupon(cp.code)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                    >
                      {cp.code} (-₹{cp.discountAmount})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Action */}
            <div className="space-y-4">
              {/* Promo Code Input Box */}
              <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Have a Promo Code?
                </h3>
                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-emerald-900">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">₹{appliedCoupon.discountAmount} discount applied</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. NATURAL50"
                      className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-xs uppercase font-mono border border-slate-200 focus:outline-none focus:border-brand-slate"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-slate text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className={`text-[11px] ${couponMessage.isError ? 'text-rose-600' : 'text-brand-green font-medium'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Price Calculation Card */}
              <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-card space-y-4">
                <div className="flex items-baseline justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-sm text-brand-slate">
                    {language === 'ta' ? 'மதிப்பீட்டு விபரம்' : 'Estimated Summary'}
                  </h3>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                    Request Mode
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal ({itemCount} {itemCount === 1 ? 'bottle' : 'bottles'})</span>
                    <span className="font-bold text-slate-900">₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-brand-green font-semibold">
                      <span>Promo Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start text-slate-600">
                    <div>
                      <span>Courier / Delivery Fee</span>
                      <span className="text-[10px] text-slate-400 block">Based on weight & pincode</span>
                    </div>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      Confirmed by Mill Desk
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Taxes & GST (5% Included)</span>
                    <span>₹{tax}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <span className="font-black text-base text-brand-slate block">Estimated Subtotal</span>
                      <span className="text-[10px] text-slate-400">Exclusive of courier charges</span>
                    </div>
                    <span className="font-black text-2xl text-brand-slate">₹{estimatedPayable}</span>
                  </div>
                </div>

                {/* Primary Proceed CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout/address')}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-amber text-white font-black text-sm shadow-md hover:bg-amber-600 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Customer Details</span>
                  <span>→</span>
                </button>

                <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
                  <p className="flex items-center justify-center gap-1 text-brand-green font-semibold">
                    <CheckCircleIcon size={12} />
                    Direct Tenkasi Mill Dispatch • FSSAI Certified
                  </p>
                  <p>Guaranteed 100% genuine unrefined cold-pressed oils.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
