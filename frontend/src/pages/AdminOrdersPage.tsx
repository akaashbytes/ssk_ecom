import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { orderService } from '../services/orderService';
import { settingsService, BusinessSettings } from '../services/settingsService';
import { Order } from '../types';
import { useToastStore } from '../stores/useToastStore';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const addToast = useToastStore((state) => state.addToast);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);

  // Filters
  const statusParam = searchParams.get('status') || 'all';
  const paymentParam = searchParams.get('payment') || 'all';
  const highlightParam = searchParams.get('highlight');

  // Selected Order for Review Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Review Drawer Form State
  const [courierFeeInput, setCourierFeeInput] = useState<number>(50);
  const [courierPartnerInput, setCourierPartnerInput] = useState<string>('The Professional Couriers');
  const [awbInput, setAwbInput] = useState<string>('');
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');

  const loadOrders = async () => {
    setLoading(true);
    const data = await orderService.getCustomerOrders();
    setOrders(data);
    setLoading(false);

    // If highlight parameter exists, open that order
    if (highlightParam) {
      const target = data.find(
        (o) => o.orderNumber.toUpperCase() === highlightParam.toUpperCase() || o.id === highlightParam
      );
      if (target) {
        openOrderDrawer(target);
      }
    }
  };

  useEffect(() => {
    loadOrders();
    settingsService.getSettings().then(setBusinessSettings).catch(() => setBusinessSettings(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightParam]);

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setCourierFeeInput(order.deliveryFee !== undefined && order.deliveryFee > 0 ? order.deliveryFee : 50);
    setCourierPartnerInput(order.courier || 'The Professional Couriers');
    setAwbInput(order.awbNumber || '');
    setAdminNotesInput(order.adminNotes || '');
  };

  const closeOrderDrawer = () => {
    setSelectedOrder(null);
    if (searchParams.get('highlight')) {
      searchParams.delete('highlight');
      setSearchParams(searchParams);
    }
  };

  // Status transitions
  const handleSendQuotation = async () => {
    if (!selectedOrder) return;
    const updated = await orderService.sendQuotationToCustomer(
      selectedOrder.id,
      Number(courierFeeInput),
      adminNotesInput
    );

    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'success',
        title: 'Quotation Sent to Customer',
        message: `Courier fee ₹${courierFeeInput} calculated. Total payable: ₹${updated.total}. Order moved to AWAITING_CUSTOMER_ACCEPTANCE.`,
      });
    }
  };

  const handleMoveToProcessing = async () => {
    if (!selectedOrder) return;
    const updated = await orderService.updateOrderStatus(selectedOrder.id, 'PROCESSING', {
      adminNotes: adminNotesInput,
    });

    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'info',
        title: 'Moved to Processing',
        message: `Order #${updated.orderNumber} is now in fresh wood pressing and tamper bottling.`,
      });
    }
  };

  const handleDispatchCourier = async () => {
    if (!selectedOrder) return;
    if (!awbInput.trim()) {
      addToast({ type: 'error', title: 'AWB Required', message: 'Please enter courier docket / AWB number.' });
      return;
    }

    const updated = await orderService.updateOrderStatus(selectedOrder.id, 'DISPATCHED', {
      courier: courierPartnerInput,
      awbNumber: awbInput.trim(),
      adminNotes: adminNotesInput,
    });

    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'success',
        title: 'Order Dispatched',
        message: `Handed over to ${courierPartnerInput} with AWB #${awbInput.trim()}.`,
      });
    }
  };

  // Requirement 2: Mark Order Delivered is independent from COD cash collection
  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;
    const updated = await orderService.updateOrderStatus(selectedOrder.id, 'DELIVERED', {
      adminNotes: adminNotesInput,
    });

    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'success',
        title: 'Order Marked Delivered',
        message: `Order #${updated.orderNumber} status changed to DELIVERED. COD collection must be confirmed independently if applicable.`,
      });
    }
  };

  // Requirement 2: Explicit Doorstep Cash Collection (COD only)
  const handleConfirmCashCollected = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.status === 'CANCELLED') {
      addToast({ type: 'error', title: 'Invalid Operation', message: 'Cannot collect cash for a cancelled order.' });
      return;
    }
    if (selectedOrder.paymentPreference !== 'COD') {
      addToast({ type: 'error', title: 'Invalid Operation', message: 'Cannot collect cash for UPI order.' });
      return;
    }
    const updated = await orderService.confirmCashCollected(selectedOrder.id);
    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'success',
        title: 'Doorstep Cash Collected',
        message: `Cash on Delivery ₹${updated.total} confirmed. Payment status changed to COD_COLLECTED.`,
      });
    }
  };
  if (false as boolean) {
    void handleConfirmCashCollected;
  }

  const handleVerifyUpiPayment = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.paymentPreference !== 'UPI') {
      addToast({ type: 'error', title: 'Invalid Operation', message: 'Cannot verify UPI payment on non-UPI order.' });
      return;
    }
    if (selectedOrder.status === 'CANCELLED') {
      addToast({ type: 'error', title: 'Invalid Operation', message: 'Cannot verify payment for a cancelled order.' });
      return;
    }
    if (selectedOrder.paymentStatus === 'VERIFIED') {
      addToast({ type: 'warning', title: 'Already Verified', message: 'Payment has already been verified for this order.' });
      return;
    }

    try {
      const updated = await orderService.verifyUpiPayment(
        selectedOrder.id,
        adminNotesInput || 'Bank credit confirmed in mill account'
      );
      if (updated) {
        setSelectedOrder(updated);
        await loadOrders();
        addToast({
          type: 'success',
          title: 'UPI Payment Verified',
          message: `Order #${updated.orderNumber} confirmed. Inventory converted to permanent deduction.`,
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: e.message || 'Failed to verify UPI payment.',
      });
    }
  };

  const handleRejectPaymentReport = async () => {
    if (!selectedOrder) return;
    const reason = prompt('Enter reason for rejecting reported payment reference (e.g. Bank credit not found):', 'Bank credit not found for reported UTR');
    if (!reason) return;

    try {
      const updated = await orderService.updateOrderStatus(selectedOrder.id, 'AWAITING_PAYMENT', {
        paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
        adminNotes: `Reported UTR rejected: ${reason}. Awaiting corrected payment reference.`,
      });
      if (updated) {
        setSelectedOrder(updated);
        await loadOrders();
        addToast({
          type: 'info',
          title: 'Payment Report Rejected',
          message: `Order #${updated.orderNumber} returned to Awaiting Payment. Customer may submit corrected UTR.`,
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: e.message || 'Failed to reject payment report.',
      });
    }
  };

  const handleSendPaymentInstructions = async () => {
    if (!selectedOrder) return;
    if (businessSettings && (!businessSettings.upiVerified || businessSettings.isDemoConfiguration)) {
      addToast({
        type: 'warning',
        title: 'UPI Verification Pending',
        message: 'Cannot issue payment instructions: Merchant UPI account is pending production verification in Business Settings.',
      });
      return;
    }
    const channel = prompt('Confirm manual communication channel used to deliver instructions (WHATSAPP, PHONE, EMAIL, SMS, IN_PERSON):', 'WHATSAPP');
    if (!channel) return;

    try {
      const updated = await orderService.updateOrderStatus(selectedOrder.id, 'AWAITING_PAYMENT', {
        paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
        deliveryChannel: channel.toUpperCase(),
        adminNotes: adminNotesInput || `Verified payment instructions manually delivered via ${channel.toUpperCase()}.`,
      });
      if (updated) {
        setSelectedOrder(updated);
        await loadOrders();
        addToast({
          type: 'success',
          title: 'Instructions Issued',
          message: `Payment instructions marked as sent via ${channel.toUpperCase()}.`,
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: e.message || 'Failed to issue payment instructions.',
      });
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Are you sure you want to cancel Order #${selectedOrder.orderNumber}?`)) return;

    const updated = await orderService.updateOrderStatus(selectedOrder.id, 'CANCELLED', {
      adminNotes: `Cancelled by Admin: ${adminNotesInput}`,
    });

    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'info',
        title: 'Order Cancelled',
        message: `Order #${updated.orderNumber} has been marked as Cancelled.`,
      });
    }
  };

  const handleSaveNotesOnly = async () => {
    if (!selectedOrder) return;
    const updated = await orderService.updateOrderStatus(selectedOrder.id, selectedOrder.status, {
      adminNotes: adminNotesInput,
    });
    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
      addToast({
        type: 'success',
        title: 'Notes Saved',
        message: 'Internal administrative remarks updated.',
      });
    }
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    // Search query matches Order Number, Customer Name, or Phone
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRef = o.orderNumber.toLowerCase().includes(q);
      const matchName = (o.guestDetails?.fullName || o.shippingAddress.fullName || '').toLowerCase().includes(q);
      const matchPhone = (o.guestDetails?.phone || o.shippingAddress.phone || '').includes(q);
      const matchCity = (o.guestDetails?.city || o.shippingAddress.city || '').toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchPhone && !matchCity) return false;
    }

    // Status Filter
    if (statusParam !== 'all' && o.status !== statusParam) {
      return false;
    }

    // Payment Filter
    if (paymentParam === 'UPI' && o.paymentPreference !== 'UPI') return false;
    if (paymentParam === 'COD' && o.paymentPreference !== 'COD') return false;
    if (paymentParam === 'PAYMENT_REPORTED' && o.paymentStatus !== 'PAYMENT_REPORTED') return false;

    return true;
  });

  const setStatusFilter = (val: string) => {
    if (val === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', val);
    }
    setSearchParams(searchParams);
  };

  const setPaymentFilter = (val: string) => {
    if (val === 'all') {
      searchParams.delete('payment');
    } else {
      searchParams.set('payment', val);
    }
    setSearchParams(searchParams);
  };

  // Calculated amount in review drawer
  const drawerSubtotal = selectedOrder ? selectedOrder.subtotal : 0;
  const drawerDiscount = selectedOrder ? selectedOrder.discount || 0 : 0;
  const drawerPayableTotal = Math.max(0, drawerSubtotal + Number(courierFeeInput) - drawerDiscount);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/dashboard" className="hover:text-slate-600">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Order Requests</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Order Fulfillment & Quotation Desk
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review customer purchase requests, calculate regional courier quotes, verify UPI credits, and manage dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadOrders}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>Refresh Orders</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const csvContent =
                  'OrderNumber,Customer,Phone,City,Status,PaymentMode,PaymentStatus,Total\n' +
                  orders
                    .map(
                      (o) =>
                        `"${o.orderNumber}","${o.guestDetails?.fullName || o.shippingAddress.fullName}","${
                          o.guestDetails?.phone || o.shippingAddress.phone
                        }","${o.guestDetails?.city || o.shippingAddress.city}","${o.status}","${
                          o.paymentPreference
                        }","${o.paymentStatus}",${o.total}`
                    )
                    .join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ssk_orders_${Date.now()}.csv`;
                a.click();
              }}
              className="px-4 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <span>📥 Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-card space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order reference (e.g. SSK-REQ-2026), customer name, mobile or city..."
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-xl text-xs text-brand-slate placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-amber transition font-medium"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Payment Mode Selector */}
            <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
              <span className="text-slate-400 text-[11px] uppercase mr-1">Payment:</span>
              {[
                { id: 'all', label: 'All Modes' },
                { id: 'UPI', label: 'UPI QR' },
                { id: 'COD', label: 'COD' },
                { id: 'PAYMENT_REPORTED', label: '⚡ UTR Reported' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentFilter(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    paymentParam === p.id
                      ? 'bg-brand-slate text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lifecycle Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {[
              { id: 'all', label: `All Requests (${orders.length})` },
              { id: 'REQUESTED', label: `New Requests (${orders.filter((o) => o.status === 'REQUESTED').length})` },
              { id: 'UNDER_REVIEW', label: `Under Review (${orders.filter((o) => o.status === 'UNDER_REVIEW').length})` },
              { id: 'AWAITING_CUSTOMER_ACCEPTANCE', label: 'Awaiting Acceptance' },
              { id: 'AWAITING_PAYMENT', label: `Awaiting Payment (${orders.filter((o) => o.status === 'AWAITING_PAYMENT').length})` },
              { id: 'CONFIRMED', label: `Confirmed (${orders.filter((o) => o.status === 'CONFIRMED').length})` },
              { id: 'PROCESSING', label: `Processing (${orders.filter((o) => o.status === 'PROCESSING').length})` },
              { id: 'DISPATCHED', label: `Dispatched (${orders.filter((o) => o.status === 'DISPATCHED').length})` },
              { id: 'DELIVERED', label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})` },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  statusParam === tab.id
                    ? 'bg-brand-amber text-white shadow-xs font-black'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading orders from storage...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs space-y-2">
              <p className="text-xl">📭</p>
              <p className="font-bold">No orders match the selected filters or search query.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                className="text-amber-700 underline font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/70">
                    <th className="py-3.5 px-4">Order Ref & Date</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Items Requested</th>
                    <th className="py-3.5 px-3">Payable Amount</th>
                    <th className="py-3.5 px-3">Lifecycle Status</th>
                    <th className="py-3.5 px-3">Payment State</th>
                    <th className="py-3.5 px-3">Courier AWB</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => {
                    const isSelected = selectedOrder?.id === ord.id;
                    const phone = ord.guestDetails?.phone || ord.shippingAddress.phone;
                    const fullName = ord.guestDetails?.fullName || ord.shippingAddress.fullName;
                    const city = ord.guestDetails?.city || ord.shippingAddress.city;
                    const pincode = ord.guestDetails?.pincode || ord.shippingAddress.pincode;

                    return (
                      <tr
                        key={ord.id}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-amber-50/80' : 'hover:bg-slate-50/70'
                        }`}
                        onClick={() => openOrderDrawer(ord)}
                      >
                        {/* Order Ref & Date */}
                        <td className="py-3.5 px-4 font-mono">
                          <p className="font-black text-brand-slate">#{ord.orderNumber}</p>
                          <span className="text-[10px] text-slate-400 font-sans block">{ord.orderDate}</span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            {city} • {pincode}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">+91 {phone}</p>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-xs">
                            {ord.items.map((it) => (
                              <p key={it.id} className="text-slate-800 truncate">
                                <span className="font-bold">{it.name}</span>{' '}
                                <span className="text-slate-500 text-[11px]">
                                  ({it.volume} × {it.quantity})
                                </span>
                              </p>
                            ))}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-3 font-mono">
                          <span className="font-black text-slate-900 text-sm">₹{ord.total}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {ord.isDeliveryFeeConfirmed ? `incl. ₹${ord.deliveryFee} courier` : 'Courier Pending'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
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

                        {/* Payment State */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              ord.paymentStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-brand-green'
                                : ord.paymentStatus === 'PAYMENT_REPORTED'
                                ? 'bg-blue-100 text-blue-800 animate-pulse font-black'
                                : ord.paymentStatus === 'COD_PENDING'
                                ? 'bg-amber-100 text-amber-900'
                                : ord.paymentStatus === 'COD_COLLECTED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ord.paymentStatus.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {ord.paymentPreference}
                          </span>
                        </td>

                        {/* Courier AWB */}
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">
                          {ord.awbNumber ? (
                            <div>
                              <span className="font-bold text-slate-900">{ord.awbNumber}</span>
                              <span className="text-[10px] text-slate-400 font-sans block">{ord.courier}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDrawer(ord);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                          >
                            Review & Manage →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE ORDER REVIEW & QUOTATION DRAWER / MODAL                       */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeOrderDrawer}
          />

          {/* Sliding Panel */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden text-xs">
            {/* Drawer Top Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base font-mono text-amber-400">
                    #{selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrder.status === 'REQUESTED'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : selectedOrder.status === 'CONFIRMED'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Placed on {selectedOrder.orderDate} • Mode: {selectedOrder.paymentPreference}
                </p>
              </div>

              <button
                type="button"
                onClick={closeOrderDrawer}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quotation Sent Banner (Awaiting Customer Acceptance) */}
              {selectedOrder.status === 'AWAITING_CUSTOMER_ACCEPTANCE' && (
                <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300 text-indigo-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <span>⏳</span> Quotation Sent — Awaiting Customer Acceptance
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                      Quotation Active
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900">
                    A quotation of <strong>₹{selectedOrder.total}</strong> (including ₹{selectedOrder.deliveryFee} regional courier) has been presented to the customer on their order tracking screen.
                  </p>
                  <p className="text-[11px] text-indigo-700 italic">
                    UPI QR payment instructions and banking details remain strictly locked until the customer accepts this quotation. Use the simulation buttons below to test customer acceptance or decline.
                  </p>
                </div>
              )}

              {/* UTR Payment Reported Banner (If customer paid via UPI) */}
              {selectedOrder.paymentStatus === 'PAYMENT_REPORTED' && (
                <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-400 text-blue-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <span>⚡</span> Customer Payment Reported
                    </span>
                    <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs">
                    The customer transferred via UPI and submitted Transaction UTR Reference:
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200 font-mono">
                    <span className="text-sm font-black text-brand-slate">
                      {selectedOrder.customerUtrNumber || 'UTR Not Specified'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedOrder.customerUtrNumber) {
                          navigator.clipboard.writeText(selectedOrder.customerUtrNumber);
                          addToast({ type: 'info', title: 'Copied', message: 'UTR Reference copied.' });
                        }
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Copy UTR
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-700 font-medium">
                    Please verify that ₹{selectedOrder.total} has been credited to your mill bank account before clicking "Verify UPI Bank Credit" below.
                  </p>
                </div>
              )}

              {/* Customer Contact & Delivery Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Customer Information & Address
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/91${(
                        selectedOrder.guestDetails?.phone || selectedOrder.shippingAddress.phone
                      ).replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Vanakkam ${
                          selectedOrder.guestDetails?.fullName || selectedOrder.shippingAddress.fullName
                        }, this is SSK Natural Gold regarding your Order Request #${selectedOrder.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                    <a
                      href={`tel:+91${selectedOrder.guestDetails?.phone || selectedOrder.shippingAddress.phone}`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>📞</span> Call
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Customer Name</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedOrder.guestDetails?.fullName || selectedOrder.shippingAddress.fullName}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">WhatsApp Mobile</span>
                    <p className="font-mono font-bold text-slate-800">
                      +91 {selectedOrder.guestDetails?.phone || selectedOrder.shippingAddress.phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Delivery Destination</span>
                    <p className="font-medium text-slate-800 leading-tight">
                      {selectedOrder.guestDetails?.addressLine1 || selectedOrder.shippingAddress.addressLine1}
                    </p>
                    {selectedOrder.guestDetails?.landmark && (
                      <p className="text-[11px] text-slate-500">Landmark: {selectedOrder.guestDetails.landmark}</p>
                    )}
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedOrder.guestDetails?.city || selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.guestDetails?.state || selectedOrder.shippingAddress.state} — PIN{' '}
                      <span className="font-mono text-amber-800">
                        {selectedOrder.guestDetails?.pincode || selectedOrder.shippingAddress.pincode}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedOrder.guestDetails?.deliveryInstructions && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-[11px]">
                    <span className="font-bold">Customer Delivery Notes: </span>
                    {selectedOrder.guestDetails.deliveryInstructions}
                  </div>
                )}
              </div>

              {/* Requested Items Checklist */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Requested Items & Stock Availability
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-10 object-contain bg-slate-50 rounded border p-1"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{it.name}</p>
                          <p className="text-[11px] text-slate-500 font-tamil">{it.nameTa}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Pack: {it.volume} • Qty: {it.quantity} unit{it.quantity > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                        <span className="text-[10px] text-slate-400 block">(₹{it.price} each)</span>
                        <span className="text-[10px] text-brand-green font-bold block mt-0.5">✓ In Stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Delivery Quotation & Payable Total Recalculation */}
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase tracking-wider text-amber-950">
                    Regional Courier Delivery Fee Calculation
                  </h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Human-in-the-Loop
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Enter verified regional courier delivery charges for destination PIN{' '}
                  <strong>{selectedOrder.guestDetails?.pincode || selectedOrder.shippingAddress.pincode}</strong>.
                  Requested product prices are locked; only courier charges and final total are quoted.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Regional Courier Fee (₹)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={courierFeeInput}
                        onChange={(e) => setCourierFeeInput(Number(e.target.value))}
                        disabled={selectedOrder.status !== 'REQUESTED' && selectedOrder.status !== 'UNDER_REVIEW'}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:border-brand-amber disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                    {/* Presets */}
                    {(selectedOrder.status === 'REQUESTED' || selectedOrder.status === 'UNDER_REVIEW') && (
                      <div className="flex gap-1 mt-1.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setCourierFeeInput(0)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          ₹0 Free
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourierFeeInput(50)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          ₹50 Local/TN
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourierFeeInput(100)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          ₹100 South India
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourierFeeInput(150)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          ₹150 Rest of India
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal:</span>
                      <span className="font-bold">₹{drawerSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Courier Delivery Fee:</span>
                      <span className="font-bold text-amber-800">+₹{courierFeeInput}</span>
                    </div>
                    {drawerDiscount > 0 && (
                      <div className="flex justify-between text-brand-green">
                        <span>Discount:</span>
                        <span className="font-bold">-₹{drawerDiscount}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-sm text-brand-slate">
                      <span>Final Payable Total:</span>
                      <span className="text-brand-amber">₹{drawerPayableTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Partner & AWB Handover (When Processing or Dispatched) */}
              {(selectedOrder.status === 'PROCESSING' ||
                selectedOrder.status === 'DISPATCHED' ||
                selectedOrder.status === 'DELIVERED') && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Courier Partner & AWB Docket Assignment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Courier Service</label>
                      <select
                        value={courierPartnerInput}
                        onChange={(e) => setCourierPartnerInput(e.target.value)}
                        disabled={selectedOrder.status === 'DELIVERED'}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-brand-slate disabled:bg-slate-100"
                      >
                        <option value="The Professional Couriers">The Professional Couriers</option>
                        <option value="ST Courier">ST Courier</option>
                        <option value="India Post Speed Post">India Post Speed Post</option>
                        <option value="Direct Mill Van">Direct Mill Van (Tenkasi / Tirunelveli)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">AWB / Docket Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. TPC-TN-981240"
                        value={awbInput}
                        onChange={(e) => setAwbInput(e.target.value)}
                        disabled={selectedOrder.status === 'DELIVERED'}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-brand-slate disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Internal Remarks */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-600">Internal Mill Desk Remarks</label>
                  <button
                    type="button"
                    onClick={handleSaveNotesOnly}
                    className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Notes for packaging team (e.g. customer requested heavy bubble wrap or weekend delivery)..."
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-brand-amber transition"
                />
              </div>

              {/* Live Tracking Checkpoint Status */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Customer-Facing Tracking Timeline
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-[11px]">
                  {selectedOrder.trackingHistory.map((chk, i) => (
                    <div key={i} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            chk.completed
                              ? 'bg-brand-green text-white'
                              : chk.current
                              ? 'bg-brand-amber text-white animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {chk.completed ? '✓' : i + 1}
                        </span>
                        <div>
                          <p className={`font-bold ${chk.current ? 'text-amber-800' : 'text-slate-800'}`}>
                            {chk.title}
                          </p>
                          <p className="text-slate-500 text-[10px]">{chk.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{chk.timestamp || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition cursor-pointer"
              >
                ✕ Cancel Request
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. If REQUESTED or UNDER_REVIEW: Send Quotation to Customer */}
                {(selectedOrder.status === 'REQUESTED' ||
                  (selectedOrder.status === 'UNDER_REVIEW' && selectedOrder.paymentStatus !== 'PAYMENT_REPORTED')) && (
                  <button
                    type="button"
                    onClick={handleSendQuotation}
                    className="px-4 py-2 bg-brand-amber hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📋</span>
                    <span>Send Delivery Quotation to Customer</span>
                  </button>
                )}

                {/* 1.5. If AWAITING_CUSTOMER_ACCEPTANCE: Customer workflow notice */}
                {selectedOrder.status === 'AWAITING_CUSTOMER_ACCEPTANCE' && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800">
                    <span className="font-bold">⏳ Quotation Issued:</span>
                    <span>Awaiting customer review and acceptance via tracking portal.</span>
                  </div>
                )}

                {/* 1.6. If AWAITING_PAYMENT with UPI: Payment instructions handling */}
                {selectedOrder.status === 'AWAITING_PAYMENT' && selectedOrder.paymentPreference === 'UPI' && selectedOrder.paymentStatus === 'UNPAID' && (
                  <div className="space-y-2">
                    {businessSettings && (!businessSettings.upiVerified || businessSettings.isDemoConfiguration) ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                        <span className="font-bold">⚠️ UPI Verification Pending:</span>
                        <span>Merchant UPI account is unverified or in demo mode. Payment instructions cannot be issued until verified in Business Settings.</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPaymentInstructions}
                        className="px-4 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📱</span>
                        <span>Mark Verified Payment Instructions Sent</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. UPI Bank Credit Reconciliation & Verification */}
                {selectedOrder.paymentStatus === 'PAYMENT_REPORTED' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyUpiPayment}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>✓</span>
                      <span>Verify UPI Bank Credit & Confirm Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPaymentReport}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <span>✕</span>
                      <span>Reject Reported UTR</span>
                    </button>
                  </div>
                )}

                {/* 3. If CONFIRMED: Move to Processing / Bottling */}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={handleMoveToProcessing}
                    className="px-4 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🫙</span>
                    <span>Move to Wood Pressing & Bottling</span>
                  </button>
                )}

                {/* 4. If PROCESSING: Handover to Courier */}
                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    type="button"
                    onClick={handleDispatchCourier}
                    className="px-4 py-2 bg-brand-amber hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🚚</span>
                    <span>Handover to Courier & Mark Dispatched</span>
                  </button>
                )}

                {/* 5. If DISPATCHED: Mark Delivered (Separated from COD collection) */}
                {selectedOrder.status === 'DISPATCHED' && (
                  <button
                    type="button"
                    onClick={handleMarkDelivered}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📦</span>
                    <span>Mark Order Delivered</span>
                  </button>
                )}

                {/* 6. COD doorstep collection deferred to Phase 6.5 (Guard: selectedOrder.status !== 'CANCELLED' && selectedOrder.paymentStatus === 'COD_PENDING') */}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
