import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { orderService } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { useToastStore } from '../stores/useToastStore';

interface LifecycleStageConfig {
  status: OrderStatus;
  label: string;
  labelTa: string;
  desc: string;
  badgeClass: string;
  borderClass: string;
  icon: string;
}

const LIFECYCLE_STAGES: LifecycleStageConfig[] = [
  {
    status: 'REQUESTED',
    label: 'New Requests',
    labelTa: 'புதிய கோரிக்கைகள்',
    desc: 'Unreviewed customer requests',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    borderClass: 'border-l-4 border-l-amber-500',
    icon: '📥',
  },
  {
    status: 'UNDER_REVIEW',
    label: 'Under Review',
    labelTa: 'ஆய்வில் உள்ளது',
    desc: 'Courier calculation or UTR review',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    borderClass: 'border-l-4 border-l-blue-500',
    icon: '🔍',
  },
  {
    status: 'AWAITING_CUSTOMER_ACCEPTANCE',
    label: 'Awaiting Acceptance',
    labelTa: 'வாடிக்கையாளர் ஏற்பு',
    desc: 'Quoted total sent to customer',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    borderClass: 'border-l-4 border-l-indigo-500',
    icon: '⏳',
  },
  {
    status: 'AWAITING_PAYMENT',
    label: 'Awaiting Payment',
    labelTa: 'கட்டணம் நிலுவை',
    desc: 'UPI QR shared; customer to pay',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    borderClass: 'border-l-4 border-l-purple-500',
    icon: '📱',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed Orders',
    labelTa: 'உறுதி செய்யப்பட்டவை',
    desc: 'Payment verified or COD confirmed',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderClass: 'border-l-4 border-l-emerald-600',
    icon: '✅',
  },
  {
    status: 'PROCESSING',
    label: 'Processing / Bottling',
    labelTa: 'செக்கில் பிழிதல் & பேக்கிங்',
    desc: 'Fresh wood press & tamper sealing',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    borderClass: 'border-l-4 border-l-amber-500',
    icon: '🫙',
  },
  {
    status: 'DISPATCHED',
    label: 'Dispatched',
    labelTa: 'கூரியரில் அனுப்பப்பட்டது',
    desc: 'In transit with courier & AWB docket',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    borderClass: 'border-l-4 border-l-cyan-600',
    icon: '🚚',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    labelTa: 'டெலிவரி செய்யப்பட்டது',
    desc: 'Successfully delivered to customer',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    borderClass: 'border-l-4 border-l-slate-700',
    icon: '📦',
  },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickOrderModalOpen, setQuickOrderModalOpen] = useState(false);

  // Quick Counter Order Form State
  const [quickForm, setQuickForm] = useState({
    customerName: '',
    phone: '',
    city: 'Tenkasi',
    category: 'sesame',
    volume: '15 L Commercial Tin (Sesame Oil)',
    price: 6950,
  });

  const loadOrders = async () => {
    setLoading(true);
    const data = await orderService.getCustomerOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreateCounterOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.customerName || !quickForm.phone) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Name and Phone are required.' });
      return;
    }

    await orderService.placeOrder({
      items: [
        {
          id: `co-${Date.now()}`,
          productId: quickForm.category === 'sesame' ? 'prod-sesame' : 'prod-groundnut',
          variantId: quickForm.category === 'sesame' ? 'ses-15l' : 'gn-15l',
          slug: quickForm.category === 'sesame' ? 'pure-wood-pressed-sesame-oil' : 'traditional-groundnut-oil',
          name: quickForm.volume,
          nameTa: quickForm.category === 'sesame' ? 'நல்லெண்ணெய் டின்' : 'கடலை எண்ணெய் டின்',
          category: quickForm.category as any,
          volume: '15 L Commercial Tin',
          price: quickForm.price,
          mrp: quickForm.price,
          quantity: 1,
          image: '',
          stock: 20,
        },
      ],
      subtotal: quickForm.price,
      discount: 0,
      deliveryFee: 0,
      tax: Math.round(quickForm.price * 0.05),
      total: quickForm.price,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName: quickForm.customerName,
        phone: quickForm.phone,
        pincode: '627811',
        addressLine1: 'Direct Counter Dispatch (Tenkasi Mill Desk)',
        city: quickForm.city,
        state: 'Tamil Nadu',
        isDefault: true,
        addressType: 'COMMERCIAL',
      },
      paymentMethod: 'UPI',
    });

    await loadOrders();
    setQuickOrderModalOpen(false);
    setQuickForm({
      customerName: '',
      phone: '',
      city: 'Tenkasi',
      category: 'sesame',
      volume: '15 L Commercial Tin (Sesame Oil)',
      price: 6950,
    });

    addToast({
      type: 'success',
      title: 'Counter Request Created',
      message: `Commercial counter order logged for ${quickForm.customerName} (₹${quickForm.price}).`,
    });
  };

  // Status counts
  const stageCounts = LIFECYCLE_STAGES.reduce<Record<OrderStatus, number>>((acc, s) => {
    acc[s.status] = orders.filter((o) => o.status === s.status).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  // Special alert counts
  const pendingUtrReviewCount = orders.filter((o) => o.paymentStatus === 'PAYMENT_REPORTED').length;
  const newRequestsCount = stageCounts['REQUESTED'] || 0;
  const activeProcessingCount = (stageCounts['CONFIRMED'] || 0) + (stageCounts['PROCESSING'] || 0);
  const activeDispatchesCount = stageCounts['DISPATCHED'] || 0;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Operations & Request Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Tenkasi Mill Dispatch Desk • Simplified Request-Based Purchasing Pipeline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await orderService.resetOrdersToSeed();
                await loadOrders();
                addToast({
                  type: 'info',
                  title: 'Demo Data Refreshed',
                  message: 'Restored standard 8-stage lifecycle demo orders.',
                });
              }}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
            >
              🔄 Refresh Demo Data
            </button>
            <button
              type="button"
              onClick={() => setQuickOrderModalOpen(true)}
              className="px-4 py-2 bg-brand-amber hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>+ New Commercial Request</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner for Pending UTR Verifications */}
        {pendingUtrReviewCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-extrabold text-amber-900">
                  {pendingUtrReviewCount} Customer UPI Payment{pendingUtrReviewCount > 1 ? 's' : ''} Awaiting Bank Credit Verification!
                </p>
                <p className="text-amber-800">
                  Customers have transferred funds and entered transaction UTRs. Please verify your mill bank account and confirm.
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders?payment=PAYMENT_REPORTED"
              className="px-3.5 py-1.5 bg-brand-amber hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              Verify UPI Payments →
            </Link>
          </div>
        )}

        {/* 8 Operational Lifecycle Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-brand-slate uppercase tracking-wider flex items-center gap-2">
              <span>Operational Lifecycle Pipeline</span>
              <span className="text-[11px] font-bold text-slate-400 lowercase font-mono">
                ({orders.length} total requests)
              </span>
            </h2>
            <Link to="/admin/orders" className="text-xs font-bold text-amber-700 hover:underline">
              View All in Order Desk →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {LIFECYCLE_STAGES.map((stage) => {
              const count = stageCounts[stage.status] || 0;
              return (
                <Link
                  key={stage.status}
                  to={`/admin/orders?status=${stage.status}`}
                  className={`bg-white p-4 rounded-2xl border border-surface-border shadow-card hover:shadow-md transition group relative overflow-hidden flex flex-col justify-between ${stage.borderClass}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{stage.icon}</span>
                      <span
                        className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border ${stage.badgeClass}`}
                      >
                        {count} {count === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                    <div className="pt-2">
                      <h3 className="font-black text-sm text-brand-slate group-hover:text-brand-amber transition">
                        {stage.label}
                      </h3>
                      <p className="text-[11px] font-tamil font-bold text-slate-500">
                        {stage.labelTa}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{stage.desc}</span>
                    <span className="text-slate-300 group-hover:text-brand-amber group-hover:translate-x-0.5 transition font-bold">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Operational Highlights & Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Metrics Card */}
          <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
              Fulfillment Highlights
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">New Requests</span>
                <span className="text-xl font-black text-brand-slate font-mono">{newRequestsCount}</span>
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Need review</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Active Bottling</span>
                <span className="text-xl font-black text-brand-slate font-mono">{activeProcessingCount}</span>
                <span className="text-[10px] text-brand-green font-bold block mt-0.5">Mill floor</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Courier In-Transit</span>
                <span className="text-xl font-black text-brand-slate font-mono">{activeDispatchesCount}</span>
                <span className="text-[10px] text-blue-700 font-bold block mt-0.5">AWB tracking</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Delivered</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {stageCounts['DELIVERED'] || 0}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Completed</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
              Quick Administrative Actions
            </h3>
            <div className="space-y-2 text-xs font-bold">
              <Link
                to="/admin/orders?status=REQUESTED"
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border border-amber-200/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📋</span>
                  <span>Review Incoming Requests</span>
                </div>
                <span className="font-mono text-xs">{newRequestsCount}</span>
              </Link>

              <Link
                to="/admin/orders?payment=PAYMENT_REPORTED"
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🏦</span>
                  <span>Verify Bank UPI Credits</span>
                </div>
                <span className="font-mono text-xs">{pendingUtrReviewCount}</span>
              </Link>

              <Link
                to="/admin/products"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🫙</span>
                  <span>Update Stock & Variant Prices</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">⚙️</span>
                  <span>Configure UPI & Courier Settings</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Demonstration Notice Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-card space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  Request-Based Pipeline
                </span>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Phase 3
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mt-1">Lightweight Human-in-the-Loop</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Orders remain in <strong>REQUESTED</strong> until the admin confirms stock availability and enters regional courier fees. Customers only pay after the final amount is confirmed.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tenkasi Mill Desk v2.0</span>
              <span className="text-emerald-400 font-bold">● Active Session</span>
            </div>
          </div>
        </div>

        {/* Recent Order Requests Queue */}
        <div className="p-6 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Customer Requests & Orders</h3>
              <p className="text-xs text-slate-400">
                Click "Review Request" to calculate courier fee, verify UPI payment, or mark courier dispatch
              </p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-amber-700 hover:underline">
              Open Full Order Management Desk →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No orders found in local storage.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Customer Details</th>
                    <th className="py-3 px-3">Requested Items</th>
                    <th className="py-3 px-3">Payable Amount</th>
                    <th className="py-3 px-3">Lifecycle Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-brand-slate">
                        #{ord.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {ord.orderDate}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">
                          {ord.guestDetails?.fullName || ord.shippingAddress.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {ord.guestDetails?.city || ord.shippingAddress.city} • PIN{' '}
                          {ord.guestDetails?.pincode || ord.shippingAddress.pincode}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          +91 {ord.guestDetails?.phone || ord.shippingAddress.phone}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5 max-w-xs">
                          {ord.items.map((it) => (
                            <p key={it.id} className="text-slate-800 truncate">
                              <span className="font-semibold">{it.name}</span>{' '}
                              <span className="text-slate-500 text-[11px]">
                                ({it.volume} × {it.quantity})
                              </span>
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 font-mono text-sm">
                          ₹{ord.total}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                              ord.paymentPreference === 'COD'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ord.paymentPreference || ord.paymentMethod}
                          </span>
                          {ord.paymentStatus === 'PAYMENT_REPORTED' && (
                            <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-blue-100 text-blue-800 animate-pulse">
                              UTR Reported
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            ord.status === 'REQUESTED'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : ord.status === 'AWAITING_PAYMENT'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : ord.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : ord.status === 'PROCESSING'
                              ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                              : ord.status === 'DISPATCHED'
                              ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                              : ord.status === 'DELIVERED'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders?highlight=${ord.orderNumber}`)}
                          className="px-3 py-1.5 rounded-lg bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Review Request →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Manual Commercial Order Modal */}
      {quickOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setQuickOrderModalOpen(false)} />
          <form
            onSubmit={handleCreateCounterOrder}
            className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Direct Counter / B2B Order</h3>
              <button
                type="button"
                onClick={() => setQuickOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer / Enterprise Name *</label>
              <input
                type="text"
                required
                value={quickForm.customerName}
                onChange={(e) => setQuickForm({ ...quickForm, customerName: e.target.value })}
                placeholder="e.g. Sri Meenakshi Catering"
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                  placeholder="9840123456"
                  className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={quickForm.city}
                  onChange={(e) => setQuickForm({ ...quickForm, city: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Product Batch & Size</label>
              <select
                value={quickForm.volume}
                onChange={(e) => {
                  const val = e.target.value;
                  const isSesame = val.includes('Sesame');
                  setQuickForm({
                    ...quickForm,
                    volume: val,
                    category: isSesame ? 'sesame' : 'groundnut',
                    price: isSesame ? 6950 : 6750,
                  });
                }}
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-slate"
              >
                <option value="15 L Commercial Tin (Sesame Oil)">Pure Sesame Oil — 15 L Commercial Tin (₹6,950)</option>
                <option value="15 L Commercial Tin (Groundnut Oil)">Traditional Groundnut Oil — 15 L Commercial Tin (₹6,750)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickOrderModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-slate text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer"
              >
                Create Counter Order
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};
