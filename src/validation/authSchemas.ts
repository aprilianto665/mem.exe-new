import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .refine(
    (value) => /[A-Za-z]/.test(value) && /\d/.test(value),
    'Password must contain both letters and numbers.',
  );

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(30, 'Username must be at most 30 characters.')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores.',
      ),
    email: z.string().email('Please enter a valid email address.'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: passwordSchema,
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export type SignUpFieldErrors = Partial<
  Record<keyof SignUpFormValues, string>
>;

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export const verificationCodeSchema = z
  .string()
  .length(6, 'Verification code must be 6 characters.')
  .regex(
    /^[A-Za-z0-9]+$/,
    'Verification code can only contain letters and numbers.',
  );

export const verifyEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  code: verificationCodeSchema,
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

export type VerifyEmailFieldErrors = Partial<
  Record<keyof VerifyEmailValues, string>
>;
