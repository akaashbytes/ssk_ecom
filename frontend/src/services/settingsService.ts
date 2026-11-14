import { apiClient } from '../lib/axios';
import { ApiResponse } from '../types';
import { mapBusinessSettingsFromApi } from './apiAdapters';

export interface BusinessSettings {
  businessName: string;
  businessNameTa: string;
  tagline: string;
  taglineTa: string;
  millAddress: string;
  fssaiLicense: string;
  fssaiVerified?: boolean;
  helpdeskPhone: string;
  whatsappPhone: string;
  supportPhone?: string;
  contactEmail?: string;
  supportEmail: string;
  workingHours: string;
  workingHoursTa: string;
  merchantUpiId: string;
  merchantPayeeName: string;
  upiVerified?: boolean;
  codEnabled: boolean;
  maxCodOrderValue?: number | null;
  defaultLocalCourierFee?: number | null;
  defaultNationalCourierFee?: number | null;
  freeDeliveryThreshold?: number | null;
  courierPartners: string[];
  serviceablePinPrefixes: string[];
  isDemoConfiguration?: boolean;
  isDemoCatalogue?: boolean;
  upiPaymentWindowMinutes?: number;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'SSK Natural Gold',
  businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
  tagline: '100% Traditional Cold-Pressed Wood-Churned Edible Oils',
  taglineTa: 'பாரம்பரிய மரச்செக்கு சுத்தமான சமையல் எண்ணெய்',
  millAddress: '',
  fssaiLicense: '',
  fssaiVerified: false,
  helpdeskPhone: '',
  whatsappPhone: '',
  supportPhone: '',
  contactEmail: '',
  supportEmail: '',
  workingHours: '8:00 AM – 7:30 PM (Mon – Sat)',
  workingHoursTa: 'காலை 8:00 – இரவு 7:30 (திங்கள் – சனி)',
  merchantUpiId: '',
  merchantPayeeName: '',
  upiVerified: false,
  codEnabled: true,
  maxCodOrderValue: null,
  defaultLocalCourierFee: null,
  defaultNationalCourierFee: null,
  freeDeliveryThreshold: null,
  courierPartners: ['The Professional Couriers', 'ST Courier', 'India Post Speed Post', 'Local Mill Van'],
  serviceablePinPrefixes: ['627', '628', '60', '61', '62', '63', '64'],
  isDemoConfiguration: true,
  isDemoCatalogue: true,
  upiPaymentWindowMinutes: 1440,
};

const SETTINGS_STORAGE_KEY = 'ssk_business_settings';

export const settingsService = {
  /**
   * Fetch active public business settings from backend API (GET /api/settings).
   * Throws cleanly on failure to expose a retryable error state rather than silently
   * masking backend breakdown with fabricated fallback data.
   */
  async getSettings(): Promise<BusinessSettings> {
    const response = await apiClient.get<ApiResponse<unknown>>('/settings');
    if (!response.data || !response.data.success || !response.data.data) {
      throw new Error(response.data?.message || 'Failed to fetch business settings from server');
    }
    return mapBusinessSettingsFromApi(response.data.data);
  },

  /**
   * Prototype update settings (for admin mock compatibility until Phase 6.4)
   */
  async updateSettings(partial: Partial<BusinessSettings>): Promise<BusinessSettings> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = await this.getSettings().catch(() => ({ ...DEFAULT_BUSINESS_SETTINGS }));
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save business settings to localStorage', e);
    }
    return updated;
  },

  async resetSettings(): Promise<BusinessSettings> {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    return { ...DEFAULT_BUSINESS_SETTINGS };
  },
};
