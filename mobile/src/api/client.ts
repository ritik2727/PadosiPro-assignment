import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Intelligent Base API URL Resolver
 * 1. Checks process.env.EXPO_PUBLIC_API_URL if configured
 * 2. On Web: connects to http://<current_hostname>:5000
 * 3. On Physical Device (Expo Go): uses the Metro host IP (e.g. 192.168.x.x:5000)
 * 4. On Android Emulator: connects to 10.0.2.2:5000
 * 5. Default fallback: http://localhost:5000
 */
export function getApiBaseUrl(): string {
  // 1. Highest precedence: custom environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser: match the current hostname (e.g. localhost or LAN IP)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000`;
  }

  // 3. Expo Go on Physical Phone or Simulator: extract computer's LAN IP from Metro hostUri
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:5000`;
    }
  }

  // 4. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 5. Default iOS Simulator / local fallback
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();

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
  const baseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;

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
    throw new Error(
      `Could not connect to server at ${baseUrl}. Please ensure the backend is running.`
    );
  }
}
