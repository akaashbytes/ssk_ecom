import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAppStore } from '../stores/useAppStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { TruckIcon } from '../components/common/Icons';

export const AccountDashboardPage: React.FC = () => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, addresses } = useAppStore();

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const orders = await orderService.getCustomerOrders();
      const active = orders.find((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
      if (active) setActiveOrder(active);
    };
    load();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogoutModal(false);
    navigate('/');
  };

  if (!currentUser) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl mb-4">
            👤
          </div>
          <h2 className="text-xl font-bold text-slate-800">You are not signed in</h2>
          <p className="text-xs text-slate-500 mt-1">
            SSK Natural Gold operates on a lightweight, request-based purchasing model with zero mandatory account creation.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/track"
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-slate text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 transition"
            >
              Track Order by Reference #
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Staff / Admin Sign In
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
        {/* Profile Card Header (Matching Stitch Screen b7d7405b...) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-slate text-white flex items-center justify-center font-black text-2xl shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-brand-slate truncate">
                  {currentUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Ph: {currentUser.phone}</p>
              <p className="text-[11px] text-slate-400">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Active Order Banner (If Any) */}
        {activeOrder && (
          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200/70 shadow-xs mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-amber animate-ping" />
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Live Dispatch Tracking
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                #{activeOrder.orderNumber}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium">
              Your order containing {activeOrder.items.length} cold-pressed oil bottles has been dispatched via{' '}
              <strong className="text-slate-900">{activeOrder.courier}</strong>.
            </p>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-brand-green font-bold flex items-center gap-1">
                <TruckIcon size={14} />
                Expected: {activeOrder.estimatedDeliveryDate}
              </span>
              <Link
                to={`/orders/${activeOrder.orderNumber}`}
                className="px-3 py-1.5 rounded-lg bg-brand-slate text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Track Live Status →
              </Link>
            </div>
          </div>
        )}

        {/* Account Menu List */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card divide-y divide-slate-100 overflow-hidden mb-6">
          <Link
            to="/account/orders"
            className="p-5 flex items-center justify-between hover:bg-slate-50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-amber flex items-center justify-center text-lg">
                📦
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-slate group-hover:text-brand-amber transition">
                  {language === 'ta' ? 'எனது ஆர்டர்கள்' : 'My Orders'}
                </h3>
                <p className="text-xs text-slate-400">View past purchase invoices and status</p>
              </div>
            </div>
            <span className="text-slate-400 text-sm font-bold">→</span>
          </Link>

          <Link
            to="/checkout/address"
            className="p-5 flex items-center justify-between hover:bg-slate-50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center text-lg">
                📍
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-slate group-hover:text-brand-amber transition">
                  {language === 'ta' ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Saved Delivery Addresses'}
                </h3>
                <p className="text-xs text-slate-400">{addresses.length} Addresses available</p>
              </div>
            </div>
            <span className="text-slate-400 text-sm font-bold">→</span>
          </Link>

          <Link
            to="/contact"
            className="p-5 flex items-center justify-between hover:bg-slate-50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                📞
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-slate group-hover:text-brand-amber transition">
                  {language === 'ta' ? 'ஆலை உதவி மையம்' : 'Tenkasi Mill Customer Care'}
                </h3>
                <p className="text-xs text-slate-400">+91 9994072837 • support@ssknaturalgold.com</p>
              </div>
            </div>
            <span className="text-slate-400 text-sm font-bold">→</span>
          </Link>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition cursor-pointer border border-rose-200"
        >
          {language === 'ta' ? 'கணக்கிலிருந்து வெளியேறு (Sign Out)' : 'Sign Out of Account'}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowLogoutModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-10 text-center space-y-4">
            <h3 className="font-black text-base text-slate-900">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to sign out from SSK Natural Gold on this device?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};
