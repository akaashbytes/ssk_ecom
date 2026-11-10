import { Order, CustomerAddress, CartItem, PaymentMethod, PaymentPreference, GuestCustomerDetails, OrderStatus, PaymentStatus } from '../types';
import { MOCK_ORDERS } from '../mock';

const ORDERS_STORAGE_KEY = 'ssk_mock_orders';

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

export const orderService = {
  async getCustomerOrders(): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return getStoredOrders();
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const cleanId = orderId.trim().toUpperCase();
    const orders = getStoredOrders();
    return orders.find((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId) || null;
  },

  async getOrderByPhoneAndRef(orderRef: string, phone: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const cleanRef = orderRef.trim().toUpperCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    // Privacy rule: BOTH Order Reference AND 10-digit registered phone number are strictly required
    if (!cleanRef || !cleanPhone || cleanPhone.length !== 10) {
      return null;
    }

    const orders = getStoredOrders();
    return orders.find((o) => {
      const matchRef = o.orderNumber.toUpperCase() === cleanRef || o.id === orderRef;
      const orderPhone = (o.guestDetails?.phone || o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
      return matchRef && orderPhone === cleanPhone;
    }) || null;
  },

  async submitOrderRequest(params: {
    items: CartItem[];
    subtotal: number;
    discount?: number;
    shippingAddress: CustomerAddress;
    guestDetails: GuestCustomerDetails;
    paymentPreference: PaymentPreference;
  }): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 150));
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
      subtotal: params.subtotal,
      discount: params.discount || 0,
      deliveryFee: 0,
      isDeliveryFeeConfirmed: false,
      tax: Math.round(params.subtotal * 0.05),
      total: params.subtotal, // Initial estimated items total
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
          subtitle: 'Our Tenkasi mill desk will verify fresh extraction batch & destination courier fee.',
          subtitleTa: 'எங்கள் ஆலை குழுவினர் இருப்பு மற்றும் கூரியர் கட்டணத்தை உறுதி செய்வர்.',
          completed: false,
          current: false,
        },
        {
          title: params.paymentPreference === 'UPI' ? 'UPI QR Payment & Verification' : 'COD Confirmation',
          titleTa: params.paymentPreference === 'UPI' ? 'UPI QR கட்டணம் மற்றும் சரிபார்ப்பு' : 'COD உறுதிப்படுத்தல்',
          subtitle: params.paymentPreference === 'UPI' ? 'Pay via UPI QR once final amount is confirmed.' : 'Payment to be collected on doorstep delivery.',
          subtitleTa: params.paymentPreference === 'UPI' ? 'இறுதி தொகை உறுதி செய்யப்பட்டவுடன் UPI QR மூலம் செலுத்தவும்.' : 'டெலிவரியின் போது பணமாக செலுத்தவும்.',
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
    return newOrder;
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

  async submitPaymentReport(orderId: string, utrNumber: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];

    // State & Payment Workflow Isolation Safeguards
    if (ord.paymentPreference !== 'UPI') {
      throw new Error(`Security Exception: Cannot submit UTR payment report for COD order #${ord.orderNumber}.`);
    }
    if (ord.status === 'CANCELLED') {
      throw new Error(`Invalid Operation: Cannot submit payment proof for cancelled order #${ord.orderNumber}.`);
    }

    ord.customerUtrNumber = utrNumber;
    ord.paymentStatus = 'PAYMENT_REPORTED';
    ord.status = 'UNDER_REVIEW';

    // Update checkpoint
    const chk = ord.trackingHistory.find((t) => t.title.includes('UPI QR Payment') || t.title.includes('UPI Payment'));
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

  /**
   * Sequence 1: Admin sends quotation to customer.
   * Order moves to AWAITING_CUSTOMER_ACCEPTANCE.
   * Payment instructions are NOT sent at this stage!
   */
  async sendQuotationToCustomer(orderId: string, courierFee: number, adminNotes?: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];

    // State Transition Safeguards
    if (ord.status === 'CANCELLED') {
      throw new Error(`Invalid State Transition: Cancelled order #${ord.orderNumber} cannot receive delivery quotation.`);
    }
    if (ord.status === 'DELIVERED') {
      throw new Error(`Invalid State Transition: Delivered order #${ord.orderNumber} cannot receive delivery quotation.`);
    }

    ord.status = 'AWAITING_CUSTOMER_ACCEPTANCE';
    ord.deliveryFee = courierFee;
    ord.isDeliveryFeeConfirmed = true;
    ord.total = ord.subtotal + courierFee - (ord.discount || 0);
    if (adminNotes !== undefined) ord.adminNotes = adminNotes;

    // Do NOT send UPI payment instructions at this stage
    if (ord.paymentPreference === 'UPI') {
      ord.paymentStatus = 'UNPAID';
    } else {
      ord.paymentStatus = 'COD_PENDING';
    }

    // Update tracking
    const th = ord.trackingHistory || [];
    const reviewChk = th.find((t) => t.title.includes('Mill Stock') || t.title.includes('Courier Review') || t.title.includes('Courier Quoted'));
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

  /**
   * Sequence 2: Customer accepts quotation.
   * UPI: Moves to AWAITING_PAYMENT, sets PAYMENT_INSTRUCTIONS_SENT, reveals UPI QR.
   * COD: Moves to CONFIRMED, sets COD_PENDING (no UPI QR).
   */
  async customerAcceptQuotation(orderId: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];

    // State Transition Safeguards
    if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
      throw new Error(`Invalid State Transition: Order #${ord.orderNumber} is in ${ord.status} status and cannot accept quotation.`);
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

  /**
   * Sequence 2 (Alternative): Customer declines quotation.
   * Order moves to CANCELLED. Never accidentally confirms the order!
   */
  async customerDeclineQuotation(orderId: string, reason?: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];

    // State Transition Safeguards
    if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
      throw new Error(`Invalid State Transition: Order #${ord.orderNumber} is in ${ord.status} status and cannot decline quotation.`);
    }

    ord.status = 'CANCELLED';
    // Cancelled COD requests release collection obligations
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

  /**
   * Requirement 2: Explicit Doorstep Cash Collection for COD orders.
   * Strictly prevents UPI orders from ever entering COD_COLLECTED.
   */
  async confirmCashCollected(orderId: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];
    if (ord.paymentPreference !== 'COD') {
      throw new Error(`Security Exception: Cannot collect cash for UPI order #${ord.orderNumber}. UPI requires bank verification.`);
    }
    if (ord.status === 'CANCELLED') {
      throw new Error(`Invalid Operation: Cannot collect cash for cancelled order #${ord.orderNumber}.`);
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

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options?: {
      courierFee?: number;
      awbNumber?: string;
      courier?: string;
      paymentStatus?: PaymentStatus;
      adminNotes?: string;
    }
  ): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const orders = getStoredOrders();
    const cleanId = orderId.trim().toUpperCase();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber.toUpperCase() === cleanId);
    if (index === -1) return null;

    const ord = orders[index];

    // Lifecycle Integrity Guardrails
    if (ord.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new Error(`Invalid State Transition: Cancelled order #${ord.orderNumber} cannot continue through normal fulfillment.`);
    }

    if (ord.status === 'DELIVERED' && status !== 'DELIVERED') {
      throw new Error(`Invalid State Transition: Delivered order #${ord.orderNumber} is in a terminal state and cannot be transitioned to ${status}.`);
    }

    if (ord.paymentPreference === 'COD' && status === 'AWAITING_PAYMENT') {
      throw new Error(`Invalid State Transition: COD order #${ord.orderNumber} cannot enter AWAITING_PAYMENT state.`);
    }

    // Permitted state transitions map
    const VALID_TRANSITIONS: Record<string, string[]> = {
      REQUESTED: ['REQUESTED', 'UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CANCELLED'],
      UNDER_REVIEW: ['UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CONFIRMED', 'CANCELLED'],
      AWAITING_CUSTOMER_ACCEPTANCE: ['AWAITING_CUSTOMER_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED'],
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
      throw new Error(`Invalid State Transition: Cannot transition order #${ord.orderNumber} from ${ord.status} to ${status}.`);
    }

    if (options?.paymentStatus) {
      if (ord.status === 'CANCELLED' || status === 'CANCELLED') {
        if (options.paymentStatus === 'COD_COLLECTED') {
          throw new Error(`Invalid Operation: Cancelled order #${ord.orderNumber} cannot be marked as COD_COLLECTED.`);
        }
      }
      if ((options.paymentStatus === 'COD_COLLECTED' || options.paymentStatus === 'COD_PENDING') && ord.paymentPreference !== 'COD') {
        throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on non-COD order #${ord.orderNumber}.`);
      }
      if (['PAYMENT_INSTRUCTIONS_SENT', 'PAYMENT_REPORTED', 'VERIFIED'].includes(options.paymentStatus) && ord.paymentPreference === 'COD') {
        throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on COD order #${ord.orderNumber}.`);
      }
      ord.paymentStatus = options.paymentStatus;
    }

    if (status === 'CANCELLED' && ord.paymentPreference === 'COD' && ord.paymentStatus === 'COD_PENDING') {
      ord.paymentStatus = 'UNPAID';
    }

    ord.status = status;
    if (options?.adminNotes !== undefined) ord.adminNotes = options.adminNotes;

    // Synchronize tracking history checkpoints
    const th = ord.trackingHistory || [];

    if (status === 'AWAITING_CUSTOMER_ACCEPTANCE') {
      const reviewChk = th.find((t) => t.title.includes('Mill Stock') || t.title.includes('Courier Review') || t.title.includes('Courier Quoted'));
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
      const payChk = th.find((t) => t.title.includes('UPI') || t.title.includes('COD') || t.title.includes('Payment'));
      if (payChk) {
        payChk.title = ord.paymentPreference === 'COD' ? 'Order Confirmed (COD)' : 'UPI Payment Verified';
        payChk.titleTa = ord.paymentPreference === 'COD' ? 'ஆர்டர் உறுதி செய்யப்பட்டது (COD)' : 'UPI கட்டணம் சரிபார்க்கப்பட்டது';
        payChk.subtitle = ord.paymentPreference === 'COD'
          ? `COD amount ₹${ord.total} confirmed. Cash to be collected at doorstep.`
          : `Bank credit verified (UTR: ${ord.customerUtrNumber || 'Verified'}).`;
        payChk.completed = true;
        payChk.current = false;
      }
      const bottleChk = th.find((t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing'));
      if (bottleChk) {
        bottleChk.completed = false;
        bottleChk.current = true;
      }
    } else if (status === 'PROCESSING') {
      const bottleChk = th.find((t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing'));
      if (bottleChk) {
        bottleChk.subtitle = 'Batch in wood-press extraction and tamper-evident bottling.';
        bottleChk.completed = true;
        bottleChk.current = true;
      }
    } else if (status === 'DISPATCHED') {
      const bottleChk = th.find((t) => t.title.includes('Bottling') || t.title.includes('Wood Pressing'));
      if (bottleChk) {
        bottleChk.completed = true;
        bottleChk.current = false;
      }
      const dispChk = th.find((t) => t.title.includes('Dispatched') || t.title.includes('Courier'));
      if (dispChk) {
        dispChk.subtitle = `Handed over to ${ord.courier || 'Courier Partner'}${ord.awbNumber ? ` (AWB: ${ord.awbNumber})` : ''}.`;
        dispChk.completed = true;
        dispChk.current = true;
      }
    } else if (status === 'DELIVERED') {
      // Mark Delivered: DO NOT automatically set COD_COLLECTED!
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

  async resetOrdersToSeed(): Promise<Order[]> {
    saveStoredOrders([...MOCK_ORDERS]);
    return [...MOCK_ORDERS];
  },
};
