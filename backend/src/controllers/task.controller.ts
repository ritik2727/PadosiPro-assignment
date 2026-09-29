import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

export class TaskController {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const q = req.query.q as string | undefined;

      const tasks = taskService.getTasks(category, q);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = taskService.getTaskById(req.params.id);
      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }

  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const request = taskService.createUserRequest(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Task request submitted successfully.',
        data: request,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const requests = taskService.getUserRequests(userId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const taskController = new TaskController();
