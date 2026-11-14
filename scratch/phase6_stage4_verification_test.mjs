/**
 * SSK Natural Gold — Phase 6.4 Verification & Safety Audit Test Suite
 * UPI Payment Submission & Verification Integration
 *
 * Verifies all 4 safety audit areas:
 * 1. Payment Instruction Delivery Gate: UTR rejected when UNPAID; allowed only after instructions sent
 * 2. Payment Rejection & Resubmission: Historical instruction delivery preserved (reverts to PAYMENT_INSTRUCTIONS_SENT, not UNPAID)
 * 3. Reservation Expiry Automation: In-process scheduler & transactional release of expired reservations
 * 4. Merchant UPI Verification: 4 test scenarios (unverified, demo, invalid VPA, verified production)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../backend/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${description} ${details ? '--> ' + details : ''}`);
  }
}

async function request(method, endpoint, data = null, token = null) {
  const url = new URL(API_BASE + endpoint);
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('SSK NATURAL GOLD - PHASE 6.4 FINAL SAFETY AUDIT SUITE');
  console.log('UPI Payment Submission & Verification Integration');
  console.log('================================================================\n');

  // --- PREPARATION & ADMIN AUTHENTICATION ---
  console.log('--- SECTION 1: Administrator Authentication & Catalog Baseline ---');
  const loginRes = await request('POST', '/admin/auth/login', {
    email: 'admin@ssknaturalgold.com',
    password: 'tenkasi2026',
  });
  assert('1.1: Mill Admin login succeeds', loginRes.status === 200);
  const adminToken = loginRes.body?.data?.token;
  assert('1.2: Admin JWT token received', Boolean(adminToken));

  // Get active products
  const prodsRes = await request('GET', '/products');
  assert('1.3: Product catalogue is accessible', prodsRes.status === 200 && prodsRes.body.data?.length > 0);
  const products = prodsRes.body.data;

  // Find a product with variants
  let testVariant = null;
  let testProduct = null;
  for (const p of products) {
    if (p.variants && p.variants.length > 0) {
      testVariant = p.variants[0];
      testProduct = p;
      break;
    }
  }
  assert('1.4: Selected variant for testing', Boolean(testVariant));

  // Ensure settings are in baseline demo state before tests
  await prisma.businessSettings.upsert({
    where: { key: 'primary' },
    update: {
      upiVerified: false,
      isDemoConfiguration: true,
      merchantUpiId: 'ssknaturalgold@okhdfcbank',
    },
    create: {
      key: 'primary',
      businessName: 'SSK Natural Gold',
      upiVerified: false,
      isDemoConfiguration: true,
      merchantUpiId: 'ssknaturalgold@okhdfcbank',
    },
  });

  // --- SECTION 2: UPI QUOTATION ACCEPTANCE & UNPAID PAYMENT GATE ---
  console.log('\n--- SECTION 2: Quotation Acceptance & UNPAID Gate Enforcement ---');
  const upiPhone = '9876543210';
  const createUpiRes = await request('POST', '/orders', {
    items: [{ variantId: testVariant.id, quantity: 2 }],
    customerName: 'Karthik Raja',
    customerPhone: upiPhone,
    customerEmail: 'karthik@example.com',
    addressLine1: '45 South Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  assert('2.1: Guest creates UPI order request (201 Created)', createUpiRes.status === 201);
  const upiOrder = createUpiRes.body.data;
  assert('2.2: Initial status is REQUESTED', upiOrder.status === 'REQUESTED');
  assert('2.3: Initial paymentStatus is UNPAID', upiOrder.paymentStatus === 'UNPAID');

  // Admin sends quotation
  const quoteRes = await request(
    'POST',
    `/admin/orders/${upiOrder.id}/quote`,
    { courierFee: 60, adminNotes: 'Standard courier to Tenkasi South Car St.' },
    adminToken
  );
  assert('2.4: Admin issues courier quotation (200 OK)', quoteRes.status === 200);
  assert('2.5: Status is AWAITING_CUSTOMER_ACCEPTANCE', quoteRes.body.data.status === 'AWAITING_CUSTOMER_ACCEPTANCE');

  // Customer accepts quotation
  const acceptRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, { phone: upiPhone });
  assert('2.6: Customer accepts quotation (200 OK)', acceptRes.status === 200);
  const acceptedOrder = acceptRes.body.data;

  assert('2.7: Order status transitions to AWAITING_PAYMENT upon acceptance', acceptedOrder.status === 'AWAITING_PAYMENT');
  assert('2.8: [CRITICAL CORRECTION] Payment status strictly remains UNPAID', acceptedOrder.paymentStatus === 'UNPAID');
  assert('2.9: Inventory state is transactionally marked RESERVED', acceptedOrder.inventoryState === 'RESERVED');
  assert(
    '2.10: Reservation expiry is set (~24 hours in future)',
    Boolean(acceptedOrder.reservationExpiresAt) && new Date(acceptedOrder.reservationExpiresAt) > new Date()
  );

  // --- AREA 1 GATE: UTR SUBMISSION REJECTED WHILE PAYMENT STATUS IS UNPAID ---
  console.log('\n--- AREA 1: Payment Instruction Delivery Gate Enforcement ---');
  const prematureUtrRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: 'UTR20261113000001',
  });
  assert(
    '2.11: UTR submission strictly REJECTED while paymentStatus is UNPAID (400)',
    prematureUtrRes.status === 400 && prematureUtrRes.body.message.includes('Payment instructions have not been delivered yet')
  );

  // --- AREA 4: MERCHANT UPI VERIFICATION (4 TEST SCENARIOS) ---
  console.log('\n--- AREA 4: Merchant UPI Verification (4 Test Scenarios) ---');

  // Scenario 1: Unverified Configuration (upiVerified: false)
  const unverifiedAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      deliveryChannel: 'WHATSAPP',
    },
    adminToken
  );
  assert(
    '3.1: Scenario 1 - Rejects instruction issuance when upiVerified is false (400)',
    unverifiedAttempt.status === 400 && unverifiedAttempt.body.message.includes('pending verification')
  );

  // Scenario 2: Demo Configuration (upiVerified: true, but isDemoConfiguration: true)
  await prisma.businessSettings.update({
    where: { key: 'primary' },
    data: { upiVerified: true, isDemoConfiguration: true, merchantUpiId: 'ssknaturalgold@okhdfcbank' },
  });
  const demoAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      deliveryChannel: 'WHATSAPP',
    },
    adminToken
  );
  assert(
    '3.2: Scenario 2 - Rejects instruction issuance when isDemoConfiguration is true (400)',
    demoAttempt.status === 400 && demoAttempt.body.message.includes('demo configuration')
  );

  // Scenario 3: Missing / Demo UPI Destination (isDemoConfiguration: false, but merchantUpiId is demo VPA)
  await prisma.businessSettings.update({
    where: { key: 'primary' },
    data: { upiVerified: true, isDemoConfiguration: false, merchantUpiId: 'ssknaturalgold@okhdfcbank' },
  });
  const demoVpaAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      deliveryChannel: 'WHATSAPP',
    },
    adminToken
  );
  assert(
    '3.3: Scenario 3 - Rejects instruction issuance when UPI destination is demo placeholder (400)',
    demoVpaAttempt.status === 400 && demoVpaAttempt.body.message.includes('valid non-demo merchant UPI destination')
  );

  // Scenario 3b: Missing Manual Delivery Channel Confirmation
  await prisma.businessSettings.update({
    where: { key: 'primary' },
    data: { upiVerified: true, isDemoConfiguration: false, merchantUpiId: 'ssk.naturalgold@icici' },
  });
  const noChannelAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      // omitting deliveryChannel
    },
    adminToken
  );
  assert(
    '3.4a: Rejects instruction issuance with missing deliveryChannel (400)',
    noChannelAttempt.status === 400 && noChannelAttempt.body.message.includes('explicitly specify a structured deliveryChannel')
  );

  // Scenario 3c: Invalid deliveryChannel value
  const invalidChannelAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      deliveryChannel: 'CARRIER_PIGEON',
    },
    adminToken
  );
  assert(
    '3.4b: Rejects instruction issuance with invalid deliveryChannel (400)',
    invalidChannelAttempt.status === 400 && invalidChannelAttempt.body.message.includes('explicitly specify a structured deliveryChannel')
  );

  // Scenario 3d: Free-text matching in adminNotes alone CANNOT satisfy delivery confirmation
  const freeTextOnlyAttempt = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      adminNotes: 'I sent instructions via WHATSAPP to customer',
      // omitting structured deliveryChannel
    },
    adminToken
  );
  assert(
    '3.4c: Matching word in free-text adminNotes alone CANNOT satisfy delivery confirmation (400)',
    freeTextOnlyAttempt.status === 400 && freeTextOnlyAttempt.body.message.includes('explicitly specify a structured deliveryChannel')
  );

  // Scenario 4: Fully Verified Production Configuration with Confirmed Structured Channel
  const verifiedInstructionRes = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT',
      deliveryChannel: 'WHATSAPP',
      adminNotes: 'Verified UPI instructions delivered to customer via WHATSAPP.',
    },
    adminToken
  );
  assert(
    '3.5: Scenario 4 - Fully verified production configuration allows instruction issuance (200 OK)',
    verifiedInstructionRes.status === 200
  );
  assert(
    '3.6: Order transitions to PAYMENT_INSTRUCTIONS_SENT',
    verifiedInstructionRes.body.data.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT'
  );

  // Reset business settings back to demo safeguards after scenario test
  await prisma.businessSettings.update({
    where: { key: 'primary' },
    data: { upiVerified: false, isDemoConfiguration: true, merchantUpiId: 'ssknaturalgold@okhdfcbank' },
  });

  // --- SECTION 4: CUSTOMER PAYMENT SUBMISSION (POST-INSTRUCTION DELIVERY) ---
  console.log('\n--- SECTION 4: Customer UPI Payment Submission & UTR Validation ---');

  // Test 4.1: Reject empty / whitespace UTR
  const emptyUtrRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: '   ',
  });
  assert('4.1: Rejects empty / whitespace UTR (400)', emptyUtrRes.status === 400);

  // Test 4.2: Reject UTR shorter than 8 characters
  const shortUtrRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: '12345',
  });
  assert('4.2: Rejects short UTR (<8 characters) (400)', shortUtrRes.status === 400);

  // Test 4.3: Reject submission with wrong customer phone
  const wrongPhoneRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: '9999999999',
    utr: '20261109123456',
  });
  assert('4.3: Rejects UTR submission with mismatched phone number (400)', wrongPhoneRes.status === 400);

  // Test 4.4: Reject UTR submission on COD order
  const codPhone = '9876543211';
  const createCodRes = await request('POST', '/orders', {
    items: [{ variantId: testVariant.id, quantity: 1 }],
    customerName: 'Meena Sundaram',
    customerPhone: codPhone,
    addressLine1: '12 North Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'COD',
  });
  const codOrder = createCodRes.body.data;
  const codUtrRes = await request('POST', `/orders/${codOrder.orderNumber}/report-payment`, {
    phone: codPhone,
    utr: '20261109123456',
  });
  assert('4.4: Rejects UTR submission on COD order (400 Security Exception)', codUtrRes.status === 400);

  // Test 4.5: Valid UTR submission (now permitted because instructions were delivered)
  const validUtr = 'UTR20261113098765';
  const submitRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: validUtr,
  });
  assert('4.5: Customer submits valid UTR successfully post-delivery (200 OK)', submitRes.status === 200);
  const reportedOrder = submitRes.body.data;

  assert('4.6: Customer reported UTR is saved in database', reportedOrder.customerUtr === validUtr);
  assert('4.7: Payment status transitions to PAYMENT_REPORTED', reportedOrder.paymentStatus === 'PAYMENT_REPORTED');
  assert('4.8: Order status transitions to UNDER_REVIEW for mill reconciliation', reportedOrder.status === 'UNDER_REVIEW');
  assert('4.9: Submitted UTR is NOT marked as verified (paymentStatus !== VERIFIED)', reportedOrder.paymentStatus !== 'VERIFIED');
  assert('4.10: paymentReportedAt timestamp is recorded', Boolean(reportedOrder.paymentReportedAt));

  // Test 4.11: PAYMENT_REPORTED order cannot submit another UTR while awaiting admin review (duplicate/overwrite blocked)
  const dupReportRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: 'ANOTHER_UTR_999999',
  });
  assert(
    '4.11: Rejects second UTR submission while order is PAYMENT_REPORTED awaiting review (400)',
    dupReportRes.status === 400 && dupReportRes.body.message.includes('already awaiting admin payment verification')
  );

  // Test 4.12: Cancelled order cannot submit a UTR
  const cancelTestRes = await request('POST', '/orders', {
    items: [{ variantId: testVariant.id, quantity: 1 }],
    customerName: 'Cancel Test User',
    customerPhone: '9876543299',
    addressLine1: 'Cancel St',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  const cancelOrder = cancelTestRes.body.data;
  await request('PATCH', `/admin/orders/${cancelOrder.id}/status`, { status: 'CANCELLED', adminNotes: 'Admin cancelled test order' }, adminToken);
  const cancelUtrRes = await request('POST', `/orders/${cancelOrder.orderNumber}/report-payment`, {
    phone: '9876543299',
    utr: 'UTR_ON_CANCELLED_123',
  });
  assert('4.12: Rejects UTR submission on cancelled order (400)', cancelUtrRes.status === 400);

  // --- AREA 2: PAYMENT REJECTION AND RESUBMISSION AUDIT ---
  console.log('\n--- AREA 2: Payment Rejection & Resubmission Integrity ---');
  // Admin discovers bank credit did not match, reverts order
  const rejectUtrRes = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    {
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT', // Reverts to PAYMENT_INSTRUCTIONS_SENT, preserving delivery fact!
      adminNotes: 'UTR not found in HDFC statement. Customer requested to check bank reference and resubmit.',
    },
    adminToken
  );
  assert('5.1: Admin reverts order to AWAITING_PAYMENT on rejection (200 OK)', rejectUtrRes.status === 200);
  assert('5.2: Order status is AWAITING_PAYMENT', rejectUtrRes.body.data.status === 'AWAITING_PAYMENT');
  assert(
    '5.3: [HISTORICAL INTEGRITY] Payment status remains PAYMENT_INSTRUCTIONS_SENT (NOT reset to UNPAID)',
    rejectUtrRes.body.data.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT'
  );

  // Customer resubmits corrected UTR
  const correctedUtr = 'UTR20261113999999';
  const resubmitRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: correctedUtr,
  });
  assert('5.4: Customer successfully resubmits corrected UTR (200 OK)', resubmitRes.status === 200);
  assert('5.5: Database reflects updated UTR reference', resubmitRes.body.data.customerUtr === correctedUtr);
  assert('5.6: Status returns to UNDER_REVIEW / PAYMENT_REPORTED', resubmitRes.body.data.paymentStatus === 'PAYMENT_REPORTED');

  // Audit trail verification
  const auditLogs = resubmitRes.body.data.statusLogs;
  assert('5.7: Status logs maintain complete auditable trail', Array.isArray(auditLogs) && auditLogs.length >= 4);

  // --- SECTION 6: ADMIN UPI BANK CREDIT VERIFICATION ---
  console.log('\n--- SECTION 6: Admin UPI Payment Verification & Inventory Conversion ---');

  // Pre-verification variant stock snapshot
  const variantBeforeVerify = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  const stockBefore = variantBeforeVerify.stock;
  const reservedBefore = variantBeforeVerify.reservedStock;

  // Unauthenticated verification attempt
  const unauthVerify = await request('POST', `/admin/orders/${upiOrder.id}/verify-upi`, {
    adminNotes: 'Credit confirmed',
  });
  assert('6.1: Unauthenticated verification attempt is rejected (401)', unauthVerify.status === 401);

  // Rejection of verification on COD order
  const codVerify = await request(
    'POST',
    `/admin/orders/${codOrder.id}/verify-upi`,
    { adminNotes: 'Attempt on COD' },
    adminToken
  );
  assert('6.2: Verification rejected on COD order (400 Security Exception)', codVerify.status === 400);

  // Admin verifies UPI bank credit
  const verifyRes = await request(
    'POST',
    `/admin/orders/${upiOrder.id}/verify-upi`,
    { adminNotes: 'Bank credit of ₹' + reportedOrder.total + ' confirmed in HDFC Current A/c #...9837' },
    adminToken
  );
  assert('6.3: Admin verifies UPI payment successfully (200 OK)', verifyRes.status === 200);
  const verifiedOrder = verifyRes.body.data;

  assert('6.4: Order status transitions to CONFIRMED', verifiedOrder.status === 'CONFIRMED');
  assert('6.5: Payment status transitions to VERIFIED', verifiedOrder.paymentStatus === 'VERIFIED');
  assert('6.6: Inventory state converted from RESERVED to DEDUCTED', verifiedOrder.inventoryState === 'DEDUCTED');
  assert('6.7: isStockDeducted is marked true', verifiedOrder.isStockDeducted === true);
  assert('6.8: reservationExpiresAt is cleared to null', verifiedOrder.reservationExpiresAt === null);
  assert('6.9: paymentVerifiedAt timestamp is recorded', Boolean(verifiedOrder.paymentVerifiedAt));

  // Verify atomic stock deduction in PostgreSQL database
  const variantAfterVerify = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  assert(
    '6.10: PostgreSQL physical stock is permanently decremented by order quantity (2 units)',
    variantAfterVerify.stock === stockBefore - 2
  );
  assert(
    '6.11: PostgreSQL reservedStock is released from reservation pool (-2 units)',
    variantAfterVerify.reservedStock === reservedBefore - 2
  );

  // --- SECTION 7: SECURITY GUARDS & DUPLICATE PROTECTION ---
  console.log('\n--- SECTION 7: Duplicate Verification & Post-Verification Guards ---');

  // Duplicate verification call must be blocked
  const dupVerifyRes = await request(
    'POST',
    `/admin/orders/${upiOrder.id}/verify-upi`,
    { adminNotes: 'Duplicate verify attempt' },
    adminToken
  );
  assert('7.1: Duplicate verification call is blocked (400 - Already Verified)', dupVerifyRes.status === 400);

  // Stock must NOT be decremented again on duplicate attempt
  const variantAfterDup = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  assert('7.2: Inventory stock was NOT double-decremented', variantAfterDup.stock === variantAfterVerify.stock);

  // Customer cannot submit UTR once order is already verified
  const postVerifyUtrRes = await request('POST', `/orders/${upiOrder.orderNumber}/report-payment`, {
    phone: upiPhone,
    utr: 'ANOTHER_UTR_9999',
  });
  assert('7.3: Customer cannot re-report UTR on already verified order (400)', postVerifyUtrRes.status === 400);

  // Customer tracking reflects verified state
  const trackRes = await request('GET', `/orders/track?orderRef=${upiOrder.orderNumber}&phone=${upiPhone}`);
  assert('7.4: Customer tracking reflects CONFIRMED status', trackRes.body.data.status === 'CONFIRMED');
  assert('7.5: Customer tracking reflects VERIFIED payment status', trackRes.body.data.paymentStatus === 'VERIFIED');
  assert('7.6: Customer tracking retains recorded customerUtr', trackRes.body.data.customerUtr === correctedUtr);

  // Verified orders are strictly protected from expiry cleanup
  const cleanupOnVerified = await request('POST', '/admin/orders/cleanup-expired-reservations', {}, adminToken);
  assert('7.7: Cleanup does NOT cancel or affect verified orders', !cleanupOnVerified.body.data?.orderNumbers?.includes(upiOrder.orderNumber));

  // --- AREA 3: 24-HOUR RESERVATION EXPIRY & AUTOMATED CLEANUP ---
  console.log('\n--- AREA 3: 24-Hour Expiry Automation & Inventory Restoration ---');

  // Create an order specifically to test expiration
  const expPhone = '9876543212';
  const expCreate = await request('POST', '/orders', {
    items: [{ variantId: testVariant.id, quantity: 3 }],
    customerName: 'Expired Test User',
    customerPhone: expPhone,
    addressLine1: 'Test Expiry Lane',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  const expOrder = expCreate.body.data;

  // Admin quotes and customer accepts -> reserves 3 units
  await request('POST', `/admin/orders/${expOrder.id}/quote`, { courierFee: 40 }, adminToken);
  await request('POST', `/orders/${expOrder.orderNumber}/accept`, { phone: expPhone });

  const variantDuringExp = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  const reservedBeforeExp = variantDuringExp.reservedStock;

  // Directly set reservationExpiresAt into the past in the database
  const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  await prisma.orderRequest.update({
    where: { id: expOrder.id },
    data: { reservationExpiresAt: pastDate },
  });

  // Execute cleanup endpoint
  const cleanupRes = await request('POST', '/admin/orders/cleanup-expired-reservations', {}, adminToken);
  assert('8.1: Cleanup endpoint executes successfully (200 OK)', cleanupRes.status === 200);
  assert('8.2: Cleanup released at least 1 expired reservation', cleanupRes.body.data.releasedCount >= 1);
  assert('8.3: Expired order number is listed in released orders', cleanupRes.body.data.orderNumbers.includes(expOrder.orderNumber));

  // Verify expired order in database
  const expOrderDb = await prisma.orderRequest.findUnique({ where: { id: expOrder.id } });
  assert('8.4: Expired order status is changed to CANCELLED', expOrderDb.status === 'CANCELLED');
  assert('8.5: Expired order paymentStatus is UNPAID', expOrderDb.paymentStatus === 'UNPAID');
  assert('8.6: Expired order inventoryState is NONE', expOrderDb.inventoryState === 'NONE');
  assert('8.7: Expired order reservationExpiresAt is cleared', expOrderDb.reservationExpiresAt === null);

  // Verify reservedStock decremented back by 3 units in PostgreSQL
  const variantAfterExp = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  assert(
    '8.8: PostgreSQL reservedStock was released by exactly 3 units',
    variantAfterExp.reservedStock === reservedBeforeExp - 3
  );

  // Run cleanup again - must be idempotent (no double release)
  const cleanupAgain = await request('POST', '/admin/orders/cleanup-expired-reservations', {}, adminToken);
  assert('8.9: Subsequent cleanup is idempotent (releasedCount is 0)', cleanupAgain.body.data.releasedCount === 0);

  // --- SECTION 9: CODEBASE INTEGRITY & REPOSITORY AUDIT ---
  console.log('\n--- SECTION 9: Codebase Integrity & Safeguard Audits ---');
  const orderServiceTs = fs.readFileSync(path.resolve('backend/src/services/order.service.ts'), 'utf8');
  assert(
    '9.1: backend customerAcceptQuotation sets paymentStatus: UNPAID for UPI',
    orderServiceTs.includes('paymentStatus: PaymentStatus.UNPAID')
  );
  assert(
    '9.2: backend submitPaymentReport rejects UTR submission when paymentStatus is UNPAID',
    orderServiceTs.includes('order.paymentStatus === PaymentStatus.UNPAID')
  );
  assert(
    '9.3: backend verifyUpiPayment blocks duplicate verification if already VERIFIED',
    orderServiceTs.includes('Payment for order #${order.orderNumber} has already been verified')
  );
  assert(
    '9.4: backend updateOrderStatus enforces upiVerified, isDemoConfiguration, non-demo VPA, and structured deliveryChannel',
    orderServiceTs.includes('Cannot issue payment instructions: Merchant UPI account is pending verification') &&
    orderServiceTs.includes('Cannot issue payment instructions: System is in demo configuration') &&
    orderServiceTs.includes('A valid non-demo merchant UPI destination') &&
    orderServiceTs.includes('Admin must explicitly specify a structured deliveryChannel')
  );
  assert(
    '9.4b: backend submitPaymentReport enforces exact allowlist (UPI, AWAITING_PAYMENT, PAYMENT_INSTRUCTIONS_SENT)',
    orderServiceTs.includes('order.status !== OrderStatus.AWAITING_PAYMENT') &&
    orderServiceTs.includes('order.paymentStatus !== PaymentStatus.PAYMENT_INSTRUCTIONS_SENT') &&
    orderServiceTs.includes('Duplicate UTR submissions while awaiting review are blocked')
  );

  const serverTs = fs.readFileSync(path.resolve('backend/src/server.ts'), 'utf8');
  assert(
    '9.5: server.ts implements in-process background scheduler for expired reservation cleanup',
    serverTs.includes('cleanupScheduler = setInterval') && serverTs.includes('releaseExpiredReservations')
  );

  const trackingPageTsx = fs.readFileSync(path.resolve('frontend/src/pages/OrderTrackingPage.tsx'), 'utf8');
  assert(
    '9.6: OrderTrackingPage renders UTR submission form only after instructions are sent',
    trackingPageTsx.includes("order.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT'") &&
    trackingPageTsx.includes('Awaiting Payment Instructions')
  );
  assert(
    '9.7: OrderTrackingPage retains DEMO / NOT VERIFIED notice to protect customer funds',
    trackingPageTsx.includes('DEMO / NOT VERIFIED')
  );

  const adminOrdersPageTsx = fs.readFileSync(path.resolve('frontend/src/pages/AdminOrdersPage.tsx'), 'utf8');
  assert(
    '9.8: AdminOrdersPage implements handleVerifyUpiPayment calling orderService.verifyUpiPayment',
    adminOrdersPageTsx.includes('handleVerifyUpiPayment') && adminOrdersPageTsx.includes('orderService.verifyUpiPayment')
  );
  assert(
    '9.9: AdminOrdersPage handleRejectPaymentReport reverts to PAYMENT_INSTRUCTIONS_SENT (not UNPAID)',
    adminOrdersPageTsx.includes("paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT'") &&
    adminOrdersPageTsx.includes('handleRejectPaymentReport')
  );
  assert(
    '9.10: AdminOrdersPage displays unverified merchant warning when upiVerified or isDemoConfiguration is active',
    adminOrdersPageTsx.includes('UPI Verification Pending')
  );

  // --- FINAL REPORT ---
  console.log('\n================================================================');
  console.log(`TOTAL PHASE 6.4 RESULTS: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('❌ SOME PHASE 6.4 ASSERTIONS FAILED!');
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 6.4 INTEGRATION VERIFICATION ASSERTIONS PASSED WITH ZERO FAILURES!\n');
    process.exit(0);
  }
}

run()
  .catch((err) => {
    console.error('Unhandled verification error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
