import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { validateBody, createTaskRequestSchema } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public catalogue routes
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);

// Protected task selection routes
router.post('/requests', authenticate, validateBody(createTaskRequestSchema), taskController.createRequest);
router.get('/user/requests', authenticate, taskController.getUserRequests);

export default router;
