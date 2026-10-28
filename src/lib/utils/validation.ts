import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid LIET college email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Full name is required'),
  roll_number: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  role: z.enum(['student', 'faculty', 'admin']).default('student'),
});

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const uuidSchema = z.string().regex(uuidRegex, 'Invalid UUID identifier');

export const bookingCreateSchema = z.object({
  service_id: uuidSchema,
  slot_id: uuidSchema.optional().nullable(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Valid start time HH:MM required'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Valid end time HH:MM required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  purpose: z.string().min(5, 'Please state the academic or operational purpose (min 5 chars)'),
  notes: z.string().optional().or(z.literal('')).nullable(),
});

export const serviceFormSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 chars)'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Detailed description is required'),
  category: z.enum([
    'laboratories',
    'sports',
    'seminar_halls',
    'event_spaces',
    'equipment',
    'campus_support',
  ]),
  location: z.string().min(3, 'Campus location is required'),
  price: z.number().min(0, 'Price must be 0 or positive'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  image_url: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  booking_rules: z.object({
    min_notice_hours: z.number().int().min(0).default(2),
    max_advance_days: z.number().int().min(1).default(14),
    requires_approval: z.boolean().default(false),
    allowed_roles: z.array(z.string()).default(['student', 'faculty', 'admin']),
  }),
});

export const paymentVerifySchema = z.object({
  booking_id: uuidSchema,
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const feedbackSchema = z.object({
  booking_id: uuidSchema,
  service_id: uuidSchema,
  rating: z.number().int().min(1).max(5),
  review: z.string().min(5, 'Review must be at least 5 characters'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  roll_number: z.string().optional().nullable(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal('')),
});

