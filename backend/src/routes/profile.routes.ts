import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { validateBody, profileSchema } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.post('/', validateBody(profileSchema), profileController.saveProfile);
router.put('/', validateBody(profileSchema), profileController.saveProfile);

export default router;
