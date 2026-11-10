import { Request, Response, NextFunction } from 'express';
import { ProductService, CreateProductInput } from '../services/product.service';

export class ProductController {
  /**
   * GET /api/products
   * Public: List all active products with variants
   */
  static async getPublicProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const products = await ProductService.getActiveProducts(category);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/products/:slug
   * Public: Get single product by slug
   */
  static async getPublicProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product with slug "${slug}" not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/admin/products
   * Admin: List all products (including inactive/out-of-stock/archived)
   */
  static async getAdminProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getAllProductsAdmin();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/admin/products
   * Admin: Create new product
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateProductInput = req.body;
      const product = await ProductService.createProduct(input);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product',
      });
    }
  }

  /**
   * PUT /api/admin/products/:id
   * Admin: Update product details
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }

  /**
   * PATCH /api/admin/products/:id/stock
   * Admin: Toggle product inStock boolean
   */
  static async toggleStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { inStock } = req.body;

      if (typeof inStock !== 'boolean') {
        res.status(400).json({
          success: false,
          message: '"inStock" boolean field is required',
        });
        return;
      }

      const product = await ProductService.toggleProductInStock(id, inStock);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle stock status',
      });
    }
  }

  /**
   * POST /api/admin/products/:id/archive
   * Admin: Archive product (soft deactivation to preserve historical order references)
   */
  static async archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isArchived } = req.body;

      const product = await ProductService.archiveProduct(id, isArchived !== false);

      res.status(200).json({
        success: true,
        message: product.isArchived ? 'Product archived successfully' : 'Product unarchived successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to archive product',
      });
    }
  }

  /**
   * POST /api/admin/products/:id/variants
   * Admin: Add new variant to existing product
   */
  static async createVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const variant = await ProductService.createVariant(id, req.body);

      res.status(201).json({
        success: true,
        data: variant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product variant',
      });
    }
  }

  /**
   * PATCH /api/admin/products/variants/:id
   * Admin: Update variant pricing/stock (does NOT mutate past order item snapshots)
   */
  static async updateVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { price, mrp, stock } = req.body;

      const variant = await ProductService.updateVariant(id, { price, mrp, stock });

      res.status(200).json({
        success: true,
        data: variant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update variant',
      });
    }
  }

  /**
   * DELETE /api/admin/products/:id
   * Admin: Delete or Archive Product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete product',
      });
    }
  }
}
