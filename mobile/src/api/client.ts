import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL configuration
// In Web & iOS Simulator: localhost:5000
// In Android Emulator: 10.0.2.2:5000
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

const TOKEN_KEY = '@padosipro_jwt_token';

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  remainingSeconds?: number;
  email?: string;
  details?: Array<{ field: string; message: string }>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      const errorObj: any = new Error(data.error || 'Network request failed');
      errorObj.status = response.status;
      errorObj.code = data.code;
      errorObj.remainingSeconds = data.remainingSeconds;
      errorObj.email = data.email;
      errorObj.details = data.details;
      throw errorObj;
    }

    return data;
  } catch (error: any) {
    if (error.status) throw error;
    // Network connectivity issue
    throw new Error('Could not connect to server. Please ensure the backend is running.');
  }
}
