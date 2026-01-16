/**
 * Validation utilities using Zod
 */

import { z } from 'zod';

// Common validation schemas

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const mfaCodeSchema = z
  .string()
  .length(6, 'MFA code must be 6 digits')
  .regex(/^\d+$/, 'MFA code must contain only numbers');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const dateStringSchema = z.string().datetime({ message: 'Invalid date format' });

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Login request validation
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// MFA verification request validation
export const mfaVerifyRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  code: mfaCodeSchema,
});

// Access log query validation
export const accessLogQuerySchema = z.object({
  tenantId: uuidSchema.optional(),
  assetId: z.string().optional(),
  userId: uuidSchema.optional(),
  action: z.enum(['entry', 'exit', 'denied']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Camera query validation
export const cameraQuerySchema = z.object({
  tenantId: uuidSchema.optional(),
  locationId: z.string().optional(),
  assetId: z.string().optional(),
  zoneId: z.string().optional(),
  type: z.enum(['interior', 'entrance', 'exterior', 'hallway']).optional(),
  status: z.enum(['online', 'offline', 'maintenance']).optional(),
});

// Environmental query validation
export const environmentalQuerySchema = z.object({
  tenantId: uuidSchema.optional(),
  locationId: z.string().optional(),
  zoneId: z.string().optional(),
  sensorId: z.string().optional(),
  type: z.enum(['temperature', 'humidity', 'power', 'airflow']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Announcement query validation
export const announcementQuerySchema = z.object({
  tenantId: uuidSchema.optional(),
  locationId: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  includeExpired: z.coerce.boolean().default(false),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

// Helper function to validate and parse query params
export function parseQueryParams<T extends z.ZodType>(
  schema: T,
  params: URLSearchParams
): z.infer<T> {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return schema.parse(obj);
}

// Helper function to safely validate data
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// Format Zod errors for API response
export function formatZodErrors(error: z.ZodError<unknown>): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  const issues = error.issues;

  issues.forEach((issue) => {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });

  return formatted;
}
