import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred. Please try again.';

  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.path}`, err);
  }

  res.status(statusCode).json({
    success: false,
    code: err.code,
    error: message,
    remainingSeconds: err.remainingSeconds,
    email: err.email,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
}
