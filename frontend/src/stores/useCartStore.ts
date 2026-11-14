import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Coupon } from '../types';
import { MOCK_COUPONS } from '../mock/adminData';

export interface PriceNotice {
  itemId: string;
  name: string;
  oldPrice: number;
  newPrice: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  priceNotices: PriceNotice[];
  addItem: (product: {
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    nameTa: string;
    category: CartItem['category'];
    volume: string;
    price: number;
    mrp: number;
    image: string;
    stock: number;
    quantity?: number;
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  acceptPriceChange: (itemId: string) => void;
  dismissPriceNotice: (itemId: string) => void;
  // Getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Clean initial state without pre-seeded items
      items: [],
      appliedCoupon: null,
      priceNotices: [],

      addItem: (newItem) => {
        const availableStock = typeof newItem.stock === 'number' ? newItem.stock : 0;
        // Strictly prevent adding out-of-stock variants
        if (availableStock <= 0) {
          return;
        }

        const id = `${newItem.productId}-${newItem.variantId}`;
        const existing = get().items.find((i) => i.id === id);
        const qtyToAdd = Math.min(newItem.quantity || 1, availableStock);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === id
                ? { ...i, quantity: Math.min(i.quantity + qtyToAdd, availableStock) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                id,
                productId: newItem.productId,
                variantId: newItem.variantId,
                slug: newItem.slug,
                name: newItem.name,
                nameTa: newItem.nameTa,
                category: newItem.category,
                volume: newItem.volume,
                price: newItem.price,
                mrp: newItem.mrp,
                quantity: qtyToAdd,
                image: newItem.image,
                stock: availableStock,
              },
            ],
          });
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((i) => i.id !== itemId),
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        const found = MOCK_COUPONS.find((c) => c.code === cleanCode);
        if (!found) {
          return { success: false, message: 'Invalid promo code. Try NATURAL50 or WELCOME100.' };
        }
        const subtotal = get().getSubtotal();
        if (subtotal < found.minimumOrder) {
          return {
            success: false,
            message: `Minimum order of ₹${found.minimumOrder} required for ${cleanCode}.`,
          };
        }
        set({ appliedCoupon: found });
        return { success: true, message: `Coupon ${cleanCode} applied! You saved ₹${found.discountAmount}.` };
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      acceptPriceChange: (itemId: string) => {
        const notice = get().priceNotices.find((n) => n.itemId === itemId);
        if (notice) {
          set({
            items: get().items.map((it) =>
              it.id === itemId ? { ...it, price: notice.newPrice } : it
            ),
            priceNotices: get().priceNotices.filter((n) => n.itemId !== itemId),
          });
        }
      },

      dismissPriceNotice: (itemId: string) => {
        set({
          priceNotices: get().priceNotices.filter((n) => n.itemId !== itemId),
        });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        return subtotal >= coupon.minimumOrder ? coupon.discountAmount : 0;
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        // Free delivery on orders ₹500 and above
        return subtotal >= 500 ? 0 : 50;
      },

      getTax: () => {
        // 5% GST on edible oil
        const taxable = Math.max(0, get().getSubtotal() - get().getDiscount());
        return Math.round(taxable * 0.05);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscount();
        const delivery = get().getDeliveryFee();
        return Math.max(0, subtotal - discount + delivery);
      },
    }),
    {
      name: 'ssk_cart_storage',
    }
  )
);
