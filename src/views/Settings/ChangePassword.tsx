import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { FormSection } from '../../components/molecules/FormSection';
import { ArrowLeftIcon, ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useUserData } from '../../hooks/useUserData';
import { generateVerificationCode, resendVerificationCode, updatePassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { AuthError } from '../../services/authService';

export const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useUserData();

  // Common Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change Password Form States (when has_password = true)
  const [oldPassword, setOldPassword] = useState('');

  // Set Password Flow States (when has_password = false)
  const [step, setStep] = useState<'verify' | 'set'>('verify');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!user?.email) return;
    setSendingCode(true);
    try {
      await generateVerificationCode(user.email);
      setCodeSent(true);
      setCooldown(60);
      toast.success('Verification code sent to your email.');
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send verification code. Please try again.');
      }
    } finally {
      setSendingCode(false);
    }
  };
  const handleResendCode = async () => {
    if (!user?.email) return;
    setSendingCode(true);
    try {
      await resendVerificationCode(user.email);
      setCooldown(60);
      toast.success('A new verification code has been sent to your email.');
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resend verification code. Please try again.');
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyProceed = () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }
    setStep('set');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('New password is required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (user?.has_password) {
        // Change password flow
        await updatePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });
        toast.success('Password changed successfully.');
      } else {
        // Set password flow
        await updatePassword({
          new_password: newPassword,
          verification_code: verificationCode,
        });
        toast.success('Password set successfully.');
      }
      navigate('/settings/profile');
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageTemplate>
        <div className="flex items-center justify-center h-full">
          <Text className="text-gray-500">Loading user profile...</Text>
        </div>
      </PageTemplate>
    );
  }

  const hasPassword = user?.has_password ?? true;

  return (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => {
              if (!hasPassword && step === 'set') {
                setStep('verify');
              } else {
                navigate('/settings/profile');
              }
            }}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">Back</Text>
          </button>
          
          <Text size="2xl" weight="bold" className="text-gray-800">
            {hasPassword ? 'Change Password' : 'Set Password'}
          </Text>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {!hasPassword && step === 'verify' ? (
            // SECURITY VERIFICATION SCREEN
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
                <ShieldCheckIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <Text weight="semibold" className="text-orange-800">Security Verification Required</Text>
                  <Text size="sm" className="text-orange-700 leading-relaxed">
                    For your security, we need to verify your email address before you can set a password for your Google-linked account.
                  </Text>
                </div>
              </div>

              <FormSection>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      VERIFICATION EMAIL
                    </h3>
                    <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <Text className="text-gray-700">{user?.email}</Text>
                    </div>
                  </div>

                  {codeSent && (
                    <div className="animate-fadeIn">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        6-DIGIT CODE
                      </h3>
                      <Input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                        placeholder="Enter the 6-digit code"
                        variant="noBorder"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </FormSection>

              {!codeSent ? (
                <Button
                  variant="primary"
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="w-full !py-3 !text-base flex items-center justify-center gap-2"
                >
                  {sendingCode ? 'Sending...' : 'Send Verification Code'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleVerifyProceed}
                    disabled={verificationCode.length !== 6}
                    className="w-full !py-3 !text-base"
                  >
                    Verify & Continue
                  </Button>
                  <button
                    onClick={handleResendCode}
                    disabled={sendingCode || cooldown > 0}
                    className="w-full text-center text-sm font-semibold text-orange-500 hover:text-orange-600 disabled:text-gray-400 py-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? `Resend Code (${cooldown}s)` : sendingCode ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // PASSWORD ENTRY SCREEN (Change or Set)
            <form onSubmit={handleSubmit} className="space-y-6">
              {!hasPassword && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <Text size="sm" className="text-green-700 font-medium">
                    Email verified! You can now set your password.
                  </Text>
                </div>
              )}

              <FormSection>
                <div className="space-y-4">
                  {hasPassword && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        CURRENT PASSWORD
                      </h3>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        variant="noBorder"
                        autoFocus
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      NEW PASSWORD
                    </h3>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      variant="noBorder"
                      autoFocus={!hasPassword}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      CONFIRM NEW PASSWORD
                    </h3>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      variant="noBorder"
                    />
                  </div>
                </div>
              </FormSection>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full !py-3 !text-base"
              >
                {isSubmitting ? 'Updating...' : hasPassword ? 'Update Password' : 'Set Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};
