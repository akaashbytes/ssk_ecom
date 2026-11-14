/**
 * SSK Natural Gold — API Data Adapters & Normalization Layer
 *
 * This module mediates between backend Prisma/PostgreSQL models and frontend TypeScript interfaces.
 *
 * Responsibilities:
 * 1. Safe Decimal Conversion: Converts Prisma Decimal JSON strings to native IEEE 754 numbers.
 *    Guards against null/undefined values and prevents accidental string concatenation in financial operations.
 * 2. Model Structure Adaptation: Normalizes backend relational models into frontend UI shapes:
 *    - Product: nameEn → name, extractionProcessEn → extractionProcess, etc.
 *    - Order: Unflattens database columns into nested shippingAddress & guestDetails objects.
 *    - Tracking: Synthesizes the 6-step bilingual trackingHistory checkpoints from database statusLogs.
 * 3. Outbound Request Normalization: Shapes frontend cart data into strict backend payload schemas.
 */

import type {
  Product,
  ProductVariant,
  Order,
  CartItem,
  CustomerAddress,
  GuestCustomerDetails,
  TrackingCheckpoint,
  OrderStatus,
  PaymentStatus,
  PaymentPreference,
  ExtractionCategory,
} from '../types';
import type { BusinessSettings } from './settingsService';

export const DEFAULT_BUSINESS_SETTINGS_FALLBACK: BusinessSettings = {
  businessName: 'SSK Natural Gold',
  businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
  tagline: '100% Traditional Cold-Pressed Wood-Churned Edible Oils',
  taglineTa: 'பாரம்பரிய மரச்செக்கு சுத்தமான சமையல் எண்ணெய்',
  millAddress: '',
  fssaiLicense: '',
  helpdeskPhone: '',
  whatsappPhone: '',
  supportEmail: '',
  workingHours: '8:00 AM – 7:30 PM (Mon – Sat)',
  workingHoursTa: 'காலை 8:00 – இரவு 7:30 (திங்கள் – சனி)',
  merchantUpiId: '',
  merchantPayeeName: '',
  codEnabled: true,
  maxCodOrderValue: null,
  defaultLocalCourierFee: null,
  defaultNationalCourierFee: null,
  freeDeliveryThreshold: null,
  courierPartners: ['The Professional Couriers', 'ST Courier', 'India Post Speed Post', 'Local Mill Van'],
  serviceablePinPrefixes: ['627', '628', '60', '61', '62', '63', '64'],
  fssaiVerified: false,
  upiVerified: false,
  isDemoConfiguration: true,
  isDemoCatalogue: true,
  upiPaymentWindowMinutes: 1440,
};



/**
 * Safely parse a value (string, number, Decimal object, null, undefined) into a JavaScript number.
 * Guarantees zero runtime NaN exceptions and prevents string concatenation.
 */
export const parseDecimal = (value: unknown, fallback: number = 0): number => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    return isNaN(parsed) ? fallback : parsed;
  }
  // If value is a Decimal-like object with toString()
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const str = (value as { toString: () => string }).toString();
    const parsed = Number(str);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Standard rounding to 2 decimal places for currency values.
 */
export const roundCurrency = (value: number): number => {
  return Math.round((Number(value) || 0) * 100) / 100;
};

/**
 * Map a raw backend ProductVariant record to the frontend ProductVariant interface.
 */
export const mapProductVariantFromApi = (variant: any): ProductVariant => {
  const stock = typeof variant?.stock === 'number' ? variant.stock : parseDecimal(variant?.stock, 0);
  const reservedStock = typeof variant?.reservedStock === 'number' ? variant.reservedStock : parseDecimal(variant?.reservedStock, 0);
  const availableStock = Math.max(0, stock - reservedStock);

  return {
    id: String(variant?.id || ''),
    sku: String(variant?.sku || ''),
    volume: String(variant?.volume || ''),
    volumeMl: Number(variant?.volumeMl) || 0,
    containerType: String(variant?.containerType || 'Food-Grade PET Bottle'),
    mrp: parseDecimal(variant?.mrp, 0),
    price: parseDecimal(variant?.price, 0),
    stock,
    reservedStock,
    availableStock,
    isDefault: Boolean(variant?.isDefault),
  };
};

