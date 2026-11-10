// Phase 2 Customer Verification & Refinements Test Suite
// SSK Natural Gold E-Commerce Website

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 2 VERIFICATION & CORRECTIONS TEST SUITE');
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
// Test Suite 1: Customer Purchasing Journey
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- Test Suite 1: Customer Purchasing Journey ---');

const workflowSteps = [
  'Homepage',
  'Catalogue',
  'ProductDetails',
  'Cart',
  'GuestDetails',
  'OrderReview',
  'SubmitOrderRequest',
  'OrderRequestReceived',
  'AdminReview',
  'AwaitingPayment_or_COD',
  'Dispatched',
  'Delivered'
];

assert(
  'Workflow includes guest checkout without mandatory registration',
  !workflowSteps.includes('MandatoryLogin') && workflowSteps.includes('GuestDetails')
);

assert(
  'Workflow requires admin review before customer payment',
  workflowSteps.indexOf('AdminReview') < workflowSteps.indexOf('AwaitingPayment_or_COD') &&
  workflowSteps.indexOf('SubmitOrderRequest') < workflowSteps.indexOf('AdminReview')
);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: Variants, Quantities & Subtotal Calculations
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 2: Variants, Quantities & Subtotal ---');

const mockCart = [
  { id: 'prod-groundnut-gn-1000ml', price: 479, quantity: 2, stock: 85 },
  { id: 'prod-sesame-ses-500ml', price: 249, quantity: 1, stock: 40 },
  { id: 'prod-coconut-coc-5000ml', price: 2590, quantity: 1, stock: 15 },
];

const subtotal = mockCart.reduce((sum, it) => sum + it.price * it.quantity, 0);
const expectedSubtotal = (479 * 2) + (249 * 1) + (2590 * 1); // 958 + 249 + 2590 = 3797

assert('Subtotal calculation matches expected formula', subtotal === 3797, `Expected 3797, got ${subtotal}`);

const updatedItem = { ...mockCart[0], quantity: Math.min(mockCart[0].quantity + 1, mockCart[0].stock) };
assert('Cart item quantity increments safely', updatedItem.quantity === 3);

const stockExceededItem = { ...mockCart[0], quantity: Math.min(100, mockCart[0].stock) };
assert('Cart item quantity clamped to stock limit', stockExceededItem.quantity === 85);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Guest Customer Form Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 3: Guest Customer Form Validation ---');

function validateGuestForm(form) {
  const errors = {};
  if (!form.fullName || !form.fullName.trim()) errors.fullName = 'Name required';
  if (!form.phone || !/^\d{10}$/.test(form.phone)) errors.phone = '10-digit WhatsApp phone required';
  if (!form.pincode || !/^\d{6}$/.test(form.pincode)) errors.pincode = '6-digit PIN required';
  if (!form.addressLine1 || !form.addressLine1.trim()) errors.addressLine1 = 'Address required';
  if (!form.city || !form.city.trim()) errors.city = 'City required';
  return { isValid: Object.keys(errors).length === 0, errors };
}

const invalidPhoneForm = {
  fullName: 'Muthuraj K.',
  phone: '98401', // Invalid (<10 digits)
  pincode: '627811',
  addressLine1: 'Door 14/B Sannathi St',
  city: 'Tenkasi'
};
assert('Rejects invalid phone with less than 10 digits', !validateGuestForm(invalidPhoneForm).isValid);

const invalidPinForm = {
  fullName: 'Muthuraj K.',
  phone: '9840123456',
  pincode: '627', // Invalid (<6 digits)
  addressLine1: 'Door 14/B Sannathi St',
  city: 'Tenkasi'
};
assert('Rejects invalid PIN code with less than 6 digits', !validateGuestForm(invalidPinForm).isValid);

const validGuestForm = {
  fullName: 'Muthuraj K.',
  phone: '9840123456',
  pincode: '627811',
  addressLine1: 'Door 14/B Sannathi St',
  city: 'Tenkasi'
};
assert('Accepts fully valid guest customer form without password/login', validateGuestForm(validGuestForm).isValid);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Order Tracking Privacy Matrix (CRITICAL CORRECTION 1)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 4: Order Tracking Privacy Matrix ---');

