import { Decimal } from '@prisma/client/runtime/library';
import {
  OrderStatus,
  PaymentStatus,
  PaymentPreference,
  ActorType,
} from '@prisma/client';
import prisma from '../config/database';

export { OrderStatus, PaymentStatus, PaymentPreference, ActorType };

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  REQUESTED: [
    OrderStatus.REQUESTED,
    OrderStatus.UNDER_REVIEW,
    OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE,
    OrderStatus.CANCELLED,
  ],
  UNDER_REVIEW: [
    OrderStatus.UNDER_REVIEW,
    OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE,
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  AWAITING_CUSTOMER_ACCEPTANCE: [
    OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE,
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  AWAITING_PAYMENT: [
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.UNDER_REVIEW,
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  CONFIRMED: [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  PROCESSING: [
    OrderStatus.PROCESSING,
    OrderStatus.DISPATCHED,
    OrderStatus.CANCELLED,
  ],
  DISPATCHED: [
    OrderStatus.DISPATCHED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ],
  DELIVERED: [
    OrderStatus.DELIVERED, // Strictly terminal! Already delivered orders cannot simply be cancelled.
  ],
  CANCELLED: [
    OrderStatus.CANCELLED, // Strictly terminal!
  ],
};

export interface SubmitOrderInput {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
  paymentPreference: 'UPI' | 'COD';
}

export class OrderService {
  /**
   * Helper to generate unique collision-resistant order number: SSK-REQ-YYYY-XXXX
   */
  private static async generateUniqueOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    let orderNum = '';
    let exists = true;
    while (exists) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      orderNum = `SSK-REQ-${year}-${suffix}`;
      const found = await prisma.orderRequest.findUnique({ where: { orderNumber: orderNum } });
      if (!found) exists = false;
    }
    return orderNum;
  }

  /**
   * Customer Submit Guest Order Request
   * Security: Prices and totals are ALWAYS calculated strictly from the database.
   * Inventory: Checks available stock (stock - reservedStock >= quantity), but does NOT reserve or deduct upon request.
   */
  static async submitOrderRequest(input: SubmitOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const cleanPhone = input.customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      throw new Error('A valid 10-digit mobile number is required');
    }

    if (!input.pincode || !/^\d{6}$/.test(input.pincode.trim())) {
      throw new Error('A valid 6-digit PIN code is required');
    }

    // Retrieve live variants and products from database
    const variantIds = input.items.map((i) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (dbVariants.length !== variantIds.length) {
      throw new Error('One or more selected products/variants do not exist in the catalog');
    }

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of input.items) {
      const variant = dbVariants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than zero');
      }

      // Available unreserved stock check
      const availableStock = variant.stock - variant.reservedStock;
      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for ${variant.product.nameEn} (${variant.volume}). Available: ${Math.max(0, availableStock)}`);
      }

      const unitPrice = Number(variant.price);
      const unitMrp = Number(variant.mrp);
      const lineSubtotal = unitPrice * item.quantity;
      calculatedSubtotal += lineSubtotal;

      orderItemsData.push({
        productId: variant.productId,
        variantId: variant.id,
        productNameEn: variant.product.nameEn,
        productNameTa: variant.product.nameTa,
        variantVolume: variant.volume,
        unitPrice: new Decimal(unitPrice.toFixed(2)),
        unitMrp: new Decimal(unitMrp.toFixed(2)),
        quantity: item.quantity,
        subtotal: new Decimal(lineSubtotal.toFixed(2)),
        image: variant.product.primaryImage,
      });
    }

    const orderNumber = await this.generateUniqueOrderNumber();
    const paymentPref = input.paymentPreference === 'COD' ? PaymentPreference.COD : PaymentPreference.UPI;
    const paymentStatus: PaymentStatus = PaymentStatus.UNPAID;

    return prisma.$transaction(async (tx) => {
      return tx.orderRequest.create({
        data: {
          orderNumber,
          status: OrderStatus.REQUESTED,
          paymentPreference: paymentPref,
          paymentStatus,
          subtotal: new Decimal(calculatedSubtotal.toFixed(2)),
          deliveryFee: new Decimal('0.00'),
          isDeliveryFeeConfirmed: false,
          discount: new Decimal('0.00'),
          total: new Decimal(calculatedSubtotal.toFixed(2)),
          customerName: input.customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: input.customerEmail?.trim(),
          addressLine1: input.addressLine1.trim(),
          addressLine2: input.addressLine2?.trim(),
          landmark: input.landmark?.trim(),
          city: input.city.trim(),
          state: input.state.trim(),
          pincode: input.pincode.trim(),
          deliveryInstructions: input.deliveryInstructions?.trim(),
          inventoryState: 'NONE',
          isStockDeducted: false,
          items: {
            create: orderItemsData,
          },
          statusLogs: {
            create: [
              {
                toStatus: OrderStatus.REQUESTED,
                toPaymentStatus: paymentStatus,
                actor: ActorType.CUSTOMER,
                notes: `Order request submitted. Payment preference: ${paymentPref}.`,
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });
    });
  }

  /**
   * Customer Track Order
   * Security: Both orderNumber and matching 10-digit registered phone number are strictly required.
   * Internal notes (adminNotes) are strictly omitted from the returned payload.
   */
  static async getOrderForTracking(orderRef: string, phone: string) {
    const cleanRef = orderRef.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!cleanRef || cleanPhone.length !== 10) {
      return null;
    }

    const order = await prisma.orderRequest.findFirst({
      where: {
        orderNumber: cleanRef,
        customerPhone: cleanPhone,
      },
      include: {
        items: true,
        statusLogs: {
          orderBy: { createdAt: 'asc' },
          select: {
            fromStatus: true,
            toStatus: true,
            fromPaymentStatus: true,
            toPaymentStatus: true,
            actor: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) return null;

    const { adminNotes, ...customerSafeOrder } = order;
    return customerSafeOrder;
  }

  /**
   * Admin Issuance of Delivery Quotation
   */
  static async sendQuotation(orderId: string, courierFee: number, adminNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error(`Invalid State Transition: Cancelled order #${order.orderNumber} cannot receive delivery quotation.`);
      }
      if (order.status === OrderStatus.DELIVERED) {
        throw new Error(`Invalid State Transition: Delivered order #${order.orderNumber} cannot receive delivery quotation.`);
      }

      const numericSubtotal = Number(order.subtotal);
      const numericDiscount = Number(order.discount);
      const fee = Math.max(0, courierFee);
      const newTotal = numericSubtotal + fee - numericDiscount;

      return tx.orderRequest.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE,
          deliveryFee: new Decimal(fee.toFixed(2)),
          isDeliveryFeeConfirmed: true,
          total: new Decimal(newTotal.toFixed(2)),
          adminNotes: adminNotes ?? order.adminNotes,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: order.paymentStatus,
              actor: ActorType.ADMIN,
              notes: `Delivery quotation issued: courier fee ₹${fee}. Total: ₹${newTotal}. Awaiting customer acceptance.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });
    });
  }

  /**
   * Customer Accepts Quotation
   * UPI:
   * - Transitions to AWAITING_PAYMENT, paymentStatus: PAYMENT_INSTRUCTIONS_SENT.
   * - TRANSACTIONAL INVENTORY RESERVATION: Reserves stock atomically.
   * - Sets 24-hour reservation expiry window.
   *
   * COD:
   * - Transitions directly to CONFIRMED, paymentStatus: COD_PENDING.
   * - Permanent inventory deduction.
   */
  static async customerAcceptQuotation(orderNumber: string, phone: string) {
    const cleanRef = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findFirst({
        where: { orderNumber: cleanRef, customerPhone: cleanPhone },
        include: { items: true },
      });

      if (!order) throw new Error('Order verification failed. Matching reference and mobile required.');

      if (order.status !== OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE) {
        throw new Error(`Invalid State Transition: Order #${order.orderNumber} is in status ${order.status} and cannot accept quotation.`);
      }

      const isCod = order.paymentPreference === PaymentPreference.COD;

      if (isCod) {
        // COD Workflow: direct confirmation & stock deduction
        for (const item of order.items) {
          if (!item.variantId) continue;
          const updated = await tx.$executeRawUnsafe(
            `UPDATE product_variants SET "stock" = "stock" - $1 WHERE id = $2 AND ("stock" - "reservedStock") >= $1`,
            item.quantity,
            item.variantId
          );
          if (updated === 0) {
            throw new Error(`Insufficient stock for "${item.productNameEn}" (${item.variantVolume}).`);
          }
        }

        const updated = await tx.orderRequest.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COD_PENDING,
            inventoryState: 'DEDUCTED',
            isStockDeducted: true,
            statusLogs: {
              create: {
                fromStatus: order.status,
                toStatus: OrderStatus.CONFIRMED,
                fromPaymentStatus: order.paymentStatus,
                toPaymentStatus: PaymentStatus.COD_PENDING,
                actor: ActorType.CUSTOMER,
                notes: `Customer accepted quotation of ₹${order.total}. Order confirmed for Cash on Delivery. Stock deducted.`,
              },
            },
          },
          include: { items: true, statusLogs: true },
        });

        const { adminNotes, ...safeOrder } = updated;
        return safeOrder;
      } else {
        // UPI Workflow: Transactional Inventory Reservation
        if (order.inventoryState !== 'RESERVED') {
          for (const item of order.items) {
            if (!item.variantId) continue;
            // Atomic conditional update: increment reservedStock only if unreserved stock >= quantity
            const updated = await tx.$executeRawUnsafe(
              `UPDATE product_variants SET "reservedStock" = "reservedStock" + $1 WHERE id = $2 AND ("stock" - "reservedStock") >= $1`,
              item.quantity,
              item.variantId
            );
            if (updated === 0) {
              throw new Error(
                `Unable to reserve inventory for "${item.productNameEn}" (${item.variantVolume}). Available stock was reserved by another order.`
              );
            }
          }
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hour payment window

        const updated = await tx.orderRequest.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.AWAITING_PAYMENT,
            paymentStatus: PaymentStatus.PAYMENT_INSTRUCTIONS_SENT,
            inventoryState: 'RESERVED',
            reservationExpiresAt: expiresAt,
            statusLogs: {
              create: {
                fromStatus: order.status,
                toStatus: OrderStatus.AWAITING_PAYMENT,
                fromPaymentStatus: order.paymentStatus,
                toPaymentStatus: PaymentStatus.PAYMENT_INSTRUCTIONS_SENT,
                actor: ActorType.CUSTOMER,
                notes: `Customer accepted quotation of ₹${order.total}. Inventory reserved for 24h. Payment instructions issued for UPI QR.`,
              },
            },
          },
          include: { items: true, statusLogs: true },
        });

        const { adminNotes, ...safeOrder } = updated;
        return safeOrder;
      }
    });
  }

  /**
   * Customer Declines Quotation
   * Order moves to CANCELLED.
   * If inventory was reserved, release reservation.
   */
  static async customerDeclineQuotation(orderNumber: string, phone: string, reason?: string) {
    const cleanRef = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findFirst({
        where: { orderNumber: cleanRef, customerPhone: cleanPhone },
        include: { items: true },
      });

      if (!order) throw new Error('Order verification failed. Matching reference and mobile required.');

      if (order.status !== OrderStatus.AWAITING_CUSTOMER_ACCEPTANCE) {
        throw new Error(`Invalid State Transition: Order #${order.orderNumber} is in status ${order.status} and cannot decline quotation.`);
      }

      // If reserved, release reservation
      if (order.inventoryState === 'RESERVED') {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.$executeRawUnsafe(
            `UPDATE product_variants SET "reservedStock" = GREATEST(0, "reservedStock" - $1) WHERE id = $2`,
            item.quantity,
            item.variantId
          );
        }
      }

      const updated = await tx.orderRequest.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.UNPAID,
          inventoryState: 'NONE',
          reservationExpiresAt: null,
          customerDeclineReason: reason || 'Customer declined quoted delivery fee',
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: PaymentStatus.UNPAID,
              actor: ActorType.CUSTOMER,
              notes: `Customer declined delivery quotation. Reason: ${reason || 'Courier fee rejected'}.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });

      const { adminNotes, ...safeOrder } = updated;
      return safeOrder;
    });
  }

  /**
   * Customer Submits Payment Proof (UTR)
   * Moves to UNDER_REVIEW, paymentStatus: PAYMENT_REPORTED.
   * Reserved stock remains reserved while under review.
   */
  static async submitPaymentReport(orderNumber: string, phone: string, utr: string) {
    const cleanRef = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanUtr = utr.trim().replace(/\s/g, '');

    if (!cleanUtr || cleanUtr.length < 8) {
      throw new Error('Please enter a valid UPI transaction reference / UTR (at least 8 characters)');
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findFirst({
        where: { orderNumber: cleanRef, customerPhone: cleanPhone },
      });

      if (!order) throw new Error('Order verification failed.');

      if (order.paymentPreference !== PaymentPreference.UPI) {
        throw new Error(`Security Exception: Cannot submit UPI UTR for COD order #${order.orderNumber}.`);
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error(`Invalid Operation: Cannot submit payment proof for cancelled order #${order.orderNumber}.`);
      }

      const updated = await tx.orderRequest.update({
        where: { id: order.id },
        data: {
          customerUtr: cleanUtr,
          paymentStatus: PaymentStatus.PAYMENT_REPORTED,
          status: OrderStatus.UNDER_REVIEW,
          paymentReportedAt: new Date(),
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.UNDER_REVIEW,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: PaymentStatus.PAYMENT_REPORTED,
              actor: ActorType.CUSTOMER,
              notes: `Customer reported UPI payment reference: ${cleanUtr}. Awaiting bank verification.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });

      const { adminNotes, ...safeOrder } = updated;
      return safeOrder;
    });
  }

  /**
   * Admin Verifies UPI Bank Credit
   * Converts temporary reservation into permanent stock deduction:
   * stock = stock - qty, reservedStock = reservedStock - qty.
   */
  static async verifyUpiPayment(orderId: string, adminNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error('Order not found');

      if (order.paymentPreference !== PaymentPreference.UPI) {
        throw new Error(`Security Exception: Cannot verify UPI bank credit on COD order #${order.orderNumber}.`);
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error(`Invalid Operation: Cannot verify payment for cancelled order #${order.orderNumber}.`);
      }

      // Convert reservation to permanent deduction
      if (order.inventoryState === 'RESERVED') {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.$executeRawUnsafe(
            `UPDATE product_variants SET "stock" = "stock" - $1, "reservedStock" = GREATEST(0, "reservedStock" - $1) WHERE id = $2`,
            item.quantity,
            item.variantId
          );
        }
      } else if (order.inventoryState === 'NONE') {
        // Direct deduction if reservation was not set
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.$executeRawUnsafe(
            `UPDATE product_variants SET "stock" = "stock" - $1 WHERE id = $2`,
            item.quantity,
            item.variantId
          );
        }
      }

      const updated = await tx.orderRequest.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.VERIFIED,
          paymentVerifiedAt: new Date(),
          inventoryState: 'DEDUCTED',
          isStockDeducted: true,
          reservationExpiresAt: null,
          adminNotes: adminNotes ?? order.adminNotes,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CONFIRMED,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: PaymentStatus.VERIFIED,
              actor: ActorType.ADMIN,
              notes: `Bank credit of ₹${order.total} confirmed (UTR: ${order.customerUtr || 'Manual Recon'}). Inventory converted to permanent deduction. Moved to Bottling Queue.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });

      return updated;
    });
  }

  /**
   * Admin Confirms Doorstep Cash Collection (COD only)
   */
  static async confirmCashCollected(orderId: string, adminNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error(`Invalid Operation: Cannot collect cash for cancelled order #${order.orderNumber}.`);
      }

      if (order.paymentPreference !== PaymentPreference.COD) {
        throw new Error(`Security Exception: Cannot collect cash for UPI order #${order.orderNumber}. UPI requires bank credit verification.`);
      }

      return tx.orderRequest.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COD_COLLECTED,
          codCollectedAt: new Date(),
          adminNotes: adminNotes ?? order.adminNotes,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: order.status,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: PaymentStatus.COD_COLLECTED,
              actor: ActorType.ADMIN,
              notes: `Doorstep Cash on Delivery ₹${order.total} collected and reconciled by mill desk.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });
    });
  }

  /**
   * Admin Updates Order Status (State Machine Enforcement)
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    options?: {
      courier?: string;
      awbNumber?: string;
      estimatedDeliveryDate?: string;
      adminNotes?: string;
      paymentStatus?: PaymentStatus;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error('Order not found');

      // Terminal guard: Cancelled orders cannot continue fulfillment
      if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
        throw new Error(`Invalid State Transition: Cancelled order #${order.orderNumber} cannot continue through normal fulfillment.`);
      }

      // Terminal guard: Delivered orders cannot be changed to another status
      if (order.status === OrderStatus.DELIVERED && newStatus !== OrderStatus.DELIVERED) {
        throw new Error(`Invalid State Transition: Delivered order #${order.orderNumber} is terminal and cannot move to ${newStatus}.`);
      }

      // Workflow isolation: COD cannot enter AWAITING_PAYMENT
      if (order.paymentPreference === PaymentPreference.COD && newStatus === OrderStatus.AWAITING_PAYMENT) {
        throw new Error(`Invalid State Transition: COD order #${order.orderNumber} cannot enter AWAITING_PAYMENT status.`);
      }

      // State transition map check
      const allowed = VALID_ORDER_TRANSITIONS[order.status] || [];
      if (!allowed.includes(newStatus)) {
        throw new Error(`Invalid State Transition: Cannot transition order #${order.orderNumber} from ${order.status} to ${newStatus}.`);
      }

      let nextPaymentStatus = options?.paymentStatus || order.paymentStatus;

      if (options?.paymentStatus) {
        if ((order.status === OrderStatus.CANCELLED || newStatus === OrderStatus.CANCELLED) && options.paymentStatus === PaymentStatus.COD_COLLECTED) {
          throw new Error(`Invalid Operation: Cancelled order #${order.orderNumber} cannot be marked as COD_COLLECTED.`);
        }
        if ((options.paymentStatus === PaymentStatus.COD_COLLECTED || options.paymentStatus === PaymentStatus.COD_PENDING) && order.paymentPreference !== PaymentPreference.COD) {
          throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on non-COD order #${order.orderNumber}.`);
        }
        if (
          [PaymentStatus.PAYMENT_INSTRUCTIONS_SENT, PaymentStatus.PAYMENT_REPORTED, PaymentStatus.VERIFIED].includes(options.paymentStatus as any) &&
          order.paymentPreference === PaymentPreference.COD
        ) {
          throw new Error(`Invalid Payment Status: Cannot set ${options.paymentStatus} on COD order #${order.orderNumber}.`);
        }
        nextPaymentStatus = options.paymentStatus;
      }

      // Auto-release collection obligation on cancellation for unpaid COD orders
      if (newStatus === OrderStatus.CANCELLED && order.paymentPreference === PaymentPreference.COD && order.paymentStatus === PaymentStatus.COD_PENDING) {
        nextPaymentStatus = PaymentStatus.UNPAID;
      }

      // Handle stock reservation / deduction release upon cancellation
      if (newStatus === OrderStatus.CANCELLED) {
        if (order.inventoryState === 'RESERVED') {
          for (const item of order.items) {
            if (!item.variantId) continue;
            await tx.$executeRawUnsafe(
              `UPDATE product_variants SET "reservedStock" = GREATEST(0, "reservedStock" - $1) WHERE id = $2`,
              item.quantity,
              item.variantId
            );
          }
        } else if (order.inventoryState === 'DEDUCTED') {
          for (const item of order.items) {
            if (!item.variantId) continue;
            await tx.$executeRawUnsafe(
              `UPDATE product_variants SET "stock" = "stock" + $1 WHERE id = $2`,
              item.quantity,
              item.variantId
            );
          }
        }
      }

      const updated = await tx.orderRequest.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus: nextPaymentStatus,
          inventoryState: newStatus === OrderStatus.CANCELLED ? 'NONE' : order.inventoryState,
          isStockDeducted: newStatus === OrderStatus.CANCELLED ? false : order.isStockDeducted,
          reservationExpiresAt: newStatus === OrderStatus.CANCELLED ? null : order.reservationExpiresAt,
          courier: options?.courier ?? order.courier,
          awbNumber: options?.awbNumber ?? order.awbNumber,
          estimatedDeliveryDate: options?.estimatedDeliveryDate ?? order.estimatedDeliveryDate,
          adminNotes: options?.adminNotes ?? order.adminNotes,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: newStatus,
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: nextPaymentStatus,
              actor: ActorType.ADMIN,
              notes: options?.adminNotes ? `Status changed to ${newStatus}. Note: ${options.adminNotes}` : `Status changed to ${newStatus}.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });

      return updated;
    });
  }

  /**
   * Release Expired UPI Reservations
   * Queries orders in AWAITING_PAYMENT with RESERVED stock whose 24-hour payment window has lapsed.
   * Cancels order and releases reserved stock back to the unreserved pool.
   */
  static async releaseExpiredReservations(): Promise<{ releasedCount: number; orderNumbers: string[] }> {
    const expiredOrders = await prisma.orderRequest.findMany({
      where: {
        status: OrderStatus.AWAITING_PAYMENT,
        paymentPreference: PaymentPreference.UPI,
        inventoryState: 'RESERVED',
        reservationExpiresAt: { lt: new Date() },
      },
      include: { items: true },
    });

    const orderNumbers: string[] = [];

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.$executeRawUnsafe(
            `UPDATE product_variants SET "reservedStock" = GREATEST(0, "reservedStock" - $1) WHERE id = $2`,
            item.quantity,
            item.variantId
          );
        }

        await tx.orderRequest.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.UNPAID,
            inventoryState: 'NONE',
            reservationExpiresAt: null,
            adminNotes: 'Order automatically cancelled: 24-hour UPI payment window expired. Reserved inventory released.',
            statusLogs: {
              create: {
                fromStatus: OrderStatus.AWAITING_PAYMENT,
                toStatus: OrderStatus.CANCELLED,
                fromPaymentStatus: PaymentStatus.PAYMENT_INSTRUCTIONS_SENT,
                toPaymentStatus: PaymentStatus.UNPAID,
                actor: ActorType.SYSTEM,
                notes: '24-hour UPI payment window expired without payment submission. Reserved stock released.',
              },
            },
          },
        });
      });

      orderNumbers.push(order.orderNumber);
    }

    return {
      releasedCount: orderNumbers.length,
      orderNumbers,
    };
  }

  /**
   * Explicit Refund Operation (FULL REFUNDS ONLY)
   * Initial release enforces full refunds only.
   * Partial refunds are rejected with an explicit error.
   */
  static async processRefund(
    orderId: string,
    input: {
      refundAmount: number;
      refundReason: string;
      refundReference: string;
      adminNotes?: string;
    }
  ) {
    if (!input.refundReason || !input.refundReason.trim()) {
      throw new Error('A valid refund reason is required.');
    }
    if (!input.refundReference || !input.refundReference.trim()) {
      throw new Error('A valid bank refund transaction reference / UTR is required.');
    }
    if (input.refundAmount === undefined || isNaN(input.refundAmount) || input.refundAmount <= 0) {
      throw new Error('A valid positive refund amount is required.');
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.orderRequest.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      // Payment must have been received/verified before it can be refunded
      if (order.paymentStatus !== PaymentStatus.VERIFIED && order.paymentStatus !== PaymentStatus.COD_COLLECTED) {
        throw new Error(
          `Cannot process refund: Order payment status is ${order.paymentStatus}. Only verified or collected payments are eligible for refund.`
        );
      }

      // Hardening: Enforce Full Refunds Only
      const totalOrderAmount = Number(order.total);
      if (Math.abs(Number(input.refundAmount) - totalOrderAmount) > 0.01) {
        throw new Error(
          `Partial refunds are not supported in this release. Refund amount must equal the exact collected order total of ₹${totalOrderAmount.toFixed(2)}.`
        );
      }

      const updated = await tx.orderRequest.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          refundAmount: new Decimal(totalOrderAmount.toFixed(2)),
          refundReason: input.refundReason.trim(),
          refundReference: input.refundReference.trim(),
          refundedAt: new Date(),
          adminNotes: input.adminNotes ? `${order.adminNotes ? order.adminNotes + ' | ' : ''}Refund: ${input.adminNotes}` : order.adminNotes,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: order.status, // Order status remains DELIVERED or CANCELLED!
              fromPaymentStatus: order.paymentStatus,
              toPaymentStatus: PaymentStatus.REFUNDED,
              actor: ActorType.ADMIN,
              notes: `Administrator verified full refund of ₹${totalOrderAmount.toFixed(2)}. Reason: ${input.refundReason}. Reference: ${input.refundReference}.`,
            },
          },
        },
        include: { items: true, statusLogs: true },
      });

      return updated;
    });
  }

  /**
   * Admin Fetch All Orders with Filtering & Pagination
   */
  static async getAllOrders(params?: {
    status?: string;
    paymentStatus?: string;
    paymentPreference?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.status && params.status !== 'all') {
      where.status = params.status as OrderStatus;
    }

    if (params?.paymentStatus && params.paymentStatus !== 'all') {
      where.paymentStatus = params.paymentStatus as PaymentStatus;
    }

    if (params?.paymentPreference && params.paymentPreference !== 'all') {
      where.paymentPreference = params.paymentPreference as PaymentPreference;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
        { city: { contains: q, mode: 'insensitive' } },
        { awbNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.orderRequest.count({ where }),
      prisma.orderRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          statusLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin Fetch Order Detail by ID
   */
  static async getOrderById(orderId: string) {
    return prisma.orderRequest.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        statusLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Admin Dashboard Metrics & Operational Pipeline Counts
   */
  static async getDashboardMetrics() {
    const orders = await prisma.orderRequest.findMany({
      select: {
        status: true,
        paymentStatus: true,
        total: true,
      },
    });

    const counts: Record<string, number> = {
      REQUESTED: 0,
      UNDER_REVIEW: 0,
      AWAITING_CUSTOMER_ACCEPTANCE: 0,
      AWAITING_PAYMENT: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    let pendingUtrVerificationCount = 0;
    let pendingCodCollectionCount = 0;
    let totalRevenue = 0;

    for (const o of orders) {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
      if (o.paymentStatus === PaymentStatus.PAYMENT_REPORTED) {
        pendingUtrVerificationCount++;
      }
      if (o.paymentStatus === PaymentStatus.COD_PENDING && (o.status === OrderStatus.DISPATCHED || o.status === OrderStatus.DELIVERED)) {
        pendingCodCollectionCount++;
      }
      if (o.paymentStatus === PaymentStatus.VERIFIED || o.paymentStatus === PaymentStatus.COD_COLLECTED) {
        totalRevenue += Number(o.total);
      }
    }

    return {
      pipelineCounts: counts,
      totalOrders: orders.length,
      pendingUtrVerificationCount,
      pendingCodCollectionCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    };
  }
}
