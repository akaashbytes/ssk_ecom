-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameTa" TEXT NOT NULL,
    "botanicalName" TEXT,
    "taglineEn" TEXT,
    "taglineTa" TEXT,
    "descriptionEn" TEXT NOT NULL,
    "descriptionTa" TEXT NOT NULL,
    "seedOrigin" TEXT,
    "extractionProcessEn" TEXT,
    "extractionProcessTa" TEXT,
    "woodType" TEXT,
    "fssaiLicense" TEXT,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "primaryImage" TEXT,
    "lifestyleImage" TEXT,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "containerType" TEXT NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_requests" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "paymentPreference" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isDeliveryFeeConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "deliveryInstructions" TEXT,
    "courier" TEXT,
    "awbNumber" TEXT,
    "estimatedDeliveryDate" TEXT,
    "customerUtr" TEXT,
    "paymentReportedAt" TIMESTAMP(3),
    "paymentVerifiedAt" TIMESTAMP(3),
    "codCollectedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "customerDeclineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderRequestId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productNameEn" TEXT NOT NULL,
    "productNameTa" TEXT NOT NULL,
    "variantVolume" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "unitMrp" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_logs" (
    "id" TEXT NOT NULL,
    "orderRequestId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "fromPaymentStatus" TEXT,
    "toPaymentStatus" TEXT,
    "actor" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'primary',
    "businessName" TEXT NOT NULL DEFAULT 'SSK Natural Gold',
    "businessNameTa" TEXT NOT NULL DEFAULT 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
    "fssaiLicense" TEXT NOT NULL DEFAULT '22426293000431',
    "fssaiVerified" BOOLEAN NOT NULL DEFAULT false,
    "merchantUpiId" TEXT NOT NULL DEFAULT 'ssknaturalgold@okhdfcbank',
    "merchantPayeeName" TEXT NOT NULL DEFAULT 'SSK Natural Gold',
    "upiVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappPhone" TEXT NOT NULL DEFAULT '+91 9994072837',
    "supportPhone" TEXT NOT NULL DEFAULT '+91 9994072837',
    "contactEmail" TEXT NOT NULL DEFAULT 'support@ssknaturalgold.com',
    "millAddress" TEXT NOT NULL DEFAULT 'Mettupatti Main Road, Tenkasi District, Tamil Nadu — 627811',
    "defaultCourierFee" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "freeDeliveryThreshold" DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "codMaxLimit" DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    "isDemoConfiguration" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_inStock_idx" ON "products"("inStock");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "order_requests_orderNumber_key" ON "order_requests"("orderNumber");

-- CreateIndex
CREATE INDEX "order_requests_orderNumber_idx" ON "order_requests"("orderNumber");

-- CreateIndex
CREATE INDEX "order_requests_customerPhone_idx" ON "order_requests"("customerPhone");

-- CreateIndex
CREATE INDEX "order_requests_status_idx" ON "order_requests"("status");

-- CreateIndex
CREATE INDEX "order_requests_paymentStatus_idx" ON "order_requests"("paymentStatus");

-- CreateIndex
CREATE INDEX "order_requests_paymentPreference_idx" ON "order_requests"("paymentPreference");

-- CreateIndex
CREATE INDEX "order_requests_createdAt_idx" ON "order_requests"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderRequestId_idx" ON "order_items"("orderRequestId");

-- CreateIndex
CREATE INDEX "order_items_variantId_idx" ON "order_items"("variantId");

-- CreateIndex
CREATE INDEX "order_status_logs_orderRequestId_idx" ON "order_status_logs"("orderRequestId");

-- CreateIndex
CREATE INDEX "order_status_logs_createdAt_idx" ON "order_status_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_key_key" ON "business_settings"("key");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderRequestId_fkey" FOREIGN KEY ("orderRequestId") REFERENCES "order_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_logs" ADD CONSTRAINT "order_status_logs_orderRequestId_fkey" FOREIGN KEY ("orderRequestId") REFERENCES "order_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
