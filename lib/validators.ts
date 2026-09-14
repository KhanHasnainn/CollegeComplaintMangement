import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  studentRollNumber: z.string().min(2, 'Roll number is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const complaintSchema = z.object({
  categoryId: z.string().uuid('Invalid category selection'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title too long'),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_FOR_STUDENT',
    'RESOLVED',
    'REOPENED',
    'REJECTED',
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedStaffId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().optional(),
  resolutionMessage: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const addUpdateMessageSchema = z.object({
  message: z.string().min(2, 'Message must be at least 2 characters'),
  updateType: z.enum([
    'STATUS_CHANGE',
    'PUBLIC_UPDATE',
    'INTERNAL_NOTE',
    'INFO_REQUEST',
    'REASSIGNMENT',
    'PRIORITY_CHANGE',
  ]),
  isPublic: z.boolean().default(true),
  newStatus: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_FOR_STUDENT',
    'RESOLVED',
    'REOPENED',
    'REJECTED',
  ]).optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'STAFF', 'ADMIN']),
  departmentId: z.string().uuid().nullable().optional(),
  studentRollNumber: z.string().optional(),
  phone: z.string().optional(),
});