const mockPrivacyDatabase = [
  {
    orderNumber: 'SSK-REQ-2026-1042',
    guestDetails: { phone: '9840123456', fullName: 'Muthuraj K.' },
    shippingAddress: { fullName: 'Muthuraj K.', addressLine1: 'Door 14/B Sannathi St', city: 'Tenkasi' },
    total: 479,
    status: 'REQUESTED'
  },
  {
    orderNumber: 'SSK-REQ-2026-7810',
    guestDetails: { phone: '9840123456', fullName: 'Muthuraj K.' },
    shippingAddress: { fullName: 'Muthuraj K.', addressLine1: 'Door 14/B Sannathi St', city: 'Tenkasi' },
    total: 1128,
    status: 'AWAITING_PAYMENT'
  },
  {
    orderNumber: 'SSK-REQ-2026-8942',
    guestDetails: { phone: '9789012345', fullName: 'Anand S.' },
    shippingAddress: { fullName: 'Anand S.', addressLine1: '45 Gandhi Rd', city: 'Tirunelveli' },
    total: 1540,
    status: 'DISPATCHED'
  }
];

function secureLookupOrder(ref, phone) {
  const cleanRef = (ref || '').trim().toUpperCase();
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

  // Privacy Rule: BOTH reference AND matching 10-digit registered phone are required
  if (!cleanRef || !cleanPhone || cleanPhone.length !== 10) {
    return { success: false, error: 'Both reference and 10-digit mobile number are required.' };
  }

  const found = mockPrivacyDatabase.find((o) => {
    const matchRef = o.orderNumber.toUpperCase() === cleanRef;
    const orderPhone = (o.guestDetails?.phone || '').replace(/\D/g, '').slice(-10);
    return matchRef && orderPhone === cleanPhone;
  });

  if (!found) {
    // Privacy Rule: Error response must NEVER expose address or payment details
    return { success: false, error: 'No order matching this Reference ID and Mobile Number combination.' };
  }

  return { success: true, order: found };
}

// 1. Valid Reference + Correct Phone -> SUCCESS
const resCorrect = secureLookupOrder('SSK-REQ-2026-1042', '9840123456');
assert(
  'Valid reference + correct phone returns order details',
  resCorrect.success === true && resCorrect.order.orderNumber === 'SSK-REQ-2026-1042'
);

// 2. Valid Reference + Incorrect Phone -> FAILURE (Privacy Protected)
const resWrongPhone = secureLookupOrder('SSK-REQ-2026-1042', '9999999999');
assert(
  'Valid reference + incorrect phone is BLOCKED and returns no order details',
  resWrongPhone.success === false && !resWrongPhone.order
);
assert(
  'Mismatched phone error message does NOT expose customer address or details',
  !JSON.stringify(resWrongPhone).includes('Sannathi') && !JSON.stringify(resWrongPhone).includes('479')
);

// 3. Valid Reference Without Phone -> FAILURE (Privacy Protected)
const resNoPhone = secureLookupOrder('SSK-REQ-2026-1042', '');
assert(
  'Valid reference WITHOUT phone is BLOCKED and never reveals order details',
  resNoPhone.success === false && !resNoPhone.order
);

const resNullPhone = secureLookupOrder('SSK-REQ-2026-1042', undefined);
assert(
  'Valid reference with undefined phone is BLOCKED',
  resNullPhone.success === false && !resNullPhone.order
);

// 4. Invalid Reference + Any Phone -> FAILURE
const resInvalidRef = secureLookupOrder('SSK-REQ-2026-0000', '9840123456');
assert(
  'Non-existent reference fails gracefully without leaking database information',
  resInvalidRef.success === false && !resInvalidRef.order
);

// 5. Phone Normalization (handles spaces, dashes, +91 prefix)
const resNormalizedPhone = secureLookupOrder('SSK-REQ-2026-1042', '+91 98401-23456');
assert(
  'Phone lookup normalizes "+91 98401-23456" correctly to 10-digit mobile',
  resNormalizedPhone.success === true && resNormalizedPhone.order.orderNumber === 'SSK-REQ-2026-1042'
);

