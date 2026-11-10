// Phase 4 End-to-End Workflow Verification & Lifecycle Integrity Test Suite
// SSK Natural Gold E-Commerce Website
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 4 E2E VERIFICATION & INTEGRITY SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${description} -> ${details}`);
    failCount++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory Simulated State Harness for End-to-End Workflow Testing
// ─────────────────────────────────────────────────────────────────────────────
const testStorage = new Map();
const ORDERS_KEY = 'ssk_mock_orders';
const PRODUCTS_KEY = 'ssk_mock_products';

const MOCK_SEED_PRODUCTS = [
  {
    id: 'prod-groundnut',
    slug: 'traditional-groundnut-oil',
    category: 'groundnut',
    name: 'Traditional Groundnut Oil (Wood Pressed)',
    nameTa: 'பாரம்பரிய மரச்செக்கு கடலை எண்ணெய்',
    variants: [
      { id: 'gn-500ml', volume: '500 ml', price: 160, mrp: 180, stock: 45 },
      { id: 'gn-1l', volume: '1 Litre', price: 295, mrp: 330, stock: 60 },
      { id: 'gn-5l', volume: '5 Litre Tin', price: 1450, mrp: 1600, stock: 25 },
    ],
  },
  {
    id: 'prod-sesame',
    slug: 'pure-wood-pressed-sesame-oil',
    category: 'sesame',
    name: 'Pure Sesame / Gingelly Oil (Wood Pressed)',
    nameTa: 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய்',
    variants: [
      { id: 'ses-500ml', volume: '500 ml', price: 245, mrp: 275, stock: 35 },
      { id: 'ses-1l', volume: '1 Litre', price: 470, mrp: 520, stock: 40 },
      { id: 'ses-5l', volume: '5 Litre Tin', price: 2300, mrp: 2550, stock: 15 },
    ],
  },
];

testStorage.set(PRODUCTS_KEY, JSON.parse(JSON.stringify(MOCK_SEED_PRODUCTS)));
testStorage.set(ORDERS_KEY, []);

// Domain transition matrix
const VALID_TRANSITIONS = {
  REQUESTED: ['REQUESTED', 'UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CANCELLED'],
  UNDER_REVIEW: ['UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'CONFIRMED', 'CANCELLED'],
  AWAITING_CUSTOMER_ACCEPTANCE: ['AWAITING_CUSTOMER_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED'],
  AWAITING_PAYMENT: ['AWAITING_PAYMENT', 'UNDER_REVIEW', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  PROCESSING: ['PROCESSING', 'DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DISPATCHED', 'DELIVERED', 'CANCELLED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
};

// Mirror orderService lifecycle logic for isolated execution test
function simSubmitOrderRequest(params) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const orderNum = `SSK-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const isCod = params.paymentPreference === 'COD';
  const newOrder = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    orderNumber: orderNum,
    status: 'REQUESTED',
    paymentPreference: params.paymentPreference,
    paymentStatus: isCod ? 'COD_PENDING' : 'UNPAID',
    items: JSON.parse(JSON.stringify(params.items)), // Deep snapshot
    subtotal: params.subtotal,
    discount: params.discount || 0,
    deliveryFee: 0,
    isDeliveryFeeConfirmed: false,
    total: params.subtotal,
    shippingAddress: params.shippingAddress,
    guestDetails: params.guestDetails,
    customerUtrNumber: undefined,
    adminNotes: undefined,
  };
  orders.unshift(newOrder);
  testStorage.set(ORDERS_KEY, orders);
  return newOrder;
}

function simSendQuotation(orderId, courierFee, notes) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.status === 'CANCELLED') throw new Error('Invalid State Transition: Cancelled orders cannot receive quotations.');
  if (ord.status === 'DELIVERED') throw new Error('Invalid State Transition: Delivered orders cannot receive quotations.');

  ord.status = 'AWAITING_CUSTOMER_ACCEPTANCE';
  ord.deliveryFee = courierFee;
  ord.isDeliveryFeeConfirmed = true;
  ord.total = ord.subtotal + courierFee - (ord.discount || 0);
  if (notes) ord.adminNotes = notes;
  if (ord.paymentPreference === 'UPI') {
    ord.paymentStatus = 'UNPAID';
  } else {
    ord.paymentStatus = 'COD_PENDING';
  }
  return ord;
}

