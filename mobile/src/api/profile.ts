import { apiRequest } from './client';
import { Profile } from '../types';

export const profileApi = {
  async getProfile() {
    return apiRequest<Profile>('/api/profile', {
      method: 'GET',
    });
  },

  async saveProfile(profile: {
    fullName: string;
    mobileNumber: string;
    addressArea: string;
    societyBuilding?: string;
    flatUnit?: string;
    gateNotes?: string;
    businessName?: string;
  }) {
    return apiRequest<Profile>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },
};
