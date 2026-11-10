import {
  AdminKpiMetrics,
  DynamicPriceItem,
  PriceAuditLog,
  WholesaleLead,
  Order,
} from '../types';
import {
  MOCK_ADMIN_METRICS,
  MOCK_PRICE_MATRIX,
  MOCK_PRICE_AUDIT_LOGS,
  MOCK_WHOLESALE_LEADS,
} from '../mock';
import { orderService } from './orderService';

export const adminService = {
  async getDashboardMetrics(): Promise<AdminKpiMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...MOCK_ADMIN_METRICS };
  },

  async getRecentOrders(): Promise<Order[]> {
    return orderService.getCustomerOrders();
  },

  async getPriceMatrix(): Promise<DynamicPriceItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...MOCK_PRICE_MATRIX];
  },

  async updatePriceItem(
    id: string,
    updates: Partial<DynamicPriceItem>,
    memo: string
  ): Promise<DynamicPriceItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const item = MOCK_PRICE_MATRIX.find((p) => p.id === id);
    if (!item) throw new Error('Item not found in price matrix');

    const previousMrp = item.mrp;
    const previousPrice = item.sellingPrice;

    Object.assign(item, updates);

    // Create audit log entry
    const newLog: PriceAuditLog = {
      id: `pal-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      productName: item.productName,
      variantName: item.variantName,
      previousMrp,
      newMrp: item.mrp,
      previousPrice,
      newPrice: item.sellingPrice,
      variancePct: Number((((item.sellingPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
      modifiedBy: 'Admin (Tenkasi Console)',
      memo,
      status: 'COMMITTED',
    };
    MOCK_PRICE_AUDIT_LOGS.unshift(newLog);

    return { ...item };
  },

  async getPriceAuditLogs(): Promise<PriceAuditLog[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...MOCK_PRICE_AUDIT_LOGS];
  },

  async getWholesaleLeads(): Promise<WholesaleLead[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...MOCK_WHOLESALE_LEADS];
  },

  async submitWholesaleLead(
    lead: Omit<WholesaleLead, 'id' | 'createdAt' | 'status'>
  ): Promise<WholesaleLead> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newLead: WholesaleLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'NEW',
    };
    MOCK_WHOLESALE_LEADS.unshift(newLead);
    return newLead;
  },
};
