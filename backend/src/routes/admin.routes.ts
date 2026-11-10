import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { ProductController } from '../controllers/product.controller';
import {
  requireAdminAuth,
  requireAdminOrSuperAdmin,
  requireSuperAdmin,
} from '../middlewares/auth.middleware';
import { loginRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public Admin Auth
router.post('/auth/login', loginRateLimiter, AuthController.login);

// All routes below require Admin Authentication (STAFF, ADMIN, or SUPER_ADMIN)
router.use(requireAdminAuth);

// Session Verification & Self Password Management
router.get('/auth/me', AuthController.me);
router.post('/auth/change-password', AuthController.changePassword);

// Dashboard Metrics (Read-only for all roles)
router.get('/dashboard/metrics', AdminController.getDashboardMetrics);
router.get('/dashboard/stats', AdminController.getDashboardMetrics);

// Order Management: Read-only access for STAFF, ADMIN, SUPER_ADMIN
router.get('/orders', AdminController.getAllOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

// Financial Order Actions (Require ADMIN or SUPER_ADMIN — STAFF is forbidden)
router.post('/orders/:id/quote', requireAdminOrSuperAdmin, AdminController.sendQuotation);
router.post('/orders/:id/verify-upi', requireAdminOrSuperAdmin, AdminController.verifyUpiPayment);
router.post('/orders/:id/collect-cod', requireAdminOrSuperAdmin, AdminController.confirmCashCollected);
router.post('/orders/:id/refund', requireAdminOrSuperAdmin, AdminController.processRefund);
router.post('/orders/cleanup-expired-reservations', requireAdminOrSuperAdmin, AdminController.cleanupExpiredReservations);

// Product Catalog Management (Require ADMIN or SUPER_ADMIN — STAFF is forbidden from mutating catalog)
router.get('/products', ProductController.getAdminProducts);
router.post('/products', requireAdminOrSuperAdmin, ProductController.createProduct);
router.put('/products/:id', requireAdminOrSuperAdmin, ProductController.updateProduct);
router.post('/products/:id/archive', requireAdminOrSuperAdmin, ProductController.archiveProduct);
router.post('/products/:id/variants', requireAdminOrSuperAdmin, ProductController.createVariant);
router.patch('/products/:id/stock', requireAdminOrSuperAdmin, ProductController.toggleStock);
router.patch('/products/variants/:id', requireAdminOrSuperAdmin, ProductController.updateVariant);
router.delete('/products/:id', requireAdminOrSuperAdmin, ProductController.deleteProduct);

// Business Settings:
// Read access: all roles
router.get('/settings', AdminController.getSettings);
// Modification: STRICTLY SUPER_ADMIN ONLY! (STAFF and normal ADMIN are blocked from modifying bank UPI/FSSAI settings)
router.put('/settings', requireSuperAdmin, AdminController.updateSettings);

// Administrator User Management (Strictly SUPER_ADMIN only!)
router.get('/users', requireSuperAdmin, AuthController.listAdminUsers);
router.post('/users', requireSuperAdmin, AuthController.createAdminUser);
router.patch('/users/:id/role', requireSuperAdmin, AuthController.updateUserRole);
router.patch('/users/:id/status', requireSuperAdmin, AuthController.toggleUserStatus);

export default router;
