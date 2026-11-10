import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { trackingRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// POST /api/orders - Guest customer checkout submission
router.post('/', OrderController.submitOrder);

// GET & POST /api/orders/track - Privacy-protected order tracking (dual identifier)
router.get('/track', trackingRateLimiter, OrderController.trackOrder);
router.post('/track', trackingRateLimiter, OrderController.trackOrder);

// POST /api/orders/:orderNumber/accept - Customer accepts quotation
router.post('/:orderNumber/accept', OrderController.acceptQuotation);

// POST /api/orders/:orderNumber/decline - Customer declines quotation
router.post('/:orderNumber/decline', OrderController.declineQuotation);

// POST /api/orders/:orderNumber/report-payment - Customer submits UPI UTR
router.post('/:orderNumber/report-payment', OrderController.reportPayment);

export default router;
