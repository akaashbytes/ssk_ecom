import { User } from '../types';
import { MOCK_CUSTOMER, MOCK_ADMIN } from '../mock';
import apiClient, { setAdminToken, clearAdminSession, ADMIN_USER_STORAGE_KEY } from '../lib/axios';

const AUTH_USER_KEY = 'ssk_mock_auth_user';

export const authService = {
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to get auth user', e);
    }
    // Default to mock logged in customer for delightful demonstration
    return MOCK_CUSTOMER;
  },

  /**
   * Primary Administrator Authentication via Express + PostgreSQL backend.
   * Calls POST /api/admin/auth/login, securely stores JWT via setAdminToken,
   * and persists session info in localStorage.
   */
  async login(email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const response = await apiClient.post('/admin/auth/login', {
      email: cleanEmail,
      password,
    });

    const data = response.data?.data;
    if (!data || !data.token) {
      throw new Error(response.data?.message || 'Authentication failed: Invalid credentials.');
    }

    // Persist JWT token
    setAdminToken(data.token);

    // Shape User object
    const adminUser = data.user || {};
    const user: User = {
      id: adminUser.id || 'usr-admin',
      name: adminUser.name || 'R. Kaliappan (Mill Supervisor)',
      email: adminUser.email || cleanEmail,
      phone: adminUser.phone || '9994072837',
      role: 'ADMIN',
      avatarUrl: adminUser.avatarUrl || '',
      memberSince: 'Oct 2024',
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminUser));
    return user;
  },

  /**
   * Fetch authenticated admin session from GET /api/admin/auth/me
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await apiClient.get('/admin/auth/me');
      const adminData = response.data?.data;
      if (!adminData) return null;

      const user: User = {
        id: adminData.id,
        name: adminData.name || 'Administrator',
        email: adminData.email,
        phone: adminData.phone || '',
        role: 'ADMIN',
        memberSince: 'Oct 2024',
      };
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Universal login handler supporting both live backend admin login
   * and demo customer login.
   */
  async loginWithPassword(identifier: string, password: string): Promise<User> {
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('@') || clean.includes('admin')) {
      try {
        return await this.login(identifier, password);
      } catch (e: any) {
        // If network or credentials error, fallback only if mock matches
        if (clean === 'admin@ssknaturalgold.com' && password === 'tenkasi2026') {
          const user: User = { ...MOCK_ADMIN };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          return user;
        }
        throw e;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: User = { ...MOCK_CUSTOMER };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async loginWithOtp(phone: string, otp: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (otp !== '123456' && otp.length !== 6) {
      throw new Error('Invalid OTP. Please enter 123456 for demonstration.');
    }
    const user: User = {
      ...MOCK_CUSTOMER,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async registerUser(params: { name: string; phone: string; email: string }): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: User = {
      id: `usr-${Date.now()}`,
      name: params.name,
      phone: params.phone,
      email: params.email,
      role: 'CUSTOMER',
      memberSince: 'Today',
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Terminate administrator session and clear JWT credentials
   */
  logout(): void {
    clearAdminSession();
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // Fail silently
    }
  },
};
