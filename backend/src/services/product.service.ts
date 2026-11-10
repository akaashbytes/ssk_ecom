import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';

export interface CreateProductInput {
  slug: string;
  category: string;
  nameEn: string;
  nameTa: string;
  botanicalName?: string;
  taglineEn?: string;
  taglineTa?: string;
  descriptionEn: string;
  descriptionTa: string;
  seedOrigin?: string;
  extractionProcessEn?: string;
  extractionProcessTa?: string;
  woodType?: string;
  fssaiLicense?: string;
  primaryImage?: string;
  lifestyleImage?: string;
  galleryImages?: string[];
  featured?: boolean;
  inStock?: boolean;
  variants: Array<{
    sku: string;
    volume: string;
    volumeMl: number;
    containerType: string;
    mrp: number;
    price: number;
    stock: number;
    isDefault?: boolean;
  }>;
}

export class ProductService {
  /**
   * Customer: Get all active products with variants
   * Filters out archived and out-of-stock products
   */
  static async getActiveProducts(category?: string) {
    const where: any = { inStock: true, isArchived: false };
    if (category && category !== 'all') {
      where.category = category;
    }

    return prisma.product.findMany({
      where,
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Customer: Get product by slug
   */
  static async getProductBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isArchived: false },
      include: {
        variants: {
          orderBy: { volumeMl: 'asc' },
        },
      },
    });
  }

  /**
   * Admin: Get all products (including archived/out-of-stock)
   */
  static async getAllProductsAdmin() {
    return prisma.product.findMany({
      include: {
        variants: {
          orderBy: { volumeMl: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Admin: Create new product with variants in a single transaction
   */
  static async createProduct(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new Error(`A product with slug "${input.slug}" already exists`);
    }

    const variantsData = input.variants.map((v) => ({
      sku: v.sku.toUpperCase(),
      volume: v.volume,
      volumeMl: v.volumeMl,
      containerType: v.containerType,
      mrp: new Decimal(v.mrp.toFixed(2)),
      price: new Decimal(v.price.toFixed(2)),
      stock: Math.max(0, v.stock),
      isDefault: v.isDefault ?? false,
    }));

    return prisma.product.create({
      data: {
        slug: input.slug,
        category: input.category,
        nameEn: input.nameEn,
        nameTa: input.nameTa,
        botanicalName: input.botanicalName,
        taglineEn: input.taglineEn,
        taglineTa: input.taglineTa,
        descriptionEn: input.descriptionEn,
        descriptionTa: input.descriptionTa,
        seedOrigin: input.seedOrigin,
        extractionProcessEn: input.extractionProcessEn,
        extractionProcessTa: input.extractionProcessTa,
        woodType: input.woodType,
        fssaiLicense: input.fssaiLicense,
        primaryImage: input.primaryImage,
        lifestyleImage: input.lifestyleImage,
        galleryImages: input.galleryImages || [],
        featured: input.featured ?? true,
        inStock: input.inStock ?? true,
        isArchived: false,
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
      },
    });
  }

  /**
   * Admin: Update product details
   */
  static async updateProduct(id: string, updates: Partial<CreateProductInput>) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    const updateData: any = {};
    if (updates.nameEn !== undefined) updateData.nameEn = updates.nameEn;
    if (updates.nameTa !== undefined) updateData.nameTa = updates.nameTa;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.taglineEn !== undefined) updateData.taglineEn = updates.taglineEn;
    if (updates.taglineTa !== undefined) updateData.taglineTa = updates.taglineTa;
    if (updates.descriptionEn !== undefined) updateData.descriptionEn = updates.descriptionEn;
    if (updates.descriptionTa !== undefined) updateData.descriptionTa = updates.descriptionTa;
    if (updates.seedOrigin !== undefined) updateData.seedOrigin = updates.seedOrigin;
    if (updates.woodType !== undefined) updateData.woodType = updates.woodType;
    if (updates.inStock !== undefined) updateData.inStock = updates.inStock;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true },
    });
  }

  /**
   * Admin: Toggle Product In-Stock Availability
   */
  static async toggleProductInStock(productId: string, inStock: boolean) {
    return prisma.product.update({
      where: { id: productId },
      data: { inStock },
      include: { variants: true },
    });
  }

  /**
   * Admin: Archive / Unarchive Product
   * Soft deactivation preserves all historical audit references
   */
  static async archiveProduct(productId: string, isArchived: boolean = true) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        isArchived,
        ...(isArchived && { inStock: false }),
      },
      include: { variants: true },
    });
  }

  /**
   * Admin: Create a new Variant for an existing Product
   */
  static async createVariant(
    productId: string,
    variantInput: {
      sku: string;
      volume: string;
      volumeMl: number;
      containerType: string;
      mrp: number;
      price: number;
      stock: number;
      isDefault?: boolean;
    }
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    return prisma.productVariant.create({
      data: {
        productId,
        sku: variantInput.sku.toUpperCase(),
        volume: variantInput.volume,
        volumeMl: variantInput.volumeMl,
        containerType: variantInput.containerType,
        mrp: new Decimal(variantInput.mrp.toFixed(2)),
        price: new Decimal(variantInput.price.toFixed(2)),
        stock: Math.max(0, variantInput.stock),
        isDefault: variantInput.isDefault ?? false,
      },
    });
  }

  /**
   * Admin: Update Variant Pricing & Inventory
   * Modifying catalog variant price NEVER mutates historical order items.
   */
  static async updateVariant(variantId: string, updates: { price?: number; mrp?: number; stock?: number }) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new Error('Variant not found');

    const data: any = {};
    if (updates.price !== undefined) data.price = new Decimal(updates.price.toFixed(2));
    if (updates.mrp !== undefined) data.mrp = new Decimal(updates.mrp.toFixed(2));
    if (updates.stock !== undefined) data.stock = Math.max(0, updates.stock);

    return prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  /**
   * Admin: Delete or Archive Product
   * If product has associated historical order items, it is safely ARCHIVED to preserve audit history.
   * If product has no historical orders, hard deletion is performed.
   */
  static async deleteProduct(id: string): Promise<{ deleted: boolean; archived: boolean; message: string }> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { select: { id: true } } },
    });
    if (!product) throw new Error('Product not found');

    const variantIds = product.variants.map((v) => v.id);

    // Check if any historical orders reference this product's variants
    const orderItemCount = await prisma.orderItem.count({
      where: {
        OR: [
          { productId: id },
          { variantId: { in: variantIds } },
        ],
      },
    });

    if (orderItemCount > 0) {
      // Historical references exist: Soft-archive product instead of hard deleting
      await prisma.product.update({
        where: { id },
        data: {
          isArchived: true,
          inStock: false,
        },
      });
      return {
        deleted: false,
        archived: true,
        message: 'Product has historical customer orders. Product safely archived to protect order history.',
      };
    }

    // No historical orders: safe to hard delete
    await prisma.product.delete({ where: { id } });
    return {
      deleted: true,
      archived: false,
      message: 'Product permanently deleted.',
    };
  }
}
