import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminRole } from '@prisma/client';
import prisma from '../config/database';
import { config } from '../config/env';

export interface AdminAuthPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  tokenVersion?: number;
}

const KNOWN_WEAK_PASSWORDS = new Set([
  'tenkasi2026',
  'password',
  '12345678',
  'admin123',
  'admin',
]);

export class AuthService {
  /**
   * Enforces password security requirements
   */
  static validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (config.env === 'production') {
      if (KNOWN_WEAK_PASSWORDS.has(password.toLowerCase())) {
        throw new Error('Chosen password is a known weak or demo credential. Please choose a strong unique password.');
      }
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasUpper || !hasLower || !hasNumber) {
        throw new Error('Production password must contain uppercase, lowercase, and numeric characters.');
      }
    }
  }

  /**
   * Authenticate Mill Administrator Credentials
   * Server-side bcrypt comparison + JWT issuance with tokenVersion
   */
  static async login(email: string, password: string): Promise<{ token: string; user: AdminAuthPayload }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Email and password are required');
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin || !admin.isActive) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const userPayload: AdminAuthPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      tokenVersion: admin.tokenVersion,
    };

    const token = jwt.sign(userPayload, config.jwtSecret, {
      expiresIn: '24h',
    });

    return {
      token,
      user: userPayload,
    };
  }

  /**
   * Verify JWT Token and fetch live admin profile
   * Validates token version against active database record to enforce session invalidation
   */
  static async verifySession(token: string): Promise<AdminAuthPayload> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AdminAuthPayload;
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
      });

      if (!admin || !admin.isActive) {
        throw new Error('Account inactive or revoked');
      }

      // Session invalidation: reject tokens issued prior to password rotation
      if (decoded.tokenVersion !== undefined && admin.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Session has been revoked due to password rotation. Please sign in again with your new credentials.');
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        tokenVersion: admin.tokenVersion,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Invalid or expired authentication token');
    }
  }

  /**
   * Password Rotation: Administrator changes password
   * Increments tokenVersion to immediately invalidate all previously issued sessions
   */
  static async rotatePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin || !admin.isActive) {
      throw new Error('Administrator account not found or inactive');
    }

    const isCurrentMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentMatch) {
      throw new Error('Current password is incorrect');
    }

    this.validatePasswordStrength(newPassword);

    const isSameAsOld = await bcrypt.compare(newPassword, admin.passwordHash);
    if (isSameAsOld) {
      throw new Error('New password must be different from current password');
    }

    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Invalidate all existing tokens by incrementing tokenVersion
    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
        tokenVersion: { increment: 1 },
      },
    });

    return {
      success: true,
      message: 'Password rotated successfully. All prior sessions have been invalidated. Please sign in with your new credentials.',
    };
  }
}
