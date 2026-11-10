-- AlterTable admin_users
ALTER TABLE "admin_users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable products
ALTER TABLE "products" ADD COLUMN "isDemoProduct" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable product_variants
ALTER TABLE "product_variants" ADD COLUMN "reservedStock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable order_requests
ALTER TABLE "order_requests" ADD COLUMN "inventoryState" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "order_requests" ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);
CREATE INDEX "order_requests_inventoryState_idx" ON "order_requests"("inventoryState");

-- AlterTable business_settings
ALTER TABLE "business_settings" ADD COLUMN "isDemoCatalogue" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "business_settings" ADD COLUMN "upiPaymentWindowMinutes" INTEGER NOT NULL DEFAULT 1440;
