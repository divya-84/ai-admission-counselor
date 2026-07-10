import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    fullname: z.string().min(2, 'Full Name must be at least 2 characters long').optional(),
    phone: z.string().optional(),
    nationality: z.string().optional(),
  })
  .refine((data) => !!(data.name || data.fullname), {
    message: 'Either name or fullname is required',
    path: ['name'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const recommendationSchema = z.object({
  marks: z.number().min(0, 'GPA/Marks cannot be negative').max(100, 'Marks cannot exceed 100'),
  interest: z.string().min(1, 'Interest specialization is required'),
  budget: z.number().nonnegative('Budget cannot be negative'),
  careerGoal: z.string().min(1, 'Career goal is required'),
  entranceExam: z.string().optional(),
  entranceScore: z.number().optional(),
});

export const eligibilitySchema = z.object({
  marks: z.number().min(0, 'GPA/Marks cannot be negative').max(100, 'Marks cannot exceed 100'),
  reservation: z.string().min(1, 'Reservation category is required'),
  entranceExam: z.string().optional(),
  entranceScore: z.number().optional(),
  age: z.number().min(10, 'Age must be at least 10').max(100, 'Age cannot exceed 100'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
});

export const scholarshipRecommendationSchema = z.object({
  marks: z.number().min(0, 'GPA/Marks cannot be negative').max(100, 'Marks cannot exceed 100'),
  annualIncome: z.number().nonnegative('Annual income cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  religion: z.string().min(1, 'Religion is required'),
  isSportsPlayer: z.boolean(),
  ewsCertificate: z.boolean(),
  aktuRegistered: z.boolean(),
});

export const bookAppointmentSchema = z.object({
  counselorId: z.string().uuid('Invalid counselor ID'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

export const sendNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  channels: z
    .array(z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP']))
    .min(1, 'At least one channel is required'),
});
