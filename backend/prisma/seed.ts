import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const KNOWN_DEMO_PASSWORDS = new Set([
  'tenkasi2026',
  'admin123',
  'password',
  'password123',
  'admin',
  '12345678',
  'ssk2026',
]);

/**
 * Validates initial administrator password safety
 */
function resolveInitialAdminPassword(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();

  if (!envPassword) {
    if (isProd) {
      throw new Error(
        '[SECURITY ERROR]: In production, ADMIN_INITIAL_PASSWORD must be explicitly provided via environment variables.'
      );
    }
    console.warn('[seed]: Warning: ADMIN_INITIAL_PASSWORD not provided in environment. Falling back to development demo credential.');
    return 'tenkasi2026';
  }

  // Prevent known demo passwords in production
  if (isProd && KNOWN_DEMO_PASSWORDS.has(envPassword.toLowerCase())) {
    throw new Error(
      '[SECURITY ERROR]: Known demo password cannot be used in production environment. Choose a strong, unique administrator passphrase.'
    );
  }

  // Enforce strong password complexity in production
  if (isProd) {
    if (envPassword.length < 10) {
      throw new Error('[SECURITY ERROR]: Production administrator password must be at least 10 characters long.');
    }
    const hasUpper = /[A-Z]/.test(envPassword);
    const hasLower = /[a-z]/.test(envPassword);
    const hasNumber = /[0-9]/.test(envPassword);
    if (!hasUpper || !hasLower || !hasNumber) {
      throw new Error(
        '[SECURITY ERROR]: Production administrator password must contain uppercase, lowercase, and numeric characters.'
      );
    }
  }

  return envPassword;
}

