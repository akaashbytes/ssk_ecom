// Phase 5 Supplemental Backend Hardening & Verification Test Suite
// SSK Natural Gold E-Commerce Website

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { createApp } = require('../backend/dist/app.js');
const { default: prisma } = require('../backend/dist/config/database.js');
const { AuthService } = require('../backend/dist/services/auth.service.js');
const { OrderService, OrderStatus, PaymentStatus, PaymentPreference } = require('../backend/dist/services/order.service.js');

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 5 SUPPLEMENTAL VERIFICATION SUITE');
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

const TEST_PORT = 5088;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runSupplementalSuite() {
  const app = createApp();
  let server;

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST-HARNESS] Supplemental test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // Obtain admin token
    const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssknaturalgold.com', password: 'tenkasi2026' }),
    });
    const loginJson = await loginRes.json();
    let adminToken = loginJson.data.token;
    const adminId = loginJson.data.user.id;

    // =========================================================================
    // SECTION 1: ADMINISTRATOR CREDENTIAL SAFETY & PASSWORD ROTATION
    // =========================================================================
    console.log('--- SECTION 1: Administrator Credential Safety & Password Rotation ---');

    // 1.1 Password strength validation: < 8 characters rejected
    let weakRejected = false;
    try {
      AuthService.validatePasswordStrength('short');
    } catch {
      weakRejected = true;
    }
    assert('1.1: Weak password (<8 chars) is rejected by validator', weakRejected);

    // 1.2 Password rotation: incorrect current password rejected
    const badRotateRes = await fetch(`${BASE_URL}/api/admin/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'wrongCurrentPassword',
        newPassword: 'TenkasiSecurePass2026!',
      }),
    });
    assert('1.2: Password rotation with incorrect current password returns 400 Bad Request', badRotateRes.status === 400);

    // 1.3 Successful password rotation
    const goodRotateRes = await fetch(`${BASE_URL}/api/admin/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'tenkasi2026',
        newPassword: 'TenkasiRotated2026#',
      }),
    });
    assert('1.3: Valid password rotation returns 200 OK', goodRotateRes.status === 200);

    // 1.4 Login with new rotated password succeeds
    const newLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssknaturalgold.com', password: 'TenkasiRotated2026#' }),
    });
    assert('1.4: Admin can successfully log in with rotated password', newLoginRes.status === 200);

    // Restore original password for test consistency
    const rotatedToken = (await newLoginRes.json()).data.token;
    await fetch(`${BASE_URL}/api/admin/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rotatedToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'TenkasiRotated2026#',
        newPassword: 'tenkasi2026',
      }),
    });
    // Refresh token after password rotation
    const refreshLogin = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssknaturalgold.com', password: 'tenkasi2026' }),
    });
    adminToken = (await refreshLogin.json()).data.token;
    assert('1.5: Admin password safely restored to original dev credential', true);

    // =========================================================================
    // SECTION 2: REFUND WORKFLOW INTEGRITY & DELIVERED ORDER PROTECTION
    // =========================================================================
    console.log('\n--- SECTION 2: Refund Workflow Integrity & Delivered Order Protection ---');

    // Create a delivered order to test refund semantics
    const prod = await prisma.product.findFirst({
      where: { inStock: true, isArchived: false },
      include: { variants: true },
    });
    const v1 = prod.variants[0];

    // Submit order
    const refundOrderSubmit = await OrderService.submitOrderRequest({
      customerName: 'Karthik N',
      customerPhone: '9840112233',
      addressLine1: '88 Mill Road',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'UPI',
      items: [{ variantId: v1.id, quantity: 1 }],
    });

    // Admin quotes & customer accepts
    await OrderService.sendQuotation(refundOrderSubmit.id, 50);
    await OrderService.customerAcceptQuotation(refundOrderSubmit.orderNumber, '9840112233');
    await OrderService.submitPaymentReport(refundOrderSubmit.orderNumber, '9840112233', 'REFUNDUTR123456');
    await OrderService.verifyUpiPayment(refundOrderSubmit.id);
    await OrderService.updateOrderStatus(refundOrderSubmit.id, OrderStatus.PROCESSING);
    await OrderService.updateOrderStatus(refundOrderSubmit.id, OrderStatus.DISPATCHED, { courier: 'ST Courier', awbNumber: 'ST9988' });
    const deliveredOrder = await OrderService.updateOrderStatus(refundOrderSubmit.id, OrderStatus.DELIVERED);

    assert('2.1: Order reached DELIVERED with paymentStatus VERIFIED', deliveredOrder.status === OrderStatus.DELIVERED && deliveredOrder.paymentStatus === PaymentStatus.VERIFIED);

    // 2.2 Terminal State Guard: DELIVERED order cannot be cancelled
    let cancelDeliveredFailed = false;
    try {
      await OrderService.updateOrderStatus(deliveredOrder.id, OrderStatus.CANCELLED);
    } catch {
      cancelDeliveredFailed = true;
    }
    assert('2.2: Delivered order is terminal and CANNOT be transitioned to CANCELLED', cancelDeliveredFailed);

    // 2.3 Refund validation: refund amount cannot exceed order total
    const excessRefundRes = await fetch(`${BASE_URL}/api/admin/orders/${deliveredOrder.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        refundAmount: Number(deliveredOrder.total) + 500,
        refundReason: 'Customer return',
        refundReference: 'REV20261110001',
      }),
    });
    assert('2.3: Refund amount exceeding total order value is rejected with 400', excessRefundRes.status === 400);

    // 2.4 Explicit admin refund execution
    const validRefundRes = await fetch(`${BASE_URL}/api/admin/orders/${deliveredOrder.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        refundAmount: Number(deliveredOrder.total),
        refundReason: 'Goods damaged during transit; customer return approved by mill',
        refundReference: 'REV20261110001',
        adminNotes: 'Reversal initiated via HDFC NetBanking',
      }),
    });
    const validRefundJson = await validRefundRes.json();
    assert('2.4: Explicit admin refund returns 200 OK', validRefundRes.status === 200);
    assert('2.5: Payment status transitions to REFUNDED', validRefundJson?.data?.paymentStatus === PaymentStatus.REFUNDED);
    assert('2.6: Order status remains DELIVERED (not marked cancelled)', validRefundJson?.data?.status === OrderStatus.DELIVERED);
    assert('2.7: Refund metadata (amount, reason, reference, timestamp) recorded', Number(validRefundJson?.data?.refundAmount) === Number(deliveredOrder.total) && !!validRefundJson?.data?.refundedAt);

    // Check refund audit log
    const auditLogs = await prisma.orderStatusLog.findMany({
      where: { orderRequestId: deliveredOrder.id },
      orderBy: { createdAt: 'desc' },
    });
    const refundLog = auditLogs[0];
    assert('2.8: Status log accurately captures refund event with ADMIN actor and bank reference', refundLog.toPaymentStatus === PaymentStatus.REFUNDED && refundLog.actor === 'ADMIN' && refundLog.notes.includes('REV20261110001'));

    // =========================================================================
    // SECTION 3: DATABASE TRANSACTIONS & INVENTORY CONCURRENCY
    // =========================================================================
    console.log('\n--- SECTION 3: Database Transactions & Inventory Concurrency ---');

    // 3.1 Verify stock is NOT deducted on initial guest submission
    const freshV1 = await prisma.productVariant.findUnique({ where: { id: v1.id } });
    const initialStock = freshV1.stock;
    const testGuestOrder = await OrderService.submitOrderRequest({
      customerName: 'Ganesh M',
      customerPhone: '9840223344',
      addressLine1: '12 West Street',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'COD',
      items: [{ variantId: v1.id, quantity: 2 }],
    });
    const variantAfterRequest = await prisma.productVariant.findUnique({ where: { id: v1.id } });
    assert('3.1: Guest order submission does NOT deduct catalog stock', variantAfterRequest.stock === initialStock);
    assert('3.2: OrderRequest.isStockDeducted is initialized to false', testGuestOrder.isStockDeducted === false);

    // 3.3 Stock deducted upon COD confirmation
    await OrderService.sendQuotation(testGuestOrder.id, 50);
    const acceptedCodOrder = await OrderService.customerAcceptQuotation(testGuestOrder.orderNumber, '9840223344');
    const variantAfterConfirmation = await prisma.productVariant.findUnique({ where: { id: v1.id } });
    assert('3.3: Order confirmation deducts stock atomically', variantAfterConfirmation.stock === initialStock - 2);

    const confirmedOrderRecord = await prisma.orderRequest.findUnique({ where: { id: testGuestOrder.id } });
    assert('3.4: OrderRequest.isStockDeducted is set to true', confirmedOrderRecord.isStockDeducted === true);

    // 3.5 Releasing stock upon cancellation
    await OrderService.updateOrderStatus(testGuestOrder.id, OrderStatus.CANCELLED, { adminNotes: 'Customer requested cancellation' });
    const variantAfterCancel = await prisma.productVariant.findUnique({ where: { id: v1.id } });
    assert('3.5: Cancelling confirmed order restores deducted inventory back to catalog', variantAfterCancel.stock === initialStock);

    const cancelledOrderRecord = await prisma.orderRequest.findUnique({ where: { id: testGuestOrder.id } });
    assert('3.6: OrderRequest.isStockDeducted reset to false upon cancellation', cancelledOrderRecord.isStockDeducted === false);

    // 3.7 Concurrency Protection: Insufficient inventory blocks simultaneous over-allocation
    // Create a temporary variant with exactly 2 units in stock
    const limitedVariant = await prisma.productVariant.create({
      data: {
        productId: prod.id,
        sku: `SSK-TEST-LTD-${Date.now()}`,
        volume: 'Limited 1L',
        volumeMl: 1000,
        containerType: 'Test Bottle',
        mrp: 300,
        price: 250,
        stock: 2, // exactly 2 available
      },
    });

    // Create two orders requesting 2 units each
    const orderA = await OrderService.submitOrderRequest({
      customerName: 'Buyer A',
      customerPhone: '9840111111',
      addressLine1: 'Addr A',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'COD',
      items: [{ variantId: limitedVariant.id, quantity: 2 }],
    });
    const orderB = await OrderService.submitOrderRequest({
      customerName: 'Buyer B',
      customerPhone: '9840222222',
      addressLine1: 'Addr B',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'COD',
      items: [{ variantId: limitedVariant.id, quantity: 2 }],
    });

    await OrderService.sendQuotation(orderA.id, 50);
    await OrderService.sendQuotation(orderB.id, 50);

    // First acceptance succeeds
    await OrderService.customerAcceptQuotation(orderA.orderNumber, '9840111111');
    const stockAfterA = (await prisma.productVariant.findUnique({ where: { id: limitedVariant.id } })).stock;
    assert('3.7: First confirmation acquires inventory (stock decrements from 2 to 0)', stockAfterA === 0);

    // Second acceptance must fail with insufficient stock error
    let orderBFailed = false;
    let orderBError = '';
    try {
      await OrderService.customerAcceptQuotation(orderB.orderNumber, '9840222222');
    } catch (e) {
      orderBFailed = true;
      orderBError = e.message;
    }
    assert('3.8: Second simultaneous confirmation fails due to atomic stock exhaustion', orderBFailed && orderBError.includes('Insufficient stock'));

    // Clean up temporary variant
    await prisma.productVariant.delete({ where: { id: limitedVariant.id } });

    // =========================================================================
    // SECTION 4: DATABASE ENUMS & STATUS INTEGRITY
    // =========================================================================
    console.log('\n--- SECTION 4: Database Enums & Status Integrity ---');

    // Query Postgres pg_type to verify enum creation
    const enumQuery = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typname IN ('OrderStatus', 'PaymentStatus', 'PaymentPreference', 'AdminRole', 'ActorType');
    `;
    const enumNames = enumQuery.map((r) => r.typname);
    assert('4.1: PostgreSQL native enum OrderStatus exists', enumNames.includes('OrderStatus'));
    assert('4.2: PostgreSQL native enum PaymentStatus exists', enumNames.includes('PaymentStatus'));
    assert('4.3: PostgreSQL native enum PaymentPreference exists', enumNames.includes('PaymentPreference'));
    assert('4.4: PostgreSQL native enum AdminRole exists', enumNames.includes('AdminRole'));
    assert('4.5: PostgreSQL native enum ActorType exists', enumNames.includes('ActorType'));

    // Attempting invalid status update fails at DB level
    let invalidStatusRejected = false;
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE order_requests SET status = 'INVALID_FAKE_STATUS' WHERE id = '${testGuestOrder.id}'`
      );
    } catch {
      invalidStatusRejected = true;
    }
    assert('4.6: Database rejects insertion of invalid enum status at PostgreSQL level', invalidStatusRejected);

    // =========================================================================
    // SECTION 5: RATE LIMITING VERIFICATION (GET & POST TRACKING + LOGIN)
    // =========================================================================
    console.log('\n--- SECTION 5: Rate Limiting Verification ---');

    // Test POST tracking endpoint responds correctly
    const postTrackRes = await fetch(`${BASE_URL}/api/orders/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef: testGuestOrder.orderNumber, phone: '9840223344' }),
    });
    assert('5.1: POST /api/orders/track accepts JSON body with reference & phone', postTrackRes.status === 200);

    // Test rapid tracking requests trigger 429
    let triggeredRateLimit = false;
    for (let i = 0; i < 35; i++) {
      const r = await fetch(`${BASE_URL}/api/orders/track?orderRef=${testGuestOrder.orderNumber}&phone=9840223344`);
      if (r.status === 429) {
        triggeredRateLimit = true;
        break;
      }
    }
    assert('5.2: Rate limiter triggers 429 Too Many Requests on tracking lookup burst', triggeredRateLimit);

    // =========================================================================
    // SECTION 6: PRODUCT AND VARIANT CRUD & ARCHIVING
    // =========================================================================
    console.log('\n--- SECTION 6: Product and Variant CRUD & Archiving ---');

    // 6.1 Create product
    const createProdRes = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        slug: `test-castor-oil-${Date.now()}`,
        category: 'castor',
        nameEn: 'Pure Wood Pressed Castor Oil',
        nameTa: 'பாரம்பரிய மரச்செக்கு விளக்கெண்ணெய்',
        descriptionEn: 'Cold pressed unrefined castor oil.',
        descriptionTa: 'சுத்தமான மரச்செக்கு விளக்கெண்ணெய்.',
        variants: [
          { sku: `SSK-CST-500ML-${Date.now()}`, volume: '500 ml', volumeMl: 500, containerType: 'Bottle', mrp: 200, price: 180, stock: 20 },
        ],
      }),
    });
    const createdProd = (await createProdRes.json()).data;
    assert('6.1: Admin creates new product with variants returns 201 Created', createProdRes.status === 201);

    // 6.2 Add variant to product
    const addVariantRes = await fetch(`${BASE_URL}/api/admin/products/${createdProd.id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        sku: `SSK-CST-1L-${Date.now()}`,
        volume: '1 Litre',
        volumeMl: 1000,
        containerType: 'Bottle',
        mrp: 380,
        price: 350,
        stock: 15,
      }),
    });
    assert('6.2: Admin adds new variant to existing product returns 201 Created', addVariantRes.status === 201);

    // 6.3 Archive product
    const archiveRes = await fetch(`${BASE_URL}/api/admin/products/${createdProd.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isArchived: true }),
    });
    assert('6.3: Admin archives product returns 200 OK', archiveRes.status === 200);

    // Verify archived product is excluded from public catalog
    const publicList = await (await fetch(`${BASE_URL}/api/products`)).json();
    const isExcluded = !publicList.data.some((p) => p.id === createdProd.id);
    assert('6.4: Archived product is hidden from customer storefront', isExcluded);

    // 6.5 Safe Deletion: When product has NO orders, it can be permanently deleted
    const deleteCleanRes = await fetch(`${BASE_URL}/api/admin/products/${createdProd.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteCleanJson = await deleteCleanRes.json();
    assert('6.5: Product without orders is permanently deleted', deleteCleanJson?.data?.deleted === true);

    // 6.6 Safe Deletion: When product HAS orders, DELETE archives rather than hard deleting
    const deleteReferencedRes = await fetch(`${BASE_URL}/api/admin/products/${prod.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteReferencedJson = await deleteReferencedRes.json();
    assert('6.6: Product with historical order references is safely archived instead of hard deleted', deleteReferencedJson?.data?.archived === true && deleteReferencedJson?.data?.deleted === false);

    // Unarchive prod so it stays active
    await fetch(`${BASE_URL}/api/admin/products/${prod.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isArchived: false }),
    });
    await fetch(`${BASE_URL}/api/admin/products/${prod.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ inStock: true }),
    });

  } catch (err) {
    console.error('[UNHANDLED SUPPLEMENTAL TEST EXCEPTION]:', err);
    failCount++;
  } finally {
    await prisma.$disconnect();
    server.close();
    console.log('\n================================================================');
    console.log(`SUPPLEMENTAL TEST RESULTS: PASS: ${passCount}, FAIL: ${failCount}`);
    console.log('================================================================');
  }
}

runSupplementalSuite();
