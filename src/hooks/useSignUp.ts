import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { register, AuthError } from '../services/authService';
import {
  signUpSchema,
  type SignUpFormValues,
  type SignUpFieldErrors,
} from '../validation/authSchemas';
import { useAuthStore } from '../store/authStore';

interface UseSignUpReturn {
  values: SignUpFormValues;
  fieldErrors: SignUpFieldErrors;
  backendError: string | null;
  isSubmitting: boolean;
  handleChange: (field: keyof SignUpFormValues) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useSignUp = (): UseSignUpReturn => {
  const router = useRouter();
  const setEmailForVerification = useAuthStore(
    (state) => state.setEmailForVerification,
  );

  const [values, setValues] = useState<SignUpFormValues>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof SignUpFormValues) =>
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

    const validationResult = signUpSchema.safeParse(values);

    if (!validationResult.success) {
      const nextFieldErrors: SignUpFieldErrors = {};

      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues | undefined;
        if (!field) continue;
        if (!nextFieldErrors[field]) {
          nextFieldErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      return;
    }

    const { email, username, password } = validationResult.data;

    setIsSubmitting(true);

    try {
      const response = await register({ email, username, password });
      toast.success(response.message);
      setEmailForVerification(email);
      router.push('/verify-email');
    } catch (error) {
      if (error instanceof AuthError) {
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


