import { db } from '../db/index';
import { generateId } from '../utils/crypto';
import { ProfileRecord } from './auth.service';

export interface ProfileInput {
  fullName: string;
  mobileNumber: string;
  addressArea: string;
  societyBuilding?: string;
  flatUnit?: string;
  gateNotes?: string;
  businessName?: string;
}

export class ProfileService {
  /**
   * Save or update user profile
   */
  saveProfile(userId: string, data: ProfileInput): ProfileRecord {
    const existing = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as ProfileRecord | undefined;
    const now = new Date().toISOString();

    // Standardize Indian mobile number format: e.g. +91 98765 43210 -> clean +919876543210
    const cleanMobile = data.mobileNumber.replace(/[^\d+]/g, '');

    if (existing) {
      db.prepare(`
        UPDATE profiles
        SET full_name = ?,
            mobile_number = ?,
            address_area = ?,
            society_building = ?,
            flat_unit = ?,
            gate_notes = ?,
            business_name = ?,
            updated_at = ?
        WHERE user_id = ?
      `).run(
        data.fullName.trim(),
        cleanMobile,
        data.addressArea.trim(),
        data.societyBuilding?.trim() || null,
        data.flatUnit?.trim() || null,
        data.gateNotes?.trim() || null,
        data.businessName?.trim() || null,
        now,
        userId
      );

      return db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as ProfileRecord;
    } else {
      const profileId = generateId();
      db.prepare(`
        INSERT INTO profiles (
          id, user_id, full_name, mobile_number, address_area,
          society_building, flat_unit, gate_notes, business_name,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        userId,
        data.fullName.trim(),
        cleanMobile,
        data.addressArea.trim(),
        data.societyBuilding?.trim() || null,
        data.flatUnit?.trim() || null,
        data.gateNotes?.trim() || null,
        data.businessName?.trim() || null,
        now,
        now
      );

      return db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId) as ProfileRecord;
    }
  }

  /**
   * Get user profile
   */
  getProfile(userId: string): ProfileRecord | null {
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as ProfileRecord | undefined;
    return profile || null;
  }
}

export const profileService = new ProfileService();
