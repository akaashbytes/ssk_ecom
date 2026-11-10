import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AdminRole } from '@prisma/client';
import prisma from '../config/database';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuthController {
  /**
   * POST /api/admin/auth/login
   * Admin login with email & password
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Both email and password are required',
        });
        return;
      }

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * GET /api/admin/auth/me
   * Get authenticated admin session info
   */
  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: req.admin,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/admin/auth/change-password
   * Authenticated password rotation (Invalidates all prior JWTs)
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.admin?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Both current password and new password are required',
        });
        return;
      }

      const result = await AuthService.rotatePassword(adminId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to rotate password',
      });
    }
  }

  /**
   * GET /api/admin/users
   * SUPER_ADMIN only: List all administrator accounts
   */
  static async listAdminUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/admin/users
   * SUPER_ADMIN only: Provision new administrator or staff account
   */
  static async createAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: 'Email, password, and name are required.',
        });
        return;
      }

      AuthService.validatePasswordStrength(password);

      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        res.status(400).json({
          success: false,
          message: `An account with email "${cleanEmail}" already exists.`,
        });
        return;
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const userRole = role === 'SUPER_ADMIN' ? AdminRole.SUPER_ADMIN : role === 'STAFF' ? AdminRole.STAFF : AdminRole.ADMIN;

      const newUser = await prisma.adminUser.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: name.trim(),
          phone: phone?.trim(),
          role: userRole,
          isActive: true,
          tokenVersion: 1,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        data: newUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create admin user',
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id/role
   * SUPER_ADMIN only: Update user role
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !Object.values(AdminRole).includes(role)) {
        res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles: ${Object.values(AdminRole).join(', ')}`,
        });
        return;
      }

      const user = await prisma.adminUser.update({
        where: { id },
        data: { role, tokenVersion: { increment: 1 } }, // revoke existing sessions upon role change
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user role',
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   * SUPER_ADMIN only: Activate or deactivate account
   */
  static async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isActive boolean is required',
        });
        return;
      }

      const user = await prisma.adminUser.update({
        where: { id },
        data: { isActive, tokenVersion: { increment: 1 } }, // revoke sessions if deactivated
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user status',
      });
    }
  }
}
