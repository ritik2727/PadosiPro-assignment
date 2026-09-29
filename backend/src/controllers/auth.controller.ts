import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { db } from '../db/index';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.generateAndSendOtp(email);
      res.status(200).json({
        success: true,
        message: 'A fresh verification code has been dispatched.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = db.prepare('SELECT id, email, is_verified, created_at FROM users WHERE id = ?').get(req.user.id) as any;
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const profile = profileService.getProfile(user.id);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            isVerified: Boolean(user.is_verified),
          },
          profile,
          hasProfile: !!profile,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
