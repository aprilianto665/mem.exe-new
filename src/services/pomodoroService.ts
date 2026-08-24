import {
  getPomodoroStatusAction,
  startPomodoroAction,
  timerActionAction,
  type PomodoroSessionData,
} from '../actions/pomodoro';

export type { PomodoroSessionData };

export class PomodoroServiceError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PomodoroServiceError';
    this.statusCode = statusCode;
  }
}

export const getPomodoroStatus = async (): Promise<PomodoroSessionData | null> => {
  try {
    return await getPomodoroStatusAction();
  } catch (error: any) {
    throw new PomodoroServiceError(error.message || 'Failed to fetch pomodoro status');
  }
};

export const startPomodoro = async (
  missionId: string
): Promise<PomodoroSessionData> => {
  try {
    return await startPomodoroAction(missionId);
  } catch (error: any) {
    throw new PomodoroServiceError(error.message || 'Failed to start pomodoro timer');
  }
};

export const executeTimerAction = async (payload: {
  action: 'finish_phase' | 'stop_early' | 'skip_rest';
}): Promise<PomodoroSessionData | null> => {
  try {
    return await timerActionAction(payload);
  } catch (error: any) {
    throw new PomodoroServiceError(error.message || 'Failed to execute timer action');
  }
};
