import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = profileService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  async saveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = profileService.saveProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Profile saved successfully.',
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();
