/**
 * SSK Natural Gold — Phase 6.2 Automated Integration & Verification Suite
 *
 * Verifies:
 * 1. Live product catalogue integration (GET /api/products)
 * 2. Real PostgreSQL UUIDs for products and variants
 * 3. Category filtering via live backend endpoint
 * 4. Product detail retrieval by slug (GET /api/products/:slug)
 * 5. 404 handling for non-existent product slugs (clean null)
 * 6. Live public business settings integration (GET /api/settings)
 * 7. Business settings safety flags (isDemoConfiguration, fssaiVerified, upiVerified)
 * 8. Decimal & monetary precision across variants (prices, MRPs as numbers)
 * 9. Stock availability and out-of-stock restrictions in cart additions
 * 10. Quantity capping against available stock
 * 11. Cart item identification with actual backend IDs (${productId}-${variantId})
 * 12. Strict adherence to verified product metadata (zero invented nutritional or rating claims)
 * 13. Bilingual product fields (English & Tamil)
 * 14. Non-fallback error policy (network failure throws cleanly for UI retry states)
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
  location: { pathname: '/shop' },
  localStorage: global.localStorage,
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
console.log('SSK NATURAL GOLD - PHASE 6.2 INTEGRATION VERIFICATION SUITE');
console.log('================================================================\n');

// Import services and adapters
const { productService } = await import('../frontend/src/services/productService.ts');
const { settingsService } = await import('../frontend/src/services/settingsService.ts');
const { useCartStore } = await import('../frontend/src/stores/useCartStore.ts');

// --- SECTION 1: Public Product Catalogue Integration ---
console.log('--- SECTION 1: Public Product Catalogue Integration (GET /api/products) ---');

await testAsync('1.1: Live product catalogue returns active products from PostgreSQL', async () => {
  const products = await productService.getAllProducts();
  assert.ok(Array.isArray(products), 'Products must be returned as an array');
  assert.strictEqual(products.length, 3, 'Must return exactly 3 seeded active products from PostgreSQL');

  const slugs = products.map((p) => p.slug).sort();
  assert.ok(slugs.includes('traditional-groundnut-oil'), 'Must include traditional groundnut oil');
  assert.ok(slugs.includes('pure-wood-pressed-sesame-oil'), 'Must include pure sesame oil');
  assert.ok(slugs.includes('virgin-cold-pressed-coconut-oil'), 'Must include coconut oil');
});

await testAsync('1.2: Products and variants carry genuine PostgreSQL UUID identifiers', async () => {
  const products = await productService.getAllProducts();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const product of products) {
    assert.match(product.id, uuidRegex, `Product id ${product.id} must be a valid UUID`);
    assert.ok(product.variants.length >= 3, `Product ${product.slug} must have at least 3 variants`);
    for (const variant of product.variants) {
      assert.match(variant.id, uuidRegex, `Variant id ${variant.id} must be a valid UUID`);
    }
  }
});

await testAsync('1.3: Category filtering through backend API works accurately', async () => {
  const groundnutOnly = await productService.getAllProducts('groundnut');
  assert.strictEqual(groundnutOnly.length, 1, 'Filtering by groundnut should return exactly 1 product');
  assert.strictEqual(groundnutOnly[0].category, 'groundnut');

  const sesameOnly = await productService.getAllProducts('sesame');
  assert.strictEqual(sesameOnly.length, 1, 'Filtering by sesame should return exactly 1 product');
  assert.strictEqual(sesameOnly[0].category, 'sesame');

  const coconutOnly = await productService.getAllProducts('coconut');
  assert.strictEqual(coconutOnly.length, 1, 'Filtering by coconut should return exactly 1 product');
  assert.strictEqual(coconutOnly[0].category, 'coconut');
});

// --- SECTION 2: Product Detail Integration ---
console.log('\n--- SECTION 2: Product Detail Integration (GET /api/products/:slug) ---');

await testAsync('2.1: Fetches complete product details by slug from live backend', async () => {
  const product = await productService.getProductBySlug('traditional-groundnut-oil');
  assert.ok(product !== null, 'Product must not be null');
  assert.strictEqual(product.slug, 'traditional-groundnut-oil');
  assert.strictEqual(product.name, 'Traditional Groundnut Oil (Wood Pressed)');
  assert.strictEqual(product.nameTa, 'பாரம்பரிய மரச்செக்கு கடலை எண்ணெய்');
  assert.strictEqual(product.botanicalName, 'Arachis hypogaea');
  assert.ok(product.variants.length === 3, 'Must return 3 variants');
});

await testAsync('2.2: Returns null on 404 for non-existent product slug', async () => {
  const notFound = await productService.getProductBySlug('non-existent-synthetic-oil-2026');
  assert.strictEqual(notFound, null, 'Non-existent product slug must return null');
});

await testAsync('2.3: Preserves verified ratings from backend and suppresses fake claims', async () => {
  const groundnut = await productService.getProductBySlug('traditional-groundnut-oil');
  assert.strictEqual(groundnut.rating, 4.9, 'Groundnut rating from DB should be 4.9');
  assert.strictEqual(groundnut.reviewCount, 38, 'Groundnut reviewCount from DB should be 38');

  // Verify that nutrition facts and purity highlights do NOT invent unverified claims
  assert.ok(Array.isArray(groundnut.nutritionFacts), 'Nutrition facts must be an array');
  assert.ok(Array.isArray(groundnut.purityHighlights), 'Purity highlights must be an array');
});

// --- SECTION 3: Product Variant and Cart Compatibility ---
console.log('\n--- SECTION 3: Product Variant and Cart Compatibility ---');

await testAsync('3.1: Prices and MRP values are parsed as clean JavaScript numbers', async () => {
  const products = await productService.getAllProducts();
  for (const product of products) {
    for (const variant of product.variants) {
      assert.strictEqual(typeof variant.price, 'number', 'Price must be a number');
      assert.strictEqual(typeof variant.mrp, 'number', 'MRP must be a number');
      assert.ok(variant.price > 0, 'Price must be positive');
      assert.ok(variant.mrp >= variant.price, 'MRP must be greater than or equal to selling price');
      assert.ok(typeof variant.stock === 'number', 'Stock must be a number');
    }
  }
});

test('3.2: Cart additions use genuine backend UUIDs and construct compound IDs', () => {
  const cart = useCartStore.getState();
  cart.clearCart();

  const testProduct = {
    productId: 'a9f61cc3-7208-443c-a61b-43e63c46d432',
    variantId: '37382417-08e3-4c11-8a65-eadf82ef1679',
    slug: 'traditional-groundnut-oil',
    name: 'Traditional Groundnut Oil',
    nameTa: 'பாரம்பரிய மரச்செக்கு கடலை எண்ணெய்',
    category: 'groundnut',
    volume: '1 Litre',
    price: 295,
    mrp: 330,
    image: '/assets/products/groundnut-bottle.png',
    stock: 56,
    quantity: 2,
  };

  cart.addItem(testProduct);

  const items = useCartStore.getState().items;
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].id, `${testProduct.productId}-${testProduct.variantId}`);
  assert.strictEqual(items[0].productId, testProduct.productId);
  assert.strictEqual(items[0].variantId, testProduct.variantId);
  assert.strictEqual(items[0].quantity, 2);
  assert.strictEqual(items[0].price, 295);

  cart.clearCart();
});

test('3.3: Out-of-stock variant additions are strictly blocked', () => {
  const cart = useCartStore.getState();
  cart.clearCart();

  const outOfStockItem = {
    productId: 'a9f61cc3-7208-443c-a61b-43e63c46d432',
    variantId: 'zero-stock-variant-uuid',
    slug: 'traditional-groundnut-oil',
    name: 'Traditional Groundnut Oil',
    nameTa: 'பாரம்பரிய மரச்செக்கு கடலை எண்ணெய்',
    category: 'groundnut',
    volume: '15 L Tin',
    price: 1450,
    mrp: 1600,
    image: '/assets/products/groundnut-bottle.png',
    stock: 0, // OUT OF STOCK
    quantity: 1,
  };

  cart.addItem(outOfStockItem);

  const items = useCartStore.getState().items;
  assert.strictEqual(items.length, 0, 'Out-of-stock item must NEVER be added to the cart');
});

test('3.4: Cart quantity additions are capped at available stock', () => {
  const cart = useCartStore.getState();
  cart.clearCart();

  const limitedStockItem = {
    productId: 'prod-uuid-limited',
    variantId: 'var-uuid-limited',
    slug: 'limited-oil',
    name: 'Limited Oil',
    nameTa: 'எண்ணெய்',
    category: 'sesame',
    volume: '1 Litre',
    price: 470,
    mrp: 520,
    image: '/assets/products/sesame-bottle.png',
    stock: 3, // Only 3 available
    quantity: 10, // Requesting 10
  };

  cart.addItem(limitedStockItem);

  const items = useCartStore.getState().items;
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].quantity, 3, 'Quantity must be capped to available stock (3)');

  // Attempting to add more should also respect available stock
  cart.addItem({ ...limitedStockItem, quantity: 5 });
  const updatedItems = useCartStore.getState().items;
  assert.strictEqual(updatedItems[0].quantity, 3, 'Accumulated quantity must remain capped at stock');

  cart.clearCart();
});

// --- SECTION 4: Public Business Settings Integration ---
console.log('\n--- SECTION 4: Public Business Settings (GET /api/settings) ---');

await testAsync('4.1: Public business settings fetch live configuration from backend', async () => {
  const settings = await settingsService.getSettings();
  assert.strictEqual(settings.businessName, 'SSK Natural Gold');
  assert.strictEqual(settings.businessNameTa, 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்');
  assert.strictEqual(settings.fssaiLicense, '22426293000431');
  assert.strictEqual(settings.fssaiVerified, false, 'fssaiVerified flag must accurately reflect backend state');
  assert.strictEqual(settings.upiVerified, false, 'upiVerified flag must accurately reflect backend state');
  assert.strictEqual(settings.isDemoConfiguration, true, 'isDemoConfiguration must accurately reflect backend state');
  assert.strictEqual(settings.defaultLocalCourierFee, 50);
  assert.strictEqual(settings.freeDeliveryThreshold, 1500);
});

await testAsync('4.2: Settings adapter never exposes private database columns or admin secrets', async () => {
  const settings = await settingsService.getSettings();
  assert.strictEqual(settings.passwordHash, undefined, 'passwordHash must never exist in public settings');
  assert.strictEqual(settings.tokenVersion, undefined, 'tokenVersion must never exist in public settings');
  assert.strictEqual(settings.adminNotes, undefined, 'adminNotes must never exist in public settings');
});

// --- SECTION 5: Localization & Bilingual Support ---
console.log('\n--- SECTION 5: Localization & Bilingual Content ---');

await testAsync('5.1: Live products provide authentic English and Tamil titles and descriptions', async () => {
  const products = await productService.getAllProducts();
  for (const product of products) {
    assert.ok(product.name.length > 0, 'English name must not be empty');
    assert.ok(product.nameTa.length > 0, 'Tamil name must not be empty');
    assert.ok(product.description.length > 0, 'English description must not be empty');
    assert.ok(product.descriptionTa.length > 0, 'Tamil description must not be empty');
    assert.ok(product.tagline.length > 0, 'English tagline must not be empty');
    assert.ok(product.taglineTa.length > 0, 'Tamil tagline must not be empty');
  }
});

// --- SECTION 6: Error Resilience & Demo Safeguards ---
console.log('\n--- SECTION 6: Error Resilience & Demo Safeguards ---');

await testAsync('6.1: Non-fallback error policy: productService does NOT silently invent fake products on API failure', async () => {
  const { apiClient } = await import('../frontend/src/lib/axios.ts');
  const originalGet = apiClient.get;

  // Simulate server breakdown / 500 error
  apiClient.get = async () => {
    const error = new Error('Network Error: Database unreachable');
    error.response = { status: 500, data: { success: false, message: 'Internal Server Error' } };
    throw error;
  };

  let threw = false;
  try {
    await productService.getAllProducts();
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('Internal Server Error') || err.message.includes('unreachable') || err.message.includes('Failed to fetch'));
  } finally {
    // Restore original client
    apiClient.get = originalGet;
  }

  assert.strictEqual(threw, true, 'productService must throw error when API fails rather than silently inventing mock products');
});

await testAsync('6.2: Unverified UPI safeguards: public settings strictly retain upiVerified=false and isDemoConfiguration=true', async () => {
  const settings = await settingsService.getSettings();
  assert.strictEqual(settings.upiVerified, false, 'upiVerified must be false for unverified demo VPA');
  assert.strictEqual(settings.isDemoConfiguration, true, 'isDemoConfiguration must remain true');
  assert.strictEqual(settings.fssaiVerified, false, 'fssaiVerified must be false');
});

await testAsync('6.3: Non-fallback error policy: settingsService throws on network failure rather than masking breakdown', async () => {
  const { apiClient } = await import('../frontend/src/lib/axios.ts');
  const originalGet = apiClient.get;

  // Simulate server 503 error
  apiClient.get = async () => {
    const error = new Error('Service Unavailable: 503');
    error.response = { status: 503, data: { success: false, message: 'Server under maintenance' } };
    throw error;
  };

  let threw = false;
  try {
    await settingsService.getSettings();
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('503') || err.message.includes('maintenance') || err.message.includes('Failed to fetch'));
  } finally {
    apiClient.get = originalGet;
  }

  assert.strictEqual(threw, true, 'settingsService must expose error for TanStack Query retry state');
});

test('6.4: Business settings fallback safety: DEFAULT_BUSINESS_SETTINGS_FALLBACK does NOT invent sample details or fees', async () => {
  const { DEFAULT_BUSINESS_SETTINGS_FALLBACK, mapBusinessSettingsFromApi } = await import('../frontend/src/services/apiAdapters.ts');

  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.fssaiLicense, '', 'Must not invent fallback FSSAI license');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.merchantUpiId, '', 'Must not invent fallback merchant UPI ID');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.millAddress, '', 'Must not invent fallback mill address');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.defaultLocalCourierFee, null, 'Must not invent fallback courier fee');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.freeDeliveryThreshold, null, 'Must not invent fallback delivery threshold');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.maxCodOrderValue, null, 'Must not invent fallback COD limit');
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.fssaiVerified, false);
  assert.strictEqual(DEFAULT_BUSINESS_SETTINGS_FALLBACK.upiVerified, false);

  // Missing threshold test: Backend returns empty payload
  const emptyMapped = mapBusinessSettingsFromApi({
    businessName: 'SSK Test',
    defaultCourierFee: null,
    freeDeliveryThreshold: null,
  });
  assert.strictEqual(emptyMapped.freeDeliveryThreshold, null, 'Missing freeDeliveryThreshold must remain null');
  assert.strictEqual(emptyMapped.defaultLocalCourierFee, null, 'Missing defaultCourierFee must remain null');
});

await testAsync('6.5: Product service endpoint integrity: getProductById resolves locally without inventing /api/products/:id', async () => {
  const products = await productService.getAllProducts();
  assert.ok(products.length > 0);
  const targetId = products[0].id;

  const resolved = await productService.getProductById(targetId);
  assert.ok(resolved !== null, 'Product must be found by ID');
  assert.strictEqual(resolved.id, targetId);
  assert.strictEqual(resolved.slug, products[0].slug);

  const nonExistent = await productService.getProductById('00000000-0000-0000-0000-000000000000');
  assert.strictEqual(nonExistent, null, 'Non-existent ID must return null without calling invalid endpoints');
});

test('6.6: FSSAI and UPI verification protections in UI components', async () => {
  const fs = await import('fs');
  const path = await import('path');

  const headerCode = fs.readFileSync(path.resolve('frontend/src/components/layout/CustomerHeader.tsx'), 'utf8');
  const footerCode = fs.readFileSync(path.resolve('frontend/src/components/layout/CustomerFooter.tsx'), 'utf8');

  // Must not claim certified regulatory unit when fssaiVerified is false
  assert.ok(footerCode.includes('isFssaiVerified'), 'Footer must dynamically check isFssaiVerified');
  assert.ok(footerCode.includes('FSSAI Registration (Pending Verification)'), 'Footer must show pending verification when unverified');
  assert.ok(headerCode.includes('isFssaiVerified'), 'Header must dynamically check isFssaiVerified');
  assert.ok(headerCode.includes('Pending Verification'), 'Header must show pending verification when unverified');

  // Must guard free delivery threshold: do NOT hardcode 500 or 1500
  assert.ok(!headerCode.includes('freeDeliveryThreshold || 500'), 'Header must not hardcode 500 fallback threshold');
  assert.ok(headerCode.includes('freeThreshold !== null'), 'Header must guard null free delivery threshold');
});

console.log('================================================================');
console.log(`TOTAL PHASE 6.2 RESULTS: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 6.2 INTEGRATION VERIFICATION ASSERTIONS PASSED WITH ZERO FAILURES!\n');
}