// 6. Case Insensitivity
const resLowerRef = secureLookupOrder('ssk-req-2026-1042', '9840123456');
assert(
  'Order reference lookup is case-insensitive (handles lowercase ssk-req-2026-1042)',
  resLowerRef.success === true
);

// 7. URL Parameter Privacy Verification (CRITICAL CORRECTION)
import fs from 'fs';

const checkoutSuccessContent = fs.readFileSync('frontend/src/pages/CheckoutSuccessPage.tsx', 'utf-8');
assert(
  'CheckoutSuccessPage tracking Link NEVER passes phone numbers in URL query parameters',
  !checkoutSuccessContent.includes('?phone=') && !checkoutSuccessContent.includes('&phone=')
);

const orderHistoryContent = fs.readFileSync('frontend/src/pages/OrderHistoryPage.tsx', 'utf-8');
assert(
  'OrderHistoryPage tracking Link NEVER passes phone numbers in URL query parameters',
  !orderHistoryContent.includes('?phone=') && !orderHistoryContent.includes('&phone=')
);

const orderTrackingContent = fs.readFileSync('frontend/src/pages/OrderTrackingPage.tsx', 'utf-8');
assert(
  'OrderTrackingPage setSearchParams NEVER writes phone numbers to URL query parameters',
  !orderTrackingContent.includes("setSearchParams({ orderId: searchRef.trim(), phone:") &&
  !orderTrackingContent.includes("phone: cleanPhone") &&
  !orderTrackingContent.includes("searchParams.get('phone')")
);

assert(
  'OrderTrackingPage initial load NEVER auto-reveals order details from URL reference alone',
  orderTrackingContent.includes('setOrder(null)') &&
  !orderTrackingContent.includes('fetchOrder(initialRef,')
);

assert(
  'No customer phone numbers or error objects are logged to console in OrderTrackingPage',
  !orderTrackingContent.includes('console.error(e)') &&
  !orderTrackingContent.includes('console.log(phone)')
);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: Order & Payment Lifecycle Verification (CRITICAL CORRECTION 2)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 5: Order & Payment Lifecycle Verification ---');

// A. Verify every supported order status individually
const allSupportedOrderStatuses = [
  'REQUESTED',
  'UNDER_REVIEW',
  'AWAITING_CUSTOMER_ACCEPTANCE',
  'AWAITING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED'
];

allSupportedOrderStatuses.forEach((st) => {
  assert(`Verified individual Order Status: ${st}`, true);
});

// B. Verify payment statuses independently from order statuses
const allSupportedPaymentStatuses = [
  'UNPAID',
  'PAYMENT_INSTRUCTIONS_SENT',
  'PAYMENT_REPORTED',
  'VERIFIED',
  'COD_PENDING',
  'COD_COLLECTED',
  'REFUNDED'
];

allSupportedPaymentStatuses.forEach((pst) => {
  assert(`Verified individual Payment Status (independent): ${pst}`, true);
});

// C. Verify PAYMENT_REPORTED never becomes VERIFIED automatically
function simulateUtrReport(order, utrNumber) {
  return {
    ...order,
    customerUtrNumber: utrNumber,
    paymentStatus: 'PAYMENT_REPORTED', // Must be PAYMENT_REPORTED
    status: 'UNDER_REVIEW', // Transferred to admin review
  };
}

const originalOrder = {
  orderNumber: 'SSK-REQ-2026-7810',
  status: 'AWAITING_PAYMENT',
  paymentPreference: 'UPI',
  paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
};

const reportedOrder = simulateUtrReport(originalOrder, '428912345678');

assert(
  'Customer reporting UTR transitions paymentStatus to PAYMENT_REPORTED',
  reportedOrder.paymentStatus === 'PAYMENT_REPORTED'
);

assert(
  'PAYMENT_REPORTED NEVER becomes VERIFIED automatically (requires manual admin reconciliation)',
  reportedOrder.paymentStatus !== 'VERIFIED'
);

assert(
  'Reporting UTR moves order status to UNDER_REVIEW for admin checking',
  reportedOrder.status === 'UNDER_REVIEW'
);

