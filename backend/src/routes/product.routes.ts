import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

// GET /api/products (filter by ?category=...)
router.get('/', ProductController.getPublicProducts);

// GET /api/products/:slug
router.get('/:slug', ProductController.getPublicProductBySlug);

export default router;