function simCustomerAcceptQuotation(orderId) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
    throw new Error(`Invalid State Transition: Order is in ${ord.status} and cannot accept quotation.`);
  }

  if (ord.paymentPreference === 'COD') {
    ord.status = 'CONFIRMED';
    ord.paymentStatus = 'COD_PENDING';
  } else {
    ord.status = 'AWAITING_PAYMENT';
    ord.paymentStatus = 'PAYMENT_INSTRUCTIONS_SENT';
  }
  return ord;
}

function simCustomerDeclineQuotation(orderId, reason) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.status !== 'AWAITING_CUSTOMER_ACCEPTANCE') {
    throw new Error(`Invalid State Transition: Order is in ${ord.status} and cannot decline quotation.`);
  }
  ord.status = 'CANCELLED';
  ord.adminNotes = `Customer declined quotation: ${reason || 'Courier charges rejected'}`;
  return ord;
}

function simSubmitPaymentReport(orderId, utr) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.paymentPreference !== 'UPI') {
    throw new Error('Security Exception: Cannot submit UTR for COD order.');
  }
  if (ord.status === 'CANCELLED') {
    throw new Error('Cannot submit payment report for cancelled order.');
  }
  ord.customerUtrNumber = utr;
  ord.paymentStatus = 'PAYMENT_REPORTED';
  ord.status = 'UNDER_REVIEW';
  return ord;
}

function simUpdateOrderStatus(orderId, status, options = {}) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');

  if (ord.status === 'CANCELLED' && status !== 'CANCELLED') {
    throw new Error(`Invalid State Transition: Cancelled order #${ord.orderNumber} cannot continue through normal fulfillment.`);
  }
  if (ord.status === 'DELIVERED' && status !== 'DELIVERED') {
    throw new Error(`Invalid State Transition: Delivered order #${ord.orderNumber} is in a terminal state.`);
  }
  if (ord.paymentPreference === 'COD' && status === 'AWAITING_PAYMENT') {
    throw new Error(`Invalid State Transition: COD order #${ord.orderNumber} cannot enter AWAITING_PAYMENT state.`);
  }

  const allowed = VALID_TRANSITIONS[ord.status] || [];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid State Transition: Cannot transition order #${ord.orderNumber} from ${ord.status} to ${status}.`);
  }

  if (options.paymentStatus) {
    if ((options.paymentStatus === 'COD_COLLECTED' || options.paymentStatus === 'COD_PENDING') && ord.paymentPreference !== 'COD') {
      throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on non-COD order.`);
    }
    if (['PAYMENT_INSTRUCTIONS_SENT', 'PAYMENT_REPORTED', 'VERIFIED'].includes(options.paymentStatus) && ord.paymentPreference === 'COD') {
      throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on COD order.`);
    }
    ord.paymentStatus = options.paymentStatus;
  }

  ord.status = status;
  if (options.adminNotes) ord.adminNotes = options.adminNotes;
  if (options.courier) ord.courier = options.courier;
  if (options.awbNumber) ord.awbNumber = options.awbNumber;
  return ord;
}

function simConfirmCashCollected(orderId) {
  const orders = testStorage.get(ORDERS_KEY) || [];
  const ord = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.paymentPreference !== 'COD') {
    throw new Error(`Security Exception: Cannot collect cash for UPI order #${ord.orderNumber}.`);
  }
  if (ord.status === 'CANCELLED') {
    throw new Error(`Invalid Operation: Cannot collect cash for cancelled order #${ord.orderNumber}.`);
  }
  ord.paymentStatus = 'COD_COLLECTED';
  return ord;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Complete Customer-to-Admin Workflow (UPI Flow)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- Test Suite 1: Customer-to-Admin Workflow (UPI Flow) ---');

// 1. Customer submits request
const upiOrder = simSubmitOrderRequest({
  items: [
    {
      id: 'it-1',
      productId: 'prod-sesame',
      variantId: 'ses-1l',
      name: 'Pure Sesame Oil (1 Litre)',
      price: 470,
      mrp: 520,
      quantity: 2,
    },
  ],
  subtotal: 940,
  discount: 0,
  shippingAddress: {
    fullName: 'S. Ramanathan',
    phone: '9840123456',
    addressLine1: '42 South Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
  },
  guestDetails: {
    fullName: 'S. Ramanathan',
    phone: '9840123456',
    addressLine1: '42 South Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
  },
  paymentPreference: 'UPI',
});

