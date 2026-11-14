import { Request, Response, NextFunction } from 'express';
import { OrderService, OrderStatus, PaymentStatus } from '../services/order.service';
import { SettingsService } from '../services/settings.service';

export class AdminController {
  /**
   * GET /api/admin/dashboard/metrics
   * Mill dashboard stats and order pipeline counts
   */
  static async getDashboardMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await OrderService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders
   * Filter, search and paginate orders
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, paymentStatus, paymentPreference, search, page, limit } = req.query;

      const result = await OrderService.getAllOrders({
        status: status as string,
        paymentStatus: paymentStatus as string,
        paymentPreference: paymentPreference as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders/:id
   * Fetch complete order details including audit trail logs and admin notes
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/admin/orders/:id/quote
   * Admin sets delivery courier fee and sends quotation
   * Order status -> AWAITING_CUSTOMER_ACCEPTANCE
   */
  static async sendQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { courierFee, adminNotes } = req.body;

      if (courierFee === undefined || isNaN(Number(courierFee))) {
        res.status(400).json({
          success: false,
          message: 'A valid numeric delivery/courier charge is required.',
        });
        return;
      }

      const order = await OrderService.sendQuotation(id, Number(courierFee), adminNotes);

      res.status(200).json({
        success: true,
        message: 'Delivery quotation sent successfully.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send delivery quotation.',
      });
    }
  }

  /**
   * POST /api/admin/orders/:id/verify-upi
   * Admin explicitly confirms bank credit reconciliation
   * Converts reservation to permanent stock deduction
   * Payment status -> VERIFIED, order status -> CONFIRMED
   */
  static async verifyUpiPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const order = await OrderService.verifyUpiPayment(id, adminNotes);

      res.status(200).json({
        success: true,
        message: 'UPI payment verified and order moved to confirmed production queue.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify UPI payment.',
      });
    }
  }

  /**
   * POST /api/admin/orders/:id/collect-cod
   * Admin confirms doorstep cash collection
   * Payment status -> COD_COLLECTED
   */
  static async confirmCashCollected(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const order = await OrderService.confirmCashCollected(id, adminNotes);

      res.status(200).json({
        success: true,
        message: 'Doorstep cash collection confirmed.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to confirm cash collection.',
      });
    }
  }

  /**
   * PATCH /api/admin/orders/:id/status
   * General status update with state-machine transition validation
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, courier, awbNumber, estimatedDeliveryDate, adminNotes, paymentStatus, deliveryChannel } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Order status is required.',
        });
        return;
      }

      const order = await OrderService.updateOrderStatus(id, status as OrderStatus, {
        courier,
        awbNumber,
        estimatedDeliveryDate,
        adminNotes,
        paymentStatus: paymentStatus as PaymentStatus | undefined,
        deliveryChannel,
      });

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}.`,
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status.',
      });
    }
  }

  /**
   * POST /api/admin/orders/:id/refund
   * Explicit administrator full refund operation
   */
  static async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { refundAmount, refundReason, refundReference, adminNotes } = req.body;

      const order = await OrderService.processRefund(id, {
        refundAmount: Number(refundAmount),
        refundReason,
        refundReference,
        adminNotes,
      });

      res.status(200).json({
        success: true,
        message: `Refund of ₹${refundAmount} processed successfully. Payment status updated to REFUNDED.`,
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process refund.',
      });
    }
  }

  /**
   * POST /api/admin/orders/cleanup-expired-reservations
   * Releases stock for abandoned UPI orders past 24-hour payment window
   */
  static async cleanupExpiredReservations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrderService.releaseExpiredReservations();
      res.status(200).json({
        success: true,
        message: `Released ${result.releasedCount} expired UPI inventory reservation(s).`,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/admin/settings & GET /api/settings
   * Retrieve business settings (with demo flags)
   */
  static async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/settings
   * Update business settings (Requires SUPER_ADMIN)
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'Business settings updated successfully.',
        data: settings,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update business settings.',
      });
    }
  }
}
