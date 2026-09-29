import jwt from 'jsonwebtoken';
import { db } from '../db/index';
import { config } from '../config/index';
import { hashPassword, comparePassword, generateOtp, hashOtp, verifyOtpHash, generateId } from '../utils/crypto';
import { sendOtpEmail } from './email.service';
import { logger } from '../utils/logger';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

export interface OtpRecord {
  id: string;
  email: string;
  otp_hash: string;
  attempts: number;
  is_used: number;
  expires_at: string;
  resend_available_at: string;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  address_area: string;
  society_building: string | null;
  flat_unit: string | null;
  gate_notes: string | null;
  business_name: string | null;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string):Promise<{ message: string; email: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as UserRecord | undefined;

    if (existingUser && existingUser.is_verified === 1) {
      throw { statusCode: 409, message: 'An account with this email already exists. Please log in.' };
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    if (existingUser) {
      // Update password for unverified user
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
        passwordHash,
        now,
        existingUser.id
      );
    } else {
      // Create new unverified user
      const userId = generateId();
      db.prepare(`
        INSERT INTO users (id, email, password_hash, is_verified, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `).run(userId, normalizedEmail, passwordHash, now, now);
    }

    // Generate and send OTP
    await this.generateAndSendOtp(normalizedEmail);

    return {
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
      email: normalizedEmail,
    };
  }

  /**
   * Generate, hash, and dispatch a new OTP with cooldown and TTL checks
   */
  async generateAndSendOtp(email: string): Promise<{ cooldownSeconds: number; previewUrl?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    // Check existing active OTP for cooldown
    const latestOtp = db.prepare(`
      SELECT * FROM email_otps 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(normalizedEmail) as OtpRecord | undefined;

    if (latestOtp) {
      const cooldownDate = new Date(latestOtp.resend_available_at);
      if (now < cooldownDate) {
        const remainingSeconds = Math.ceil((cooldownDate.getTime() - now.getTime()) / 1000);
        throw {
          statusCode: 429,
          message: `Please wait ${remainingSeconds}s before requesting a new code.`,
          remainingSeconds,
        };
      }
    }

    // Invalidate previous unused OTPs for this email
    db.prepare('UPDATE email_otps SET is_used = 1 WHERE email = ? AND is_used = 0').run(normalizedEmail);

    const otpCode = generateOtp();
    const hashedCode = hashOtp(otpCode);
    const otpId = generateId();

    const expiresAt = new Date(now.getTime() + config.otp.expiryMinutes * 60 * 1000).toISOString();
    const resendAvailableAt = new Date(now.getTime() + config.otp.resendCooldownSeconds * 1000).toISOString();

    db.prepare(`
      INSERT INTO email_otps (id, email, otp_hash, attempts, is_used, expires_at, resend_available_at, created_at)
      VALUES (?, ?, ?, 0, 0, ?, ?, ?)
    `).run(otpId, normalizedEmail, hashedCode, expiresAt, resendAvailableAt, now.toISOString());

    // Send email dispatch
    const emailResult = await sendOtpEmail(normalizedEmail, otpCode);

    return {
      cooldownSeconds: config.otp.resendCooldownSeconds,
      previewUrl: emailResult?.previewUrl,
    };
  }

  /**
   * Verify an entered OTP
   */
  async verifyOtp(email: string, otp: string): Promise<{ token: string; user: { id: string; email: string }; hasProfile: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const now = new Date();

    // Find latest OTP entry for this email
    const otpRecord = db.prepare(`
      SELECT * FROM email_otps 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(normalizedEmail) as OtpRecord | undefined;

    if (!otpRecord) {
      throw { statusCode: 400, message: 'No verification code found. Please request a new one.' };
    }

    // Check maximum attempts limit
    if (otpRecord.attempts >= config.otp.maxAttempts) {
      db.prepare('UPDATE email_otps SET is_used = 1 WHERE id = ?').run(otpRecord.id);
      throw {
        statusCode: 429,
        message: 'Maximum attempts exceeded (5/5). This code has been invalidated. Please request a new code.',
      };
    }

    if (otpRecord.is_used === 1) {
      throw { statusCode: 400, message: 'This verification code has already been used. Please request a new one.' };
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < now) {
      throw { statusCode: 400, message: 'Verification code has expired. Please request a new one.' };
    }

    // Verify hash
    const isValid = verifyOtpHash(cleanOtp, otpRecord.otp_hash);

    if (!isValid) {
      const newAttempts = otpRecord.attempts + 1;
      db.prepare('UPDATE email_otps SET attempts = ? WHERE id = ?').run(newAttempts, otpRecord.id);

      const attemptsLeft = config.otp.maxAttempts - newAttempts;
      if (attemptsLeft <= 0) {
        db.prepare('UPDATE email_otps SET is_used = 1 WHERE id = ?').run(otpRecord.id);
        throw {
          statusCode: 429,
          message: 'Maximum attempts exceeded (5/5). This code has been invalidated. Please request a new code.',
        };
      }

      throw {
        statusCode: 400,
        message: `Invalid code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
      };
    }

    // OTP is valid! Mark as used
    db.prepare('UPDATE email_otps SET is_used = 1 WHERE id = ?').run(otpRecord.id);

    // Mark user as verified
    db.prepare('UPDATE users SET is_verified = 1, updated_at = ? WHERE email = ?').run(
      now.toISOString(),
      normalizedEmail
    );

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as UserRecord;

    // Check if profile exists
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id) as ProfileRecord | undefined;

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email },
      hasProfile: !!profile,
    };
  }

  /**
   * Log in an existing user
   */
  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string }; hasProfile: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as UserRecord | undefined;

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    // Check verification status
    if (user.is_verified === 0) {
      // Send a fresh OTP automatically for convenience
      try {
        await this.generateAndSendOtp(normalizedEmail);
      } catch (e) {
        // Ignore cooldown error if one was already sent recently
      }

      throw {
        statusCode: 403,
        code: 'UNVERIFIED_EMAIL',
        message: 'Your email is not verified yet. We have sent a verification code to your email.',
        email: normalizedEmail,
      };
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id) as ProfileRecord | undefined;
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email },
      hasProfile: !!profile,
    };
  }

  /**
   * Generate JWT
   */
  generateToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }
}

export const authService = new AuthService();
