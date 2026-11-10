// Comprehensive Domain Types for SSK Natural Gold E-Commerce Platform

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type Language = 'en' | 'ta';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatarUrl?: string;
  memberSince?: string;
}

export type ExtractionCategory = 'groundnut' | 'sesame' | 'coconut';

export interface ProductVariant {
  id: string;
  sku: string;
  volume: string; // e.g. "500 ml", "1 Litre", "5 L Tin", "15 L Tin"
  volumeMl: number;
  containerType: string; // "Food-Grade PET Bottle", "Reinforced Mill Tin"
  mrp: number;
  price: number;
  stock: number;
  isDefault?: boolean;
}

export interface ProductNutritionalFact {
  label: string;
  labelTa: string;
  per100g: string;
}

export interface Product {
  id: string;
  slug: string;
  category: ExtractionCategory;
  name: string;
  nameTa: string;
  botanicalName: string;
  tagline: string;
  taglineTa: string;
  description: string;
  descriptionTa: string;
  seedOrigin: string;
  extractionProcess: string;
  extractionProcessTa: string;
  woodType: string; // "Vaagai Wood Mortar"
  fssaiLicense: string;
  rating: number;
  reviewCount: number;
  primaryImage: string;
  galleryImages: string[];
  lifestyleImage: string;
  featured: boolean;
  inStock: boolean;
  variants: ProductVariant[];
  nutritionFacts: ProductNutritionalFact[];
  purityHighlights: {
    title: string;
    titleTa: string;
    description: string;
    descriptionTa: string;
  }[];
}

export interface CartItem {
  id: string; // unique item id in cart (productId-variantId)
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  nameTa: string;
  category: ExtractionCategory;
  volume: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface Coupon {
  code: string;
  discountAmount: number;
  minimumOrder: number;
  description: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  isDefault: boolean;
  addressType: 'HOME' | 'WORK' | 'COMMERCIAL';
}

export type OrderStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'AWAITING_CUSTOMER_ACCEPTANCE'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ORDER_PLACED'
  | 'EXTRACTION_PACKING'
  | 'OUT_FOR_DELIVERY';

export type PaymentPreference = 'UPI' | 'COD';
export type PaymentMethod = 'UPI' | 'COD' | 'CARD' | 'NET_BANKING';

export type PaymentStatus =
  | 'UNPAID'
  | 'PAYMENT_INSTRUCTIONS_SENT'
  | 'PAYMENT_REPORTED'
  | 'VERIFIED'
  | 'COD_PENDING'
  | 'COD_COLLECTED'
  | 'REFUNDED'
  | 'PAID'
  | 'PENDING'
  | 'FAILED';

export interface GuestCustomerDetails {
  fullName: string;
  phone: string; // WhatsApp Mobile Number
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
}

export interface TrackingCheckpoint {
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa?: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SSK-REQ-2026-8942"
  orderDate: string;
  estimatedDeliveryDate?: string;
  status: OrderStatus;
  paymentPreference?: PaymentPreference;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  deliveryFee: number;
  isDeliveryFeeConfirmed?: boolean;
  tax: number;
  total: number;
  shippingAddress: CustomerAddress;
  guestDetails?: GuestCustomerDetails;
  courier?: string;
  awbNumber?: string;
  trackingHistory: TrackingCheckpoint[];
  upiVpa?: string;
  customerUtrNumber?: string;
  adminNotes?: string;
}

export interface WholesaleLead {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
  city: string;
  state: string;
  oilCategories: string[];
  estimatedMonthlyVolume: string; // e.g. "200 Litres (Tins)"
  message?: string;
  createdAt: string;
  status: 'NEW' | 'CONTACTED' | 'IN_QUOTE' | 'CLOSED';
}

export interface AdminKpiMetrics {
  todayRevenue: number;
  revenueChangePct: number;
  todayOrdersCount: number;
  activeDispatches: number;
  lowStockAlertsCount: number;
  chartData: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
}

export interface DynamicPriceItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productNameTa: string;
  variantName: string;
  seedCost: number;
  extractionCost: number;
  bottlePackagingCost: number;
  shippingAllowance: number;
  marginPct: number;
  mrp: number;
  sellingPrice: number;
  bulkTierDiscountPct: number;
  stockLitres: number;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
}

export interface PriceAuditLog {
  id: string;
  timestamp: string;
  productName: string;
  variantName: string;
  previousMrp: number;
  newMrp: number;
  previousPrice: number;
  newPrice: number;
  variancePct: number;
  modifiedBy: string;
  memo: string;
  status: 'COMMITTED' | 'VERIFIED';
}
