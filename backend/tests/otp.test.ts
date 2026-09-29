import { generateOtp, hashOtp, verifyOtpHash } from '../src/utils/crypto';
import { db, initDatabase } from '../src/db/index';
import { authService } from '../src/services/auth.service';

jest.mock('../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ success: true, previewUrl: 'https://ethereal.email/test' }),
}));

describe('OTP & Security Logic Tests', () => {
  const testEmail = 'otp_test_user@padosipro.test';

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    initDatabase();
  });

  beforeEach(() => {
    // Clean up test email records
    db.prepare('DELETE FROM email_otps WHERE email = ?').run(testEmail);
    db.prepare('DELETE FROM users WHERE email = ?').run(testEmail);
  });

  describe('OTP Generation & Cryptographic Hashing', () => {
    it('should generate a 6-digit numeric OTP string', () => {
      const otp = generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });

    it('should hash OTP using SHA-256 and verify correctly with constant-time comparison', () => {
      const otp = '438872';
      const hash = hashOtp(otp);

      expect(hash).toHaveLength(64); // SHA-256 hex length
      expect(hash).not.toEqual(otp); // Never plain text

      // Positive match
      expect(verifyOtpHash('438872', hash)).toBe(true);

      // Negative matches
      expect(verifyOtpHash('123456', hash)).toBe(false);
      expect(verifyOtpHash('438873', hash)).toBe(false);
      expect(verifyOtpHash('43887', hash)).toBe(false);
    });
  });

  describe('OTP Expiry and Single-Use Rules', () => {
    it('should reject verification if OTP has expired', async () => {
      // Register user first
      await authService.register(testEmail, 'StrongPassword123');

      // Fetch the generated OTP
      const latestOtp = db.prepare('SELECT * FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1').get(testEmail) as any;

      // Artificially expire the OTP by setting expires_at into the past
      const pastTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      db.prepare('UPDATE email_otps SET expires_at = ? WHERE id = ?').run(pastTime, latestOtp.id);

      // Attempt verification
      await expect(authService.verifyOtp(testEmail, '123456')).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringMatching(/expired/i),
      });
    });

    it('should enforce single-use policy on OTPs', async () => {
      await authService.register(testEmail, 'StrongPassword123');

      // Mock an OTP in database directly to know the exact code
      const code = '991122';
      const hash = hashOtp(code);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      const resendAt = new Date(now.getTime() + 30 * 1000).toISOString();

      db.prepare('DELETE FROM email_otps WHERE email = ?').run(testEmail);
      db.prepare(`
        INSERT INTO email_otps (id, email, otp_hash, attempts, is_used, expires_at, resend_available_at, created_at)
        VALUES ('test-otp-id', ?, ?, 0, 0, ?, ?, ?)
      `).run(testEmail, hash, expiresAt, resendAt, now.toISOString());

      // First verification should succeed
      const result = await authService.verifyOtp(testEmail, code);
      expect(result.token).toBeDefined();

      // Second verification with the same code must fail
      await expect(authService.verifyOtp(testEmail, code)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringMatching(/already been used/i),
      });
    });
  });

  describe('Attempt Limits (Max 5 attempts)', () => {
    it('should increment attempt count and lock out after 5 failed attempts', async () => {
      await authService.register(testEmail, 'StrongPassword123');

      const wrongCode = '000000';

      // 1st failed attempt -> 4 left
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('4 attempts remaining'),
      });

      // 2nd failed attempt -> 3 left
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('3 attempts remaining'),
      });

      // 3rd failed attempt -> 2 left
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('2 attempts remaining'),
      });

      // 4th failed attempt -> 1 left
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('1 attempt remaining'),
      });

      // 5th failed attempt -> locked out
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringMatching(/maximum attempts exceeded/i),
      });

      // Subsequent attempt should still be rejected as invalid/exhausted
      await expect(authService.verifyOtp(testEmail, wrongCode)).rejects.toMatchObject({
        statusCode: 429,
      });
    });
  });

  describe('Resend Cooldown Enforcement (30 seconds)', () => {
    it('should block OTP resend if within 30-second cooldown period', async () => {
      await authService.register(testEmail, 'StrongPassword123');

      // Immediate resend should trigger 429 cooldown error
      await expect(authService.generateAndSendOtp(testEmail)).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringMatching(/please wait \d+s/i),
      });
    });
  });
});
