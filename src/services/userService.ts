import { getCurrentUserAction } from '../actions/user';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  member_since: string;
  has_password: boolean;
}

export class UserError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'UserError';
    this.statusCode = statusCode;
  }
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    return await getCurrentUserAction();
  } catch (error: any) {
    throw new UserError(error.message || 'Failed to fetch user profile');
  }
};
