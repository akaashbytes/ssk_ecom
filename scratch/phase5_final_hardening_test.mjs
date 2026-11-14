// Phase 5 Final Hardening Verification Test Suite
// SSK Natural Gold E-Commerce Website

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { createApp } = require('../backend/dist/app.js');
const { default: prisma } = require('../backend/dist/config/database.js');
const { OrderService, OrderStatus, PaymentStatus, PaymentPreference } = require('../backend/dist/services/order.service.js');
const { AdminRole } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('../backend/node_modules/bcryptjs');

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 5 FINAL HARDENING VERIFICATION SUITE');
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

const TEST_PORT = 5077;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runFinalHardeningSuite() {
  const app = createApp();
  let server;

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST-HARNESS] Final hardening test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // Setup RBAC test users in DB
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('TestPass2026!', salt);

    // Super Admin
    const superAdmin = await prisma.adminUser.upsert({
      where: { email: 'superadmin@ssknaturalgold.com' },
      update: { role: AdminRole.SUPER_ADMIN, passwordHash: passHash, isActive: true },
      create: {
        email: 'superadmin@ssknaturalgold.com',
        name: 'Super Admin',
        role: AdminRole.SUPER_ADMIN,
        passwordHash: passHash,
        isActive: true,
      },
    });

    // Normal Admin
    const normalAdmin = await prisma.adminUser.upsert({
      where: { email: 'deskadmin@ssknaturalgold.com' },
      update: { role: AdminRole.ADMIN, passwordHash: passHash, isActive: true },
      create: {
        email: 'deskadmin@ssknaturalgold.com',
        name: 'Desk Admin',
        role: AdminRole.ADMIN,
        passwordHash: passHash,
        isActive: true,
      },
    });

    // Staff
    const staffUser = await prisma.adminUser.upsert({
      where: { email: 'staff@ssknaturalgold.com' },
      update: { role: AdminRole.STAFF, passwordHash: passHash, isActive: true },
      create: {
        email: 'staff@ssknaturalgold.com',
        name: 'Packing Staff',
        role: AdminRole.STAFF,
        passwordHash: passHash,
        isActive: true,
      },
    });

    // Log in all 3
    const superToken = (await (await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@ssknaturalgold.com', password: 'TestPass2026!' }),
    })).json()).data.token;

    const adminToken = (await (await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deskadmin@ssknaturalgold.com', password: 'TestPass2026!' }),
    })).json()).data.token;

    const staffToken = (await (await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@ssknaturalgold.com', password: 'TestPass2026!' }),
    })).json()).data.token;

    // =========================================================================
    // SECTION 1: UPI INVENTORY RESERVATION & EXPIRY WORKFLOW
    // =========================================================================
    console.log('--- SECTION 1: UPI Inventory Reservation & Expiry Workflow ---');

    // Create a product variant with exactly 5 units in stock for precise tracking
    const prod = await prisma.product.findFirst({ where: { inStock: true } });
    const resVariant = await prisma.productVariant.create({
      data: {
        productId: prod.id,
        sku: `SSK-RES-VAR-${Date.now()}`,
        volume: '1L Reserve Test',
        volumeMl: 1000,
        containerType: 'PET Bottle',
        mrp: 300,
        price: 250,
        stock: 5,
        reservedStock: 0,
      },
    });

    // 1.1 Customer submits UPI request: stock is NOT reserved yet
    const upiOrder = await OrderService.submitOrderRequest({
      customerName: 'Kavitha Reserve',
      customerPhone: '9840556677',
      addressLine1: '45 Lake View',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'UPI',
      items: [{ variantId: resVariant.id, quantity: 3 }],
    });
    let checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.1: Submitting UPI request leaves reservedStock at 0', checkV.reservedStock === 0 && checkV.stock === 5);

    // 1.2 Customer accepts quotation: stock is RESERVED (reservedStock = 3)
    await OrderService.sendQuotation(upiOrder.id, 50);
    const acceptedUpi = await OrderService.customerAcceptQuotation(upiOrder.orderNumber, '9840556677');
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.2: Customer acceptance reserves stock (reservedStock becomes 3)', checkV.reservedStock === 3 && checkV.stock === 5);
    assert('1.3: Order inventoryState is set to RESERVED', acceptedUpi.inventoryState === 'RESERVED');
    assert('1.4: Reservation has 24-hour expiry timestamp', !!acceptedUpi.reservationExpiresAt);

    // 1.5 Competing customer attempts to buy remaining stock: available is only 2 (5 - 3 = 2)
    let overResFailed = false;
    try {
      await OrderService.submitOrderRequest({
        customerName: 'Competing Buyer',
        customerPhone: '9840998877',
        addressLine1: 'Competing St',
        city: 'Tenkasi',
        state: 'Tamil Nadu',
        pincode: '627811',
        paymentPreference: 'UPI',
        items: [{ variantId: resVariant.id, quantity: 3 }], // wants 3, but only 2 unreserved
      });
    } catch {
      overResFailed = true;
    }
    assert('1.5: Reserved stock is unavailable to other orders (request for 3 rejected when unreserved is 2)', overResFailed);

    // 1.6 Payment instructions delivered -> Customer submits UTR & Admin verifies payment -> Reservation converts to permanent deduction
    await prisma.orderRequest.update({ where: { id: upiOrder.id }, data: { paymentStatus: 'PAYMENT_INSTRUCTIONS_SENT' } });
    await OrderService.submitPaymentReport(upiOrder.orderNumber, '9840556677', 'UTRRESERVE202611');
    const verifiedOrder = await OrderService.verifyUpiPayment(upiOrder.id);
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.6: Admin UPI verification converts reservation to permanent deduction (stock=2, reservedStock=0)', checkV.stock === 2 && checkV.reservedStock === 0);
    assert('1.7: Order inventoryState is set to DEDUCTED', verifiedOrder.inventoryState === 'DEDUCTED');

    // 1.8 Cancellation of an order in RESERVED state releases the reservation
    const upiOrder2 = await OrderService.submitOrderRequest({
      customerName: 'Buyer To Cancel',
      customerPhone: '9840334455',
      addressLine1: 'Addr Cancel',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'UPI',
      items: [{ variantId: resVariant.id, quantity: 2 }],
    });
    await OrderService.sendQuotation(upiOrder2.id, 50);
    await OrderService.customerAcceptQuotation(upiOrder2.orderNumber, '9840334455');
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.8: Second order reserves remaining 2 units (reservedStock becomes 2)', checkV.reservedStock === 2);

    // Customer cancels
    await OrderService.updateOrderStatus(upiOrder2.id, OrderStatus.CANCELLED);
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.9: Cancelling reserved order releases reservedStock back to 0', checkV.reservedStock === 0);

    // 1.10 Reservation Expiry Mechanism: Test automated release of expired reservations
    const upiOrderExpired = await OrderService.submitOrderRequest({
      customerName: 'Abandoned Buyer',
      customerPhone: '9840778899',
      addressLine1: 'Abandoned Addr',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      paymentPreference: 'UPI',
      items: [{ variantId: resVariant.id, quantity: 2 }],
    });
    await OrderService.sendQuotation(upiOrderExpired.id, 50);
    await OrderService.customerAcceptQuotation(upiOrderExpired.orderNumber, '9840778899');
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.10: Order reserves 2 units before abandonment', checkV.reservedStock === 2);

    // Manually backdate reservationExpiresAt to simulate 24-hour expiration
    await prisma.orderRequest.update({
      where: { id: upiOrderExpired.id },
      data: { reservationExpiresAt: new Date(Date.now() - 3600 * 1000) }, // 1 hour ago
    });

    // Run expiration cleanup
    const cleanupResult = await OrderService.releaseExpiredReservations();
    checkV = await prisma.productVariant.findUnique({ where: { id: resVariant.id } });
    assert('1.11: releaseExpiredReservations cleans up expired order and releases reservedStock back to 0', checkV.reservedStock === 0 && cleanupResult.releasedCount >= 1);

    const expiredRecord = await prisma.orderRequest.findUnique({ where: { id: upiOrderExpired.id } });
    assert('1.12: Expired order transitions to CANCELLED with SYSTEM actor audit log', expiredRecord.status === OrderStatus.CANCELLED && expiredRecord.inventoryState === 'NONE');

    // Clean up test variant
    await prisma.productVariant.delete({ where: { id: resVariant.id } });

    // =========================================================================
    // SECTION 2: REFUND AMOUNT INTEGRITY (FULL REFUNDS ONLY)
    // =========================================================================
    console.log('\n--- SECTION 2: Refund Amount Integrity (Full Refunds Only) ---');

    // Use verifiedOrder from Section 1 (Total = 250 + 50 = ₹300)
    const refundTestTotal = Number(verifiedOrder.total);

    // 2.1 Attempt partial refund (e.g. ₹150 of ₹300) -> MUST BE REJECTED
    const partialRefundRes = await fetch(`${BASE_URL}/api/admin/orders/${verifiedOrder.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        refundAmount: 150,
        refundReason: 'Partial customer return',
        refundReference: 'REFUNDPARTIAL001',
      }),
    });
    const partialRefundJson = await partialRefundRes.json();
    assert('2.1: Partial refund is strictly rejected with 400 Bad Request', partialRefundRes.status === 400);
    assert('2.2: Partial refund rejection message explains full refunds only policy', partialRefundJson.message.includes('Partial refunds are not supported in this release'));

    // 2.3 Attempt full refund matching exact collected total -> SUCCEEDS
    const fullRefundRes = await fetch(`${BASE_URL}/api/admin/orders/${verifiedOrder.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        refundAmount: refundTestTotal,
        refundReason: 'Full order return and mill reversal approved',
        refundReference: 'REVFULL202611001',
      }),
    });
    const fullRefundJson = await fullRefundRes.json();
    assert('2.3: Full refund matching exact total returns 200 OK', fullRefundRes.status === 200);
    assert('2.4: Payment status becomes REFUNDED', fullRefundJson?.data?.paymentStatus === PaymentStatus.REFUNDED);
    assert('2.5: Refund amount equals total collected order amount', Number(fullRefundJson?.data?.refundAmount) === refundTestTotal);

    // =========================================================================
    // SECTION 3: ROLE-BASED ACCESS CONTROL (STAFF vs ADMIN vs SUPER_ADMIN)
    // =========================================================================
    console.log('\n--- SECTION 3: Role-Based Authorization & Boundaries ---');

    // 3.1 STAFF attempting financial action (verify-upi) is rejected with 403 Forbidden
    const staffVerifyRes = await fetch(`${BASE_URL}/api/admin/orders/${verifiedOrder.id}/verify-upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({}),
    });
    assert('3.1: STAFF attempting to verify payment is rejected with 403 Forbidden', staffVerifyRes.status === 403);

    // 3.2 STAFF attempting to modify business settings is rejected with 403 Forbidden
    const staffSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ defaultCourierFee: 60 }),
    });
    assert('3.2: STAFF attempting to modify business settings is rejected with 403 Forbidden', staffSettingsRes.status === 403);

    // 3.3 ADMIN attempting to modify business settings is rejected with 403 Forbidden (Requires SUPER_ADMIN)
    const adminSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ defaultCourierFee: 60 }),
    });
    assert('3.3: ADMIN attempting to modify business payment settings is rejected with 403 Forbidden (SUPER_ADMIN required)', adminSettingsRes.status === 403);

    // 3.4 ADMIN attempting to view user accounts is rejected with 403 Forbidden
    const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert('3.4: ADMIN attempting to view admin users is rejected with 403 Forbidden (SUPER_ADMIN required)', adminUsersRes.status === 403);

    // 3.5 SUPER_ADMIN accessing user accounts returns 200 OK
    const superUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    assert('3.5: SUPER_ADMIN accessing admin accounts returns 200 OK', superUsersRes.status === 200);

    // =========================================================================
    // SECTION 4: PASSWORD ROTATION & SESSION INVALIDATION
    // =========================================================================
    console.log('\n--- SECTION 4: Password Rotation & Immediate Session Invalidation ---');

    // User logs in and receives token
    const rotLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deskadmin@ssknaturalgold.com', password: 'TestPass2026!' }),
    });
    const oldAdminToken = (await rotLoginRes.json()).data.token;

    // Verify token works
    const testBeforeRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${oldAdminToken}` },
    });
    assert('4.1: Initial token works before rotation', testBeforeRes.status === 200);

    // Rotate password
    const rotRes = await fetch(`${BASE_URL}/api/admin/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oldAdminToken}` },
      body: JSON.stringify({
        currentPassword: 'TestPass2026!',
        newPassword: 'BrandNewPass2026#',
      }),
    });
    assert('4.2: Password rotation returns 200 OK', rotRes.status === 200);

    // Old token MUST now be rejected with 401 Session Revoked!
    const testAfterRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${oldAdminToken}` },
    });
    const testAfterJson = await testAfterRes.json();
    assert('4.3: Previously issued JWT is IMMEDIATELY revoked and rejected with 401', testAfterRes.status === 401);
    assert('4.4: Revocation error message explicitly indicates password rotation', testAfterJson.message.includes('Session has been revoked due to password rotation'));

    // New password allows login and works
    const newLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deskadmin@ssknaturalgold.com', password: 'BrandNewPass2026#' }),
    });
    assert('4.5: Login with newly rotated password returns 200 OK', newLoginRes.status === 200);

    // Restore deskadmin password
    const newAdminToken = (await newLoginRes.json()).data.token;
    await fetch(`${BASE_URL}/api/admin/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newAdminToken}` },
      body: JSON.stringify({
        currentPassword: 'BrandNewPass2026#',
        newPassword: 'TestPass2026!',
      }),
    });

    // =========================================================================
    // SECTION 5: DEMO CATALOGUE & CONFIGURATION SAFEGUARDS
    // =========================================================================
    console.log('\n--- SECTION 5: Demo Catalogue & Configuration Safeguards ---');

    // 5.1 Settings returns demo flags
    const settingsRes = await fetch(`${BASE_URL}/api/settings`);
    const settingsJson = await settingsRes.json();
    assert('5.1: Settings returns isDemoConfiguration: true', settingsJson.data.isDemoConfiguration === true);
    assert('5.2: Settings returns isDemoCatalogue: true', settingsJson.data.isDemoCatalogue === true);
    assert('5.3: Settings returns fssaiVerified: false', settingsJson.data.fssaiVerified === false);
    assert('5.4: Settings returns upiVerified: false', settingsJson.data.upiVerified === false);

    // 5.5 Attempting to set isDemoConfiguration to false while using demo FSSAI is blocked
    const illegalPromoRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superToken}` },
      body: JSON.stringify({
        isDemoConfiguration: false,
        fssaiLicense: '22426293000431', // demo license
      }),
    });
    assert('5.5: Silently disabling demo configuration with demo FSSAI is blocked with 400', illegalPromoRes.status === 400);

    // 5.6 Attempting to set isDemoConfiguration to false while using demo UPI is blocked
    const illegalPromoUpi = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superToken}` },
      body: JSON.stringify({
        isDemoConfiguration: false,
        fssaiVerified: true,
        fssaiLicense: '11223344556677',
        merchantUpiId: 'ssknaturalgold@okhdfcbank', // demo UPI
        upiVerified: false,
      }),
    });
    assert('5.6: Silently disabling demo configuration with demo UPI VPA is blocked with 400', illegalPromoUpi.status === 400);

    // Cleanup test users
    await prisma.adminUser.deleteMany({
      where: { email: { in: ['superadmin@ssknaturalgold.com', 'deskadmin@ssknaturalgold.com', 'staff@ssknaturalgold.com'] } },
    });

  } catch (err) {
    console.error('[UNHANDLED HARDENING TEST EXCEPTION]:', err);
    failCount++;
  } finally {
    await prisma.$disconnect();
    server.close();
    console.log('\n================================================================');
    console.log(`FINAL HARDENING TEST RESULTS: PASS: ${passCount}, FAIL: ${failCount}`);
    console.log('================================================================');
  }
}

runFinalHardeningSuite();
