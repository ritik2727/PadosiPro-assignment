export interface User {
  id: string;
  email: string;
  isVerified: boolean;
}

export interface Profile {
  id?: string;
  user_id?: string;
  fullName: string;
  mobileNumber: string;
  addressArea: string;
  societyBuilding?: string;
  flatUnit?: string;
  gateNotes?: string;
  businessName?: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  icon_name: string;
  sub_services: string[];
  is_coming_soon: number;
}

export interface UserRequest {
  id: string;
  user_id: string;
  category: string;
  service_title: string;
  sub_services: string[];
  urgency: string;
  lifestyle_manager: string;
  status: string;
  notes?: string | null;
  created_at: string;
}

export type ScreenName =
  | 'Splash'
  | 'Auth'
  | 'VerifyOtp'
  | 'Profile'
  | 'Home'
  | 'TaskCatalogue'
  | 'Urgency'
  | 'RequestSubmitted';

export type UrgencyOption = 'Standard' | 'Same day' | 'Express' | 'Scheduled';