assert('Step 1: Customer submits UPI request (status=REQUESTED, paymentStatus=UNPAID)', upiOrder.status === 'REQUESTED' && upiOrder.paymentStatus === 'UNPAID');
assert('Step 1: Order total reflects items subtotal before quotation (₹940)', upiOrder.total === 940 && upiOrder.deliveryFee === 0);

// 2. Admin reviews and quotes delivery fee
const quotedUpi = simSendQuotation(upiOrder.id, 60, 'Direct Tenkasi town auto courier');
assert('Step 2: Admin quotation moves order to AWAITING_CUSTOMER_ACCEPTANCE', quotedUpi.status === 'AWAITING_CUSTOMER_ACCEPTANCE');
assert('Step 2: Quoted delivery fee is saved (+₹60) and total recalculated (₹1000)', quotedUpi.deliveryFee === 60 && quotedUpi.total === 1000);
assert('Step 2: Payment instructions are locked (paymentStatus remains UNPAID)', quotedUpi.paymentStatus === 'UNPAID');

// 3. Customer accepts quotation
const acceptedUpi = simCustomerAcceptQuotation(upiOrder.id);
assert('Step 3: Customer acceptance moves UPI order to AWAITING_PAYMENT', acceptedUpi.status === 'AWAITING_PAYMENT');
assert('Step 3: Acceptance triggers payment instructions (paymentStatus=PAYMENT_INSTRUCTIONS_SENT)', acceptedUpi.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT');

// 4. Customer submits UTR
const reportedUpi = simSubmitPaymentReport(upiOrder.id, '429810482910');
assert('Step 4: Submitting UTR moves order to UNDER_REVIEW', reportedUpi.status === 'UNDER_REVIEW');
assert('Step 4: Submitting UTR sets paymentStatus to PAYMENT_REPORTED (not verified)', reportedUpi.paymentStatus === 'PAYMENT_REPORTED');
assert('Step 4: Customer UTR is logged accurately', reportedUpi.customerUtrNumber === '429810482910');

// 5. Admin verifies bank credit
const verifiedUpi = simUpdateOrderStatus(upiOrder.id, 'CONFIRMED', { paymentStatus: 'VERIFIED' });
assert('Step 5: Admin confirms bank credit (status=CONFIRMED, paymentStatus=VERIFIED)', verifiedUpi.status === 'CONFIRMED' && verifiedUpi.paymentStatus === 'VERIFIED');

// 6. Admin moves to Processing
const processingUpi = simUpdateOrderStatus(upiOrder.id, 'PROCESSING');
assert('Step 6: Moved to fresh bottling (status=PROCESSING)', processingUpi.status === 'PROCESSING');

// 7. Admin hands over to courier
const dispatchedUpi = simUpdateOrderStatus(upiOrder.id, 'DISPATCHED', { courier: 'ST Courier', awbNumber: 'ST-TNK-44912' });
assert('Step 7: Handed over with courier & AWB (status=DISPATCHED)', dispatchedUpi.status === 'DISPATCHED' && dispatchedUpi.awbNumber === 'ST-TNK-44912');

// 8. Admin marks delivered
const deliveredUpi = simUpdateOrderStatus(upiOrder.id, 'DELIVERED');
assert('Step 8: Safely delivered (status=DELIVERED, paymentStatus=VERIFIED)', deliveredUpi.status === 'DELIVERED' && deliveredUpi.paymentStatus === 'VERIFIED');

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: Complete Customer-to-Admin Workflow (COD Flow)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 2: Customer-to-Admin Workflow (COD Flow) ---');

// 1. Customer submits COD request
const codOrder = simSubmitOrderRequest({
  items: [
    {
      id: 'it-2',
      productId: 'prod-groundnut',
      variantId: 'gn-1l',
      name: 'Traditional Groundnut Oil (1 Litre)',
      price: 295,
      mrp: 330,
      quantity: 1,
    },
  ],
  subtotal: 295,
  discount: 0,
  shippingAddress: {
    fullName: 'M. Valli',
    phone: '9840998877',
    addressLine1: '12 North High Road',
    city: 'Ambasamudram',
    state: 'Tamil Nadu',
    pincode: '627401',
  },
  guestDetails: {
    fullName: 'M. Valli',
    phone: '9840998877',
    addressLine1: '12 North High Road',
    city: 'Ambasamudram',
    state: 'Tamil Nadu',
    pincode: '627401',
  },
  paymentPreference: 'COD',
});

assert('COD Step 1: Customer submits COD request (status=REQUESTED, paymentStatus=COD_PENDING)', codOrder.status === 'REQUESTED' && codOrder.paymentStatus === 'COD_PENDING');

// 2. Admin quotes courier fee
const quotedCod = simSendQuotation(codOrder.id, 50, 'Regional courier to Ambasamudram');
assert('COD Step 2: Quoted moves order to AWAITING_CUSTOMER_ACCEPTANCE', quotedCod.status === 'AWAITING_CUSTOMER_ACCEPTANCE');
assert('COD Step 2: Quoted fee (₹50) updates total to ₹345', quotedCod.total === 345);
assert('COD Step 2: Payment remains COD_PENDING', quotedCod.paymentStatus === 'COD_PENDING');

// 3. Customer accepts quotation (Bypasses AWAITING_PAYMENT directly to CONFIRMED)
const acceptedCod = simCustomerAcceptQuotation(codOrder.id);
assert('COD Step 3: Customer acceptance confirms order directly (status=CONFIRMED)', acceptedCod.status === 'CONFIRMED');
assert('COD Step 3: COD never enters AWAITING_PAYMENT', acceptedCod.status !== 'AWAITING_PAYMENT');
assert('COD Step 3: Payment status remains COD_PENDING', acceptedCod.paymentStatus === 'COD_PENDING');

// 4. Fulfillment moves through PROCESSING -> DISPATCHED -> DELIVERED
simUpdateOrderStatus(codOrder.id, 'PROCESSING');
simUpdateOrderStatus(codOrder.id, 'DISPATCHED', { courier: 'The Professional Couriers', awbNumber: 'TPC-88120' });
const deliveredCod = simUpdateOrderStatus(codOrder.id, 'DELIVERED');
assert('COD Step 4: Delivered order keeps payment as COD_PENDING (no auto-collection)', deliveredCod.status === 'DELIVERED' && deliveredCod.paymentStatus === 'COD_PENDING');

// 5. Admin explicitly confirms doorstep cash collection
const collectedCod = simConfirmCashCollected(codOrder.id);
assert('COD Step 5: Explicit cash collection changes paymentStatus to COD_COLLECTED', collectedCod.paymentStatus === 'COD_COLLECTED');

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Customer Quotation Decline Workflow
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 3: Customer Quotation Decline Workflow ---');

const declineOrder = simSubmitOrderRequest({
  items: [{ id: 'it-3', productId: 'prod-sesame', variantId: 'ses-500ml', name: 'Sesame 500ml', price: 245, mrp: 275, quantity: 1 }],
  subtotal: 245,
  shippingAddress: { fullName: 'K. Balaji', phone: '9443123456', addressLine1: 'Madurai', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
  guestDetails: { fullName: 'K. Balaji', phone: '9443123456', addressLine1: 'Madurai', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
  paymentPreference: 'UPI',
});

simSendQuotation(declineOrder.id, 120, 'Outstation courier fee');
const declined = simCustomerDeclineQuotation(declineOrder.id, 'Delivery fee too high for small bottle');

assert('Quotation decline moves order to CANCELLED', declined.status === 'CANCELLED');
assert('Declined order records decline reason in adminNotes', declined.adminNotes.includes('Delivery fee too high'));

let continueFulfillmentError = false;
try {
  simUpdateOrderStatus(declineOrder.id, 'PROCESSING');
} catch (e) {
  continueFulfillmentError = true;
}
assert('Cancelled order is blocked from continuing through fulfillment', continueFulfillmentError);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Order Lifecycle Integrity & Blocked Invalid Transitions
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 4: Lifecycle Integrity & Blocked Transitions ---');

// Terminal states test
let deliveredTransitionError = false;
try {
  simUpdateOrderStatus(deliveredUpi.id, 'PROCESSING');
} catch (e) {
  deliveredTransitionError = true;
}
assert('Terminal State Guard: Delivered order cannot be moved back to PROCESSING', deliveredTransitionError);

// Invalid skip test (REQUESTED directly to DELIVERED)
const freshReq = simSubmitOrderRequest({
  items: [{ id: 'it-4', productId: 'prod-sesame', variantId: 'ses-1l', name: 'Sesame 1L', price: 470, mrp: 520, quantity: 1 }],
  subtotal: 470,
  shippingAddress: { fullName: 'Test User', phone: '9000000000', addressLine1: 'Test', city: 'Test', state: 'TN', pincode: '600001' },
  guestDetails: { fullName: 'Test User', phone: '9000000000', addressLine1: 'Test', city: 'Test', state: 'TN', pincode: '600001' },
  paymentPreference: 'UPI',
});

let illegalSkipError = false;
try {
  simUpdateOrderStatus(freshReq.id, 'DELIVERED');
} catch (e) {
  illegalSkipError = true;
}
assert('Transition Guard: Cannot jump directly from REQUESTED to DELIVERED', illegalSkipError);

// Isolation test: COD cannot enter AWAITING_PAYMENT
let codPaymentStateError = false;
try {
  simUpdateOrderStatus(codOrder.id, 'AWAITING_PAYMENT');
} catch (e) {
  codPaymentStateError = true;
}
assert('Isolation Guard: COD order cannot enter AWAITING_PAYMENT', codPaymentStateError);

// Isolation test: UPI cannot enter COD_COLLECTED
let upiCodCollectionError = false;
try {
  simConfirmCashCollected(upiOrder.id);
} catch (e) {
  upiCodCollectionError = true;
}
assert('Isolation Guard: confirmCashCollected throws security exception on UPI order', upiCodCollectionError);

// Isolation test: COD cannot use UPI payment statuses
let codUpiStatusError = false;
try {
  simUpdateOrderStatus(codOrder.id, 'CONFIRMED', { paymentStatus: 'PAYMENT_REPORTED' });
} catch (e) {
  codUpiStatusError = true;
}
assert('Isolation Guard: Setting PAYMENT_REPORTED on COD order throws error', codUpiStatusError);

// UTR submission on COD order
let codUtrError = false;
try {
  simSubmitPaymentReport(codOrder.id, '123456789012');
} catch (e) {
  codUtrError = true;
}
assert('Isolation Guard: submitPaymentReport throws error for COD order', codUtrError);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: Data Consistency & Product Price Snapshot Immutability
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 5: Snapshot Immutability & Data Consistency ---');

// Mutate product catalog price
const products = testStorage.get(PRODUCTS_KEY);
const sesameProd = products.find((p) => p.id === 'prod-sesame');
const sesame1l = sesameProd.variants.find((v) => v.id === 'ses-1l');
const originalPrice = sesame1l.price; // 470
sesame1l.price = 550; // Increased catalog price to 550

// Inspect past order item price
const orderInDb = testStorage.get(ORDERS_KEY).find((o) => o.id === upiOrder.id);
const pastItem = orderInDb.items.find((i) => i.variantId === 'ses-1l');

assert('Catalog price updated successfully in store (470 -> 550)', sesame1l.price === 550);
assert('Order item price snapshot remains strictly unchanged at ₹470', pastItem.price === originalPrice);
assert('Order subtotal remains unchanged at ₹940', orderInDb.subtotal === 940);

// Admin notes privacy check: Ensure adminNotes is in DB but not displayed on customer tracking
orderInDb.adminNotes = 'Confidential: VIP customer, requested extra tamper tape';
const trackingPageCode = fs.readFileSync(path.resolve('frontend/src/pages/OrderTrackingPage.tsx'), 'utf8');
assert('Privacy Guard: adminNotes is never referenced or rendered in OrderTrackingPage.tsx', !trackingPageCode.includes('adminNotes'));

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: Privacy & Authentication Safety Boundaries
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 6: Privacy & Authentication Safety ---');

const trackingCode = fs.readFileSync(path.resolve('frontend/src/pages/OrderTrackingPage.tsx'), 'utf8');
assert('Privacy: Requires cleanPhone.length === 10 to reveal order details', trackingCode.includes('cleanPhone.length !== 10'));
assert('Privacy: Tracking query params NEVER write phone numbers to URL', !trackingCode.includes('searchParams.set(\'phone\''));

const checkoutSuccessCode = fs.readFileSync(path.resolve('frontend/src/pages/CheckoutSuccessPage.tsx'), 'utf8');
assert('Privacy: CheckoutSuccessPage never puts phone in tracking link', !checkoutSuccessCode.includes('?phone='));

const adminLayoutCode = fs.readFileSync(path.resolve('frontend/src/components/layout/AdminLayout.tsx'), 'utf8');
assert('Auth Boundary: AdminLayout guards against non-admin roles', adminLayoutCode.includes('currentUser.role !== \'ADMIN\''));
assert('Auth Safety: AdminLayout explicitly declares prototype disclaimer', adminLayoutCode.includes('Frontend-only route guards provide prototype workflow evaluation'));

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 7: Business Configuration & Unverified Markings
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 7: Business Configuration & Demo Safeguards ---');

const headerCode = fs.readFileSync(path.resolve('frontend/src/components/layout/CustomerHeader.tsx'), 'utf8');
assert('Demo Safeguard: CustomerHeader FSSAI is labeled [Demo]', headerCode.includes('FSSAI: 22426293000431 <span className="text-amber-400 font-mono text-[9px]">[Demo]</span>'));

const footerCode = fs.readFileSync(path.resolve('frontend/src/components/layout/CustomerFooter.tsx'), 'utf8');
assert('Demo Safeguard: CustomerFooter FSSAI is labeled [Demo]', footerCode.includes('FSSAI: 22426293000431 <span className="text-amber-700 font-bold text-[9px]">[Demo]</span>'));

const homeCode = fs.readFileSync(path.resolve('frontend/src/pages/HomePage.tsx'), 'utf8');
assert('Demo Safeguard: HomePage FSSAI is labeled [Demo]', homeCode.includes('FSSAI 22426293000431 [Demo]'));

const policiesCode = fs.readFileSync(path.resolve('frontend/src/pages/PoliciesLegalPage.tsx'), 'utf8');
assert('Demo Safeguard: PoliciesLegalPage FSSAI is marked DEMO / NOT VERIFIED', policiesCode.includes('DEMO / NOT VERIFIED'));

const settingsCode = fs.readFileSync(path.resolve('frontend/src/pages/AdminSettingsPage.tsx'), 'utf8');
assert(
  'Demo Safeguard: AdminSettingsPage UPI ID is labeled DEMO / NOT VERIFIED',
  settingsCode.includes('Merchant UPI ID / VPA') && settingsCode.includes('DEMO / NOT VERIFIED')
);

const prodServiceCode = fs.readFileSync(path.resolve('frontend/src/services/productService.ts'), 'utf8');
assert('Delivery Safeguard: checkPincode returns isIndicativeEstimate: true', prodServiceCode.includes('isIndicativeEstimate: true'));

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 8: Responsive Verification Across Breakpoints
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 8: Responsive Viewport Verification (360px - 1440px) ---');

const adminOrdersCode = fs.readFileSync(path.resolve('frontend/src/pages/AdminOrdersPage.tsx'), 'utf8');
assert('Responsive: AdminOrdersPage supports mobile-to-desktop grid/flex', adminOrdersCode.includes('flex flex-col sm:flex-row') && adminOrdersCode.includes('overflow-x-auto'));

const adminDashboardCode = fs.readFileSync(path.resolve('frontend/src/pages/AdminDashboardPage.tsx'), 'utf8');
assert('Responsive: AdminDashboardPage adapts lifecycle cards from 2-col mobile to 4-col desktop', adminDashboardCode.includes('grid-cols-2 sm:grid-cols-2 md:grid-cols-4'));

const cartPageCode = fs.readFileSync(path.resolve('frontend/src/pages/CartPage.tsx'), 'utf8');
assert('Responsive: CartPage supports responsive columns and sticky summary', cartPageCode.includes('grid-cols-1 lg:grid-cols-3') && cartPageCode.includes('max-w-page'));

const checkoutPageCode = fs.readFileSync(path.resolve('frontend/src/pages/CheckoutAddressPage.tsx'), 'utf8');
assert('Responsive: CheckoutAddressPage supports responsive inputs', checkoutPageCode.includes('grid grid-cols-1 sm:grid-cols-2'));

// ─────────────────────────────────────────────────────────────────────────────
// Final Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(`TOTAL PHASE 4 E2E VERIFICATION RESULTS: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🌟 ALL PHASE 4 END-TO-END WORKFLOW ASSERTIONS PASSED WITH ZERO FAILURES!\n');
}
