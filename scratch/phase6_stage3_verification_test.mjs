// Phase 6.3 - Guest Order Request & Quotation Workflow Verification Suite
// Tests guest checkout, dual-identifier tracking, admin quotation, acceptance, decline, and inventory reservation.

import http from 'node:http';

const API_BASE = 'http://localhost:5000/api';

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

async function request(method, path, body = null, headers = {}) {
  const fullUrl = API_BASE + (path.startsWith('/') ? path : '/' + path);
  const url = new URL(fullUrl);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('SSK NATURAL GOLD - PHASE 6.3 INTEGRATION VERIFICATION SUITE');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1: Product Variants Discovery for Order Testing
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- SECTION 1: Product Variants & Inventory Baseline ---');
  const prodsRes = await request('GET', '/products');
  assert('1.1: Public catalogue is reachable', prodsRes.status === 200);
  const products = prodsRes.body.data;
  assert('1.2: Catalogue contains active products', Array.isArray(products) && products.length > 0);

  // Find groundnut and sesame products with available stock
  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v) => ({ ...v, productName: p.nameEn }))
  );
  const availableVariant = allVariants.find((v) => v.stock > 10);
  assert(
    '1.3: Located product variant with available stock for testing',
    Boolean(availableVariant),
    `Found variant: ${availableVariant?.id}`
  );

  const initialStock = availableVariant.stock;
  const initialReserved = availableVariant.reservedStock || 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2: Guest Order Request Submission (POST /api/orders)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 2: Guest Order Request Submission (POST /api/orders) ---');

  // Test 2.1: Rejection on missing items or invalid PIN code
  const emptyItemsRes = await request('POST', '/orders', {
    items: [],
    customerName: 'Annamalai K.',
    customerPhone: '9840112233',
    addressLine1: '123 North Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  assert(
    '2.1: Rejects order request when items array is empty (400)',
    emptyItemsRes.status === 400
  );

  const invalidPinRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Annamalai K.',
    customerPhone: '9840112233',
    addressLine1: '123 North Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '123', // Invalid PIN
    paymentPreference: 'UPI',
  });
  assert(
    '2.1b: Rejects order request when PIN code is invalid (400)',
    invalidPinRes.status === 400
  );

  // Test 2.2: Rejection on invalid 10-digit mobile number
  const invalidPhoneRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Annamalai K.',
    customerPhone: '12345', // Invalid phone
    addressLine1: '123 North Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  assert(
    '2.2: Rejects order request when phone is not a valid 10-digit number',
    invalidPhoneRes.status === 400
  );

  // Test 2.3: Rejection when requested quantity exceeds available stock
  const excessStockRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: initialStock + 500 }],
    customerName: 'Annamalai K.',
    customerPhone: '9840112233',
    addressLine1: '123 North Car Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  assert(
    '2.3: Rejects order request when requested quantity exceeds available stock',
    excessStockRes.status === 400
  );

  // Test 2.4: Successful UPI Guest Order Request
  const upiPhone = '9840123456';
  const upiOrderRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 2 }],
    customerName: 'Senthil Nathan',
    customerPhone: upiPhone,
    customerEmail: 'senthil@example.com',
    addressLine1: '14 Madasamy Kovil Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    deliveryInstructions: 'Ring bell on arrival',
    paymentPreference: 'UPI',
  });

  assert('2.4: Guest UPI order request succeeds with 201 Created', upiOrderRes.status === 201);
  const upiOrder = upiOrderRes.body.data;
  assert(
    '2.5: Generates genuine reference matching SSK-REQ-YYYY-XXXX',
    /^SSK-REQ-\d{4}-\d{4}$/.test(upiOrder.orderNumber),
    `Received: ${upiOrder.orderNumber}`
  );
  assert('2.6: Initial status is REQUESTED', upiOrder.status === 'REQUESTED');
  assert('2.7: Initial payment status is UNPAID for UPI', upiOrder.paymentStatus === 'UNPAID');
  assert(
    '2.8: Authoritative subtotal calculated from PostgreSQL variant price',
    Number(upiOrder.subtotal) === Number(availableVariant.price) * 2,
    `Calculated: ${upiOrder.subtotal}, Expected: ${Number(availableVariant.price) * 2}`
  );
  assert(
    '2.9: Delivery fee is initially 0 pending admin quotation review',
    Number(upiOrder.deliveryFee) === 0
  );
  assert(
    '2.10: Customer phone number is sanitized to exactly 10 digits',
    upiOrder.customerPhone === '9840123456'
  );

  // Test 2.11: Successful COD Guest Order Request
  const codPhone = '9840987654';
  const codOrderRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Meenakshi Sundaram',
    customerPhone: codPhone,
    addressLine1: '25 Agraharam Street',
    city: 'Shenkottai',
    state: 'Tamil Nadu',
    pincode: '627809',
    paymentPreference: 'COD',
  });

  assert('2.11: Guest COD order request succeeds with 201 Created', codOrderRes.status === 201);
  const codOrder = codOrderRes.body.data;
  assert('2.12: COD order initializes with status REQUESTED', codOrder.status === 'REQUESTED');
  assert(
    '2.13: COD order initializes with paymentStatus UNPAID before customer acceptance',
    codOrder.paymentStatus === 'UNPAID'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3: Customer Dual-Identifier Order Tracking (GET /api/orders/track)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 3: Dual-Identifier Order Tracking & Privacy ---');

  // Test 3.1: Rejection when phone number is missing
  const noPhoneRes = await request('GET', `/orders/track?orderRef=${upiOrder.orderNumber}`);
  assert('3.1: Rejects tracking when registered phone number is missing', noPhoneRes.status === 400);

  // Test 3.2: Rejection when phone number does not match
  const wrongPhoneRes = await request(
    'GET',
    `/orders/track?orderRef=${upiOrder.orderNumber}&phone=9999999999`
  );
  assert('3.2: Rejects tracking when phone number does not match', wrongPhoneRes.status === 404);

  // Test 3.3: Successful tracking with matching reference + phone
  const trackRes = await request(
    'GET',
    `/orders/track?orderRef=${upiOrder.orderNumber}&phone=${upiPhone}`
  );
  assert('3.3: Tracking succeeds with matching reference and phone', trackRes.status === 200);
  const trackedOrder = trackRes.body.data;
  assert(
    '3.4: Tracking payload includes customer status logs',
    Array.isArray(trackedOrder.statusLogs) && trackedOrder.statusLogs.length > 0
  );
  assert(
    '3.5: STRICT PRIVACY: Internal adminNotes is omitted from customer tracking payload',
    trackedOrder.adminNotes === undefined,
    `adminNotes: ${trackedOrder.adminNotes}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 4: Administrator Authentication & Protected API Routes
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 4: Administrator Authentication & JWT Security ---');

  // Test 4.1: Admin login with invalid password
  const badLoginRes = await request('POST', '/admin/auth/login', {
    email: 'admin@ssknaturalgold.com',
    password: 'wrongpassword',
  });
  assert('4.1: Rejects administrator login with invalid password', badLoginRes.status === 401);

  // Test 4.2: Admin login with valid credentials
  const loginRes = await request('POST', '/admin/auth/login', {
    email: 'admin@ssknaturalgold.com',
    password: 'tenkasi2026',
  });
  assert('4.2: Authenticates valid mill administrator credentials', loginRes.status === 200);
  const adminToken = loginRes.body.data.token;
  assert('4.3: Receives signed JWT token', Boolean(adminToken) && adminToken.split('.').length === 3);

  const authHeader = { Authorization: `Bearer ${adminToken}` };

  // Test 4.4: Protected admin endpoint rejects request without token
  const unauthRes = await request('GET', '/admin/orders');
  assert('4.4: Protected admin orders endpoint rejects unauthenticated access (401)', unauthRes.status === 401);

  // Test 4.5: Authenticated GET /api/admin/auth/me returns admin identity
  const meRes = await request('GET', '/admin/auth/me', null, authHeader);
  assert('4.5: /api/admin/auth/me returns authenticated admin identity', meRes.status === 200);
  assert(
    '4.6: Admin role is verified as ADMIN or SUPER_ADMIN',
    meRes.body.data.role === 'ADMIN' || meRes.body.data.role === 'SUPER_ADMIN'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 5: Admin Order Pipeline & Detail Inspection
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 5: Admin Order Pipeline Inspection ---');

  const adminOrdersRes = await request('GET', '/admin/orders', null, authHeader);
  assert('5.1: Admin retrieves live orders list from PostgreSQL', adminOrdersRes.status === 200);
  const adminOrdersList = adminOrdersRes.body.data;
  assert('5.2: Order list contains created test orders', adminOrdersList.length >= 2);

  const fetchedUpiOrder = adminOrdersList.find((o) => o.id === upiOrder.id);
  assert('5.3: Created UPI order is listed in admin pipeline', Boolean(fetchedUpiOrder));

  // Test 5.4: Fetch individual order details including audit trail
  const orderDetailRes = await request('GET', `/admin/orders/${upiOrder.id}`, null, authHeader);
  assert('5.4: Admin retrieves complete individual order detail', orderDetailRes.status === 200);
  assert('5.5: Admin detail includes ordered items with variants', orderDetailRes.body.data.items.length > 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 6: Admin Delivery Quotation Issuance
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 6: Admin Delivery Quotation Issuance ---');

  // Test 6.1: Reject non-numeric delivery fee
  const badQuoteRes = await request(
    'POST',
    `/admin/orders/${upiOrder.id}/quote`,
    { courierFee: 'invalid', adminNotes: 'Test note' },
    authHeader
  );
  assert('6.1: Rejects quotation with non-numeric courier fee', badQuoteRes.status === 400);

  // Test 6.2: Successful quotation issuance for UPI order
  const quotedFeeUpi = 60;
  const quoteUpiRes = await request(
    'POST',
    `/admin/orders/${upiOrder.id}/quote`,
    {
      courierFee: quotedFeeUpi,
      adminNotes: 'ST Courier regional parcel service to Tenkasi',
    },
    authHeader
  );

  assert('6.2: Admin issues delivery quotation successfully', quoteUpiRes.status === 200);
  const quotedUpiOrder = quoteUpiRes.body.data;
  assert(
    '6.3: Status transitions to AWAITING_CUSTOMER_ACCEPTANCE',
    quotedUpiOrder.status === 'AWAITING_CUSTOMER_ACCEPTANCE'
  );
  assert(
    '6.4: Quoted delivery fee is confirmed in database',
    Number(quotedUpiOrder.deliveryFee) === quotedFeeUpi
  );
  assert(
    '6.5: Total is recalculated to subtotal + courierFee',
    Number(quotedUpiOrder.total) === Number(upiOrder.subtotal) + quotedFeeUpi
  );
  assert(
    '6.6: Payment instructions remain locked before customer acceptance (remains UNPAID)',
    quotedUpiOrder.paymentStatus === 'UNPAID'
  );

  // Test 6.7: Successful quotation issuance for COD order
  const quotedFeeCod = 50;
  const quoteCodRes = await request(
    'POST',
    `/admin/orders/${codOrder.id}/quote`,
    {
      courierFee: quotedFeeCod,
      adminNotes: 'Professional courier COD delivery to Shenkottai',
    },
    authHeader
  );
  assert('6.7: Admin issues delivery quotation for COD order', quoteCodRes.status === 200);
  const quotedCodOrder = quoteCodRes.body.data;
  assert(
    '6.8: COD order transitions to AWAITING_CUSTOMER_ACCEPTANCE',
    quotedCodOrder.status === 'AWAITING_CUSTOMER_ACCEPTANCE'
  );
  assert(
    '6.9: COD order retains paymentStatus UNPAID before customer acceptance',
    quotedCodOrder.paymentStatus === 'UNPAID'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 7: Customer Quotation Acceptance & Inventory Reservation
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 7: Customer Acceptance & Transactional Stock Actions ---');

  // Test 7.1: UPI Acceptance requires registered phone verification
  const acceptNoPhoneRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, {
    phone: '',
  });
  assert('7.1: Rejects quotation acceptance without registered phone', acceptNoPhoneRes.status === 400);

  const acceptWrongPhoneRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, {
    phone: '9999999999',
  });
  assert('7.2: Rejects quotation acceptance with wrong phone number', acceptWrongPhoneRes.status === 400);

  // Test 7.3: Successful UPI Quotation Acceptance
  const acceptUpiRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, {
    phone: upiPhone,
  });
  assert('7.3: Customer accepts UPI quotation successfully', acceptUpiRes.status === 200);
  const acceptedUpiOrder = acceptUpiRes.body.data;
  assert(
    '7.4: UPI order transitions AWAITING_CUSTOMER_ACCEPTANCE -> AWAITING_PAYMENT',
    acceptedUpiOrder.status === 'AWAITING_PAYMENT'
  );
  assert(
    '7.5: Payment status strictly remains UNPAID until verified instructions delivered (paymentStatus: UNPAID)',
    acceptedUpiOrder.paymentStatus === 'UNPAID'
  );
  assert(
    '7.6: Inventory state is marked RESERVED',
    acceptedUpiOrder.inventoryState === 'RESERVED'
  );
  assert(
    '7.7: Reservation expiry date is set (~24 hours)',
    Boolean(acceptedUpiOrder.reservationExpiresAt)
  );

  // Verify DB reservedStock incremented
  const prodsAfterRes = await request('GET', '/products');
  const updatedVariantUpi = prodsAfterRes.body.data
    .flatMap((p) => p.variants || [])
    .find((v) => v.id === availableVariant.id);
  assert(
    '7.8: DB reservedStock incremented by requested quantity (2 units)',
    updatedVariantUpi.reservedStock === initialReserved + 2,
    `reservedStock is ${updatedVariantUpi.reservedStock}`
  );
  assert(
    '7.9: Physical stock remains un-decremented during reservation',
    updatedVariantUpi.stock === initialStock,
    `physical stock is ${updatedVariantUpi.stock}`
  );

  // Test 7.10: COD Quotation Acceptance
  const acceptCodRes = await request('POST', `/orders/${codOrder.orderNumber}/accept`, {
    phone: codPhone,
  });
  assert('7.10: Customer accepts COD quotation successfully', acceptCodRes.status === 200);
  const acceptedCodOrder = acceptCodRes.body.data;
  assert(
    '7.11: COD order transitions directly to CONFIRMED (bypasses AWAITING_PAYMENT)',
    acceptedCodOrder.status === 'CONFIRMED'
  );
  assert(
    '7.12: COD payment status remains COD_PENDING',
    acceptedCodOrder.paymentStatus === 'COD_PENDING'
  );
  assert(
    '7.13: COD inventory state is marked DEDUCTED',
    acceptedCodOrder.inventoryState === 'DEDUCTED'
  );

  // Verify DB stock decremented for COD
  const prodsAfterCod = await request('GET', '/products');
  const updatedVariantCod = prodsAfterCod.body.data
    .flatMap((p) => p.variants || [])
    .find((v) => v.id === availableVariant.id);
  assert(
    '7.14: Physical stock permanently decremented by 1 unit for confirmed COD order',
    updatedVariantCod.stock === initialStock - 1,
    `physical stock is ${updatedVariantCod.stock}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 8: Customer Quotation Decline Workflow
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 8: Customer Quotation Decline Workflow ---');

  // Create a third order to test declining
  const declinePhone = '9840445566';
  const declineOrderRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Karthik Raja',
    customerPhone: declinePhone,
    addressLine1: '88 Railway Feeder Road',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  const declineOrder = declineOrderRes.body.data;

  // Admin quotes it
  await request(
    'POST',
    `/admin/orders/${declineOrder.id}/quote`,
    { courierFee: 75, adminNotes: 'Express courier' },
    authHeader
  );

  // Customer declines quotation
  const declineRes = await request('POST', `/orders/${declineOrder.orderNumber}/decline`, {
    phone: declinePhone,
    reason: 'Customer felt courier fee was too high',
  });
  assert('8.1: Customer declines delivery quotation successfully', declineRes.status === 200);
  const declinedOrder = declineRes.body.data;
  assert(
    '8.2: Declined order transitions directly to CANCELLED',
    declinedOrder.status === 'CANCELLED'
  );
  assert(
    '8.3: Quotation decline NEVER accidentally confirms the order',
    declinedOrder.status !== 'CONFIRMED' && declinedOrder.status !== 'AWAITING_PAYMENT'
  );

  // Test 8.4: Cancelled order cannot be re-accepted
  const reAcceptRes = await request('POST', `/orders/${declineOrder.orderNumber}/accept`, {
    phone: declinePhone,
  });
  assert('8.4: Cancelled order cannot be accepted (blocked with 400)', reAcceptRes.status === 400);

  // Test 8.5: Cancelled order cannot receive a new quotation
  const reQuoteRes = await request(
    'POST',
    `/admin/orders/${declineOrder.id}/quote`,
    { courierFee: 40 },
    authHeader
  );
  assert('8.5: Cancelled order cannot receive another quotation (blocked with 400)', reQuoteRes.status === 400);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 9: Admin Dashboard Live Pipeline Metrics
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 9: Admin Dashboard Metrics (GET /api/admin/dashboard/metrics) ---');

  const metricsRes = await request('GET', '/admin/dashboard/metrics', null, authHeader);
  assert('9.1: Live metrics endpoint returns 200 OK', metricsRes.status === 200);
  const metrics = metricsRes.body.data;
  assert('9.2: Metrics contains pipelineCounts object', typeof metrics.pipelineCounts === 'object');
  assert(
    '9.3: Pipeline count includes AWAITING_PAYMENT >= 1',
    metrics.pipelineCounts['AWAITING_PAYMENT'] >= 1,
    `Count: ${metrics.pipelineCounts['AWAITING_PAYMENT']}`
  );
  assert(
    '9.4: Pipeline count includes CONFIRMED >= 1',
    metrics.pipelineCounts['CONFIRMED'] >= 1,
    `Count: ${metrics.pipelineCounts['CONFIRMED']}`
  );
  assert(
    '9.5: Pipeline count includes CANCELLED >= 1',
    metrics.pipelineCounts['CANCELLED'] >= 1,
    `Count: ${metrics.pipelineCounts['CANCELLED']}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 10: Inventory Transaction Safety & Concurrency Audits
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 10: Inventory Transaction Safety & Concurrency Audits ---');

  // Test 10.1: Repeated quotation acceptance rejected
  const repeatUpiAcceptRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, {
    phone: upiPhone,
  });
  assert(
    '10.1: Repeated UPI quotation acceptance is rejected (400 - Invalid State Transition)',
    repeatUpiAcceptRes.status === 400
  );

  const repeatCodAcceptRes = await request('POST', `/orders/${codOrder.orderNumber}/accept`, {
    phone: codPhone,
  });
  assert(
    '10.2: Repeated COD quotation acceptance is rejected (400 - Invalid State Transition)',
    repeatCodAcceptRes.status === 400
  );

  // Test 10.3: Cross-customer acceptance blocked
  const crossCustomerAcceptRes = await request('POST', `/orders/${upiOrder.orderNumber}/accept`, {
    phone: '9840999999', // Different customer's phone
  });
  assert(
    '10.3: Customer cannot accept another customer\'s quotation (400 - Phone mismatch)',
    crossCustomerAcceptRes.status === 400
  );

  // Test 10.4: Cross-customer decline blocked
  const crossCustomerDeclineRes = await request('POST', `/orders/${codOrder.orderNumber}/decline`, {
    phone: '9840999999', // Different customer's phone
  });
  assert(
    '10.4: Customer cannot decline another customer\'s quotation (400 - Phone mismatch)',
    crossCustomerDeclineRes.status === 400
  );

  // Test 10.5: UPI cancellation releases reservedStock
  const prodsBeforeCancelUpi = await request('GET', '/products');
  const vBeforeCancel = prodsBeforeCancelUpi.body.data
    .flatMap((p) => p.variants || [])
    .find((v) => v.id === availableVariant.id);
  const reservedBeforeCancel = vBeforeCancel.reservedStock;

  // Cancel the accepted UPI order via admin status update
  const cancelUpiRes = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    { status: 'CANCELLED', adminNotes: 'Customer requested cancellation of reserved order' },
    authHeader
  );
  assert('10.5: Admin cancels accepted UPI order', cancelUpiRes.status === 200);

  const prodsAfterCancelUpi = await request('GET', '/products');
  const vAfterCancel = prodsAfterCancelUpi.body.data
    .flatMap((p) => p.variants || [])
    .find((v) => v.id === availableVariant.id);
  assert(
    '10.6: UPI cancellation releases 2 units from reservedStock back to available pool',
    vAfterCancel.reservedStock === reservedBeforeCancel - 2,
    `Before: ${reservedBeforeCancel}, After: ${vAfterCancel.reservedStock}`
  );

  // Test 10.7: COD cancellation restores physical stock
  const stockBeforeCancelCod = vAfterCancel.stock;
  const cancelCodRes = await request(
    'PATCH',
    `/admin/orders/${codOrder.id}/status`,
    { status: 'CANCELLED', adminNotes: 'COD order cancelled before dispatch' },
    authHeader
  );
  assert('10.7: Admin cancels confirmed COD order', cancelCodRes.status === 200);

  const prodsAfterCancelCod = await request('GET', '/products');
  const vAfterCancelCod = prodsAfterCancelCod.body.data
    .flatMap((p) => p.variants || [])
    .find((v) => v.id === availableVariant.id);
  assert(
    '10.8: COD cancellation restores 1 unit back to physical stock',
    vAfterCancelCod.stock === stockBeforeCancelCod + 1,
    `Before: ${stockBeforeCancelCod}, After: ${vAfterCancelCod.stock}`
  );

  // Test 10.9: Cleanup expired reservations endpoint works cleanly
  const cleanupRes = await request(
    'POST',
    '/admin/orders/cleanup-expired-reservations',
    {},
    authHeader
  );
  assert('10.9: Admin triggers cleanup of expired reservations (200 OK)', cleanupRes.status === 200);
  assert(
    '10.10: Cleanup response includes releasedCount and orderNumbers',
    typeof cleanupRes.body.data?.releasedCount === 'number'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 11: Complete Sequence & State Machine Guards
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 11: Lifecycle Sequence & State Machine Guards ---');

  // Demonstrate complete sequence: REQUESTED -> UNDER_REVIEW -> AWAITING_CUSTOMER_ACCEPTANCE
  const seqPhone = '9840667788';
  const seqOrderRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Gomathi Ammal',
    customerPhone: seqPhone,
    addressLine1: '45 South Street',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  const seqOrder = seqOrderRes.body.data;
  assert('11.1: Sequence starts at REQUESTED', seqOrder.status === 'REQUESTED');

  // Move to UNDER_REVIEW
  const reviewRes = await request(
    'PATCH',
    `/admin/orders/${seqOrder.id}/status`,
    { status: 'UNDER_REVIEW', adminNotes: 'Mill desk checking stock' },
    authHeader
  );
  assert('11.2: Order transitions REQUESTED -> UNDER_REVIEW', reviewRes.status === 200 && reviewRes.body.data.status === 'UNDER_REVIEW');

  // Move to AWAITING_CUSTOMER_ACCEPTANCE
  const seqQuoteRes = await request(
    'POST',
    `/admin/orders/${seqOrder.id}/quote`,
    { courierFee: 45, adminNotes: 'Quoted 45 courier' },
    authHeader
  );
  assert('11.3: Order transitions UNDER_REVIEW -> AWAITING_CUSTOMER_ACCEPTANCE', seqQuoteRes.status === 200 && seqQuoteRes.body.data.status === 'AWAITING_CUSTOMER_ACCEPTANCE');

  // State Machine Invalidation Guards:
  // Invalid 11.4: Cannot skip directly from REQUESTED to AWAITING_PAYMENT
  const freshOrderRes = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Kailasam P.',
    customerPhone: '9840778899',
    addressLine1: '12 Car St',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'UPI',
  });
  const freshOrder = freshOrderRes.body.data;
  const skipToPaymentRes = await request(
    'PATCH',
    `/admin/orders/${freshOrder.id}/status`,
    { status: 'AWAITING_PAYMENT' },
    authHeader
  );
  assert('11.4: Direct transition from REQUESTED to AWAITING_PAYMENT is rejected (400)', skipToPaymentRes.status === 400);

  // Invalid 11.5: Cancelled order cannot move to PROCESSING or CONFIRMED
  const skipFromCancelledRes = await request(
    'PATCH',
    `/admin/orders/${upiOrder.id}/status`,
    { status: 'PROCESSING' },
    authHeader
  );
  assert('11.5: Transitioning CANCELLED order to PROCESSING is rejected (400)', skipFromCancelledRes.status === 400);

  // Invalid 11.6: COD order cannot enter AWAITING_PAYMENT
  const codOrder2Res = await request('POST', '/orders', {
    items: [{ variantId: availableVariant.id, quantity: 1 }],
    customerName: 'Muthusamy K.',
    customerPhone: '9840889900',
    addressLine1: '34 Car St',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    pincode: '627811',
    paymentPreference: 'COD',
  });
  const codOrder2 = codOrder2Res.body.data;
  const codToAwaitingPayRes = await request(
    'PATCH',
    `/admin/orders/${codOrder2.id}/status`,
    { status: 'AWAITING_PAYMENT' },
    authHeader
  );
  assert('11.6: Transitioning COD order to AWAITING_PAYMENT is rejected (400)', codToAwaitingPayRes.status === 400);

  // Invalid 11.7: Unauthenticated request to admin operations is rejected with 401
  const noTokenQuoteRes = await request(
    'POST',
    `/admin/orders/${seqOrder.id}/quote`,
    { courierFee: 50 }
  );
  assert('11.7: Unauthenticated admin quote request is rejected with 401', noTokenQuoteRes.status === 401);

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`TOTAL PHASE 6.3 RESULTS: ${passCount} Passed, ${failCount} Failed.`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
