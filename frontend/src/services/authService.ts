import { User } from '../types';
import { MOCK_CUSTOMER, MOCK_ADMIN } from '../mock';

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

  async loginWithPassword(identifier: string, _password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: User = identifier.includes('admin') ? { ...MOCK_ADMIN } : { ...MOCK_CUSTOMER };
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

  logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
