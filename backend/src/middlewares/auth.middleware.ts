import { Request, Response, NextFunction } from 'express';
import { AdminRole } from '@prisma/client';
import { AuthService, AdminAuthPayload } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  admin?: AdminAuthPayload;
}

/**
 * Validates JWT Bearer Token and verifies active admin user session
 */
export const requireAdminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const admin = await AuthService.verifySession(token);

    req.admin = admin;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired session.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * Enforces permissions for SUPER_ADMIN, ADMIN, and STAFF
 */
export const requireRole = (allowedRoles: AdminRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied: Requires ${allowedRoles.join(' or ')} privileges. Current role: ${req.admin.role}.`,
      });
      return;
    }

    next();
  };
};

export const requireAdminOrSuperAdmin = requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
export const requireSuperAdmin = requireRole([AdminRole.SUPER_ADMIN]);
