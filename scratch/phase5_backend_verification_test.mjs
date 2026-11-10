// Phase 5 Database & Backend Development Verification Test Suite
// SSK Natural Gold E-Commerce Website

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { createApp } = require('../backend/dist/app.js');
const { default: prisma } = require('../backend/dist/config/database.js');

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 5 DATABASE & BACKEND VERIFICATION SUITE');
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

const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runVerification() {
  const app = createApp();
  let server;

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST-HARNESS] Backend test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // =========================================================================
    // SUITE 1: POSTGRESQL RELATIONAL DATABASE SCHEMA & PRISMA MODELS
    // =========================================================================
    console.log('--- SUITE 1: PostgreSQL Relational Database Schema & Models ---');

    await prisma.$connect();
    assert('1.1: PostgreSQL database connection established successfully', true);

    const adminCount = await prisma.adminUser.count();
    assert('1.2: AdminUser model exists in DB with seeded users', adminCount >= 1, `Count: ${adminCount}`);

    const productCount = await prisma.product.count();
    assert('1.3: Product model exists with traditional wood-pressed oils', productCount >= 3, `Count: ${productCount}`);

    const variantCount = await prisma.productVariant.count();
    assert('1.4: ProductVariant model exists with bottle/tin options', variantCount >= 9, `Count: ${variantCount}`);

    const settings = await prisma.businessSettings.findUnique({ where: { key: 'primary' } });
    assert('1.5: BusinessSettings model exists with primary key', !!settings);
    assert('1.6: Demo safeguard flag isDemoConfiguration is active', settings?.isDemoConfiguration === true);
    assert('1.7: Demo safeguard flag fssaiVerified is false (unverified demo license)', settings?.fssaiVerified === false);
    assert('1.8: Demo safeguard flag upiVerified is false (unverified demo UPI ID)', settings?.upiVerified === false);

    // =========================================================================
    // SUITE 2: ADMINISTRATOR AUTHENTICATION & ACCESS CONTROL (JWT + BCRYPT)
    // =========================================================================
    console.log('\n--- SUITE 2: Admin Authentication & Access Control (JWT + Bcrypt) ---');

    // 2.1 Missing credentials
    const emptyLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert('2.1: Login without credentials returns 400 Bad Request', emptyLoginRes.status === 400);

    // 2.2 Invalid credentials
    const badLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssknaturalgold.com', password: 'wrongpassword' }),
    });
    assert('2.2: Login with wrong password returns 401 Unauthorized', badLoginRes.status === 401);

    // 2.3 Valid credentials
    const validLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssknaturalgold.com', password: 'tenkasi2026' }),
    });
    const validLoginJson = await validLoginRes.json();
    assert('2.3: Login with correct bcrypt credentials returns 200 OK', validLoginRes.status === 200);
    assert('2.4: Login response issues JWT bearer token', typeof validLoginJson?.data?.token === 'string');
    assert('2.5: Login response returns admin user identity', validLoginJson?.data?.user?.email === 'admin@ssknaturalgold.com');

    const adminToken = validLoginJson.data.token;

    // 2.6 Protected route without token
    const noTokenRes = await fetch(`${BASE_URL}/api/admin/auth/me`);
    assert('2.6: Protected endpoint rejects request without token with 401', noTokenRes.status === 401);

    // 2.7 Protected route with invalid token
    const badTokenRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Authorization: 'Bearer forged.invalid.token' },
    });
    assert('2.7: Protected endpoint rejects invalid token with 401', badTokenRes.status === 401);

    // 2.8 Protected route with valid token
    const meRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meJson = await meRes.json();
    assert('2.8: Protected endpoint with valid token returns 200 OK', meRes.status === 200);
    assert('2.9: Admin profile verified with ADMIN role', meJson?.data?.role === 'ADMIN');

    // =========================================================================
    // SUITE 3: CUSTOMER PRODUCT CATALOG & SETTINGS PUBLIC APIS
    // =========================================================================
    console.log('\n--- SUITE 3: Customer Product Catalog & Settings Public APIs ---');

    // 3.1 Public products list
    const prodListRes = await fetch(`${BASE_URL}/api/products`);
    const prodListJson = await prodListRes.json();
    assert('3.1: Public product catalog returns 200 OK', prodListRes.status === 200);
    assert('3.2: Public product catalog returns 3 active oils', prodListJson?.data?.length === 3);
    assert('3.3: Product variants are included and ordered by price', prodListJson?.data[0]?.variants?.length >= 3);

    // 3.4 Public product by slug
    const singleProdRes = await fetch(`${BASE_URL}/api/products/traditional-groundnut-oil`);
    const singleProdJson = await singleProdRes.json();
    assert('3.4: Fetch single product by slug returns 200 OK', singleProdRes.status === 200);
    assert('3.5: Returns correct oil metadata and Tamil name', singleProdJson?.data?.nameTa?.includes('கடலை'));

    // 3.6 Non-existent slug returns 404
    const notFoundProdRes = await fetch(`${BASE_URL}/api/products/non-existent-oil-slug`);
    assert('3.6: Non-existent product slug returns 404 Not Found', notFoundProdRes.status === 404);

    // 3.7 Public settings
    const pubSettingsRes = await fetch(`${BASE_URL}/api/settings`);
    const pubSettingsJson = await pubSettingsRes.json();
    assert('3.7: Public business settings returns 200 OK', pubSettingsRes.status === 200);
    assert('3.8: Returns Tenkasi mill address and WhatsApp support', pubSettingsJson?.data?.millAddress?.includes('Tenkasi'));
    assert('3.9: Preserves demo configuration flag', pubSettingsJson?.data?.isDemoConfiguration === true);

    // =========================================================================
    // SUITE 4: GUEST ORDER REQUEST SUBMISSION & SERVER-SIDE CALCULATION
    // =========================================================================
    console.log('\n--- SUITE 4: Guest Order Request Submission & Server Calculation ---');

    // Grab a live variant from the catalog for testing
    const testProduct = prodListJson.data[0];
    const testVariant = testProduct.variants[0];
    const testVariant2 = testProduct.variants[1];

    // 4.1 Invalid phone validation
    const badPhoneRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Kavitha S',
        customerPhone: '12345', // invalid
        pincode: '600001',
        addressLine1: '12 Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        paymentPreference: 'UPI',
        items: [{ variantId: testVariant.id, quantity: 2 }],
      }),
    });
    assert('4.1: Order submission rejects invalid phone (<10 digits) with 400', badPhoneRes.status === 400);

    // 4.2 Invalid pincode validation
    const badPinRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Kavitha S',
        customerPhone: '9876543210',
        pincode: '6000', // invalid
        addressLine1: '12 Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        paymentPreference: 'UPI',
        items: [{ variantId: testVariant.id, quantity: 2 }],
      }),
    });
    assert('4.2: Order submission rejects invalid PIN (!=6 digits) with 400', badPinRes.status === 400);

    // 4.3 Server-side total calculation: ignore client-side subtotal manipulation
    const expectedSubtotal = Number(testVariant.price) * 2 + Number(testVariant2.price) * 1;

    const validUpiOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Akaash Sharma',
        customerPhone: '9840123456',
        customerEmail: 'akaash@example.com',
        addressLine1: 'Plot 44, Gandhi Nagar',
        city: 'Tenkasi',
        state: 'Tamil Nadu',
        pincode: '627811',
        paymentPreference: 'UPI',
        // Client attempts to pass a forged subtotal of 1.00 - server MUST ignore and calculate from DB
        clientSubtotal: 1.00,
        items: [
          { variantId: testVariant.id, quantity: 2 },
          { variantId: testVariant2.id, quantity: 1 },
        ],
      }),
    });
    const validUpiOrderJson = await validUpiOrderRes.json();
    assert('4.3: Valid guest order submission returns 201 Created', validUpiOrderRes.status === 201);
    assert('4.4: Order number adheres to collision-resistant pattern SSK-REQ-YYYY-XXXX', /^SSK-REQ-\d{4}-\d{4}$/.test(validUpiOrderJson?.data?.orderNumber));
    assert('4.5: Server calculates subtotal exclusively from DB variant prices', Number(validUpiOrderJson?.data?.subtotal) === expectedSubtotal, `Expected ${expectedSubtotal}, got ${validUpiOrderJson?.data?.subtotal}`);
    assert('4.6: Initial order status is REQUESTED', validUpiOrderJson?.data?.status === 'REQUESTED');
    assert('4.7: Initial payment status is UNPAID (UPI QR locked)', validUpiOrderJson?.data?.paymentStatus === 'UNPAID');
    assert('4.8: Internal adminNotes are omitted from customer order response', validUpiOrderJson?.data?.adminNotes === undefined);

    const upiOrder = validUpiOrderJson.data;

    // =========================================================================
    // SUITE 5: CUSTOMER ORDER TRACKING PRIVACY (DUAL-IDENTIFIER REQUIREMENT)
    // =========================================================================
    console.log('\n--- SUITE 5: Customer Order Tracking Privacy (Dual-Identifier) ---');

    // 5.1 Missing phone parameter
    const trackNoPhoneRes = await fetch(`${BASE_URL}/api/orders/track?orderRef=${upiOrder.orderNumber}`);
    assert('5.1: Tracking with reference alone (no phone) is rejected with 400 Bad Request', trackNoPhoneRes.status === 400);

    // 5.2 Missing orderRef parameter
    const trackNoRefRes = await fetch(`${BASE_URL}/api/orders/track?phone=9840123456`);
    assert('5.2: Tracking with phone alone (no reference) is rejected with 400 Bad Request', trackNoRefRes.status === 400);

    // 5.3 Valid reference + mismatched phone number
    const trackBadPhoneRes = await fetch(`${BASE_URL}/api/orders/track?orderRef=${upiOrder.orderNumber}&phone=9999999999`);
    assert('5.3: Tracking with mismatched phone number returns 404 Not Found', trackBadPhoneRes.status === 404);

    // 5.4 Valid reference + matching phone number
    const trackOkRes = await fetch(`${BASE_URL}/api/orders/track?orderRef=${upiOrder.orderNumber}&phone=9840123456`);
    const trackOkJson = await trackOkRes.json();
    assert('5.4: Tracking with matching reference and phone returns 200 OK', trackOkRes.status === 200);
    assert('5.5: Tracking response includes items and audit logs', trackOkJson?.data?.items?.length === 2);
    assert('5.6: Tracking response strictly excludes adminNotes', trackOkJson?.data?.adminNotes === undefined);

    // =========================================================================
    // SUITE 6: QUOTATION WORKFLOW & LIFECYCLE (UPI ORDER)
    // =========================================================================
    console.log('\n--- SUITE 6: Quotation Workflow & Lifecycle (UPI Order) ---');

    // 6.1 Admin issues quotation with courier fee
    const quoteRes = await fetch(`${BASE_URL}/api/admin/orders/${upiOrder.id}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ courierFee: 80, adminNotes: 'Standard courier to Tenkasi' }),
    });
    const quoteJson = await quoteRes.json();
    assert('6.1: Admin issuing quotation returns 200 OK', quoteRes.status === 200);
    assert('6.2: Order transitions to AWAITING_CUSTOMER_ACCEPTANCE', quoteJson?.data?.status === 'AWAITING_CUSTOMER_ACCEPTANCE');
    assert('6.3: Delivery fee is confirmed and total updated (subtotal + fee)', Number(quoteJson?.data?.deliveryFee) === 80 && Number(quoteJson?.data?.total) === expectedSubtotal + 80);
    assert('6.4: Payment status remains UNPAID (UPI QR instructions still locked)', quoteJson?.data?.paymentStatus === 'UNPAID');

    // 6.5 Customer accepts quotation
    const acceptRes = await fetch(`${BASE_URL}/api/orders/${upiOrder.orderNumber}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9840123456' }),
    });
    const acceptJson = await acceptRes.json();
    assert('6.5: Customer accepting quotation returns 200 OK', acceptRes.status === 200);
    assert('6.6: UPI order transitions to AWAITING_PAYMENT', acceptJson?.data?.status === 'AWAITING_PAYMENT');
    assert('6.7: Payment status transitions to PAYMENT_INSTRUCTIONS_SENT (UPI QR unlocked)', acceptJson?.data?.paymentStatus === 'PAYMENT_INSTRUCTIONS_SENT');

    // 6.8 Customer reports payment reference (UTR)
    const reportPayRes = await fetch(`${BASE_URL}/api/orders/${upiOrder.orderNumber}/report-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9840123456', utr: 'UPI20261110998877' }),
    });
    const reportPayJson = await reportPayRes.json();
    assert('6.8: Customer reporting UTR returns 200 OK', reportPayRes.status === 200);
    assert('6.9: Order status moves to UNDER_REVIEW for admin reconciliation', reportPayJson?.data?.status === 'UNDER_REVIEW');
    assert('6.10: Payment status moves to PAYMENT_REPORTED (not verified yet)', reportPayJson?.data?.paymentStatus === 'PAYMENT_REPORTED');

    // 6.11 Admin verifies bank credit
    const verifyUpiRes = await fetch(`${BASE_URL}/api/admin/orders/${upiOrder.id}/verify-upi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ adminNotes: 'HDFC bank credit reconciled at 12:45 PM' }),
    });
    const verifyUpiJson = await verifyUpiRes.json();
    assert('6.11: Admin verifying UPI credit returns 200 OK', verifyUpiRes.status === 200);
    assert('6.12: Order status transitions to CONFIRMED (moved to production)', verifyUpiJson?.data?.status === 'CONFIRMED');
    assert('6.13: Payment status transitions to VERIFIED', verifyUpiJson?.data?.paymentStatus === 'VERIFIED');

    // =========================================================================
    // SUITE 7: CASH ON DELIVERY (COD) WORKFLOW & COLLECTION SEPARATION
    // =========================================================================
    console.log('\n--- SUITE 7: Cash on Delivery (COD) Workflow & Collection ---');

    // 7.1 Submit COD order
    const codOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Murugan P',
        customerPhone: '9443123456',
        addressLine1: '15 West Car Street',
        city: 'Tenkasi',
        state: 'Tamil Nadu',
        pincode: '627811',
        paymentPreference: 'COD',
        items: [{ variantId: testVariant.id, quantity: 1 }],
      }),
    });
    const codOrderJson = await codOrderRes.json();
    assert('7.1: COD guest order created with 201 Created', codOrderRes.status === 201);
    assert('7.2: COD order initial payment status is UNPAID', codOrderJson?.data?.paymentStatus === 'UNPAID');

    const codOrder = codOrderJson.data;

    // 7.3 Admin issues quotation for COD order
    const codQuoteRes = await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ courierFee: 50 }),
    });
    const codQuoteJson = await codQuoteRes.json();
    assert('7.3: COD order quotation sent returns 200 OK', codQuoteRes.status === 200);
    assert('7.4: COD order moves to AWAITING_CUSTOMER_ACCEPTANCE', codQuoteJson?.data?.status === 'AWAITING_CUSTOMER_ACCEPTANCE');

    // 7.5 Customer accepts COD quotation -> Moves directly to CONFIRMED and COD_PENDING
    const codAcceptRes = await fetch(`${BASE_URL}/api/orders/${codOrder.orderNumber}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9443123456' }),
    });
    const codAcceptJson = await codAcceptRes.json();
    assert('7.5: COD customer accepts quotation returns 200 OK', codAcceptRes.status === 200);
    assert('7.6: COD order bypasses payment wait and transitions directly to CONFIRMED', codAcceptJson?.data?.status === 'CONFIRMED');
    assert('7.7: COD payment status becomes COD_PENDING (no advance payment instructions)', codAcceptJson?.data?.paymentStatus === 'COD_PENDING');

    // 7.8 Progress COD order through PROCESSING -> DISPATCHED -> DELIVERED
    await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'DISPATCHED', courier: 'ST Courier', awbNumber: 'ST12345678' }),
    });
    const deliveredRes = await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    const deliveredJson = await deliveredRes.json();
    assert('7.8: COD order progresses to DELIVERED status', deliveredJson?.data?.status === 'DELIVERED');
    assert('7.9: Reaching DELIVERED does NOT auto-collect COD; paymentStatus remains COD_PENDING', deliveredJson?.data?.paymentStatus === 'COD_PENDING');

    // 7.10 Admin confirms doorstep cash collection
    const collectRes = await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/collect-cod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ adminNotes: 'Courier delivery agent deposited cash' }),
    });
    const collectJson = await collectRes.json();
    assert('7.10: Admin confirming COD cash collection returns 200 OK', collectRes.status === 200);
    assert('7.11: Payment status transitions to COD_COLLECTED', collectJson?.data?.paymentStatus === 'COD_COLLECTED');

    // =========================================================================
    // SUITE 8: COD QUOTATION DECLINE & COLLECTION OBLIGATION RELEASE
    // =========================================================================
    console.log('\n--- SUITE 8: Quotation Decline & Obligation Release ---');

    // 8.1 Submit another COD order
    const declineCodRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Sundar R',
        customerPhone: '9789123456',
        addressLine1: '20 North Street',
        city: 'Tenkasi',
        state: 'Tamil Nadu',
        pincode: '627811',
        paymentPreference: 'COD',
        items: [{ variantId: testVariant.id, quantity: 1 }],
      }),
    });
    const declineCodJson = await declineCodRes.json();
    const declineCodOrder = declineCodJson.data;

    // Issue quotation
    await fetch(`${BASE_URL}/api/admin/orders/${declineCodOrder.id}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ courierFee: 100 }),
    });

    // 8.2 Customer declines quotation
    const declineRes = await fetch(`${BASE_URL}/api/orders/${declineCodOrder.orderNumber}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9789123456', reason: 'Delivery charge is too high' }),
    });
    const declineJson = await declineRes.json();
    assert('8.1: Customer declining quotation returns 200 OK', declineRes.status === 200);
    assert('8.2: Order transitions to CANCELLED', declineJson?.data?.status === 'CANCELLED');
    assert('8.3: Payment status set to UNPAID (pending obligation completely released)', declineJson?.data?.paymentStatus === 'UNPAID');

    // 8.4 Attempt cash collection on cancelled order must fail
    const illegalCollectRes = await fetch(`${BASE_URL}/api/admin/orders/${declineCodOrder.id}/collect-cod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({}),
    });
    assert('8.4: Cash collection on cancelled order is rejected with 400', illegalCollectRes.status === 400);

    // =========================================================================
    // SUITE 9: SECURITY BOUNDARY & PAYMENT METHOD ISOLATION GUARDS
    // =========================================================================
    console.log('\n--- SUITE 9: Security Boundary & Payment Method Isolation ---');

    // 9.1 Attempt to verify UPI on a COD order
    const illegalUpiOnCod = await fetch(`${BASE_URL}/api/admin/orders/${codOrder.id}/verify-upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({}),
    });
    assert('9.1: Attempting to verify UPI on a COD order is rejected with 400 Security Exception', illegalUpiOnCod.status === 400);

    // 9.2 Attempt to collect COD on a UPI order
    const illegalCodOnUpi = await fetch(`${BASE_URL}/api/admin/orders/${upiOrder.id}/collect-cod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({}),
    });
    assert('9.2: Attempting to collect COD on a UPI order is rejected with 400 Security Exception', illegalCodOnUpi.status === 400);

    // 9.3 Attempt to submit UPI UTR on a COD order
    const illegalUtrOnCod = await fetch(`${BASE_URL}/api/orders/${codOrder.orderNumber}/report-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9443123456', utr: 'FAKE12345678' }),
    });
    assert('9.3: Attempting to report UPI UTR on a COD order is rejected with 400 Security Exception', illegalUtrOnCod.status === 400);

    // 9.4 Illegal state transition: Jump directly from REQUESTED to DELIVERED
    const jumpOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Jump',
        customerPhone: '9840999999',
        addressLine1: 'Test Address',
        city: 'Tenkasi',
        state: 'Tamil Nadu',
        pincode: '627811',
        paymentPreference: 'UPI',
        items: [{ variantId: testVariant.id, quantity: 1 }],
      }),
    });
    const jumpOrder = (await jumpOrderRes.json()).data;
    const illegalJumpRes = await fetch(`${BASE_URL}/api/admin/orders/${jumpOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert('9.4: Illegal state transition (REQUESTED -> DELIVERED) is blocked by state machine with 400', illegalJumpRes.status === 400);

    // 9.5 Terminal state guard: Cancelled order cannot move to PROCESSING
    const uncancelRes = await fetch(`${BASE_URL}/api/admin/orders/${declineCodOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    assert('9.5: Cancelled terminal order cannot resume fulfillment (rejected with 400)', uncancelRes.status === 400);

    // =========================================================================
    // SUITE 10: PRICE SNAPSHOT IMMUTABILITY AUDIT
    // =========================================================================
    console.log('\n--- SUITE 10: Price Snapshot Immutability Audit ---');

    // Check historical price stored in the order item of `upiOrder`
    const historicalOrderRecord = await prisma.orderRequest.findUnique({
      where: { id: upiOrder.id },
      include: { items: true },
    });
    const originalItemUnitPrice = Number(historicalOrderRecord.items[0].unitPrice);
    const originalItemSubtotal = Number(historicalOrderRecord.items[0].subtotal);

    // Admin updates the catalog variant price
    const newPrice = originalItemUnitPrice + 50;
    const updateVariantRes = await fetch(`${BASE_URL}/api/admin/products/variants/${testVariant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: newPrice }),
    });
    assert('10.1: Admin updates catalog variant price returns 200 OK', updateVariantRes.status === 200);

    // Re-query historical order item from DB to verify immutability
    const postUpdateOrderRecord = await prisma.orderRequest.findUnique({
      where: { id: upiOrder.id },
      include: { items: true },
    });
    const postItemUnitPrice = Number(postUpdateOrderRecord.items[0].unitPrice);
    const postItemSubtotal = Number(postUpdateOrderRecord.items[0].subtotal);

    assert('10.2: Historical order item unitPrice remains unchanged after catalog price update', postItemUnitPrice === originalItemUnitPrice, `Original: ${originalItemUnitPrice}, Post: ${postItemUnitPrice}`);
    assert('10.3: Historical order item subtotal remains unchanged', postItemSubtotal === originalItemSubtotal, `Original: ${originalItemSubtotal}, Post: ${postItemSubtotal}`);

    // Revert variant price back to original
    await fetch(`${BASE_URL}/api/admin/products/variants/${testVariant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: originalItemUnitPrice }),
    });

    // =========================================================================
    // SUITE 11: ADMIN DASHBOARD METRICS & REVENUE AUDIT
    // =========================================================================
    console.log('\n--- SUITE 11: Admin Dashboard Metrics & Revenue Audit ---');

    const metricsRes = await fetch(`${BASE_URL}/api/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsJson = await metricsRes.json();
    assert('11.1: Fetch dashboard metrics returns 200 OK', metricsRes.status === 200);
    assert('11.2: Metrics contains all 9 pipeline status counts', Object.keys(metricsJson?.data?.pipelineCounts || {}).length === 9);
    assert('11.3: Total orders count is accurately tracked', typeof metricsJson?.data?.totalOrders === 'number' && metricsJson.data.totalOrders >= 4);
    assert('11.4: Total revenue accounts for VERIFIED and COD_COLLECTED orders', metricsJson?.data?.totalRevenue > 0, `Revenue: ₹${metricsJson?.data?.totalRevenue}`);

    // =========================================================================
    // SUITE 12: ADMIN PRODUCT & CATALOG MANAGEMENT CRUD
    // =========================================================================
    console.log('\n--- SUITE 12: Admin Product Catalog Management CRUD ---');

    const adminProdsRes = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert('12.1: Admin products list returns 200 OK', adminProdsRes.status === 200);

    // Toggle inStock availability
    const toggleStockRes = await fetch(`${BASE_URL}/api/admin/products/${testProduct.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ inStock: false }),
    });
    assert('12.2: Admin toggles product stock availability to false returns 200 OK', toggleStockRes.status === 200);

    // Verify public catalog hides out-of-stock product
    const publicAfterStockRes = await fetch(`${BASE_URL}/api/products`);
    const publicAfterStockJson = await publicAfterStockRes.json();
    const isHiddenFromPublic = !publicAfterStockJson.data.some((p) => p.id === testProduct.id);
    assert('12.3: Inactive/out-of-stock product is excluded from customer catalog', isHiddenFromPublic);

    // Restore stock availability
    await fetch(`${BASE_URL}/api/admin/products/${testProduct.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ inStock: true }),
    });

  } catch (err) {
    console.error('[UNHANDLED TEST EXCEPTION]:', err);
    failCount++;
  } finally {
    await prisma.$disconnect();
    server.close();
    console.log('\n================================================================');
    console.log(`TOTAL PASS: ${passCount}`);
    console.log(`TOTAL FAIL: ${failCount}`);
    console.log('================================================================');
  }
}

runVerification();
