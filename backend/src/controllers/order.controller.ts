import { Request, Response, NextFunction } from 'express';
import { OrderService, SubmitOrderInput } from '../services/order.service';

export class OrderController {
  /**
   * POST /api/orders
   * Customer: Guest Order Request submission
   * Server calculates prices and totals from database.
   */
  static async submitOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: SubmitOrderInput = req.body;
      const order = await OrderService.submitOrderRequest(input);

      // Return sanitized customer-safe order response
      const { adminNotes, ...customerSafeOrder } = order;

      res.status(201).json({
        success: true,
        data: customerSafeOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Unable to submit order request',
      });
    }
  }

  /**
   * GET /api/orders/track
   * Customer: Track order by Reference + Registered Phone Number
   * Privacy: Both parameters are mandatory.
   */
  static async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderRef = (req.query.orderRef as string) || (req.body?.orderRef as string);
      const phone = (req.query.phone as string) || (req.body?.phone as string);

      if (!orderRef || !phone) {
        res.status(400).json({
          success: false,
          message: 'Both Order Reference Number and registered 10-digit mobile number are required.',
        });
        return;
      }

      const order = await OrderService.getOrderForTracking(orderRef, phone);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'No order found matching the provided reference number and mobile number.',
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
   * POST /api/orders/:orderNumber/accept
   * Customer: Accepts delivery quotation
   */
  static async acceptQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({
          success: false,
          message: 'Registered 10-digit mobile number is required to verify order.',
        });
        return;
      }

      const order = await OrderService.customerAcceptQuotation(orderNumber, phone);

      res.status(200).json({
        success: true,
        message: 'Quotation accepted successfully.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to accept quotation.',
      });
    }
  }

  /**
   * POST /api/orders/:orderNumber/decline
   * Customer: Declines delivery quotation
   */
  static async declineQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const { phone, reason } = req.body;

      if (!phone) {
        res.status(400).json({
          success: false,
          message: 'Registered 10-digit mobile number is required to verify order.',
        });
        return;
      }

      const order = await OrderService.customerDeclineQuotation(orderNumber, phone, reason);

      res.status(200).json({
        success: true,
        message: 'Quotation declined and order request cancelled.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to decline quotation.',
      });
    }
  }

  /**
   * POST /api/orders/:orderNumber/report-payment
   * Customer: Reports UPI transaction reference (UTR)
   */
  static async reportPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const { phone, utr } = req.body;

      if (!phone || !utr) {
        res.status(400).json({
          success: false,
          message: 'Both registered mobile number and UPI transaction reference (UTR) are required.',
        });
        return;
      }

      const order = await OrderService.submitPaymentReport(orderNumber, phone, utr);

      res.status(200).json({
        success: true,
        message: 'Payment reference submitted. Your order is under mill desk verification.',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit payment reference.',
      });
    }
  }
}
