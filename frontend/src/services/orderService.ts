import {
  Order,
  CustomerAddress,
  CartItem,
  PaymentMethod,
  PaymentPreference,
  GuestCustomerDetails,
  OrderStatus,
  PaymentStatus,
} from '../types';
import { MOCK_ORDERS } from '../mock';
import apiClient, { isAdminAuthenticated } from '../lib/axios';
import {
  mapOrderFromApi,
  mapOrdersFromApi,
  mapSubmitOrderInputToBackend,
} from './apiAdapters';

const ORDERS_STORAGE_KEY = 'ssk_mock_orders';

// In-memory cache for fast lookup and phone association
let lastSubmittedOrder: Order | null = null;
const cachedPhonesByRef: Record<string, string> = {};

const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed: Order[] = JSON.parse(raw);
      // Ensure seed mock orders exist in storage
      const existingRefs = new Set(parsed.map((o) => o.orderNumber));
      const missingSeeds = MOCK_ORDERS.filter((s) => !existingRefs.has(s.orderNumber));
      if (missingSeeds.length > 0) {
        const merged = [...parsed, ...missingSeeds];
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse orders from localStorage', e);
  }
  return [...MOCK_ORDERS];
};

const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
};

const updateStoredOrder = (order: Order) => {
  try {
    const orders = getStoredOrders();
    const idx = orders.findIndex(
      (o) => o.id === order.id || o.orderNumber.toUpperCase() === order.orderNumber.toUpperCase()
    );
    if (idx !== -1) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    saveStoredOrders(orders);
  } catch {
    // Fail silently
  }
};

