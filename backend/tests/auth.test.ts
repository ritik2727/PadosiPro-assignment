import request from 'supertest';
import { app } from '../src/app';
import { db, initDatabase } from '../src/db/index';
import { hashOtp } from '../src/utils/crypto';

jest.mock('../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ success: true, previewUrl: 'https://ethereal.email/test' }),
}));

describe('Auth & API Flow Integration Tests', () => {
  const userA = {
    email: 'integration_user@padosipro.test',
    password: 'SecurePassword123',
  };

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    initDatabase();
  });

  beforeEach(() => {
    db.prepare('DELETE FROM email_otps WHERE email = ?').run(userA.email);
    db.prepare('DELETE FROM users WHERE email = ?').run(userA.email);
  });

  it('should register a new unverified user and dispatch OTP', async () => {
    const res = await request(app).post('/api/auth/register').send(userA);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userA.email);

    // Verify user created with is_verified = 0
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(userA.email) as any;
    expect(user).toBeDefined();
    expect(user.is_verified).toBe(0);
  });

  it('should block login for unverified users with 403 UNVERIFIED_EMAIL', async () => {
    // 1. Register user
    await request(app).post('/api/auth/register').send(userA);

    // 2. Try login before verification
    const res = await request(app).post('/api/auth/login').send(userA);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNVERIFIED_EMAIL');
  });

  it('should verify OTP and permit login for verified users', async () => {
    // 1. Register
    await request(app).post('/api/auth/register').send(userA);

    // 2. Set known OTP
    const code = '555888';
    const now = new Date();
    db.prepare(`
      UPDATE email_otps 
      SET otp_hash = ?, expires_at = ?, attempts = 0, is_used = 0 
      WHERE email = ?
    `).run(
      hashOtp(code),
      new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      userA.email
    );

    // 3. Verify OTP
    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: userA.email,
      otp: code,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.token).toBeDefined();

    // 4. Login should now succeed
    const loginRes = await request(app).post('/api/auth/login').send(userA);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
  });

  it('should reject invalid credentials during login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should enforce authentication on protected profile and task routes', async () => {
    const profileRes = await request(app).get('/api/profile');
    expect(profileRes.status).toBe(401);

    const taskRequestRes = await request(app).post('/api/tasks/requests').send({});
    expect(taskRequestRes.status).toBe(401);
  });
});
