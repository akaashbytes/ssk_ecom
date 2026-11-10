import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { TruckIcon } from '../components/common/Icons';

export const OrderHistoryPage: React.FC = () => {
  const { language } = useLanguageStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await orderService.getCustomerOrders();
      setOrders(data);
      setLoading(false);
    };
    load();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (filter === 'delivered') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-brand-slate transition">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/account" className="hover:text-brand-slate transition">
            Account
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">
            Order History <span className="font-tamil">(ஆர்டர் வரலாறு)</span>
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
          <h1 className="text-2xl font-black text-brand-slate tracking-tight">
            {language === 'ta' ? 'எனது ஆர்டர் வரலாறு' : 'My Orders'}
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {orders.length} Total Orders
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              filter === 'all'
                ? 'bg-brand-slate text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              filter === 'active'
                ? 'bg-brand-slate text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Active Dispatches ({orders.filter((o) => o.status !== 'DELIVERED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              filter === 'delivered'
                ? 'bg-brand-slate text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Delivered ({orders.filter((o) => o.status === 'DELIVERED').length})
          </button>
        </div>

        {/* Order Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-36" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-sm font-bold text-slate-700">No orders found in this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-5 border border-surface-border shadow-card space-y-4"
              >
                {/* Top Row: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="font-mono font-black text-sm text-brand-slate">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-slate-400 ml-2">{ord.orderDate}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] w-fit ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-brand-green'
                        : ord.status === 'DISPATCHED'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    <TruckIcon size={12} />
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Items Row */}
                <div className="flex items-center gap-4 overflow-x-auto py-1">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <img src={it.image} alt={it.name} className="w-12 h-12 object-contain bg-white rounded p-1" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 max-w-[130px] truncate">{it.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {it.volume} • Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row: Total & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">
                      {ord.paymentStatus === 'VERIFIED' ? 'Total Paid: ' : 'Order Total: '}
                    </span>
                    <span className="font-black text-base text-brand-slate">₹{ord.total}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({ord.paymentMethod})</span>
                    {ord.paymentStatus !== 'VERIFIED' && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {ord.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/orders/${ord.orderNumber}`}
                      className="px-4 py-2 rounded-lg bg-brand-slate text-white font-bold hover:bg-slate-800 transition"
                    >
                      Track Order Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => alert(`Invoice downloaded for #${ord.orderNumber}`)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                    >
                      PDF Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
