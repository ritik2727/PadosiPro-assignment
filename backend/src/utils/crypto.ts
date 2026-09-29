import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure 6-digit OTP string
 */
export function generateOtp(): string {
  const number = crypto.randomInt(100000, 1000000); // 100000 to 999999
  return number.toString();
}

/**
 * Hash an OTP string using SHA-256 for secure storage (never store plain OTPs)
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Secure constant-time comparison of OTP hashes to prevent timing attacks
 */
export function verifyOtpHash(enteredOtp: string, storedHash: string): boolean {
  const enteredHash = hashOtp(enteredOtp);
  const bufA = Buffer.from(enteredHash, 'hex');
  const bufB = Buffer.from(storedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generate a standard UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}
