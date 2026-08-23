"use client";

import { useRouter } from 'next/navigation';
import { Logo } from '../../components/atoms/Logo';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { useAuthStore, type AuthStoreState } from '../../store/authStore';
import { useEmailVerification } from '../../hooks/useEmailVerification';

const getMaskedEmail = (email: string | null) => {
  if (!email) return null;

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const visibleLength = Math.min(3, localPart.length);
  const visible = localPart.slice(0, visibleLength);
  const masked = '*'.repeat(Math.max(localPart.length - visibleLength, 1));

  return `${visible}${masked}@${domain}`;
};

export const EmailVerification = () => {
  const router = useRouter();
  const emailForVerification = useAuthStore(
    (state: AuthStoreState) => state.emailForVerification,
  );
  const maskedEmail = getMaskedEmail(emailForVerification);

  const {
    code,
    fieldErrors,
    isGenerating,
    isVerifying,
    handleCodeChange,
    handleSubmit,
  } = useEmailVerification();

  return (
    <div className="min-h-screen app-background px-4 flex items-center justify-center py-8">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="max-w-md w-full login-logo-container">
          <Logo src="/mem_logo.png" alt="Mem Logo" className="h-50" />
        </div>

        {/* Verification Form Card */}
        <div className="bg-white rounded-4xl p-8 shadow-lg border border-gray-100">
          {/* Title Section */}
          <div className="text-center mb-6">
            <Text size="2xl" weight="bold" className="text-gray-700 mb-2">
              Verify Your Email
            </Text>
            <Text size="sm" className="text-gray-600">
              {maskedEmail
                ? `We've sent a verification code to ${maskedEmail}`
                : "We've sent a verification code to your email"}
            </Text>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Verification Code Input */}
            <div>
              <Input
                type="text"
                placeholder="Enter 6-character code"
                variant="noBorder"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest font-semibold"
                error={fieldErrors.code}
              />
              {isGenerating && (
                <Text size="xs" className="mt-1 text-gray-500 text-center">
                  Sending verification code...
                </Text>
              )}
            </div>

            {/* Verify Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
          </form>

          {/* Resend Code Link */}
          <div className="mt-6 text-center">
            <Text size="sm" className="text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                className="text-[#7DB8E0] hover:text-[#6BA8D0] font-semibold transition-colors cursor-pointer"
              >
                Resend Code
              </button>
            </Text>
          </div>

          {/* Back to Sign Up Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


