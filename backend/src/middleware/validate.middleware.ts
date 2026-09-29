import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: issues[0]?.message || 'Validation error',
          details: issues,
        });
        return;
      }
      next(error);
    }
  };
}

export const registerSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Indian mobile regex allowing +91 or raw 10 digits starting with 6-9
const indianMobileRegex = /^(?:\+91|91)?[\s\-]?[6-9]\d{9}$/;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  mobileNumber: z
    .string()
    .trim()
    .regex(indianMobileRegex, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)'),
  addressArea: z.string().trim().min(3, 'Address & area is required').max(255),
  societyBuilding: z.string().trim().optional(),
  flatUnit: z.string().trim().optional(),
  gateNotes: z.string().trim().optional(),
  businessName: z.string().trim().optional(),
});

export const createTaskRequestSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  serviceTitle: z.string().min(1, 'Service title is required'),
  subServices: z.array(z.string()).min(1, 'Please select at least one task or service'),
  urgency: z.enum(['Standard', 'Same day', 'Express', 'Scheduled'], {
    errorMap: () => ({ message: 'Please select a valid urgency level (Standard, Same day, Express, Scheduled)' }),
  }),
  notes: z.string().optional(),
});
