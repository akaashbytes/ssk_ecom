import { apiClient } from '../lib/axios';
import { Product, ExtractionCategory, ProductVariant, ApiResponse } from '../types';
import { mapProductFromApi, mapProductsFromApi } from './apiAdapters';

const PRODUCTS_STORAGE_KEY = 'ssk_mock_products';

const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse products from localStorage', e);
  }
  return [];
};

const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
};

export const productService = {
  /**
   * Fetch active products from backend PostgreSQL database (GET /api/products)
   * Strictly adheres to P18 compliance: NEVER invents mock products on failure.
   */
  async getAllProducts(category?: ExtractionCategory | 'all'): Promise<Product[]> {
    const params: Record<string, string> = {};
    if (category && category !== 'all') {
      params.category = category;
    }

    const response = await apiClient.get<ApiResponse<unknown>>('/products', { params });
    if (!response.data || !response.data.success || !response.data.data) {
      throw new Error(response.data?.message || 'Failed to fetch product catalog from server');
    }

    return mapProductsFromApi(response.data.data);
  },

  /**
   * Fetch single product by slug from backend API (GET /api/products/:slug)
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug) return null;
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(`/products/${encodeURIComponent(slug)}`);
      if (!response.data || !response.data.success || !response.data.data) {
        return null;
      }
      return mapProductFromApi(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch product by ID
   * Note: The backend API provides GET /api/products (catalogue) and GET /api/products/:slug (detail).
   * It does NOT provide a direct GET /api/products/:id endpoint.
   * Therefore, getProductById resolves products by fetching the active catalogue (GET /api/products)
   * and finding the matching product locally, strictly preserving backend route integrity without inventing endpoints.
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!id) return null;
    const all = await this.getAllProducts();
    return all.find((p) => p.id === id) || null;
  },

  /**
   * Fetch products filtered by category
   */
  async getProductsByCategory(category: ExtractionCategory | 'all'): Promise<Product[]> {
    return this.getAllProducts(category);
  },

  // -------------------------------------------------------------
  // Prototype Admin compatibility methods (Preserved for Admin UI until Phase 6.4)
  // -------------------------------------------------------------
  async toggleProductInStock(productId: string, inStock: boolean): Promise<Product | null> {
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    products[index].inStock = inStock;
    saveStoredProducts(products);
    return products[index];
  },

  async updateProductVariantStock(productId: string, variantId: string, newStock: number): Promise<Product | null> {
    const products = getStoredProducts();
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) return null;

    const variant = products[productIndex].variants.find((v) => v.id === variantId);
    if (variant) {
      variant.stock = Math.max(0, newStock);
    }

    const totalStock = products[productIndex].variants.reduce((sum, v) => sum + v.stock, 0);
    if (totalStock === 0) {
      products[productIndex].inStock = false;
    } else if (!products[productIndex].inStock && newStock > 0) {
      products[productIndex].inStock = true;
    }

    saveStoredProducts(products);
    return products[productIndex];
  },

  async updateVariantPricing(
    productId: string,
    variantId: string,
    price: number,
    mrp?: number
  ): Promise<Product | null> {
    const products = getStoredProducts();
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) return null;

    const variant = products[productIndex].variants.find((v) => v.id === variantId);
    if (variant) {
      variant.price = price;
      if (mrp !== undefined) variant.mrp = mrp;
    }

    saveStoredProducts(products);
    return products[productIndex];
  },

  async saveProduct(productData: Partial<Product> & { name: string; category: ExtractionCategory }): Promise<Product> {
    const products = getStoredProducts();
    const now = Date.now();

    if (productData.id) {
      const idx = products.findIndex((p) => p.id === productData.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...productData } as Product;
        saveStoredProducts(products);
        return products[idx];
      }
    }

    const newId = `prod-${now}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const defaultVariants: ProductVariant[] = productData.variants || [
      {
        id: `var-${now}-500ml`,
        sku: `SSK-${productData.category.slice(0, 3).toUpperCase()}-500ML`,
        volume: '500 ml',
        volumeMl: 500,
        containerType: 'Food-Grade PET Bottle',
        mrp: 249,
        price: 249,
        stock: 50,
        isDefault: true,
      },
      {
        id: `var-${now}-1l`,
        sku: `SSK-${productData.category.slice(0, 3).toUpperCase()}-1L`,
        volume: '1 Litre',
        volumeMl: 1000,
        containerType: 'Food-Grade PET Bottle',
        mrp: 479,
        price: 479,
        stock: 40,
      },
      {
        id: `var-${now}-5l`,
        sku: `SSK-${productData.category.slice(0, 3).toUpperCase()}-5L`,
        volume: '5 L Tin',
        volumeMl: 5000,
        containerType: 'Food-Grade Tin',
        mrp: 2290,
        price: 2290,
        stock: 20,
      },
    ];

    const newProduct: Product = {
      id: newId,
      slug,
      category: productData.category,
      name: productData.name,
      nameTa: productData.nameTa || productData.name,
      botanicalName: productData.botanicalName || 'Botanical Specimen',
      tagline: productData.tagline || '100% Traditional Cold Pressed',
      taglineTa: productData.taglineTa || 'பாரம்பரிய முறைப்படி மரச்செக்கில் பிழியப்பட்டது',
      description: productData.description || 'Traditional wood-pressed natural cold-pressed oil.',
      descriptionTa: productData.descriptionTa || 'மரச்செக்கில் பிழியப்பட்ட சுத்தமான எண்ணெய்.',
      seedOrigin: productData.seedOrigin || 'Tamil Nadu',
      extractionProcess: productData.extractionProcess || 'Vaagai Wood Mortar Chekku (< 42°C)',
      extractionProcessTa: productData.extractionProcessTa || 'வாகை மர உரல் (42°C குறைவான வெப்பநிலை)',
      woodType: productData.woodType || 'Vaagai Wood Churn Mortar',
      fssaiLicense: productData.fssaiLicense || '22426293000431',
      rating: null,
      reviewCount: null,
      primaryImage: productData.primaryImage || '/assets/products/groundnut-bottle.png',
      galleryImages: productData.galleryImages || ['/assets/products/groundnut-bottle.png'],
      lifestyleImage: productData.lifestyleImage || '/assets/products/groundnut-bottle.png',
      featured: productData.featured ?? true,
      inStock: productData.inStock ?? true,
      variants: defaultVariants,
      nutritionFacts: [],
      purityHighlights: [],
    };

    products.push(newProduct);
    saveStoredProducts(products);
    return newProduct;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== productId);
    if (filtered.length !== products.length) {
      saveStoredProducts(filtered);
      return true;
    }
    return false;
  },

  async resetProductsToSeed(): Promise<Product[]> {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    return this.getAllProducts();
  },

  // -------------------------------------------------------------
  // Pincode Delivery Serviceability Check (Client-side estimation)
  // -------------------------------------------------------------
  async checkPincode(pincode: string): Promise<{
    serviceable: boolean;
    city?: string;
    state?: string;
    estimatedDays?: string;
    codAvailable: boolean;
    isIndicativeEstimate: boolean;
    serviceabilityNotice: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return {
        serviceable: false,
        codAvailable: false,
        isIndicativeEstimate: true,
        serviceabilityNotice: 'Invalid PIN code format. Please enter a 6-digit Indian Postal Code.',
      };
    }

    if (cleanPin.startsWith('627')) {
      return {
        serviceable: true,
        city: 'Tenkasi / Tirunelveli (Direct Mill Dispatch)',
        state: 'Tamil Nadu',
        estimatedDays: '1-2 Days (Indicative Estimate)',
        codAvailable: true,
        isIndicativeEstimate: true,
        serviceabilityNotice: 'Indicative estimate. Final courier delivery fee will be quoted by mill desk manager upon order review.',
      };
    }

    if (
      cleanPin.startsWith('60') ||
      cleanPin.startsWith('61') ||
      cleanPin.startsWith('62') ||
      cleanPin.startsWith('63') ||
      cleanPin.startsWith('64')
    ) {
      return {
        serviceable: true,
        city: 'Tamil Nadu Regional',
        state: 'Tamil Nadu',
        estimatedDays: '2-3 Business Days (Indicative Estimate)',
        codAvailable: true,
        isIndicativeEstimate: true,
        serviceabilityNotice: 'Indicative estimate. Regional courier charges will be verified by mill desk upon order review.',
      };
    }

    return {
      serviceable: true,
      city: 'Rest of India',
      state: 'India',
      estimatedDays: '4-6 Business Days (Indicative Estimate)',
      codAvailable: true,
      isIndicativeEstimate: true,
      serviceabilityNotice: 'Outstation courier charges will be calculated and quoted by mill desk before payment.',
    };
  },
};