async function main() {
  console.log('[seed]: Starting database seeding for SSK Natural Gold...');

  // 1. Seed Business Settings
  await prisma.businessSettings.upsert({
    where: { key: 'primary' },
    update: {},
    create: {
      key: 'primary',
      businessName: 'SSK Natural Gold',
      businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
      fssaiLicense: '22426293000431',
      fssaiVerified: false, // Explicitly marked unverified demo
      merchantUpiId: 'ssknaturalgold@okhdfcbank',
      merchantPayeeName: 'SSK Natural Gold',
      upiVerified: false, // Explicitly marked unverified demo
      whatsappPhone: '+91 9994072837',
      supportPhone: '+91 9994072837',
      contactEmail: 'support@ssknaturalgold.com',
      millAddress: 'Mettupatti Main Road, Tenkasi District, Tamil Nadu — 627811',
      defaultCourierFee: 50.00,
      freeDeliveryThreshold: 1500.00,
      codEnabled: true,
      codMaxLimit: 5000.00,
      isDemoConfiguration: true,
    },
  });
  console.log('[seed]: ✓ Business settings seeded (with demo configuration flags)');

  // 2. Seed Admin User with Credential Safety Validation
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase() || 'admin@ssknaturalgold.com';
  const rawAdminPassword = resolveInitialAdminPassword();

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(rawAdminPassword, salt);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'R. Kaliappan (Mill Supervisor)',
      phone: '9994072837',
      role: AdminRole.ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'R. Kaliappan (Mill Supervisor)',
      phone: '9994072837',
      role: AdminRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`[seed]: ✓ Admin user initialized: ${admin.email} (password configured securely via environment)`);

  // 3. Seed Three Traditional Cold Pressed Oils
  // A. Groundnut Oil
  const gnProduct = await prisma.product.upsert({
    where: { slug: 'traditional-groundnut-oil' },
    update: {},
    create: {
      slug: 'traditional-groundnut-oil',
      category: 'groundnut',
      nameEn: 'Traditional Groundnut Oil (Wood Pressed)',
      nameTa: 'பாரம்பரிய மரச்செக்கு கடலை எண்ணெய்',
      botanicalName: 'Arachis hypogaea',
      taglineEn: '100% Traditional Vaagai Wood Chekku Extraction',
      taglineTa: 'சுத்தமான வாகை மரச்செக்கில் பிழியப்பட்டது',
      descriptionEn: 'Cold extracted using seasoned Vaagai wood pestles below 42°C. Preserves natural nutty aroma, natural antioxidants, and rich phytosterols without chemical refining.',
      descriptionTa: 'பாரம்பரிய முறையில் வாகை மர உரலில் பிழியப்பட்ட சுத்தமான கடலை எண்ணெய். சுவையும் மணமும் நிறைந்தது.',
      seedOrigin: 'Saurashtra & Tiruvannamalai Farm Direct',
      extractionProcessEn: 'Wood Mortar Mara Chekku (< 42°C Cold Press)',
      extractionProcessTa: 'பாரம்பரிய மரச்செக்கு (< 42°C குளிர் அழுத்தம்)',
      woodType: 'Vaagai Wood Mortar (Albizia lebbeck)',
      fssaiLicense: '22426293000431',
      rating: 4.9,
      reviewCount: 38,
      primaryImage: '/assets/products/groundnut-bottle.png',
      featured: true,
      inStock: true,
      variants: {
        create: [
          {
            sku: 'SSK-GN-500ML',
            volume: '500 ml',
            volumeMl: 500,
            containerType: 'Food-Grade PET Bottle',
            mrp: 180.00,
            price: 160.00,
            stock: 45,
            isDefault: false,
          },
          {
            sku: 'SSK-GN-1L',
            volume: '1 Litre',
            volumeMl: 1000,
            containerType: 'Food-Grade PET Bottle',
            mrp: 330.00,
            price: 295.00,
            stock: 60,
            isDefault: true,
          },
          {
            sku: 'SSK-GN-5L',
            volume: '5 Litre Tin',
            volumeMl: 5000,
            containerType: 'Reinforced Food-Grade Tin',
            mrp: 1600.00,
            price: 1450.00,
            stock: 25,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // B. Sesame Oil
  const sesProduct = await prisma.product.upsert({
    where: { slug: 'pure-wood-pressed-sesame-oil' },
    update: {},
    create: {
      slug: 'pure-wood-pressed-sesame-oil',
      category: 'sesame',
      nameEn: 'Pure Sesame / Gingelly Oil (Wood Pressed)',
      nameTa: 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய்',
      botanicalName: 'Sesamum indicum',
      taglineEn: 'Crushed with Natural Palm Jaggery (கருப்பட்டி)',
      taglineTa: 'சுத்தமான பனங்கருப்பட்டி சேர்த்து ஆட்டப்பட்டது',
      descriptionEn: 'Single-origin black sesame seeds crushed with traditional Palm Jaggery (Karupatti) in Vaagai wood pestles. Natural, unrefined, and rich in sesamol and sesamolin.',
      descriptionTa: 'கருப்பு எள் மற்றும் நாட்டு பனங்கருப்பட்டி சேர்த்து செக்கில் பிழியப்பட்ட சுத்தமான நல்லெண்ணெய்.',
      seedOrigin: 'Tenkasi & Madurai Black Sesame',
      extractionProcessEn: 'Traditional Mara Chekku with Karupatti',
      extractionProcessTa: 'மரச்செக்கு & கருப்பட்டி கலவை',
      woodType: 'Vaagai Wood Mortar',
      fssaiLicense: '22426293000431',
      rating: 5.0,
      reviewCount: 46,
      primaryImage: '/assets/products/sesame-bottle.png',
      featured: true,
      inStock: true,
      variants: {
        create: [
          {
            sku: 'SSK-SES-500ML',
            volume: '500 ml',
            volumeMl: 500,
            containerType: 'Food-Grade PET Bottle',
            mrp: 275.00,
            price: 245.00,
            stock: 35,
            isDefault: false,
          },
          {
            sku: 'SSK-SES-1L',
            volume: '1 Litre',
            volumeMl: 1000,
            containerType: 'Food-Grade PET Bottle',
            mrp: 520.00,
            price: 470.00,
            stock: 40,
            isDefault: true,
          },
          {
            sku: 'SSK-SES-5L',
            volume: '5 Litre Tin',
            volumeMl: 5000,
            containerType: 'Reinforced Food-Grade Tin',
            mrp: 2550.00,
            price: 2300.00,
            stock: 15,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // C. Coconut Oil
  const cocProduct = await prisma.product.upsert({
    where: { slug: 'virgin-cold-pressed-coconut-oil' },
    update: {},
    create: {
      slug: 'virgin-cold-pressed-coconut-oil',
      category: 'coconut',
      nameEn: 'Pure Wood Pressed Coconut Oil',
      nameTa: 'பாரம்பரிய மரச்செக்கு தேங்காய் எண்ணெய்',
      botanicalName: 'Cocos nucifera',
      taglineEn: 'Sun-Dried Sulphur-Free Copra Extraction',
      taglineTa: 'இயற்கையாக வெயிலில் உலர்த்திய கொப்பரை தேங்காய்',
      descriptionEn: 'Cold-pressed from naturally sun-dried sulphur-free copra. Water-clear consistency, subtle natural aroma, high in beneficial lauric acid.',
      descriptionTa: 'கந்தகம் கலக்காத இயற்கை கொப்பரை தேங்காயிலிருந்து வாகை மரச்செக்கில் பிழியப்பட்டது.',
      seedOrigin: 'Pollachi & Tenkasi Farm Coconuts',
      extractionProcessEn: 'Vaagai Wood Cold Extraction',
      extractionProcessTa: 'வாகை மரச்செக்கு தயாரிப்பு',
      woodType: 'Vaagai Wood Mortar',
      fssaiLicense: '22426293000431',
      rating: 4.8,
      reviewCount: 29,
      primaryImage: '/assets/products/coconut-bottle.png',
      featured: true,
      inStock: true,
      variants: {
        create: [
          {
            sku: 'SSK-COC-500ML',
            volume: '500 ml',
            volumeMl: 500,
            containerType: 'Food-Grade PET Bottle',
            mrp: 235.00,
            price: 210.00,
            stock: 30,
            isDefault: false,
          },
          {
            sku: 'SSK-COC-1L',
            volume: '1 Litre',
            volumeMl: 1000,
            containerType: 'Food-Grade PET Bottle',
            mrp: 440.00,
            price: 395.00,
            stock: 35,
            isDefault: true,
          },
          {
            sku: 'SSK-COC-5L',
            volume: '5 Litre Tin',
            volumeMl: 5000,
            containerType: 'Reinforced Food-Grade Tin',
            mrp: 2150.00,
            price: 1900.00,
            stock: 12,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log('[seed]: ✓ 3 wood-pressed products and 9 variants seeded successfully');

  console.log('[seed]: Seeding complete!');
}

main()
  .catch((e) => {
    console.error('[seed]: Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
