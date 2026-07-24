import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  generateVerificationCode,
  verifyEmail,
  AuthError,
} from '../services/authService';
import { useAuthStore } from '../store/authStore';
import {
  verifyEmailSchema,
  type VerifyEmailFieldErrors,
} from '../validation/authSchemas';

// This flag prevents duplicate generate-code calls in React StrictMode (dev)
let hasGeneratedCodeForSession = false;

interface UseEmailVerificationReturn {
  code: string;
  fieldErrors: VerifyEmailFieldErrors;
  backendError: string | null;
  successMessage: string | null;
  isGenerating: boolean;
  isVerifying: boolean;
  handleCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const navigate = useNavigate();
  const emailForVerification = useAuthStore(
    (state) => state.emailForVerification,
  );

  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<VerifyEmailFieldErrors>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!emailForVerification) {
      navigate('/signup', { replace: true });
      return;
    }

    if (hasGeneratedCodeForSession) {
      return;
    }

    hasGeneratedCodeForSession = true;

    const generateCode = async () => {
      setIsGenerating(true);
      setBackendError(null);

      try {
        await generateVerificationCode(emailForVerification);
      } catch (error) {
        if (error instanceof AuthError) {
          setBackendError(error.message);
          toast.error(error.message);
        } else {
          const message =
            'Failed to send verification code. Please try again.';
          setBackendError(message);
          toast.error(message);
        }
      } finally {
        setIsGenerating(false);
      }
    };

    void generateCode();
  }, [emailForVerification, navigate]);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.slice(0, 6);
    setCode(value);
    setFieldErrors((prev) => ({ ...prev, code: undefined }));
    setBackendError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailForVerification) {
      navigate('/signup', { replace: true });
      return;
    }

    setBackendError(null);
    setSuccessMessage(null);

    const validationResult = verifyEmailSchema.safeParse({
      email: emailForVerification,
      code,
    });

    if (!validationResult.success) {
      const nextFieldErrors: VerifyEmailFieldErrors = {};

      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as keyof VerifyEmailFieldErrors | undefined;
        if (!field) continue;
        if (!nextFieldErrors[field]) {
          nextFieldErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyEmail(validationResult.data);
      setSuccessMessage(response.message);
      toast.success(response.message);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      if (error instanceof AuthError) {
        setBackendError(error.message);
        toast.error(error.message);
      } else {
        const message = 'Failed to verify email. Please try again.';
        setBackendError(message);
        toast.error(message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    code,
    fieldErrors,
    backendError,
    successMessage,
    isGenerating,
    isVerifying,
    handleCodeChange,
    handleSubmit,
  };
};