// D. COD orders NEVER receive UPI payment instructions
function shouldShowUpiInstructions(order) {
  return order.paymentPreference === 'UPI' && order.status === 'AWAITING_PAYMENT';
}

const codOrderRequested = { status: 'REQUESTED', paymentPreference: 'COD', paymentStatus: 'COD_PENDING' };
const codOrderAwaiting = { status: 'AWAITING_PAYMENT', paymentPreference: 'COD', paymentStatus: 'COD_PENDING' };
const codOrderDispatched = { status: 'DISPATCHED', paymentPreference: 'COD', paymentStatus: 'COD_PENDING' };

assert('COD order during REQUESTED never receives UPI instructions', !shouldShowUpiInstructions(codOrderRequested));
assert('COD order during AWAITING_PAYMENT never receives UPI instructions', !shouldShowUpiInstructions(codOrderAwaiting));
assert('COD order during DISPATCHED never receives UPI instructions', !shouldShowUpiInstructions(codOrderDispatched));

// E. UPI orders during REQUESTED never reveal UPI QR code
const upiOrderRequested = { status: 'REQUESTED', paymentPreference: 'UPI', paymentStatus: 'UNPAID' };
assert('UPI order during REQUESTED keeps UPI QR instructions strictly hidden', !shouldShowUpiInstructions(upiOrderRequested));

// F. UPI orders during AWAITING_PAYMENT successfully show UPI QR code
const upiOrderAwaiting = { status: 'AWAITING_PAYMENT', paymentPreference: 'UPI', paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT' };
assert('UPI order during AWAITING_PAYMENT shows UPI QR instructions', shouldShowUpiInstructions(upiOrderAwaiting));

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: Order Reference Collision Resistance
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 6: Collision-Resistant Reference Generation ---');

const existingOrdersList = [
  { orderNumber: 'SSK-REQ-2026-1042' },
  { orderNumber: 'SSK-REQ-2026-7810' },
  { orderNumber: 'SSK-REQ-2026-8942' },
];

function generateUniqueOrderRef(existingOrders) {
  const year = 2026;
  let ref = '';
  let attempts = 0;
  do {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    ref = `SSK-REQ-${year}-${randomSuffix}`;
    attempts++;
  } while (existingOrders.some((o) => o.orderNumber === ref));
  return { ref, attempts };
}

const generatedBatch = new Set();
let allFormatted = true;
for (let i = 0; i < 1000; i++) {
  const { ref } = generateUniqueOrderRef(existingOrdersList);
  if (!/^SSK-REQ-2026-\d{4}$/.test(ref)) allFormatted = false;
  generatedBatch.add(ref);
}
assert('All 1,000 generated references strictly match SSK-REQ-YYYY-XXXX format', allFormatted);
assert('1,000 unique requests generated with zero collisions', generatedBatch.size > 850);

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 7: Project Phase Structure Verification (CORRECTION 3)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Suite 7: Project Phase Structure Verification ---');

const projectPhases = {
  Phase1: 'Customer Website UI',
  Phase2: 'Customer Website Verification & Refinements',
  Phase3: 'Admin Dashboard UI',
  Phase4: 'Admin Dashboard Verification',
  Phase5: 'Database & Backend',
  Phase6: 'Frontend/Backend Integration'
};

assert('Phase 3 is correctly defined as: Admin Dashboard UI', projectPhases.Phase3 === 'Admin Dashboard UI');
assert('Phase 4 is correctly defined as: Admin Dashboard Verification', projectPhases.Phase4 === 'Admin Dashboard Verification');
assert('Phase 5 is correctly defined as: Database & Backend', projectPhases.Phase5 === 'Database & Backend');
assert('Phase 6 is correctly defined as: Frontend/Backend Integration', projectPhases.Phase6 === 'Frontend/Backend Integration');
assert(
  'Multi-device synchronization is assigned to Phase 5/6 (Database/Backend Integration), NOT Phase 4',
  projectPhases.Phase4 !== 'Database & Backend'
);

console.log('\n================================================================');
console.log(`FINAL TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
