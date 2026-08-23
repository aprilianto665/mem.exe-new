import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { login, AuthError } from '../services/authService';
import {
  loginSchema,
  type LoginFormValues,
  type LoginFieldErrors,
} from '../validation/authSchemas';
import { setAuthToken } from '../services/tokenService';
import { useAuthStore } from '../store/authStore';

interface UseLoginReturn {
  values: LoginFormValues;
  fieldErrors: LoginFieldErrors;
  backendError: string | null;
  isSubmitting: boolean;
  handleChange: (
    field: keyof LoginFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

const UNVERIFIED_EMAIL_MESSAGE =
  'Email not verified. Please verify your email before logging in';

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const setEmailForVerification = useAuthStore(
    (state) => state.setEmailForVerification,
  );

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof LoginFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));

      setBackendError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBackendError(null);

    const validationResult = loginSchema.safeParse(values);

    if (!validationResult.success) {
      const nextFieldErrors: LoginFieldErrors = {};

      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as keyof LoginFormValues | undefined;
        if (!field) continue;
        if (!nextFieldErrors[field]) {
          nextFieldErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(validationResult.data);
      setAuthToken(response.token);
      toast.success(response.message || 'Login successful');
      router.replace('/missions');
    } catch (error) {
      if (error instanceof AuthError) {
        if (
          error.statusCode === 403 &&
          error.message === UNVERIFIED_EMAIL_MESSAGE
        ) {
          setEmailForVerification(values.email);
          router.replace('/verify-email');
          return;
        }

        setBackendError(error.message);
        toast.error(error.message);
      } else {
        const message = 'Unexpected error. Please try again.';
        setBackendError(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    fieldErrors,
    backendError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};


