import { getUserSettingsAction, updateUserSettingsAction } from '../actions/user';

export interface PomodoroSettings {
  focus_minutes: number;
  rest_minutes: number;
}

export interface UserSettings {
  timezone: string;
  execution_mode: 'default' | 'pomodoro';
  pomodoro: PomodoroSettings;
}

export interface UpdateSettingsPayload {
  timezone?: string;
  execution_mode?: 'default' | 'pomodoro';
  pomodoro?: Partial<PomodoroSettings>;
}

export class SettingsError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'SettingsError';
    this.statusCode = statusCode;
  }
}

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    return await getUserSettingsAction() as UserSettings;
  } catch (error: any) {
    throw new SettingsError(error.message || 'Failed to fetch user settings');
  }
};

export const updateUserSettings = async (
  payload: UpdateSettingsPayload,
): Promise<UserSettings> => {
  try {
    return await updateUserSettingsAction(payload) as UserSettings;
  } catch (error: any) {
    throw new SettingsError(error.message || 'Failed to update user settings');
  }
};
