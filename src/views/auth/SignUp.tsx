import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/atoms/Logo';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { useSignUp } from '../../hooks/useSignUp';

export const SignUp = () => {
  const navigate = useNavigate();
  const { values, fieldErrors, isSubmitting, handleChange, handleSubmit } =
    useSignUp();

  const triggerGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1023773956488-example.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const scope = encodeURIComponent('openid email profile');
    const nonce = Math.random().toString(36).substring(2);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&nonce=${nonce}&state=signup`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen app-background px-4 flex items-center justify-center py-8">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="max-w-md w-full login-logo-container">
          <Logo src="/mem_logo.png" alt="Mem Logo" className="h-50" />
        </div>

        {/* Sign Up Form Card */}
        <div className="bg-white rounded-4xl p-8 shadow-lg border border-gray-100">
          {/* Title Section */}
          <div className="text-center mb-8">
            <Text size="2xl" weight="bold" className="text-gray-700 mb-2">
              Create Account
            </Text>
            <Text size="sm" className="text-gray-600">
              Start your journey with us today
            </Text>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-3">
                USERNAME
              </h3>
              <Input
                type="text"
                placeholder="Choose a username"
                variant="noBorder"
                required
                value={values.username}
                onChange={handleChange('username')}
                error={fieldErrors.username}
              />
            </div>

            {/* Email Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-3">
                EMAIL
              </h3>
              <Input
                type="email"
                placeholder="Enter your email"
                variant="noBorder"
                required
                value={values.email}
                onChange={handleChange('email')}
                error={fieldErrors.email}
              />
            </div>

            {/* Password Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-3">
                PASSWORD
              </h3>
              <Input
                type="password"
                placeholder="Create a password"
                variant="noBorder"
                required
                value={values.password}
                onChange={handleChange('password')}
                error={fieldErrors.password}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-3">
                CONFIRM PASSWORD
              </h3>
              <Input
                type="password"
                placeholder="Confirm your password"
                variant="noBorder"
                required
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={fieldErrors.confirmPassword}
              />
            </div>

            {/* Sign Up Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <Text size="sm" className="px-4 text-gray-500">
              OR
            </Text>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={triggerGoogleSignIn}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl font-medium text-base transition-colors duration-200 cursor-pointer focus:outline-none flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Text size="sm" className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#7DB8E0] hover:text-[#6BA8D0] font-semibold transition-colors cursor-pointer"
              >
                Login
              </button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