/**
 * Map a raw backend Product record to the frontend Product interface.
 * Normalizes localized columns: nameEn → name, taglineEn → tagline, etc.
 *
 * Integrity Rule:
 * Never invent nutrition facts, purity claims, or unverified extraction attributes.
 * Missing fields remain empty, null, or zero.
 */
export const mapProductFromApi = (product: any): Product => {
  if (!product) {
    throw new Error('Cannot map null or undefined product record');
  }

  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const variants = rawVariants.map(mapProductVariantFromApi);

  return {
    id: String(product.id || ''),
    slug: String(product.slug || ''),
    category: (product.category as ExtractionCategory) || 'groundnut',
    name: String(product.nameEn || product.name || ''),
    nameTa: String(product.nameTa || product.name || ''),
    botanicalName: String(product.botanicalName || ''),
    tagline: String(product.taglineEn || product.tagline || ''),
    taglineTa: String(product.taglineTa || ''),
    description: String(product.descriptionEn || product.description || ''),
    descriptionTa: String(product.descriptionTa || ''),
    seedOrigin: String(product.seedOrigin || ''),
    extractionProcess: String(product.extractionProcessEn || product.extractionProcess || ''),
    extractionProcessTa: String(product.extractionProcessTa || ''),
    woodType: String(product.woodType || ''),
    fssaiLicense: String(product.fssaiLicense || ''),
    // Strictly preserve null when unverified; display genuine zero only when explicitly supplied
    rating: (() => {
      const r = product.rating;
      if (r === null || r === undefined || r === '') return null;
      const parsed = parseDecimal(r, -999);
      return parsed !== -999 && !isNaN(parsed) && parsed >= 0 ? parsed : null;
    })(),
    reviewCount: (() => {
      const rc = product.reviewCount;
      if (rc === null || rc === undefined || rc === '') return null;
      const parsed = Number(rc);
      return !isNaN(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
    })(),
    primaryImage: String(product.primaryImage || ''),
    lifestyleImage: String(product.lifestyleImage || product.primaryImage || ''),
    galleryImages: Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages
      : product.primaryImage ? [product.primaryImage] : [],
    featured: Boolean(product.featured),
    inStock: Boolean(product.inStock),
    variants,
    // Strictly preserve verified information only; never invent unverified claims or values
    nutritionFacts: Array.isArray(product.nutritionFacts) ? product.nutritionFacts : [],
    purityHighlights: Array.isArray(product.purityHighlights) ? product.purityHighlights : [],
  };
};

/**
 * Map an array of backend product records.
 */
export const mapProductsFromApi = (products: unknown): Product[] => {
  if (!Array.isArray(products)) return [];
  return products.filter(Boolean).map(mapProductFromApi);
};

/**
 * Map a backend OrderItem record to the frontend CartItem interface for order display.
 */
export const mapOrderItemFromApi = (item: any): CartItem => {
  const unitPrice = parseDecimal(item?.unitPrice ?? item?.price, 0);
  const mrp = parseDecimal(item?.mrp, unitPrice);
  const quantity = Number(item?.quantity) || 1;

  return {
    id: String(item?.id || `${item?.productId}-${item?.variantId}`),
    productId: String(item?.productId || ''),
    variantId: String(item?.variantId || ''),
    slug: String(item?.slug || ''),
    name: String(item?.productName || item?.name || 'Wood-Pressed Oil'),
    nameTa: String(item?.productNameTa || item?.nameTa || item?.productName || 'மரச்செக்கு எண்ணெய்'),
    category: (item?.category as ExtractionCategory) || 'groundnut',
    volume: String(item?.volume || ''),
    price: unitPrice,
    mrp,
    quantity,
    image: String(item?.productImage || item?.image || ''),
    stock: 999, // Order item snapshot, not real-time inventory
  };
};

/**
 * Synthesize the 6-step customer tracking timeline from verified backend statusLogs.
 *
 * Accuracy Guarantees:
 * - Completed tracking events correspond strictly to actual backend status log evidence.
 * - No fabricated event timestamps (e.g. 'Completed', 'Just now' when no log exists).
 * - Pending stages are displayed as upcoming uncompleted checkpoints.
 * - Dispatched, delivered, paid, or verified states require explicit backend evidence.
 * - Separate UPI and COD workflow behavior is strictly preserved.
 */
export const generateTrackingHistoryFromStatusLogs = (
  status: OrderStatus,
  paymentPreference: PaymentPreference,
  paymentStatus: PaymentStatus,
  statusLogs?: any[],
  customerUtr?: string | null
): TrackingCheckpoint[] => {
  const isCod = paymentPreference === 'COD';
  const logs = Array.isArray(statusLogs) ? statusLogs : [];

  // Helper to find log by destination status or payment status
  const findStatusLog = (targetStatus: string): any | undefined => {
    return logs.find((l) => l.toStatus === targetStatus);
  };

  const findPaymentLog = (targetPaymentStatus: string): any | undefined => {
    return logs.find((l) => l.toPaymentStatus === targetPaymentStatus);
  };

  const formatLogTimestamp = (log?: any): string | undefined => {
    if (!log?.createdAt) return undefined;
    try {
      const d = new Date(log.createdAt);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return undefined;
    }
  };

  // Backend Evidence Verification
  const reqLog = findStatusLog('REQUESTED');
  const quoteLog = findStatusLog('AWAITING_CUSTOMER_ACCEPTANCE');
  const paymentReportLog = findPaymentLog('PAYMENT_REPORTED');
  const verifiedLog = findPaymentLog('VERIFIED');
  const confirmedLog = findStatusLog('CONFIRMED');
  const processingLog = findStatusLog('PROCESSING');
  const dispatchedLog = findStatusLog('DISPATCHED');
  const deliveredLog = findStatusLog('DELIVERED');
  const cancelledLog = findStatusLog('CANCELLED');

  const isCancelled = status === 'CANCELLED' || Boolean(cancelledLog);

  // Checkpoint 1: Order Request Received
  const hasRequestEvidence = Boolean(reqLog) || Boolean(confirmedLog) || status !== 'CANCELLED';
  const cp1: TrackingCheckpoint = {
    title: 'Order Request Received',
    titleTa: 'ஆர்டர் கோரிக்கை பெறப்பட்டது',
    subtitle: isCod
      ? 'Order request received with Cash on Delivery payment preference.'
      : 'Order request received with UPI payment preference.',
    subtitleTa: isCod
      ? 'நேரடி பணக் கட்டண (COD) விருப்பத்துடன் ஆர்டர் கோரிக்கை பெறப்பட்டது.'
      : 'UPI கட்டண விருப்பத்துடன் ஆர்டர் கோரிக்கை பெறப்பட்டது.',
    timestamp: formatLogTimestamp(reqLog),
    completed: hasRequestEvidence && !isCancelled,
    current: status === 'REQUESTED' && !isCancelled,
  };

  // Checkpoint 2: Mill Stock & Courier Review
  const hasPassedReview = Boolean(confirmedLog) || Boolean(processingLog) || Boolean(dispatchedLog) || Boolean(deliveredLog);
  const isAwaitingAcceptance = status === 'AWAITING_CUSTOMER_ACCEPTANCE';
  const cp2Completed = (hasPassedReview || Boolean(quoteLog)) && !isAwaitingAcceptance && !isCancelled;
  const cp2Current = (status === 'UNDER_REVIEW' || isAwaitingAcceptance) && !isCancelled;

  let cp2Subtitle = 'Our Tenkasi mill desk will verify fresh extraction batch & destination courier fee.';
  let cp2SubtitleTa = 'எங்கள் ஆலை குழுவினர் இருப்பு மற்றும் கூரியர் கட்டணத்தை உறுதி செய்வர்.';
  if (isAwaitingAcceptance) {
    cp2Subtitle = 'Delivery quotation sent by mill desk. Awaiting customer acceptance.';
    cp2SubtitleTa = 'டெலிவரி கூரியர் கட்டணம் நிர்ணயிக்கப்பட்டது. உங்கள் ஒப்புதலுக்கு காத்திருக்கிறது.';
  } else if (cp2Completed) {
    cp2Subtitle = 'Stock and delivery charges reviewed and verified.';
    cp2SubtitleTa = 'இருப்பு மற்றும் கூரியர் கட்டணம் சரிபார்க்கப்பட்டது.';
  }

  const cp2: TrackingCheckpoint = {
    title: 'Mill Stock & Courier Review',
    titleTa: 'ஆலை இருப்பு மற்றும் கூரியர் சரிபார்ப்பு',
    subtitle: cp2Subtitle,
    subtitleTa: cp2SubtitleTa,
    timestamp: formatLogTimestamp(quoteLog || findStatusLog('UNDER_REVIEW')),
    completed: cp2Completed,
    current: cp2Current,
  };

  // Checkpoint 3: Payment Verification / COD Confirmation
  let cp3Title = isCod ? 'COD Order Confirmation' : 'UPI Payment Verification';
  let cp3TitleTa = isCod ? 'COD ஆர்டர் உறுதிப்படுத்தல்' : 'UPI கட்டணம் மற்றும் சரிபார்ப்பு';
  let cp3Subtitle = isCod
    ? 'Payment to be collected on doorstep delivery.'
    : 'Payment instructions and QR will be provided upon quotation acceptance.';
  let cp3SubtitleTa = isCod
    ? 'டெலிவரியின் போது பணமாக செலுத்தவும்.'
    : 'ஒப்புதலுக்குப் பின் UPI QR கட்டண விவரங்கள் வழங்கப்படும்.';
  let cp3Timestamp: string | undefined = undefined;
  let cp3Completed = false;
  let cp3Current = false;

  if (isCod) {
    cp3Completed = (Boolean(confirmedLog) || status === 'CONFIRMED' || Boolean(processingLog) || Boolean(dispatchedLog) || Boolean(deliveredLog)) && !isCancelled;
    cp3Current = status === 'CONFIRMED' && !isCancelled;
    cp3Timestamp = formatLogTimestamp(confirmedLog);
    if (cp3Completed) {
      cp3Subtitle = 'Cash on Delivery confirmed. Ready for bottling and dispatch.';
      cp3SubtitleTa = 'COD ஆர்டர் உறுதி செய்யப்பட்டது. பேக்கிங் தொடங்கப்படுகிறது.';
    }
  } else {
    // UPI Workflow
    const isPaymentVerified = paymentStatus === 'VERIFIED' || Boolean(verifiedLog);
    const isPaymentReported = paymentStatus === 'PAYMENT_REPORTED' || Boolean(paymentReportLog);

    if (isPaymentVerified) {
      cp3Completed = !isCancelled;
      cp3Subtitle = 'Bank credit verified by mill finance desk.';
      cp3SubtitleTa = 'வங்கி கணக்கில் தொகை பெறப்பட்டு சரிபார்க்கப்பட்டது.';
      cp3Timestamp = formatLogTimestamp(verifiedLog || confirmedLog);
    } else if (isPaymentReported) {
      cp3Current = !isCancelled;
      cp3Title = 'UPI Payment Reported';
      cp3TitleTa = 'UPI கட்டணம் பதிவு செய்யப்பட்டது';
      cp3Subtitle = customerUtr
        ? `Customer reported UTR: ${customerUtr}. Awaiting bank verification.`
        : 'Payment reference submitted. Awaiting bank credit verification.';
      cp3SubtitleTa = 'வாடிக்கையாளர் செலுத்திய குறிப்பு எண் பெறப்பட்டு வங்கி சரிபார்ப்பில் உள்ளது.';
      cp3Timestamp = formatLogTimestamp(paymentReportLog);
    } else if (status === 'AWAITING_PAYMENT') {
      cp3Current = !isCancelled;
      if (paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT') {
        cp3Subtitle = 'Quotation accepted. Payment instructions issued. Awaiting UPI payment submission.';
        cp3SubtitleTa = 'விலைப்புள்ளி ஏற்கப்பட்டது. கட்டண விவரங்கள் வழங்கப்பட்டுள்ளன. UPI கட்டண பரிவர்த்தனைக்காக காத்திருக்கிறது.';
      } else {
        cp3Subtitle = 'Quotation accepted. Inventory reserved for 24 hours. Awaiting verified payment instructions.';
        cp3SubtitleTa = 'விலைப்புள்ளி ஏற்கப்பட்டது. இருப்பு 24 மணி நேரத்திற்கு ஒதுக்கப்பட்டுள்ளது. சரிபார்க்கப்பட்ட கட்டண விவரங்களுக்கு காத்திருக்கிறது.';
      }
    }
  }

  const cp3: TrackingCheckpoint = {
    title: cp3Title,
    titleTa: cp3TitleTa,
    subtitle: cp3Subtitle,
    subtitleTa: cp3SubtitleTa,
    timestamp: cp3Timestamp,
    completed: cp3Completed,
    current: cp3Current,
  };

  // Checkpoint 4: Fresh Wood Pressing & Bottling
  const isBottlingCompleted = (Boolean(dispatchedLog) || Boolean(deliveredLog) || status === 'DISPATCHED' || status === 'DELIVERED') && !isCancelled;
  const isBottlingCurrent = status === 'PROCESSING' && !isCancelled;

  const cp4: TrackingCheckpoint = {
    title: 'Fresh Wood Pressing & Bottling',
    titleTa: 'செக்கில் பிழிந்து பேக்கிங்',
    subtitle: isBottlingCompleted
      ? 'Pure batch bottled in tamper-evident sealed packaging.'
      : 'Cold-pressed batch queued for filtration and bottling.',
    subtitleTa: isBottlingCompleted
      ? 'பாட்டிலில் அடைக்கப்பட்டு தர பரிசோதனை முடிவடைந்தது.'
      : 'மரச்செக்கு எண்ணெய் வண்டல் வடிகட்டப்பட்டு பேக்கிங் செய்யப்படும்.',
    timestamp: formatLogTimestamp(processingLog),
    completed: isBottlingCompleted,
    current: isBottlingCurrent,
  };

  // Checkpoint 5: Dispatched via Courier
  const isDispatched = (status === 'DISPATCHED' || Boolean(dispatchedLog)) && !isCancelled;
  const isDelivered = (status === 'DELIVERED' || Boolean(deliveredLog)) && !isCancelled;

  const cp5: TrackingCheckpoint = {
    title: 'Dispatched via Courier',
    titleTa: 'கூரியரில் அனுப்பப்பட்டது',
    subtitle: isDispatched
      ? 'Handed over to regional courier partner with tracking reference.'
      : 'Handover to courier partner pending packaging completion.',
    subtitleTa: isDispatched
      ? 'கூரியர் நிலையத்திற்கு ஒப்படைக்கப்பட்டு AWB எண் வழங்கப்பட்டது.'
      : 'பேக்கிங் முடிந்ததும் கூரியரில் ஒப்படைக்கப்படும்.',
    timestamp: formatLogTimestamp(dispatchedLog),
    completed: isDelivered,
    current: status === 'DISPATCHED' && !isCancelled,
  };

  // Checkpoint 6: Delivered
  const cp6: TrackingCheckpoint = {
    title: 'Delivered',
    titleTa: 'டெலிவரி செய்யப்பட்டது',
    subtitle: isDelivered
      ? 'Safely delivered to customer doorstep.'
      : 'Estimated delivery upon regional courier transit.',
    subtitleTa: isDelivered
      ? 'பொருள் வாடிக்கையாளர் இல்லத்தில் வழங்கப்பட்டது.'
      : 'கூரியர் மூலம் உங்கள் முகவரிக்கு வழங்கப்படும்.',
    timestamp: formatLogTimestamp(deliveredLog),
    completed: isDelivered,
    current: status === 'DELIVERED' && !isCancelled,
  };

  return [cp1, cp2, cp3, cp4, cp5, cp6];
};

/**
 * Map a raw backend OrderRequest record to the frontend Order interface.
 * Unflattens shipping fields into CustomerAddress and guestDetails, converts Decimal strings,
 * and synthesizes tracking history checkpoints.
 */
export const mapOrderFromApi = (order: any): Order => {
  if (!order) {
    throw new Error('Cannot map null or undefined order record');
  }

  const subtotal = parseDecimal(order.subtotal, 0);
  const deliveryFee = parseDecimal(order.deliveryFee, 0);
  const discount = parseDecimal(order.discount, 0);
  const tax = parseDecimal(order.tax, 0);
  const total = parseDecimal(order.total, subtotal + deliveryFee - discount);

  const paymentPreference: PaymentPreference = (order.paymentPreference as PaymentPreference) || 'UPI';
  const paymentStatus: PaymentStatus = (order.paymentStatus as PaymentStatus) || 'UNPAID';
  const orderStatus: OrderStatus = (order.status as OrderStatus) || 'REQUESTED';

  // Construct shipping address
  const shippingAddress: CustomerAddress = {
    id: `addr-${order.id || 'order'}`,
    fullName: String(order.customerName || ''),
    phone: String(order.customerPhone || ''),
    addressLine1: String(order.shippingAddressLine1 || ''),
    addressLine2: order.shippingAddressLine2 ? String(order.shippingAddressLine2) : undefined,
    landmark: order.shippingLandmark ? String(order.shippingLandmark) : undefined,
    city: String(order.shippingCity || ''),
    state: String(order.shippingState || 'Tamil Nadu'),
    pincode: String(order.shippingPincode || ''),
    isDefault: false,
    addressType: 'HOME',
  };

  // Construct guest customer details
  const guestDetails: GuestCustomerDetails = {
    fullName: String(order.customerName || ''),
    phone: String(order.customerPhone || ''),
    email: order.customerEmail ? String(order.customerEmail) : undefined,
    addressLine1: String(order.shippingAddressLine1 || ''),
    addressLine2: order.shippingAddressLine2 ? String(order.shippingAddressLine2) : undefined,
    landmark: order.shippingLandmark ? String(order.shippingLandmark) : undefined,
    city: String(order.shippingCity || ''),
    state: String(order.shippingState || 'Tamil Nadu'),
    pincode: String(order.shippingPincode || ''),
    deliveryInstructions: order.deliveryInstructions ? String(order.deliveryInstructions) : undefined,
  };

  // Format order date
  let orderDateFormatted = 'Recent';
  if (order.createdAt) {
    try {
      const d = new Date(order.createdAt);
      orderDateFormatted = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      orderDateFormatted = String(order.createdAt);
    }
  }

  // Map order items
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items: CartItem[] = rawItems.map(mapOrderItemFromApi);

  // Synthesize tracking history
  const trackingHistory = generateTrackingHistoryFromStatusLogs(
    orderStatus,
    paymentPreference,
    paymentStatus,
    order.statusLogs,
    order.customerUtr
  );

  return {
    id: String(order.id || ''),
    orderNumber: String(order.orderNumber || ''),
    orderDate: orderDateFormatted,
    estimatedDeliveryDate: order.estimatedDeliveryDate || (orderStatus === 'DELIVERED' ? 'Delivered' : 'Pending Mill Review'),
    status: orderStatus,
    paymentPreference,
    paymentMethod: paymentPreference,
    paymentStatus,
    items,
    subtotal,
    deliveryFee,
    isDeliveryFeeConfirmed: Boolean(order.isDeliveryFeeConfirmed),
    discount,
    tax,
    total,
    shippingAddress,
    guestDetails,
    courier: order.courierPartner ? String(order.courierPartner) : undefined,
    awbNumber: order.trackingNumber ? String(order.trackingNumber) : undefined,
    customerUtrNumber: order.customerUtr ? String(order.customerUtr) : undefined,
    adminNotes: order.adminNotes ? String(order.adminNotes) : undefined,
    trackingHistory,
  };
};

/**
 * Map an array of backend OrderRequest records.
 */
export const mapOrdersFromApi = (orders: unknown): Order[] => {
  if (!Array.isArray(orders)) return [];
  return orders.filter(Boolean).map(mapOrderFromApi);
};

/**
 * Outbound adapter: Shape client cart and checkout parameters into the exact SubmitOrderInput
 * structure expected by POST /api/orders.
 *
 * Security Note: Client-calculated prices are NOT sent; backend independently looks up and calculates
 * authoritative prices directly from PostgreSQL.
 */
export interface SubmitOrderPayload {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
  paymentPreference: 'UPI' | 'COD';
}

export const mapSubmitOrderInputToBackend = (params: {
  items: CartItem[];
  shippingAddress: CustomerAddress;
  guestDetails?: GuestCustomerDetails | null;
  paymentPreference: PaymentPreference;
}): SubmitOrderPayload => {
  const details = params.guestDetails || {
    fullName: params.shippingAddress.fullName,
    phone: params.shippingAddress.phone,
    addressLine1: params.shippingAddress.addressLine1,
    addressLine2: params.shippingAddress.addressLine2,
    landmark: params.shippingAddress.landmark,
    city: params.shippingAddress.city,
    state: params.shippingAddress.state,
    pincode: params.shippingAddress.pincode,
  };

  // Strictly sanitize phone number to 10 digits
  const rawPhone = details.phone || params.shippingAddress.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

  return {
    items: (params.items || []).map((item) => ({
      variantId: item.variantId,
      quantity: Math.max(1, Number(item.quantity) || 1),
    })),
    customerName: (details.fullName || params.shippingAddress.fullName || '').trim(),
    customerPhone: cleanPhone,
    customerEmail: details.email?.trim() || undefined,
    addressLine1: (details.addressLine1 || params.shippingAddress.addressLine1 || '').trim(),
    addressLine2: (details.addressLine2 || params.shippingAddress.addressLine2 || '').trim() || undefined,
    landmark: (details.landmark || params.shippingAddress.landmark || '').trim() || undefined,
    city: (details.city || params.shippingAddress.city || '').trim(),
    state: (details.state || params.shippingAddress.state || 'Tamil Nadu').trim(),
    pincode: (details.pincode || params.shippingAddress.pincode || '').replace(/\D/g, '').slice(0, 6),
    deliveryInstructions: details.deliveryInstructions?.trim() || undefined,
    paymentPreference: params.paymentPreference === 'COD' ? 'COD' : 'UPI',
  };
};

/**
 * Map raw backend BusinessSettings record to frontend BusinessSettings interface.
 * Strictly adheres to P18 & Phase 6.2 specifications:
 * 1. Missing delivery thresholds, charges, and limits remain null rather than receiving fabricated values.
 * 2. Unverified FSSAI and UPI info are protected against being presented as genuine regulatory or banking credentials.
 * 3. Silent fallback to sample business contact details is strictly prevented.
 */
export const mapBusinessSettingsFromApi = (apiSettings: any): BusinessSettings => {
  if (!apiSettings) return { ...DEFAULT_BUSINESS_SETTINGS_FALLBACK };

  const fssaiVerified = typeof apiSettings.fssaiVerified === 'boolean' ? apiSettings.fssaiVerified : false;
  const upiVerified = typeof apiSettings.upiVerified === 'boolean' ? apiSettings.upiVerified : false;
  const isDemoConfiguration = typeof apiSettings.isDemoConfiguration === 'boolean' ? apiSettings.isDemoConfiguration : true;

  // Delivery thresholds and courier fees: Never invent values if null or undefined from backend
  const defaultLocalCourierFee = apiSettings.defaultCourierFee != null && apiSettings.defaultCourierFee !== ''
    ? parseDecimal(apiSettings.defaultCourierFee, 0)
    : null;
  const defaultNationalCourierFee = apiSettings.nationalCourierFee != null && apiSettings.nationalCourierFee !== ''
    ? parseDecimal(apiSettings.nationalCourierFee, 0)
    : null;
  const freeDeliveryThreshold = apiSettings.freeDeliveryThreshold != null && apiSettings.freeDeliveryThreshold !== ''
    ? parseDecimal(apiSettings.freeDeliveryThreshold, 0)
    : null;
  const maxCodOrderValue = apiSettings.codMaxLimit != null && apiSettings.codMaxLimit !== ''
    ? parseDecimal(apiSettings.codMaxLimit, 0)
    : null;

  // UPI Protection: Never present unverified UPI VPA as a live, verified destination
  const rawUpiId = apiSettings.merchantUpiId ? String(apiSettings.merchantUpiId) : '';
  const merchantUpiId = (upiVerified || isDemoConfiguration) ? rawUpiId : '';

  return {
    ...DEFAULT_BUSINESS_SETTINGS_FALLBACK,
    businessName: apiSettings.businessName || DEFAULT_BUSINESS_SETTINGS_FALLBACK.businessName,
    businessNameTa: apiSettings.businessNameTa || DEFAULT_BUSINESS_SETTINGS_FALLBACK.businessNameTa,
    millAddress: apiSettings.millAddress || '',
    fssaiLicense: apiSettings.fssaiLicense || '',
    merchantUpiId,
    merchantPayeeName: apiSettings.merchantPayeeName || '',
    helpdeskPhone: apiSettings.supportPhone || '',
    whatsappPhone: apiSettings.whatsappPhone || '',
    supportEmail: apiSettings.contactEmail || '',
    defaultLocalCourierFee,
    defaultNationalCourierFee,
    freeDeliveryThreshold,
    maxCodOrderValue,
    codEnabled: typeof apiSettings.codEnabled === 'boolean' ? apiSettings.codEnabled : true,
    fssaiVerified,
    upiVerified,
    isDemoConfiguration,
    isDemoCatalogue: typeof apiSettings.isDemoCatalogue === 'boolean' ? apiSettings.isDemoCatalogue : true,
    upiPaymentWindowMinutes: Number(apiSettings.upiPaymentWindowMinutes) || 1440,
  };
};
