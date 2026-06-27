import { signIn } from 'next-auth/react';
import {
  registerAction,
  generateVerificationCodeAction,
  resendVerificationCodeAction,
  verifyEmailAction,
} from '../actions/auth';
import { updatePasswordAction } from '../actions/user';

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  message: string;
  status: string;
}

export interface LoginSuccessResponse extends AuthSuccessResponse {
  token: string;
}

export type RegisterResponse = AuthSuccessResponse;

export class AuthError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export const register = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  try {
    const res = await registerAction(payload);
    return {
      status: 'success',
      message: res.message,
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Registration failed');
  }
};

export const login = async (
  payload: LoginPayload,
): Promise<LoginSuccessResponse> => {
  try {
    const result = await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return {
      status: 'success',
      message: 'Logged in successfully',
      token: 'session_managed_by_nextauth', // Placeholder so types match
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Login failed', 401);
  }
};

export const generateVerificationCode = async (
  email: string,
): Promise<AuthSuccessResponse> => {
  try {
    const res = await generateVerificationCodeAction(email);
    return {
      status: 'success',
      message: res.message,
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Failed to generate code');
  }
};

export const resendVerificationCode = async (
  email: string,
): Promise<AuthSuccessResponse> => {
  try {
    const res = await resendVerificationCodeAction(email);
    return {
      status: 'success',
      message: res.message,
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Failed to resend code');
  }
};

export interface VerifyEmailPayload {
  code: string;
  email: string;
}

export type VerifyEmailResponse = AuthSuccessResponse;

export const verifyEmail = async (
  payload: VerifyEmailPayload,
): Promise<VerifyEmailResponse> => {
  try {
    const res = await verifyEmailAction(payload);
    return {
      status: 'success',
      message: res.message,
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Email verification failed');
  }
};

export interface GoogleLoginPayload {
  credential: string;
  signUp?: boolean;
}

export const googleLogin = async (
  payload: GoogleLoginPayload,
): Promise<LoginSuccessResponse> => {
  try {
    const result = await signIn('credentials', {
      googleToken: payload.credential,
      isSignUp: payload.signUp ? 'true' : 'false',
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return {
      status: 'success',
      message: 'Logged in successfully with Google',
      token: 'session_managed_by_nextauth',
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Google Login failed', 401);
  }
};

export interface PasswordSettingsPayload {
  old_password?: string;
  new_password: string;
  verification_code?: string;
}

export const updatePassword = async (
  payload: PasswordSettingsPayload,
): Promise<AuthSuccessResponse> => {
  try {
    const res = await updatePasswordAction(payload);
    return {
      status: 'success',
      message: res.message,
    };
  } catch (error: any) {
    throw new AuthError(error.message || 'Failed to update password');
  }
};
