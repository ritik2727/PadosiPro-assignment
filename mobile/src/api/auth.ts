import { apiRequest } from './client';
import { User, Profile } from '../types';

export interface AuthSuccessData {
  token: string;
  user: User;
  hasProfile: boolean;
}

export const authApi = {
  async register(email: string, password: string) {
    return apiRequest<{ message: string; email: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async verifyOtp(email: string, otp: string) {
    return apiRequest<AuthSuccessData>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async resendOtp(email: string) {
    return apiRequest<{ cooldownSeconds: number; previewUrl?: string }>('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async login(email: string, password: string) {
    return apiRequest<AuthSuccessData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async fetchMe() {
    return apiRequest<{
      user: User;
      profile: Profile | null;
      hasProfile: boolean;
    }>('/api/auth/me', {
      method: 'GET',
    });
  },
};
