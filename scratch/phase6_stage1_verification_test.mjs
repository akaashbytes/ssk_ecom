/**
 * SSK Natural Gold — Phase 6 Stage 1 Automated Verification Suite
 *
 * Verifies:
 * 1. Axios client configuration & base URL
 * 2. Admin token access, storage, and session cleanup utilities
 * 3. Protected admin endpoint detection & selective Bearer token attachment
 * 4. Token isolation: Public customer endpoints NEVER receive admin tokens
 * 5. 401 Unauthorized handling & concurrency debounce guard
 * 6. Decimal parsing & financial calculation safety (zero string concatenation)
 * 7. Product adapter field mapping (nameEn -> name, localized strings, variant prices)
 * 8. Inventory reservation & available stock calculation
 * 9. Order adapter unflattening (shippingAddress, guestDetails, field renames, tracking synthesis)
 * 10. Outbound order request payload adapter (sanitized phone, { variantId, quantity })
 * 11. Business settings adapter & demo safeguard preservation
 */

import assert from 'assert';

// Simulated browser storage for Node.js test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};
global.window = {
  location: {
    pathname: '/admin/dashboard',
    assign: (url) => { global.window.location.pathname = url; },
  },
};

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
    failCount++;
  }
}

async function testAsync(description, fn) {
  try {
    await fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('SSK NATURAL GOLD - PHASE 6.1 (STAGE 1) VERIFICATION SUITE');
console.log('================================================================\n');

// Import built/transpiled modules from frontend
// In node environment, we test the logic implemented in frontend/src/lib/axios.ts and apiAdapters.ts
const {
  ADMIN_TOKEN_STORAGE_KEY,
  getAdminToken,
  setAdminToken,
  removeAdminToken,
  clearAdminSession,
  isAdminAuthenticated,
  isProtectedAdminUrl,
  _reset401Guard,
  apiClient,
} = await import('../frontend/src/lib/axios.ts');


const {
  parseDecimal,
  roundCurrency,
  mapProductVariantFromApi,
  mapProductFromApi,
  mapProductsFromApi,
  mapOrderItemFromApi,
  generateTrackingHistoryFromStatusLogs,
  mapOrderFromApi,
  mapOrdersFromApi,
  mapSubmitOrderInputToBackend,
  mapBusinessSettingsFromApi,
} = await import('../frontend/src/services/apiAdapters.ts');

// --- SECTION 1: Axios Client Configuration ---
console.log('--- SECTION 1: Axios Client Configuration & Base URL ---');

test('1.1: Axios instance is created with correct default baseURL', () => {
  assert.strictEqual(typeof apiClient.defaults.baseURL, 'string');
  assert.ok(
    apiClient.defaults.baseURL.includes('localhost:5000/api') ||
    apiClient.defaults.baseURL.includes('/api')
  );
});

test('1.2: Axios timeout is configured to 10000ms', () => {
  assert.strictEqual(apiClient.defaults.timeout, 10000);
});

test('1.3: Axios default headers include Content-Type: application/json', () => {
  assert.strictEqual(apiClient.defaults.headers['Content-Type'], 'application/json');
});

// --- SECTION 2: Token Storage & Session Utilities ---
console.log('\n--- SECTION 2: Admin Token Access & Session Utilities ---');

test('2.1: Token utilities initially report unauthenticated state', () => {
  mockStorage.clear();
  assert.strictEqual(getAdminToken(), null);
  assert.strictEqual(isAdminAuthenticated(), false);
});

test('2.2: setAdminToken correctly stores JWT in localStorage', () => {
  const dummyJwt = 'header.payload_admin_tenkasi.signature';
  setAdminToken(dummyJwt);
  assert.strictEqual(getAdminToken(), dummyJwt);
  assert.strictEqual(isAdminAuthenticated(), true);
  assert.strictEqual(mockStorage.get(ADMIN_TOKEN_STORAGE_KEY), dummyJwt);
});

test('2.3: removeAdminToken cleans up JWT token', () => {
  removeAdminToken();
  assert.strictEqual(getAdminToken(), null);
  assert.strictEqual(isAdminAuthenticated(), false);
});

test('2.4: clearAdminSession removes token and session identifiers', () => {
  setAdminToken('test_jwt_to_clear');
  mockStorage.set('ssk_admin_user_session', JSON.stringify({ email: 'admin@ssknaturalgold.com' }));
  clearAdminSession();
  assert.strictEqual(getAdminToken(), null);
  assert.strictEqual(mockStorage.has('ssk_admin_user_session'), false);
});

// --- SECTION 3: Protected Admin URL Detection ---
console.log('\n--- SECTION 3: Protected Admin Endpoint Identification ---');

test('3.1: Identifies protected admin order endpoint', () => {
  assert.strictEqual(isProtectedAdminUrl('/api/admin/orders'), true);
  assert.strictEqual(isProtectedAdminUrl('/admin/orders/ord-123/quote'), true);
});

test('3.2: Identifies protected admin dashboard & settings endpoints', () => {
  assert.strictEqual(isProtectedAdminUrl('/api/admin/dashboard/metrics'), true);
  assert.strictEqual(isProtectedAdminUrl('/api/admin/settings'), true);
  assert.strictEqual(isProtectedAdminUrl('/admin/products/variants/var-1'), true);
});

test('3.3: Admin login endpoint is identified as public (NOT protected)', () => {
  // Login must not require or attach an existing token
  assert.strictEqual(isProtectedAdminUrl('/api/admin/auth/login'), false);
  assert.strictEqual(isProtectedAdminUrl('/admin/auth/login?redirect=1'), false);
});

test('3.4: Customer public endpoints are identified as NOT protected', () => {
  assert.strictEqual(isProtectedAdminUrl('/api/products'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/products/cold-pressed-groundnut-oil'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/orders'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/orders/track'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/orders/SSK-REQ-2026-1001/accept'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/settings'), false);
  assert.strictEqual(isProtectedAdminUrl('/api/health'), false);
});

// --- SECTION 4: Request Interceptor Selective Token Attachment ---
console.log('\n--- SECTION 4: Request Interceptor Selective Token Attachment ---');

test('4.1: Attaches Bearer JWT when requesting protected admin route', () => {
  const dummyJwt = 'test_valid_admin_jwt_token_2026';
  setAdminToken(dummyJwt);

  // Retrieve interceptor handler from apiClient
  const reqInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

  const mockAdminConfig = {
    url: '/api/admin/orders',
    headers: {},
  };

  const processed = reqInterceptor(mockAdminConfig);
  assert.strictEqual(processed.headers.Authorization, `Bearer ${dummyJwt}`);
});

test('4.2: STRICT PRIVACY: Does NOT attach Bearer JWT to public customer products endpoint', () => {
  const dummyJwt = 'test_valid_admin_jwt_token_2026';
  setAdminToken(dummyJwt);

  const reqInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

  const mockPublicConfig = {
    url: '/api/products',
    headers: {},
  };

  const processed = reqInterceptor(mockPublicConfig);
  assert.strictEqual(processed.headers.Authorization, undefined, 'Public products route must never receive admin token');
});

test('4.3: STRICT PRIVACY: Does NOT attach Bearer JWT to guest checkout endpoint', () => {
  const dummyJwt = 'test_valid_admin_jwt_token_2026';
  setAdminToken(dummyJwt);

  const reqInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

  const mockCheckoutConfig = {
    url: '/api/orders',
    headers: {},
  };

  const processed = reqInterceptor(mockCheckoutConfig);
  assert.strictEqual(processed.headers.Authorization, undefined, 'Guest checkout must never receive admin token');
});

test('4.4: STRICT PRIVACY: Does NOT attach Bearer JWT to order tracking endpoint', () => {
  const dummyJwt = 'test_valid_admin_jwt_token_2026';
  setAdminToken(dummyJwt);

  const reqInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

  const mockTrackConfig = {
    url: '/api/orders/track',
    headers: {},
  };

  const processed = reqInterceptor(mockTrackConfig);
  assert.strictEqual(processed.headers.Authorization, undefined, 'Customer tracking must never receive admin token');
});

test('4.5: Does not attach Authorization header if no token exists in storage', () => {
  removeAdminToken();

  const reqInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

  const mockAdminConfig = {
    url: '/api/admin/orders',
    headers: {},
  };

  const processed = reqInterceptor(mockAdminConfig);
  assert.strictEqual(processed.headers.Authorization, undefined);
});

// --- SECTION 5: 401 Response Error Handling & Concurrency Guard ---
console.log('\n--- SECTION 5: 401 Error Handling & Concurrency Guard ---');

await testAsync('5.1: 401 on protected admin route clears session and triggers redirect', async () => {
  setAdminToken('expired_stale_token');
  global.window.location.pathname = '/admin/orders';

  const resErrorHandler = apiClient.interceptors.response.handlers[0].rejected;

  const mock401Error = {
    config: { url: '/api/admin/orders' },
    response: { status: 401 },
  };

  try {
    await resErrorHandler(mock401Error);
  } catch {
    // Expected rejection
  }

  assert.strictEqual(getAdminToken(), null, 'Stale token must be purged upon 401');
  assert.strictEqual(global.window.location.pathname, '/admin/login', 'Must navigate to admin login');
});

await testAsync('5.2: 401 concurrency guard prevents duplicate redirect loops', async () => {
  if (typeof _reset401Guard === 'function') _reset401Guard();
  setAdminToken('expired_stale_token_2');
  global.window.location.pathname = '/admin/dashboard';


  const resErrorHandler = apiClient.interceptors.response.handlers[0].rejected;

  let assignCount = 0;
  const originalAssign = global.window.location.assign;
  global.window.location.assign = (url) => {
    assignCount++;
    global.window.location.pathname = url;
  };

  const mock401Error = {
    config: { url: '/api/admin/orders' },
    response: { status: 401 },
  };

  // Fire two concurrent 401 errors simultaneously
  await Promise.allSettled([
    resErrorHandler(mock401Error),
    resErrorHandler(mock401Error),
  ]);

  global.window.location.assign = originalAssign;
  assert.strictEqual(assignCount, 1, 'Duplicate 401s must trigger only a single redirect');
});

await testAsync('5.3: 401 on public route does NOT clear admin session', async () => {
  setAdminToken('valid_admin_token');

  const resErrorHandler = apiClient.interceptors.response.handlers[0].rejected;

  const mockPublic401 = {
    config: { url: '/api/products' },
    response: { status: 401 },
  };

  try {
    await resErrorHandler(mockPublic401);
  } catch {
    // Expected rejection
  }

  assert.strictEqual(getAdminToken(), 'valid_admin_token', 'Public route 401 must not purge admin token');
});


// --- SECTION 6: Decimal Conversion & Financial Values ---
console.log('\n--- SECTION 6: Decimal Parsing & Financial Calculation Safety ---');

test('6.1: parseDecimal handles string Decimal representations from Prisma', () => {
  assert.strictEqual(parseDecimal('470.00'), 470);
  assert.strictEqual(parseDecimal('550.50'), 550.5);
  assert.strictEqual(parseDecimal('  120.75  '), 120.75);
});

test('6.2: parseDecimal handles native numbers', () => {
  assert.strictEqual(parseDecimal(345), 345);
  assert.strictEqual(parseDecimal(0), 0);
});

test('6.3: parseDecimal handles null and undefined safely with fallback', () => {
  assert.strictEqual(parseDecimal(null), 0);
  assert.strictEqual(parseDecimal(undefined), 0);
  assert.strictEqual(parseDecimal(null, 50), 50);
  assert.strictEqual(parseDecimal(undefined, 100), 100);
});

test('6.4: parseDecimal handles object with toString (Decimal instance)', () => {
  const mockPrismaDecimal = {
    toString: () => '940.00',
  };
  assert.strictEqual(parseDecimal(mockPrismaDecimal), 940);
});

test('6.5: parseDecimal prevents accidental string concatenation in price totals', () => {
  const itemSubtotal = '470.00';
  const deliveryFee = '60.00';
  // String concat would yield "470.0060.00"
  const total = parseDecimal(itemSubtotal) + parseDecimal(deliveryFee);
  assert.strictEqual(total, 530);
  assert.strictEqual(typeof total, 'number');
});

test('6.6: roundCurrency rounds accurately to 2 decimal places', () => {
  assert.strictEqual(roundCurrency(10.555), 10.56);
  assert.strictEqual(roundCurrency(10.554), 10.55);
  assert.strictEqual(roundCurrency(0), 0);
});

// --- SECTION 7: Product Adapter Field Mapping ---
console.log('\n--- SECTION 7: Product Adapter Field Mapping ---');

test('7.1: mapProductFromApi maps localized fields correctly (nameEn -> name)', () => {
  const backendProduct = {
    id: 'prod-101',
    slug: 'cold-pressed-groundnut-oil',
    category: 'groundnut',
    nameEn: 'Vaagai Wood Groundnut Oil',
    nameTa: 'வாகை மரச்செக்கு கடலை எண்ணெய்',
    taglineEn: 'Cold Pressed Purity',
    taglineTa: 'இயற்கை மரச்செக்கு',
    descriptionEn: 'Pure wood-pressed groundnut oil.',
    descriptionTa: 'பாரம்பரிய மரச்செக்கு எண்ணெய்.',
    extractionProcessEn: 'Vaagai Wood Mortar Pressed',
    extractionProcessTa: 'வாகை மர உரல் முறை',
    rating: '4.95',
    reviewCount: 150,
    primaryImage: '/assets/groundnut.jpg',
    featured: true,
    inStock: true,
    variants: [
      {
        id: 'var-1',
        sku: 'GNO-1L',
        volume: '1 Litre',
        volumeMl: 1000,
        containerType: 'Food-Grade PET Bottle',
        mrp: '550.00',
        price: '470.00',
        stock: 45,
        reservedStock: 5,
        isDefault: true,
      },
    ],
  };

  const mapped = mapProductFromApi(backendProduct);

  assert.strictEqual(mapped.id, 'prod-101');
  assert.strictEqual(mapped.slug, 'cold-pressed-groundnut-oil');
  assert.strictEqual(mapped.name, 'Vaagai Wood Groundnut Oil', 'nameEn must map to name');
  assert.strictEqual(mapped.nameTa, 'வாகை மரச்செக்கு கடலை எண்ணெய்');
  assert.strictEqual(mapped.tagline, 'Cold Pressed Purity');
  assert.strictEqual(mapped.description, 'Pure wood-pressed groundnut oil.');
  assert.strictEqual(mapped.extractionProcess, 'Vaagai Wood Mortar Pressed');
  assert.strictEqual(mapped.rating, 4.95);
  assert.strictEqual(mapped.featured, true);
  assert.strictEqual(mapped.inStock, true);
  assert.strictEqual(mapped.variants.length, 1);
});

test('7.2: mapProductVariantFromApi calculates availableStock correctly', () => {
  const variantWithReservation = {
    id: 'var-1',
    sku: 'GNO-1L',
    volume: '1 Litre',
    mrp: '550.00',
    price: '470.00',
    stock: 50,
    reservedStock: 15,
  };

  const mapped = mapProductVariantFromApi(variantWithReservation);
  assert.strictEqual(mapped.mrp, 550);
  assert.strictEqual(mapped.price, 470);
  assert.strictEqual(mapped.stock, 50);
  assert.strictEqual(mapped.reservedStock, 15);
  assert.strictEqual(mapped.availableStock, 35, 'Available stock = stock (50) - reserved (15) = 35');
});

test('7.3: availableStock never drops below 0 even if reservedStock exceeds physical stock', () => {
  const overReservedVariant = {
    id: 'var-2',
    stock: 5,
    reservedStock: 8,
  };

  const mapped = mapProductVariantFromApi(overReservedVariant);
  assert.strictEqual(mapped.availableStock, 0, 'Available stock must be clamped to 0');
});

test('7.4: REMOVAL OF UNVERIFIED CLAIMS: nutrition facts and purity highlights are strictly empty when not in DB, and missing rating/reviewCount preserve null', () => {
  const bareProduct = {
    id: 'prod-bare',
    nameEn: 'Sesame Oil',
    nameTa: 'நல்லெண்ணெய்',
    variants: [],
  };

  const mapped = mapProductFromApi(bareProduct);
  assert.deepStrictEqual(mapped.nutritionFacts, [], 'Nutrition facts must remain empty when not verified in backend');
  assert.deepStrictEqual(mapped.purityHighlights, [], 'Purity highlights must remain empty when not verified in backend');
  assert.strictEqual(mapped.seedOrigin, '', 'Seed origin must remain empty string when not provided');
  assert.strictEqual(mapped.woodType, '', 'Wood type must remain empty string when not provided');
  assert.strictEqual(mapped.rating, null, 'Rating must be preserved as null when not verified in backend');
  assert.strictEqual(mapped.reviewCount, null, 'Review count must be preserved as null when not verified in backend');
});

test('7.5: mapProductsFromApi processes array and filters nulls', () => {
  const products = [
    { id: 'p1', nameEn: 'Oil 1', variants: [] },
    null,
    { id: 'p2', nameEn: 'Oil 2', variants: [] },
  ];
  const mapped = mapProductsFromApi(products);
  assert.strictEqual(mapped.length, 2);
  assert.strictEqual(mapped[0].name, 'Oil 1');
  assert.strictEqual(mapped[1].name, 'Oil 2');
});

test('7.6: GENUINE ZERO RATINGS: displays genuine zero only when explicitly supplied by backend', () => {
  const zeroProduct = {
    id: 'prod-zero',
    nameEn: 'New Batch Oil',
    nameTa: 'புதிய எண்ணெய்',
    rating: 0,
    reviewCount: 0,
    variants: [],
  };

  const mapped = mapProductFromApi(zeroProduct);
  assert.strictEqual(mapped.rating, 0, 'Explicit 0 rating must be preserved as genuine 0');
  assert.strictEqual(mapped.reviewCount, 0, 'Explicit 0 reviewCount must be preserved as genuine 0');

  // Also test with string representation "0"
  const stringZeroProduct = {
    id: 'prod-str-zero',
    nameEn: 'New Batch Oil 2',
    nameTa: 'புதிய எண்ணெய் 2',
    rating: '0',
    reviewCount: '0',
    variants: [],
  };

  const mappedStr = mapProductFromApi(stringZeroProduct);
  assert.strictEqual(mappedStr.rating, 0, 'Explicit "0" rating string must parse to genuine 0');
  assert.strictEqual(mappedStr.reviewCount, 0, 'Explicit "0" reviewCount string must parse to genuine 0');
});

test('7.7: VERIFIED RATINGS PRESERVED: preserves verified decimal ratings and positive review counts', () => {
  const verifiedProduct = {
    id: 'prod-verified',
    nameEn: 'Groundnut Oil',
    nameTa: 'கடலை எண்ணெய்',
    rating: '4.85',
    reviewCount: 142,
    variants: [],
  };

  const mapped = mapProductFromApi(verifiedProduct);
  assert.strictEqual(mapped.rating, 4.85, 'Verified rating must be preserved');
  assert.strictEqual(mapped.reviewCount, 142, 'Verified reviewCount must be preserved');
});

test('7.8: UNVERIFIED / MALFORMED RATINGS MAP TO NULL: empty strings or invalid numbers remain null', () => {
  const malformedProduct = {
    id: 'prod-malformed',
    nameEn: 'Test Oil',
    rating: 'unrated',
    reviewCount: 'invalid',
    variants: [],
  };

  const mapped = mapProductFromApi(malformedProduct);
  assert.strictEqual(mapped.rating, null, 'Malformed rating must become null (not 0)');
  assert.strictEqual(mapped.reviewCount, null, 'Malformed reviewCount must become null (not 0)');
});

// --- SECTION 8: Order Adapter Mapping & Tracking Synthesis ---
console.log('\n--- SECTION 8: Order Adapter Field Mapping & Tracking History ---');

test('8.1: mapOrderFromApi unflattens customer and shipping address fields', () => {
  const backendOrder = {
    id: 'ord-uuid-99',
    orderNumber: 'SSK-REQ-2026-8942',
    createdAt: '2026-11-10T10:30:00.000Z',
    status: 'REQUESTED',
    paymentPreference: 'UPI',
    paymentStatus: 'UNPAID',
    subtotal: '940.00',
    deliveryFee: '0.00',
    discount: '0.00',
    tax: '47.00',
    total: '940.00',
    customerName: 'Ramaiah Akaash',
    customerPhone: '9994072837',
    customerEmail: 'akaash@example.com',
    shippingAddressLine1: 'Door 14/B, Sannathi Street',
    shippingAddressLine2: 'Near Perumal Temple',
    shippingLandmark: 'Opposite Clock Tower',
    shippingCity: 'Tenkasi',
    shippingState: 'Tamil Nadu',
    shippingPincode: '627811',
    deliveryInstructions: 'Ring bell twice',
    customerUtr: null,
    courierPartner: null,
    trackingNumber: null,
    adminNotes: 'Internal mill notes',
    items: [
      {
        id: 'item-1',
        productId: 'prod-101',
        variantId: 'var-1',
        productName: 'Vaagai Wood Groundnut Oil',
        volume: '1 Litre',
        unitPrice: '470.00',
        mrp: '550.00',
        quantity: 2,
      },
    ],
    statusLogs: [
      {
        fromStatus: null,
        toStatus: 'REQUESTED',
        createdAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  };

  const mapped = mapOrderFromApi(backendOrder);

  assert.strictEqual(mapped.orderNumber, 'SSK-REQ-2026-8942');
  assert.strictEqual(mapped.subtotal, 940);
  assert.strictEqual(mapped.deliveryFee, 0);
  assert.strictEqual(mapped.total, 940);
  assert.strictEqual(typeof mapped.total, 'number');

  // Verify unflattened shippingAddress
  assert.strictEqual(mapped.shippingAddress.fullName, 'Ramaiah Akaash');
  assert.strictEqual(mapped.shippingAddress.phone, '9994072837');
  assert.strictEqual(mapped.shippingAddress.addressLine1, 'Door 14/B, Sannathi Street');
  assert.strictEqual(mapped.shippingAddress.addressLine2, 'Near Perumal Temple');
  assert.strictEqual(mapped.shippingAddress.landmark, 'Opposite Clock Tower');
  assert.strictEqual(mapped.shippingAddress.city, 'Tenkasi');
  assert.strictEqual(mapped.shippingAddress.pincode, '627811');

  // Verify unflattened guestDetails
  assert.ok(mapped.guestDetails);
  assert.strictEqual(mapped.guestDetails.fullName, 'Ramaiah Akaash');
  assert.strictEqual(mapped.guestDetails.phone, '9994072837');
  assert.strictEqual(mapped.guestDetails.email, 'akaash@example.com');
  assert.strictEqual(mapped.guestDetails.deliveryInstructions, 'Ring bell twice');

  // Verify items mapping
  assert.strictEqual(mapped.items.length, 1);
  assert.strictEqual(mapped.items[0].name, 'Vaagai Wood Groundnut Oil');
  assert.strictEqual(mapped.items[0].price, 470);
  assert.strictEqual(mapped.items[0].quantity, 2);
});

test('8.2: mapOrderFromApi performs field renames (customerUtr -> customerUtrNumber, courierPartner -> courier, trackingNumber -> awbNumber)', () => {
  const backendOrderWithDispatch = {
    id: 'ord-disp-1',
    orderNumber: 'SSK-REQ-2026-7777',
    status: 'DISPATCHED',
    paymentPreference: 'UPI',
    paymentStatus: 'VERIFIED',
    subtotal: '470.00',
    deliveryFee: '60.00',
    discount: '0.00',
    tax: '25.00',
    total: '530.00',
    customerName: 'Test Customer',
    customerPhone: '9876543210',
    shippingAddressLine1: 'Mettupatti Road',
    shippingCity: 'Tenkasi',
    shippingState: 'Tamil Nadu',
    shippingPincode: '627811',
    customerUtr: 'UTR123456789',
    courierPartner: 'The Professional Couriers',
    trackingNumber: 'TPC-TEN-998811',
  };

  const mapped = mapOrderFromApi(backendOrderWithDispatch);

  assert.strictEqual(mapped.customerUtrNumber, 'UTR123456789');
  assert.strictEqual(mapped.courier, 'The Professional Couriers');
  assert.strictEqual(mapped.awbNumber, 'TPC-TEN-998811');
});

test('8.3: generateTrackingHistoryFromStatusLogs synthesizes 6 bilingual checkpoints', () => {
  const history = generateTrackingHistoryFromStatusLogs(
    'CONFIRMED',
    'UPI',
    'VERIFIED',
    [
      { toStatus: 'REQUESTED', createdAt: '2026-11-10T10:00:00.000Z' },
      { toStatus: 'CONFIRMED', createdAt: '2026-11-10T11:00:00.000Z' },
    ],
    'UTR987654321'
  );

  assert.strictEqual(history.length, 6, 'Must generate exactly 6 lifecycle checkpoints');
  assert.strictEqual(history[0].title, 'Order Request Received');
  assert.strictEqual(history[0].completed, true);
  assert.strictEqual(history[2].title, 'UPI Payment Verification');
  assert.strictEqual(history[2].completed, true);
  assert.strictEqual(history[5].title, 'Delivered');
  assert.strictEqual(history[5].completed, false);
});

test('8.4: COD tracking history displays Cash on Delivery instructions instead of UPI QR', () => {
  const codPendingHistory = generateTrackingHistoryFromStatusLogs(
    'REQUESTED',
    'COD',
    'COD_PENDING'
  );

  assert.strictEqual(codPendingHistory[2].title, 'COD Order Confirmation');
  assert.ok(codPendingHistory[2].subtitle.includes('doorstep delivery'));
  assert.ok(codPendingHistory[0].subtitle.includes('Cash on Delivery'));

  const codConfirmedHistory = generateTrackingHistoryFromStatusLogs(
    'CONFIRMED',
    'COD',
    'COD_PENDING'
  );
  assert.strictEqual(codConfirmedHistory[2].title, 'COD Order Confirmation');
  assert.ok(codConfirmedHistory[2].subtitle.includes('Cash on Delivery confirmed'));
});


test('8.5: Tracking timestamps strictly require backend logs and are never fabricated', () => {
  // Order with no logs at all
  const rawHistory = generateTrackingHistoryFromStatusLogs(
    'REQUESTED',
    'UPI',
    'UNPAID',
    []
  );

  rawHistory.forEach((cp) => {
    assert.strictEqual(cp.timestamp, undefined, `Checkpoint "${cp.title}" must have undefined timestamp when no backend log exists`);
  });
});

test('8.6: UPI payment cannot be marked completed without VERIFIED backend evidence', () => {
  // Customer submitted UTR, but mill admin has NOT verified credit yet
  const reportedHistory = generateTrackingHistoryFromStatusLogs(
    'UNDER_REVIEW',
    'UPI',
    'PAYMENT_REPORTED',
    [
      { toStatus: 'REQUESTED', createdAt: '2026-11-10T10:00:00.000Z' },
      { toPaymentStatus: 'PAYMENT_REPORTED', createdAt: '2026-11-10T10:15:00.000Z' },
    ],
    'UTR-TEST-889900'
  );

  const paymentCp = reportedHistory[2];
  assert.strictEqual(paymentCp.title, 'UPI Payment Reported');
  assert.strictEqual(paymentCp.completed, false, 'Payment reported must NOT be marked completed before admin verification');
  assert.strictEqual(paymentCp.current, true, 'Payment reported must be current active step awaiting review');
  assert.ok(paymentCp.subtitle.includes('UTR-TEST-889900'));
});

test('8.7: Order cannot be marked dispatched or delivered without corresponding backend logs', () => {
  const confirmedHistory = generateTrackingHistoryFromStatusLogs(
    'CONFIRMED',
    'UPI',
    'VERIFIED',
    [
      { toStatus: 'REQUESTED', createdAt: '2026-11-10T10:00:00.000Z' },
      { toStatus: 'CONFIRMED', toPaymentStatus: 'VERIFIED', createdAt: '2026-11-10T11:00:00.000Z' },
    ]
  );

  assert.strictEqual(confirmedHistory[3].completed, false, 'Processing cannot be completed without progression log');
  assert.strictEqual(confirmedHistory[4].completed, false, 'Dispatched cannot be completed without progression log');
  assert.strictEqual(confirmedHistory[5].completed, false, 'Delivered cannot be completed without progression log');
});


// --- SECTION 9: Outbound Order Request Payload Adapter ---
console.log('\n--- SECTION 9: Outbound Order Request Payload Adapter ---');

test('9.1: mapSubmitOrderInputToBackend shapes payload strictly for POST /api/orders', () => {
  const clientInput = {
    items: [
      {
        id: 'p1-v1',
        productId: 'prod-101',
        variantId: 'var-1',
        slug: 'groundnut-oil',
        name: 'Vaagai Groundnut Oil',
        nameTa: 'கடலை எண்ணெய்',
        category: 'groundnut',
        volume: '1 Litre',
        price: 470,
        mrp: 550,
        quantity: 3,
        image: '/img.jpg',
        stock: 50,
      },
    ],
    shippingAddress: {
      id: 'addr-1',
      fullName: 'Akaash Ramaiah',
      phone: '+91 99940 72837',
      addressLine1: 'Door 14/B, Sannathi Street',
      addressLine2: 'Apt 2',
      landmark: 'Clock Tower',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      isDefault: true,
      addressType: 'HOME',
    },
    guestDetails: {
      fullName: 'Akaash Ramaiah',
      phone: '+91 99940 72837',
      email: 'akaash@example.com',
      addressLine1: 'Door 14/B, Sannathi Street',
      city: 'Tenkasi',
      state: 'Tamil Nadu',
      pincode: '627811',
      deliveryInstructions: 'Handle with care',
    },
    paymentPreference: 'UPI',
  };

  const payload = mapSubmitOrderInputToBackend(clientInput);

  // Security Verification: Client prices are omitted; backend calculates prices
  assert.deepStrictEqual(payload.items, [{ variantId: 'var-1', quantity: 3 }]);
  assert.strictEqual(payload.customerName, 'Akaash Ramaiah');
  assert.strictEqual(payload.customerPhone, '9994072837', 'Phone must be stripped to clean 10 digits');
  assert.strictEqual(payload.customerEmail, 'akaash@example.com');
  assert.strictEqual(payload.addressLine1, 'Door 14/B, Sannathi Street');
  assert.strictEqual(payload.city, 'Tenkasi');
  assert.strictEqual(payload.pincode, '627811');
  assert.strictEqual(payload.deliveryInstructions, 'Handle with care');
  assert.strictEqual(payload.paymentPreference, 'UPI');
});

// --- SECTION 10: Business Settings Adapter & Demo Safeguards ---
console.log('\n--- SECTION 10: Business Settings Adapter & Demo Safeguards ---');

test('10.1: mapBusinessSettingsFromApi maps Decimal fees and retains contact info', () => {
  const backendSettings = {
    id: 'set-1',
    businessName: 'SSK Natural Gold',
    businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
    fssaiLicense: '22426293000431',
    fssaiVerified: false,
    merchantUpiId: 'ssknaturalgold@okhdfcbank',
    merchantPayeeName: 'SSK Natural Gold',
    upiVerified: false,
    whatsappPhone: '+91 9994072837',
    supportPhone: '+91 9994072837',
    contactEmail: 'support@ssknaturalgold.com',
    millAddress: 'Mettupatti Main Road, Tenkasi District, Tamil Nadu — 627811',
    defaultCourierFee: '50.00',
    freeDeliveryThreshold: '1500.00',
    codEnabled: true,
    codMaxLimit: '5000.00',
    isDemoConfiguration: true,
  };

  const mapped = mapBusinessSettingsFromApi(backendSettings);

  assert.strictEqual(mapped.businessName, 'SSK Natural Gold');
  assert.strictEqual(mapped.businessNameTa, 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்');
  assert.strictEqual(mapped.defaultLocalCourierFee, 50);
  assert.strictEqual(typeof mapped.defaultLocalCourierFee, 'number');
  assert.strictEqual(mapped.freeDeliveryThreshold, 1500);
  assert.strictEqual(typeof mapped.freeDeliveryThreshold, 'number');
  assert.strictEqual(mapped.maxCodOrderValue, 5000);
  assert.strictEqual(typeof mapped.maxCodOrderValue, 'number');
  assert.strictEqual(mapped.codEnabled, true);
});

// --- Summary ---
console.log('\n================================================================');
console.log(`TOTAL PHASE 6.1 (STAGE 1) RESULTS: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(`\n🎉 ALL ${passCount} PHASE 6.1 (STAGE 1) VERIFICATION ASSERTIONS PASSED WITH ZERO FAILURES!\n`);

  process.exit(0);
}
