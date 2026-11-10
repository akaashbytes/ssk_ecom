import { Router } from 'express';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Public settings endpoint (mill details, demo flags, general configs)
router.get('/settings', AdminController.getSettings);

// Customer product catalog routes
router.use('/products', productRoutes);

// Customer order & tracking routes
router.use('/orders', orderRoutes);

// Protected Admin Dashboard routes
router.use('/admin', adminRoutes);

export default router;
