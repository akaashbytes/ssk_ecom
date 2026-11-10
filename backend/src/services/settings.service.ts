import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';

const DEMO_FSSAI = '22426293000431';
const DEMO_UPI = 'ssknaturalgold@okhdfcbank';

export class SettingsService {
  /**
   * Retrieve active business settings
   * Safeguard: Returns explicit flags indicating if UPI/FSSAI details are unverified demo placeholders
   */
  static async getSettings() {
    let settings = await prisma.businessSettings.findUnique({
      where: { key: 'primary' },
    });

    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          key: 'primary',
          businessName: 'SSK Natural Gold',
          businessNameTa: 'எஸ்.எஸ்.கே நேச்சுரல் கோல்ட்',
          fssaiLicense: DEMO_FSSAI,
          fssaiVerified: false,
          merchantUpiId: DEMO_UPI,
          merchantPayeeName: 'SSK Natural Gold',
          upiVerified: false,
          whatsappPhone: '+91 9994072837',
          supportPhone: '+91 9994072837',
          contactEmail: 'support@ssknaturalgold.com',
          millAddress: 'Mettupatti Main Road, Tenkasi District, Tamil Nadu — 627811',
          defaultCourierFee: new Decimal('50.00'),
          freeDeliveryThreshold: new Decimal('1500.00'),
          codEnabled: true,
          codMaxLimit: new Decimal('5000.00'),
          isDemoConfiguration: true,
          isDemoCatalogue: true,
          upiPaymentWindowMinutes: 1440,
        },
      });
    }

    return settings;
  }

  /**
   * Update business settings
   * Safeguard: Prevents silently disabling demo configuration unless production FSSAI and UPI are genuinely verified
   */
  static async updateSettings(updates: Partial<{
    businessName: string;
    businessNameTa: string;
    fssaiLicense: string;
    fssaiVerified: boolean;
    merchantUpiId: string;
    merchantPayeeName: string;
    upiVerified: boolean;
    whatsappPhone: string;
    supportPhone: string;
    contactEmail: string;
    millAddress: string;
    defaultCourierFee: number;
    freeDeliveryThreshold: number;
    codEnabled: boolean;
    codMaxLimit: number;
    isDemoConfiguration: boolean;
    isDemoCatalogue: boolean;
    upiPaymentWindowMinutes: number;
  }>) {
    const current = await this.getSettings();

    // Demo Safeguard: Cannot transition isDemoConfiguration to false without verified production credentials
    if (updates.isDemoConfiguration === false) {
      const finalFssaiLicense = updates.fssaiLicense ?? current.fssaiLicense;
      const finalFssaiVerified = updates.fssaiVerified ?? current.fssaiVerified;
      const finalUpiId = updates.merchantUpiId ?? current.merchantUpiId;
      const finalUpiVerified = updates.upiVerified ?? current.upiVerified;

      if (!finalFssaiVerified || finalFssaiLicense === DEMO_FSSAI) {
        throw new Error(
          'Cannot promote to production configuration: FSSAI license must be verified and cannot use the demo license number.'
        );
      }

      if (!finalUpiVerified || finalUpiId === DEMO_UPI) {
        throw new Error(
          'Cannot promote to production configuration: Merchant UPI ID must be verified and cannot use the demo UPI VPA.'
        );
      }
    }

    const data: any = {};
    if (updates.businessName !== undefined) data.businessName = updates.businessName;
    if (updates.businessNameTa !== undefined) data.businessNameTa = updates.businessNameTa;
    if (updates.fssaiLicense !== undefined) data.fssaiLicense = updates.fssaiLicense;
    if (updates.fssaiVerified !== undefined) data.fssaiVerified = updates.fssaiVerified;
    if (updates.merchantUpiId !== undefined) data.merchantUpiId = updates.merchantUpiId;
    if (updates.merchantPayeeName !== undefined) data.merchantPayeeName = updates.merchantPayeeName;
    if (updates.upiVerified !== undefined) data.upiVerified = updates.upiVerified;
    if (updates.whatsappPhone !== undefined) data.whatsappPhone = updates.whatsappPhone;
    if (updates.supportPhone !== undefined) data.supportPhone = updates.supportPhone;
    if (updates.contactEmail !== undefined) data.contactEmail = updates.contactEmail;
    if (updates.millAddress !== undefined) data.millAddress = updates.millAddress;
    if (updates.defaultCourierFee !== undefined) data.defaultCourierFee = new Decimal(updates.defaultCourierFee.toFixed(2));
    if (updates.freeDeliveryThreshold !== undefined) data.freeDeliveryThreshold = new Decimal(updates.freeDeliveryThreshold.toFixed(2));
    if (updates.codEnabled !== undefined) data.codEnabled = updates.codEnabled;
    if (updates.codMaxLimit !== undefined) data.codMaxLimit = new Decimal(updates.codMaxLimit.toFixed(2));
    if (updates.isDemoConfiguration !== undefined) data.isDemoConfiguration = updates.isDemoConfiguration;
    if (updates.isDemoCatalogue !== undefined) data.isDemoCatalogue = updates.isDemoCatalogue;
    if (updates.upiPaymentWindowMinutes !== undefined) data.upiPaymentWindowMinutes = Math.max(15, updates.upiPaymentWindowMinutes);

    return prisma.businessSettings.upsert({
      where: { key: 'primary' },
      update: data,
      create: { key: 'primary', ...data },
    });
  }
}
