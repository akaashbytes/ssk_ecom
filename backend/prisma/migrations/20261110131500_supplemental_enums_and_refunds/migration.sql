-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'AWAITING_CUSTOMER_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAYMENT_INSTRUCTIONS_SENT', 'PAYMENT_REPORTED', 'VERIFIED', 'COD_PENDING', 'COD_COLLECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentPreference" AS ENUM ('UPI', 'COD');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');

-- AlterTable admin_users
ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "AdminRole" USING ("role"::"AdminRole");
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"AdminRole";

-- AlterTable products
ALTER TABLE "products" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "products_isArchived_idx" ON "products"("isArchived");

-- AlterTable order_requests
ALTER TABLE "order_requests" ADD COLUMN "refundAmount" DECIMAL(10,2);
ALTER TABLE "order_requests" ADD COLUMN "refundReason" TEXT;
ALTER TABLE "order_requests" ADD COLUMN "refundReference" TEXT;
ALTER TABLE "order_requests" ADD COLUMN "refundedAt" TIMESTAMP(3);
ALTER TABLE "order_requests" ADD COLUMN "isStockDeducted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "order_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order_requests" ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::"OrderStatus");
ALTER TABLE "order_requests" ALTER COLUMN "status" SET DEFAULT 'REQUESTED'::"OrderStatus";

ALTER TABLE "order_requests" ALTER COLUMN "paymentPreference" TYPE "PaymentPreference" USING ("paymentPreference"::"PaymentPreference");

ALTER TABLE "order_requests" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "order_requests" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING ("paymentStatus"::"PaymentStatus");
ALTER TABLE "order_requests" ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID'::"PaymentStatus";

-- AlterTable order_status_logs
ALTER TABLE "order_status_logs" ALTER COLUMN "fromStatus" TYPE "OrderStatus" USING ("fromStatus"::"OrderStatus");
ALTER TABLE "order_status_logs" ALTER COLUMN "toStatus" TYPE "OrderStatus" USING ("toStatus"::"OrderStatus");
ALTER TABLE "order_status_logs" ALTER COLUMN "fromPaymentStatus" TYPE "PaymentStatus" USING ("fromPaymentStatus"::"PaymentStatus");
ALTER TABLE "order_status_logs" ALTER COLUMN "toPaymentStatus" TYPE "PaymentStatus" USING ("toPaymentStatus"::"PaymentStatus");
ALTER TABLE "order_status_logs" ALTER COLUMN "actor" TYPE "ActorType" USING ("actor"::"ActorType");