export const orderService = {
  /**
   * Fetch customer/admin orders.
   * If admin is authenticated, calls GET /api/admin/orders on the live backend.
   * Falls back to stored orders when offline or unauthenticated.
   */
  async getCustomerOrders(): Promise<Order[]> {
    if (isAdminAuthenticated()) {
      try {
        const result = await this.getAllOrders({ limit: 100 });
        return result.orders;
      } catch {
        // Fall back to storage if network fails
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
    return getStoredOrders();
  },

  /**
   * Administrative order search, filtering, and pagination from GET /api/admin/orders
   */
  async getAllOrders(filters?: {
    status?: string;
    paymentStatus?: string;
    paymentPreference?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; pagination: any }> {
    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.get('/admin/orders', { params: filters });
        const rawOrders = response.data?.data || [];
        const pagination = response.data?.pagination || {
          total: rawOrders.length,
          page: 1,
          limit: rawOrders.length,
          totalPages: 1,
        };
        const orders = mapOrdersFromApi(rawOrders);
        orders.forEach(updateStoredOrder);
        return { orders, pagination };
      } catch {
        // Fallback below
      }
    }
    const orders = getStoredOrders();
    return {
      orders,
      pagination: {
        total: orders.length,
        page: 1,
        limit: orders.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Fetch a single order by ID or Order Reference.
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const cleanId = orderId.trim();

    // Check newly submitted order memory cache
    if (
      lastSubmittedOrder &&
      (lastSubmittedOrder.id === cleanId ||
        lastSubmittedOrder.orderNumber.toUpperCase() === cleanId.toUpperCase())
    ) {
      return lastSubmittedOrder;
    }

    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.get(`/admin/orders/${cleanId}`);
        if (response.data?.data) {
          const mapped = mapOrderFromApi(response.data.data);
          updateStoredOrder(mapped);
          return mapped;
        }
      } catch {
        // Fall through
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
    const cleanRef = cleanId.toUpperCase();
    const orders = getStoredOrders();
    return orders.find((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanRef) || null;
  },

  /**
   * Dual-identifier order tracking: Requires BOTH Order Reference AND 10-digit registered mobile.
   * Calls GET /api/orders/track?orderRef=...&phone=...
   */
  async getOrderByPhoneAndRef(orderRef: string, phone: string): Promise<Order | null> {
    const cleanRef = orderRef.trim().toUpperCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    // Privacy rule: BOTH Order Reference AND 10-digit registered phone number are strictly required
    if (!cleanRef || !cleanPhone || cleanPhone.length !== 10) {
      return null;
    }

    // Cache verified phone for subsequent customer actions on this reference
    cachedPhonesByRef[cleanRef] = cleanPhone;

    try {
      const response = await apiClient.get('/orders/track', {
        params: { orderRef: cleanRef, phone: cleanPhone },
      });
      if (response.data?.data) {
        const mapped = mapOrderFromApi(response.data.data);
        updateStoredOrder(mapped);
        return mapped;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.data?.message) {
        return null;
      }
    }

    // Fallback for tests running without live backend server
    await new Promise((resolve) => setTimeout(resolve, 60));
    const orders = getStoredOrders();
    return (
      orders.find((o) => {
        const matchRef = o.orderNumber.toUpperCase() === cleanRef || o.id === orderRef;
        const orderPhone = (o.guestDetails?.phone || o.shippingAddress?.phone || '')
          .replace(/\D/g, '')
          .slice(-10);
        return matchRef && orderPhone === cleanPhone;
      }) || null
    );
  },

  /**
   * Submit guest customer order request.
   * Calls POST /api/orders on backend.
   * Authoritative prices are calculated by backend from PostgreSQL.
   */
  async submitOrderRequest(params: {
    items: CartItem[];
    subtotal?: number;
    discount?: number;
    shippingAddress: CustomerAddress;
    guestDetails: GuestCustomerDetails;
    paymentPreference: PaymentPreference;
  }): Promise<Order> {
    const payload = mapSubmitOrderInputToBackend(params);

    try {
      const response = await apiClient.post('/orders', payload);
      if (response.data?.data) {
        const mapped = mapOrderFromApi(response.data.data);
        lastSubmittedOrder = mapped;
        if (mapped.guestDetails?.phone) {
          cachedPhonesByRef[mapped.orderNumber.toUpperCase()] = mapped.guestDetails.phone
            .replace(/\D/g, '')
            .slice(-10);
        }
        updateStoredOrder(mapped);
        return mapped;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response) {
        throw error;
      }
      // Only fall back to local if purely offline/network error without response
      return this.localSubmitOrderRequest(params);
    }

    throw new Error('Failed to create order request');
  },

  // Legacy placeOrder wrapper for backward compatibility
  async placeOrder(params: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    appliedCoupon?: string;
    deliveryFee: number;
    tax: number;
    total: number;
    shippingAddress: CustomerAddress;
    paymentMethod: PaymentMethod;
  }): Promise<Order> {
    return this.submitOrderRequest({
      items: params.items,
      subtotal: params.subtotal,
      discount: params.discount,
      shippingAddress: params.shippingAddress,
      guestDetails: {
        fullName: params.shippingAddress.fullName,
        phone: params.shippingAddress.phone,
        addressLine1: params.shippingAddress.addressLine1,
        city: params.shippingAddress.city,
        state: params.shippingAddress.state,
        pincode: params.shippingAddress.pincode,
      },
      paymentPreference: params.paymentMethod === 'COD' ? 'COD' : 'UPI',
    });
  },

  /**
   * Customer: Report UPI transaction UTR reference.
   * Calls POST /api/orders/:orderNumber/report-payment
   */
  async submitPaymentReport(
    orderIdOrNumber: string,
    utrNumber: string,
    phone?: string
  ): Promise<Order | null> {
    const cleanRef = orderIdOrNumber.trim().toUpperCase();
    const stored = getStoredOrders().find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === cleanRef
    );
    const finalOrderNumber = stored ? stored.orderNumber : cleanRef;
    const finalPhone =
      phone ||
      stored?.guestDetails?.phone ||
      stored?.shippingAddress?.phone ||
      cachedPhonesByRef[cleanRef] ||
      '';

    try {
      const response = await apiClient.post(`/orders/${finalOrderNumber}/report-payment`, {
        phone: finalPhone,
        utr: utrNumber,
      });
      if (response.data?.data) {
        const mapped = mapOrderFromApi(response.data.data);
        updateStoredOrder(mapped);
        return mapped;
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
      if (e.response) {
        throw e;
      }
    }

    return this.localSubmitPaymentReport(orderIdOrNumber, utrNumber);
  },

  /**
   * Admin sends delivery quotation to customer.
   * Calls POST /api/admin/orders/:id/quote
   */
  async sendQuotationToCustomer(
    orderId: string,
    courierFee: number,
    adminNotes?: string
  ): Promise<Order | null> {
    const numFee = Number(courierFee);
    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.post(`/admin/orders/${orderId}/quote`, {
          courierFee: numFee,
          adminNotes,
        });
        if (response.data?.data) {
          const mapped = mapOrderFromApi(response.data.data);
          updateStoredOrder(mapped);
          return mapped;
        }
      } catch (e: any) {
        if (e.response?.data?.message) {
          throw new Error(e.response.data.message);
        }
        if (e.response) {
          throw e;
        }
      }
    }

    return this.localSendQuotationToCustomer(orderId, numFee, adminNotes);
  },

  /**
   * Customer accepts quotation.
   * Calls POST /api/orders/:orderNumber/accept
   */
  async customerAcceptQuotation(
    orderIdOrNumber: string,
    phone?: string
  ): Promise<Order | null> {
    const cleanRef = orderIdOrNumber.trim().toUpperCase();
    const stored = getStoredOrders().find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === cleanRef
    );
    const finalOrderNumber = stored ? stored.orderNumber : cleanRef;
    const finalPhone =
      phone ||
      stored?.guestDetails?.phone ||
      stored?.shippingAddress?.phone ||
      cachedPhonesByRef[cleanRef] ||
      '';

    try {
      const response = await apiClient.post(`/orders/${finalOrderNumber}/accept`, {
        phone: finalPhone,
      });
      if (response.data?.data) {
        const mapped = mapOrderFromApi(response.data.data);
        updateStoredOrder(mapped);
        return mapped;
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
      if (e.response) {
        throw e;
      }
    }

    return this.localCustomerAcceptQuotation(orderIdOrNumber);
  },

  /**
   * Customer declines quotation.
   * Calls POST /api/orders/:orderNumber/decline
   */
  async customerDeclineQuotation(
    orderIdOrNumber: string,
    reason?: string,
    phone?: string
  ): Promise<Order | null> {
    const cleanRef = orderIdOrNumber.trim().toUpperCase();
    const stored = getStoredOrders().find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === cleanRef
    );
    const finalOrderNumber = stored ? stored.orderNumber : cleanRef;
    const finalPhone =
      phone ||
      stored?.guestDetails?.phone ||
      stored?.shippingAddress?.phone ||
      cachedPhonesByRef[cleanRef] ||
      '';

    try {
      const response = await apiClient.post(`/orders/${finalOrderNumber}/decline`, {
        phone: finalPhone,
        reason: reason || 'Customer declined quoted delivery fee',
      });
      if (response.data?.data) {
        const mapped = mapOrderFromApi(response.data.data);
        updateStoredOrder(mapped);
        return mapped;
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
      if (e.response) {
        throw e;
      }
    }

    return this.localCustomerDeclineQuotation(orderIdOrNumber, reason);
  },

  /**
   * Admin confirms doorstep cash collection (COD only).
   * Calls POST /api/admin/orders/:id/collect-cod
   */
  async confirmCashCollected(orderId: string, adminNotes?: string): Promise<Order | null> {
    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.post(`/admin/orders/${orderId}/collect-cod`, {
          adminNotes,
        });
        if (response.data?.data) {
          const mapped = mapOrderFromApi(response.data.data);
          updateStoredOrder(mapped);
          return mapped;
        }
      } catch (e: any) {
        if (e.response?.data?.message) {
          throw new Error(e.response.data.message);
        }
        if (e.response) {
          throw e;
        }
      }
    }

    return this.localConfirmCashCollected(orderId);
  },

  /**
   * Admin verifies UPI payment bank reconciliation.
   * Calls POST /api/admin/orders/:id/verify-upi
   */
  async verifyUpiPayment(orderId: string, adminNotes?: string): Promise<Order | null> {
    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.post(`/admin/orders/${orderId}/verify-upi`, {
          adminNotes,
        });
        if (response.data?.data) {
          const mapped = mapOrderFromApi(response.data.data);
          updateStoredOrder(mapped);
          return mapped;
        }
      } catch (e: any) {
        if (e.response?.data?.message) {
          throw new Error(e.response.data.message);
        }
        if (e.response) {
          throw e;
        }
      }
    }

    return this.localUpdateOrderStatus(orderId, 'CONFIRMED', {
      paymentStatus: 'VERIFIED',
      adminNotes,
    });
  },

  /**
   * Admin updates order status.
   * Calls PATCH /api/admin/orders/:id/status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options?: {
      courierFee?: number;
      awbNumber?: string;
      courier?: string;
      paymentStatus?: PaymentStatus;
      adminNotes?: string;
      estimatedDeliveryDate?: string;
      deliveryChannel?: string;
    }
  ): Promise<Order | null> {
    if (isAdminAuthenticated()) {
      try {
        const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
          status,
          courier: options?.courier,
          awbNumber: options?.awbNumber,
          estimatedDeliveryDate: options?.estimatedDeliveryDate,
          adminNotes: options?.adminNotes,
          paymentStatus: options?.paymentStatus,
          deliveryChannel: options?.deliveryChannel,
        });
        if (response.data?.data) {
          const mapped = mapOrderFromApi(response.data.data);
          updateStoredOrder(mapped);
          return mapped;
        }
      } catch (e: any) {
        if (e.response?.data?.message) {
          throw new Error(e.response.data.message);
        }
        if (e.response) {
          throw e;
        }
      }
    }

    return this.localUpdateOrderStatus(orderId, status, options);
  },

  /**
   * Live Admin Dashboard Pipeline Metrics from GET /api/admin/dashboard/metrics
   */
  async getDashboardMetrics(): Promise<any> {
    const response = await apiClient.get('/admin/dashboard/metrics');
    return response.data?.data;
  },

  async resetOrdersToSeed(): Promise<Order[]> {
    saveStoredOrders([...MOCK_ORDERS]);
    return [...MOCK_ORDERS];
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Local fallback implementations (Preserves 100% Phase 3 & 4 test offline compatibility)
  // ─────────────────────────────────────────────────────────────────────────

  localSubmitOrderRequest(params: {
    items: CartItem[];
    subtotal?: number;
    discount?: number;
    shippingAddress: CustomerAddress;
    guestDetails: GuestCustomerDetails;
    paymentPreference: PaymentPreference;
  }): Order {
    const orders = getStoredOrders();
    const year = new Date().getFullYear();
    let orderNum = '';
    do {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      orderNum = `SSK-REQ-${year}-${randomSuffix}`;
    } while (orders.some((o) => o.orderNumber === orderNum));

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isCod = params.paymentPreference === 'COD';
    const subtotal = params.subtotal || 0;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      orderDate: dateFormatted,
      estimatedDeliveryDate: 'Pending Mill Review',
      status: 'REQUESTED',
      paymentPreference: params.paymentPreference,
      paymentMethod: params.paymentPreference,
      paymentStatus: isCod ? 'COD_PENDING' : 'UNPAID',
      items: params.items,
      subtotal,
      discount: params.discount || 0,
      deliveryFee: 0,
      isDeliveryFeeConfirmed: false,
      tax: Math.round(subtotal * 0.05),
      total: subtotal,
      shippingAddress: params.shippingAddress,
      guestDetails: params.guestDetails,
      trackingHistory: [
        {
          title: 'Order Request Received',
          titleTa: 'ஆர்டர் கோரிக்கை பெறப்பட்டது',
          subtitle: `Request #${orderNum} submitted. Payment preference: ${params.paymentPreference}.`,
          subtitleTa: `கோரிக்கை பதிவு செய்யப்பட்டது. கட்டண விருப்பம்: ${params.paymentPreference}.`,
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          title: 'Mill Stock & Courier Review',
          titleTa: 'ஆலை இருப்பு மற்றும் கூரியர் சரிபார்ப்பு',
          subtitle:
            'Our Tenkasi mill desk will verify fresh extraction batch & destination courier fee.',
          subtitleTa: 'எங்கள் ஆலை குழுவினர் இருப்பு மற்றும் கூரியர் கட்டணத்தை உறுதி செய்வர்.',
          completed: false,
          current: false,
        },
        {
          title:
            params.paymentPreference === 'UPI'
              ? 'UPI QR Payment & Verification'
              : 'COD Confirmation',
          titleTa:
            params.paymentPreference === 'UPI'
              ? 'UPI QR கட்டணம் மற்றும் சரிபார்ப்பு'
              : 'COD உறுதிப்படுத்தல்',
          subtitle:
            params.paymentPreference === 'UPI'
              ? 'Pay via UPI QR once final amount is confirmed.'
              : 'Payment to be collected on doorstep delivery.',
          subtitleTa:
            params.paymentPreference === 'UPI'
              ? 'இறுதி தொகை உறுதி செய்யப்பட்டவுடன் UPI QR மூலம் செலுத்தவும்.'
              : 'டெலிவரியின் போது பணமாக செலுத்தவும்.',
          completed: false,
          current: false,
        },
        {
          title: 'Fresh Wood Pressing & Bottling',
          titleTa: 'செக்கில் பிழிந்து பேக்கிங்',
          subtitle: 'Pure batch bottled in tamper-evident sealed packaging.',
          subtitleTa: 'பாட்டிலில் அடைக்கப்பட்டு தர பரிசோதனை செய்யப்படும்.',
          completed: false,
          current: false,
        },
        {
          title: 'Dispatched via Courier',
          titleTa: 'கூரியரில் அனுப்பப்பட்டது',
          subtitle: 'Handed over to regional courier partner with AWB tracking.',
          subtitleTa: 'கூரியர் நிலையத்திற்கு ஒப்படைக்கப்பட்டு AWB எண் வழங்கப்படும்.',
          completed: false,
          current: false,
        },
        {
          title: 'Delivered',
          titleTa: 'டெலிவரி செய்யப்பட்டது',
          subtitle: 'Safely delivered to your doorstep.',
          subtitleTa: 'பொருள் உங்கள் இல்லத்தில் வழங்கப்படும்.',
          completed: false,
          current: false,
        },
      ],
    };

    orders.unshift(newOrder);
    saveStoredOrders(orders);
    lastSubmittedOrder = newOrder;
    return newOrder;
  },

  localSendQuotationToCustomer(
    orderId: string,
    courierFee: number,
    adminNotes?: string
  ): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.status === 'CANCELLED') {
      throw new Error(
        `Invalid State Transition: Cancelled order #${ord.orderNumber} cannot receive delivery quotation.`
      );
    }
    if (ord.status === 'DELIVERED') {
      throw new Error(
        `Invalid State Transition: Delivered order #${ord.orderNumber} cannot receive delivery quotation.`
      );
    }

    ord.status = 'AWAITING_CUSTOMER_ACCEPTANCE';
    ord.deliveryFee = courierFee;
    ord.isDeliveryFeeConfirmed = true;
    ord.total = ord.subtotal + courierFee - (ord.discount || 0);
    if (adminNotes !== undefined) ord.adminNotes = adminNotes;

    if (ord.paymentPreference === 'UPI') {
      ord.paymentStatus = 'UNPAID';
    } else {
      ord.paymentStatus = 'COD_PENDING';
    }

    const th = ord.trackingHistory || [];
    const reviewChk = th.find(
      (t) =>
        t.title.includes('Mill Stock') ||
        t.title.includes('Courier Review') ||
        t.title.includes('Courier Quoted')
    );
    if (reviewChk) {
      reviewChk.title = 'Mill Stock Confirmed & Courier Quoted';
      reviewChk.titleTa = 'இருப்பு மற்றும் கூரியர் கட்டணம் கணக்கிடப்பட்டது';
      reviewChk.subtitle = `Courier delivery fee ₹${courierFee} quoted. Total: ₹${ord.total}. Awaiting customer acceptance.`;
      reviewChk.completed = true;
      reviewChk.current = true;
    }

    saveStoredOrders(orders);
    return orders[index];
  },

  localCustomerAcceptQuotation(orderId: string): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
      throw new Error(
        `Invalid State Transition: Order #${ord.orderNumber} is in ${ord.status} status and cannot accept quotation.`
      );
    }

    const isCod = ord.paymentPreference === 'COD';
    const th = ord.trackingHistory || [];

    if (isCod) {
      ord.status = 'CONFIRMED';
      ord.paymentStatus = 'COD_PENDING';

      const payChk = th.find((t) => t.title.includes('COD') || t.title.includes('Payment'));
      if (payChk) {
        payChk.title = 'Order Confirmed (COD)';
        payChk.titleTa = 'ஆர்டர் உறுதி செய்யப்பட்டது (COD)';
        payChk.subtitle = `Quoted total ₹${ord.total} accepted. Cash to be collected at doorstep on delivery.`;
        payChk.completed = true;
        payChk.current = true;
      }
    } else {
      ord.status = 'AWAITING_PAYMENT';
      ord.paymentStatus = 'PAYMENT_INSTRUCTIONS_SENT';

      const payChk = th.find((t) => t.title.includes('UPI') || t.title.includes('Payment'));
      if (payChk) {
        payChk.title = 'UPI QR Payment Instructions Sent';
        payChk.titleTa = 'UPI QR கட்டண விவரம் அனுப்பப்பட்டது';
        payChk.subtitle = `Quoted total ₹${ord.total} accepted. Please pay via UPI QR and enter transaction UTR.`;
        payChk.completed = false;
        payChk.current = true;
      }
    }

    saveStoredOrders(orders);
    return orders[index];
  },

  localCustomerDeclineQuotation(orderId: string, reason?: string): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
      throw new Error(
        `Invalid State Transition: Order #${ord.orderNumber} is in ${ord.status} status and cannot decline quotation.`
      );
    }

    ord.status = 'CANCELLED';
    if (ord.paymentPreference === 'COD' && ord.paymentStatus === 'COD_PENDING') {
      ord.paymentStatus = 'UNPAID';
    }
    ord.adminNotes = `Customer declined quotation: ${reason || 'Customer rejected quoted delivery charges'}`;

    const th = ord.trackingHistory || [];
    const lastChk = th[th.length - 1];
    if (lastChk) {
      lastChk.subtitle = 'Order request cancelled following quotation decline.';
    }

    saveStoredOrders(orders);
    return orders[index];
  },

  localSubmitPaymentReport(orderId: string, utrNumber: string): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.paymentPreference !== 'UPI') {
      throw new Error(
        `Security Exception: Cannot submit UTR payment report for COD order #${ord.orderNumber}.`
      );
    }
    if (ord.status === 'CANCELLED') {
      throw new Error(
        `Invalid Operation: Cannot submit payment proof for cancelled order #${ord.orderNumber}.`
      );
    }

    ord.customerUtrNumber = utrNumber;
    ord.paymentStatus = 'PAYMENT_REPORTED';
    ord.status = 'UNDER_REVIEW';

    const chk = ord.trackingHistory.find(
      (t) => t.title.includes('UPI QR Payment') || t.title.includes('UPI Payment')
    );
    if (chk) {
      chk.title = 'UPI QR Payment Reported';
      chk.titleTa = 'UPI கட்டணம் பதிவு செய்யப்பட்டது';
      chk.subtitle = `Customer reported UPI Reference: ${utrNumber}. Awaiting mill verification.`;
      chk.completed = true;
      chk.current = true;
    }

    saveStoredOrders(orders);
    return orders[index];
  },

  localConfirmCashCollected(orderId: string): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.paymentPreference !== 'COD') {
      throw new Error(
        `Security Exception: Cannot collect cash for UPI order #${ord.orderNumber}. UPI requires bank verification.`
      );
    }
    if (ord.status === 'CANCELLED') {
      throw new Error(
        `Invalid Operation: Cannot collect cash for cancelled order #${ord.orderNumber}.`
      );
    }

    ord.paymentStatus = 'COD_COLLECTED';

    const th = ord.trackingHistory || [];
    const delivChk = th.find((t) => t.title.includes('Delivered'));
    if (delivChk) {
      delivChk.subtitle = `Delivered to doorstep. Cash on Delivery ₹${ord.total} verified and collected.`;
      delivChk.completed = true;
    }

    saveStoredOrders(orders);
    return orders[index];
  },

  localUpdateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options?: {
      courierFee?: number;
      awbNumber?: string;
      courier?: string;
      paymentStatus?: PaymentStatus;
      adminNotes?: string;
    }
  ): Order | null {
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId
    );
    if (index === -1) return null;

    const ord = orders[index];

    if (ord.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new Error(
        `Invalid State Transition: Cancelled order #${ord.orderNumber} cannot continue through normal fulfillment.`
      );
    }

    if (ord.status === 'DELIVERED' && status !== 'DELIVERED') {
      throw new Error(
        `Invalid State Transition: Delivered order #${ord.orderNumber} is in a terminal state and cannot be transitioned to ${status}.`
      );
    }

    if (ord.paymentPreference === 'COD' && status === 'AWAITING_PAYMENT') {
      throw new Error(
        `Invalid State Transition: COD order #${ord.orderNumber} cannot enter AWAITING_PAYMENT state.`
      );
    }

    const VALID_TRANSITIONS: Record<string, string[]> = {
      REQUESTED: ['REQUESTED', 'UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CANCELLED'],
      UNDER_REVIEW: ['UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CONFIRMED', 'CANCELLED'],
      AWAITING_CUSTOMER_ACCEPTANCE: [
        'AWAITING_CUSTOMER_ACCEPTANCE',
        'AWAITING_PAYMENT',
        'CONFIRMED',
        'CANCELLED',
      ],
      AWAITING_PAYMENT: ['AWAITING_PAYMENT', 'UNDER_REVIEW', 'CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
      PROCESSING: ['PROCESSING', 'DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['DISPATCHED', 'DELIVERED', 'CANCELLED'],
      DELIVERED: ['DELIVERED'],
      CANCELLED: ['CANCELLED'],
      ORDER_PLACED: ['ORDER_PLACED', 'UNDER_REVIEW', 'CANCELLED'],
      EXTRACTION_PACKING: ['EXTRACTION_PACKING', 'DISPATCHED', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    };

    const allowed = VALID_TRANSITIONS[ord.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(
        `Invalid State Transition: Cannot transition order #${ord.orderNumber} from ${ord.status} to ${status}.`
      );
    }

    if (options?.paymentStatus) {
      if (ord.status === 'CANCELLED' || status === 'CANCELLED') {
        if (options.paymentStatus === 'COD_COLLECTED') {
          throw new Error(
            `Invalid Operation: Cancelled order #${ord.orderNumber} cannot be marked as COD_COLLECTED.`
          );
        }
      }
      if (
        (options.paymentStatus === 'COD_COLLECTED' || options.paymentStatus === 'COD_PENDING') &&
        ord.paymentPreference !== 'COD'
      ) {
        throw new Error(
          `Invalid Payment Status: Cannot set ${options.paymentStatus} on non-COD order #${ord.orderNumber}.`
        );
      }
      if (
        ['PAYMENT_INSTRUCTIONS_SENT', 'PAYMENT_REPORTED', 'VERIFIED'].includes(
          options.paymentStatus
        ) &&
        ord.paymentPreference === 'COD'
      ) {
        throw new Error(
          `Invalid Payment Status: Cannot set ${options.paymentStatus} on COD order #${ord.orderNumber}.`
        );
      }
      ord.paymentStatus = options.paymentStatus;
    }

    if (status === 'CANCELLED' && ord.paymentPreference === 'COD' && ord.paymentStatus === 'COD_PENDING') {
      ord.paymentStatus = 'UNPAID';
    }

    ord.status = status;
    if (options?.adminNotes !== undefined) ord.adminNotes = options.adminNotes;

    const th = ord.trackingHistory || [];

    if (status === 'AWAITING_CUSTOMER_ACCEPTANCE') {
      const reviewChk = th.find(
        (t) =>
          t.title.includes('Mill Stock') ||
          t.title.includes('Courier Review') ||
          t.title.includes('Courier Quoted')
      );
      if (reviewChk) {
        reviewChk.title = 'Mill Stock Confirmed & Courier Quoted';
        reviewChk.titleTa = 'இருப்பு மற்றும் கூரியர் கட்டணம் கணக்கிடப்பட்டது';
        reviewChk.subtitle = `Courier delivery fee ₹${ord.deliveryFee} quoted. Total: ₹${ord.total}. Awaiting customer acceptance.`;
        reviewChk.completed = true;
        reviewChk.current = true;
      }
    } else if (status === 'AWAITING_PAYMENT') {
      const payChk = th.find((t) => t.title.includes('UPI') || t.title.includes('Payment'));
      if (payChk) {
        payChk.completed = false;
        payChk.current = true;
      }
    } else if (status === 'CONFIRMED') {
      const payChk = th.find(
        (t) => t.title.includes('UPI') || t.title.includes('COD') || t.title.includes('Payment')
      );
      if (payChk) {
        payChk.title =
          ord.paymentPreference === 'COD' ? 'Order Confirmed (COD)' : 'UPI Payment Verified';
        payChk.titleTa =
          ord.paymentPreference === 'COD'
            ? 'ஆர்டர் உறுதி செய்யப்பட்டது (COD)'
            : 'UPI கட்டணம் சரிபார்க்கப்பட்டது';
        payChk.subtitle =
          ord.paymentPreference === 'COD'
            ? `COD amount ₹${ord.total} confirmed. Cash to be collected at doorstep.`
            : `Bank credit verified (UTR: ${ord.customerUtrNumber || 'Verified'}).`;
        payChk.completed = true;
        payChk.current = false;
      }
      const bottleChk = th.find(
        (t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing')
      );
      if (bottleChk) {
        bottleChk.completed = false;
        bottleChk.current = true;
      }
    } else if (status === 'PROCESSING') {
      const bottleChk = th.find(
        (t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing')
      );
      if (bottleChk) {
        bottleChk.subtitle = 'Batch in wood-press extraction and tamper-evident bottling.';
        bottleChk.completed = true;
        bottleChk.current = true;
      }
    } else if (status === 'DISPATCHED') {
      const bottleChk = th.find(
        (t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing')
      );
      if (bottleChk) {
        bottleChk.completed = true;
        bottleChk.current = false;
      }
      const dispChk = th.find((t) => t.title.includes('Dispatched') || t.title.includes('Courier'));
      if (dispChk) {
        dispChk.subtitle = `Handed over to ${ord.courier || 'Courier Partner'}${
          ord.awbNumber ? ` (AWB: ${ord.awbNumber})` : ''
        }.`;
        dispChk.completed = true;
        dispChk.current = true;
      }
    } else if (status === 'DELIVERED') {
      th.forEach((t) => {
        t.completed = true;
        t.current = false;
      });
      const delivChk = th.find((t) => t.title.includes('Delivered'));
      if (delivChk) {
        delivChk.completed = true;
        delivChk.current = true;
        delivChk.subtitle = 'Safely delivered to your doorstep.';
      }
    }

    saveStoredOrders(orders);
    return orders[index];
  },
};
