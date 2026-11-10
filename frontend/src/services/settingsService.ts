export interface BusinessSettings {
  businessName: string;
  businessNameTa: string;
  tagline: string;
  taglineTa: string;
  millAddress: string;
  fssaiLicense: string;
  helpdeskPhone: string;
  whatsappPhone: string;
  supportEmail: string;
  workingHours: string;
  workingHoursTa: string;
  merchantUpiId: string;
  merchantPayeeName: string;
  codEnabled: boolean;
  maxCodOrderValue: number;
  defaultLocalCourierFee: number;
  defaultNationalCourierFee: number;
  freeDeliveryThreshold: number;
  courierPartners: string[];
  serviceablePinPrefixes: string[];
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'SSK Natural Gold',
  businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
  tagline: '100% Traditional Cold-Pressed Wood-Churned Edible Oils',
  taglineTa: 'பாரம்பரிய மரச்செக்கு சுத்தமான சமையல் எண்ணெய்',
  millAddress: 'Door 14/B, Sannathi Street, Tenkasi, Tamil Nadu - 627811',
  fssaiLicense: '12423023000452',
  helpdeskPhone: '+91 9994072837',
  whatsappPhone: '+91 9994072837',
  supportEmail: 'support@ssknaturalgold.com',
  workingHours: '8:00 AM – 7:30 PM (Mon – Sat)',
  workingHoursTa: 'காலை 8:00 – இரவு 7:30 (திங்கள் – சனி)',
  merchantUpiId: 'ssknaturalgold@okhdfcbank',
  merchantPayeeName: 'SSK Natural Gold',
  codEnabled: true,
  maxCodOrderValue: 5000,
  defaultLocalCourierFee: 50,
  defaultNationalCourierFee: 120,
  freeDeliveryThreshold: 500,
  courierPartners: ['The Professional Couriers', 'ST Courier', 'India Post Speed Post', 'Local Mill Van'],
  serviceablePinPrefixes: ['627', '628', '60', '61', '62', '63', '64'],
};

const SETTINGS_STORAGE_KEY = 'ssk_business_settings';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) return { ...DEFAULT_BUSINESS_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      console.error('Failed to parse business settings from localStorage', e);
    }
    return { ...DEFAULT_BUSINESS_SETTINGS };
  },

  async updateSettings(partial: Partial<BusinessSettings>): Promise<BusinessSettings> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = await this.getSettings();
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
