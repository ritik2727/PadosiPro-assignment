import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody, registerSchema, verifyOtpSchema, resendOtpSchema, loginSchema } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/verify-otp', validateBody(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validateBody(resendOtpSchema), authController.resendOtp);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
