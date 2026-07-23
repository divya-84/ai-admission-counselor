import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
    name: z.string().optional(),
    fullname: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    nationality: z.string().optional(),
    tenthPercentage: z.number().min(0, 'Percentage must be positive').max(100, 'Percentage cannot exceed 100').optional(),
    twelfthPercentage: z.number().min(0, 'Percentage must be positive').max(100, 'Percentage cannot exceed 100').optional(),
    twelfthPCMPercentage: z.number().min(0, 'Percentage must be positive').max(100, 'Percentage cannot exceed 100').optional(),
    jeePercentile: z.number().min(0, 'Percentile must be positive').max(100, 'Percentile cannot exceed 100').optional(),
    role: z.enum(['STUDENT', 'COUNSELOR']).default('STUDENT'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }

    if (data.role === 'STUDENT') {
      const actualName = data.name || data.fullname;
      if (!actualName || actualName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full Name must be at least 2 characters long',
          path: ['fullname'],
        });
      }
      if (!data.fatherName || data.fatherName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Father's Name must be at least 2 characters long",
          path: ['fatherName'],
        });
      }
      if (!data.motherName || data.motherName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mother's Name must be at least 2 characters long",
          path: ['motherName'],
        });
      }
      if (!data.phone || data.phone.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid phone number is required (min 10 digits)',
          path: ['phone'],
        });
      }
      if (!data.location || data.location.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Location is required',
          path: ['location'],
        });
      }
      if (data.tenthPercentage === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '10th Percentage is required',
          path: ['tenthPercentage'],
        });
      }
      if (data.twelfthPercentage === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '12th Percentage is required',
          path: ['twelfthPercentage'],
        });
      }
      if (data.twelfthPCMPercentage === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '12th PCM Percentage is required',
          path: ['twelfthPCMPercentage'],
        });
      }
      if (data.jeePercentile === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JEE Percentile is required',
          path: ['jeePercentile'],
        });
      }
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
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
