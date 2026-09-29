import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile } from '../types';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profile';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isLoading: boolean;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  register: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ hasProfile: boolean }>;
  resendOtp: (email: string) => Promise<{ cooldownSeconds: number; previewUrl?: string }>;
  login: (email: string, password: string) => Promise<{ hasProfile: boolean }>;
  saveProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  reloadSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeProfile(p: any): Profile | null {
  if (!p) return null;
  return {
    id: p.id,
    user_id: p.user_id,
    fullName: p.fullName || p.full_name || '',
    mobileNumber: p.mobileNumber || p.mobile_number || '',
    addressArea: p.addressArea || p.address_area || '',
    societyBuilding: p.societyBuilding || p.society_building || '',
    flatUnit: p.flatUnit || p.flat_unit || '',
    gateNotes: p.gateNotes || p.gate_notes || '',
    businessName: p.businessName || p.business_name || '',
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string>('');

  // Check persistent session on app start
  const restoreSession = async () => {
    try {
      const storedToken = await getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setTokenState(storedToken);
      const res = await authApi.fetchMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(normalizeProfile(res.data.profile));
        setHasProfile(res.data.hasProfile);
      } else {
        await removeAuthToken();
        setTokenState(null);
      }
    } catch (err) {
      await removeAuthToken();
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const register = async (email: string, password: string) => {
    const res = await authApi.register(email, password);
    if (res.success) {
      setPendingEmail(email);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await authApi.verifyOtp(email, otp);
    if (res.success && res.data) {
      await setAuthToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user);
      setHasProfile(res.data.hasProfile);
      return { hasProfile: res.data.hasProfile };
    }
    throw new Error(res.error || 'Verification failed');
  };

  const resendOtp = async (email: string) => {
    const res = await authApi.resendOtp(email);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to resend code');
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        await setAuthToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setHasProfile(res.data.hasProfile);
        return { hasProfile: res.data.hasProfile };
      }
      throw new Error(res.error || 'Login failed');
    } catch (err: any) {
      if (err.code === 'UNVERIFIED_EMAIL') {
        setPendingEmail(email);
      }
      throw err;
    }
  };

  const saveProfile = async (data: any) => {
    const res = await profileApi.saveProfile(data);
    if (res.success && res.data) {
      setProfile(normalizeProfile(res.data));
      setHasProfile(true);
    } else {
      throw new Error(res.error || 'Failed to save profile');
    }
  };

  const logout = async () => {
    await removeAuthToken();
    setTokenState(null);
    setUser(null);
    setProfile(null);
    setHasProfile(false);
  };

  const reloadSession = async () => {
    await restoreSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        hasProfile,
        isLoading,
        pendingEmail,
        setPendingEmail,
        register,
        verifyOtp,
        resendOtp,
        login,
        saveProfile,
        logout,
        reloadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
