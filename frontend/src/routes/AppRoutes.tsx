import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  HomePage,
  ShopAllPage,
  ProductDetailPage,
  CartPage,
  CheckoutAddressPage,
  CheckoutPaymentPage,
  CheckoutSuccessPage,
  LoginPage,
  RegisterPage,
  OtpVerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AccountDashboardPage,
  OrderHistoryPage,
  OrderTrackingPage,
  AboutUsPage,
  ContactWholesalePage,
  PoliciesLegalPage,
  NotFoundPage,
  AdminLoginPage,
  AdminDashboardPage,
  AdminProductsPage,
  AdminProductStudioPage,
  AdminPricingPage,
  AdminPriceAuditPage,
  AdminOrdersPage,
  AdminSafeguardsPage,
  AdminSettingsPage,
} from '../pages';
import { ComponentShowcase } from '../components/showcase/ComponentShowcase';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ─── Batch 1: Core Navigation & Homepage ───────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />

      {/* ─── Batch 2: Product Catalogue / Shop All ──────────────────────── */}
      <Route path="/shop" element={<ShopAllPage />} />
      <Route path="/products" element={<ShopAllPage />} />

      {/* ─── Batch 3: Product Details ──────────────────────────────────── */}
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/product/:slug" element={<ProductDetailPage />} />

      {/* ─── Batch 4: Shopping Cart & Promotions ────────────────────────── */}
      <Route path="/cart" element={<CartPage />} />

      {/* ─── Batch 5: Checkout Pipeline & Confirmation ─────────────────── */}
      <Route path="/checkout" element={<CheckoutAddressPage />} />
      <Route path="/checkout/address" element={<CheckoutAddressPage />} />
      <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

      {/* ─── Batch 6: Customer Authentication & OTP ────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ─── Batch 7: Customer Account, Orders & Tracking ───────────────── */}
      <Route path="/account" element={<AccountDashboardPage />} />
      <Route path="/account/orders" element={<OrderHistoryPage />} />
      <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
      <Route path="/account/orders/:orderId" element={<OrderTrackingPage />} />
      <Route path="/track" element={<OrderTrackingPage />} />

      {/* ─── Batch 8: Content Hubs & Policy Pages ───────────────────────── */}
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/faq" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactWholesalePage />} />
      <Route path="/wholesale" element={<ContactWholesalePage />} />
      <Route path="/policies" element={<PoliciesLegalPage />} />
      <Route path="/terms" element={<PoliciesLegalPage />} />
      <Route path="/privacy" element={<PoliciesLegalPage />} />
      <Route path="/returns" element={<PoliciesLegalPage />} />
      <Route path="/shipping" element={<PoliciesLegalPage />} />

      {/* ─── Design System & Showcase ──────────────────────────────────── */}
      <Route path="/design-system" element={<ComponentShowcase />} />
      <Route path="/showcase" element={<ComponentShowcase />} />

      {/* ─── Batch 9: Admin Authentication & Dashboard ─────────────────── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      {/* ─── Batch 10: Admin Operations, Pricing & Order Fulfillment ───── */}
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/products/new" element={<AdminProductStudioPage />} />
      <Route path="/admin/products/:id" element={<AdminProductStudioPage />} />
      <Route path="/admin/pricing" element={<AdminPricingPage />} />
      <Route path="/admin/pricing/audit" element={<AdminPriceAuditPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/safeguards" element={<AdminSafeguardsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* ─── 404 Not Found Catch-All ───────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
