import { create } from 'zustand';
import type { Mission } from '../types/mission.types';
import {
  fetchMissionDetailAction,
  fetchMissionsAction,
  fetchDailyMissionsAction,
  fetchTimelineDataAction,
  fetchMonthlyTimelineAction,
  fetchDailyTimelineAction,
  addMissionAction,
  deleteMissionAction,
  logMinutesAction,
  startTimerAction,
  pauseTimerAction,
} from '../actions/missions';
import {
  fetchMilestonesAction,
  addMilestoneAction,
  updateMilestoneAction,
  deleteMilestoneAction,
  toggleMilestoneAction,
  addSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction,
  updateSubtaskAction,
} from '../actions/milestones';

export interface MilestoneSubtask {
  id: string;
  milestoneId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
  createdAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt?: string;
  subtasks: MilestoneSubtask[];
}

export interface DailyProgress {
  missionId: string;
  date: string;
  minutesDone: number;
  requiredMinutes: number;
  status: 'pending' | 'completed' | 'failed' | 'missed';
}

export function mapBackendMissions(backendMissions: any[]): Mission[] {
  return (backendMissions || []).map((item: any): Mission => {
    const baseSecs = item.logged_seconds !== undefined ? item.logged_seconds : (item.logged_minutes || 0) * 60;
    let currentSecs = baseSecs;
    if (item.timer_started_at) {
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(item.timer_started_at).getTime()) / 1000));
      currentSecs += elapsedSecs;
    }
    const currentMinutes = Math.min(item.minutes_per_day, Math.floor(currentSecs / 60));

    return {
      id: item.id,
      name: item.title,
      reason: item.description || "",
      commitmentType: item.type === 'daily_habit' ? 'daily-habit' : 'challenge',
      commitmentLevel: 'normal',
      frequency: item.type === 'daily_habit' ? 'everyday' : 'custom',
      currentDays: item.current_day,
      minutesPerDay: item.minutes_per_day,
      targetMinutes: item.minutes_per_day,
      currentMinutes: currentMinutes,
      loggedMinutes: item.logged_minutes,
      loggedSeconds: baseSecs,
      status: item.status === 'cancelled' ? 'canceled' : (item.status as any),
      streak: item.streak || 0,
      missed: item.missed_consecutive || 0,
      linkedMilestoneId: undefined,
      timerStartedAt: item.timer_started_at || undefined,
      startDate: item.start_date || undefined,
      selectedDays: item.days_of_week || undefined,
      duration: item.duration || undefined
    };
  });
}

export function mapBackendHistory(backendHistory: any[]): DailyProgress[] {
  return (backendHistory || []).map((h: any): DailyProgress => ({
    missionId: h.mission_id,
    date: h.date,
    minutesDone: h.minutes_done,
    requiredMinutes: h.required_minutes,
    status: h.status as any
  }));
}

export function mapBackendMilestones(backendMilestones: any[]): Milestone[] {
  return (backendMilestones || []).map((m: any): Milestone => ({
    id: m.id,
    title: m.title,
    description: m.description || undefined,
    deadline: m.deadline || undefined,
    status: m.status as any,
    createdAt: m.created_at,
    completedAt: m.completed_at || undefined,
    subtasks: (m.subtasks || []).map((s: any): MilestoneSubtask => ({
      id: s.id,
      milestoneId: s.milestone_id || s.milestoneId,
      title: s.title,
      isCompleted: s.is_completed ?? s.isCompleted ?? false,
      orderIndex: s.order_index ?? s.orderIndex ?? 0,
      createdAt: s.created_at || s.createdAt,
      completedAt: s.completed_at || s.completedAt || undefined,
    })),
  }));
}

export interface MissionStoreState {
  missions: Mission[];
  milestones: Milestone[];
  history: DailyProgress[];
  monthlyTimeline: Array<{
    date: string;
    status: 'success' | 'failed' | 'has-missions' | 'normal';
    has_habits: boolean;
    has_challenges: boolean;
    has_todos: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  fetchMissions: (filters?: { commitmentType?: string; status?: string; search?: string }) => Promise<void>;
  fetchMissionDetail: (id: string) => Promise<void>;
  fetchDailyMissions: () => Promise<void>;
  fetchTimelineData: () => Promise<void>;
  fetchMonthlyTimeline: (year: number, month: number) => Promise<void>;
  fetchDailyTimeline: (date: string) => Promise<any>;
  fetchMilestones: () => Promise<void>;
  addMission: (mission: Omit<Mission, 'id'>) => Promise<void>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  logMinutes: (id: string, minutes: number) => Promise<void>;
  startTimer: (id: string) => Promise<void>;
  pauseTimer: (id: string, additionalSeconds?: number) => Promise<void>;
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'status' | 'subtasks'> & { subtasks?: string[] }) => Promise<void>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  toggleMilestone: (id: string) => Promise<void>;
  addSubtask: (milestoneId: string, title: string) => Promise<void>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  updateSubtask: (subtaskId: string, title: string) => Promise<void>;
  setInitialData: (missions: Mission[], history?: DailyProgress[]) => void;
  setInitialMilestones: (milestones: Milestone[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useMissionStore = create<MissionStoreState>((set, get) => ({
  missions: [],
  milestones: [],
  history: [],
  monthlyTimeline: [],
  isLoading: false,
  error: null,

  setInitialData: (missions, history = []) =>
    set({ missions, history, isLoading: false, error: null }),

  setInitialMilestones: (milestones) =>
    set({ milestones, isLoading: false, error: null }),

  fetchMissionDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await fetchMissionDetailAction(id);
      if (!item) {
        set({ isLoading: false });
        return;
      }

      const baseSecs = item.logged_seconds !== undefined ? item.logged_seconds : (item.logged_minutes || 0) * 60;
      let currentSecs = baseSecs;
      if (item.timer_started_at) {
        const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(item.timer_started_at).getTime()) / 1000));
        currentSecs += elapsedSecs;
      }
      const currentMinutes = Math.min(item.minutes_per_day, Math.floor(currentSecs / 60));

      const mapped: Mission = {
        id: item.id,
        name: item.title,
        reason: item.description || "",
        commitmentType: item.type === 'daily_habit' ? 'daily-habit' : 'challenge',
        commitmentLevel: 'normal',
        frequency: item.type === 'daily_habit' ? 'everyday' : 'custom',
        currentDays: item.current_day,
        minutesPerDay: item.minutes_per_day,
        targetMinutes: item.minutes_per_day,
        currentMinutes: currentMinutes,
        loggedMinutes: item.logged_minutes,
        loggedSeconds: baseSecs,
        status: item.status === 'cancelled' ? 'canceled' : (item.status as any),
        streak: item.streak || 0,
        missed: item.missed_consecutive || 0,
        linkedMilestoneId: undefined,
        timerStartedAt: item.timer_started_at || undefined,
        startDate: item.start_date || undefined,
        selectedDays: (item.days_of_week as any) || undefined,
        duration: item.duration || undefined,
        totalMinutesDone: item.total_minutes_done,
        averageMinutesDone: item.average_minutes_done
      };

      set((state) => {
        const exists = state.missions.some((m) => m.id === id);
        const updatedMissions = exists
          ? state.missions.map((m) => m.id === id ? mapped : m)
          : [...state.missions, mapped];
        return { missions: updatedMissions, isLoading: false };
      });
    } catch (err: any) {
      console.error('Failed to fetch mission details', err);
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  fetchMissions: async (filters) => {
    set({ missions: [], isLoading: true, error: null });
    try {
      const res = await fetchMissionsAction(filters);
      const backendMissions = res.data || [];
      const backendHistory = res.history || [];

      const mappedMissions = backendMissions.map((item: any): Mission => {
        const baseSecs = item.logged_seconds !== undefined ? item.logged_seconds : (item.logged_minutes || 0) * 60;
        let currentSecs = baseSecs;
        if (item.timer_started_at) {
          const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(item.timer_started_at).getTime()) / 1000));
          currentSecs += elapsedSecs;
        }
        const currentMinutes = Math.min(item.minutes_per_day, Math.floor(currentSecs / 60));

        return {
          id: item.id,
          name: item.title,
          reason: item.description || "",
          commitmentType: item.type === 'daily_habit' ? 'daily-habit' : 'challenge',
          commitmentLevel: 'normal',
          frequency: item.type === 'daily_habit' ? 'everyday' : 'custom',
          currentDays: item.current_day,
          minutesPerDay: item.minutes_per_day,
          targetMinutes: item.minutes_per_day,
          currentMinutes: currentMinutes,
          loggedMinutes: item.logged_minutes,
          loggedSeconds: baseSecs,
          status: item.status === 'cancelled' ? 'canceled' : (item.status as any),
          streak: item.streak || 0,
          missed: item.missed_consecutive || 0,
          linkedMilestoneId: undefined,
          timerStartedAt: item.timer_started_at || undefined,
          startDate: item.start_date || undefined,
          selectedDays: item.days_of_week || undefined,
          duration: item.duration || undefined
        };
      });

      const mappedHistory = backendHistory.map((h: any): DailyProgress => ({
        missionId: h.mission_id,
        date: h.date,
        minutesDone: h.minutes_done,
        requiredMinutes: h.required_minutes,
        status: h.status as any
      }));

      set({ missions: mappedMissions, history: mappedHistory, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch missions data', err);
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  fetchDailyMissions: async () => {
    set({ missions: [], isLoading: true, error: null });
    try {
      const res = await fetchDailyMissionsAction();
      const backendMissions = res.data || [];
      const backendHistory = res.history || [];

      const mappedMissions = mapBackendMissions(backendMissions);
      const mappedHistory = mapBackendHistory(backendHistory);

      set({ missions: mappedMissions, history: mappedHistory, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch daily missions data', err);
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  fetchTimelineData: async () => {
    set({ missions: [], milestones: [], history: [], isLoading: true, error: null });
    try {
      const res = await fetchTimelineDataAction();
      const backendMissions = res.missions || [];
      const backendHistory = res.history || [];
      const backendMilestones = res.milestones || [];

      const mappedMilestones = backendMilestones.map((m: any): Milestone => ({
        id: m.id,
        title: m.title,
        description: m.description || undefined,
        deadline: m.deadline || undefined,
        status: m.status as any,
        createdAt: m.created_at,
        completedAt: m.completed_at || undefined,
        subtasks: (m.subtasks || []).map((s: any): MilestoneSubtask => ({
          id: s.id,
          milestoneId: s.milestone_id || s.milestoneId,
          title: s.title,
          isCompleted: s.is_completed ?? s.isCompleted ?? false,
          orderIndex: s.order_index ?? s.orderIndex ?? 0,
          createdAt: s.created_at || s.createdAt,
          completedAt: s.completed_at || s.completedAt || undefined,
        })),
      }));

      const mappedMissions = backendMissions.map((item: any): Mission => {
        const baseSecs = item.logged_seconds !== undefined ? item.logged_seconds : (item.logged_minutes || 0) * 60;
        let currentSecs = baseSecs;
        if (item.timer_started_at) {
          const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(item.timer_started_at).getTime()) / 1000));
          currentSecs += elapsedSecs;
        }
        const currentMinutes = Math.min(item.minutes_per_day, Math.floor(currentSecs / 60));

        return {
          id: item.id,
          name: item.title,
          reason: item.description || "",
          commitmentType: item.type === 'daily_habit' ? 'daily-habit' : 'challenge',
          commitmentLevel: 'normal',
          frequency: item.type === 'daily_habit' ? 'everyday' : 'custom',
          currentDays: item.current_day,
          minutesPerDay: item.minutes_per_day,
          targetMinutes: item.minutes_per_day,
          currentMinutes: currentMinutes,
          loggedMinutes: item.logged_minutes,
          loggedSeconds: baseSecs,
          status: item.status === 'cancelled' ? 'canceled' : (item.status as any),
          streak: item.streak || 0,
          missed: item.missed_consecutive || 0,
          linkedMilestoneId: undefined,
          timerStartedAt: item.timer_started_at || undefined,
          startDate: item.start_date || undefined,
          selectedDays: item.days_of_week || undefined,
          duration: item.duration || undefined
        };
      });

      const mappedHistory = backendHistory.map((h: any): DailyProgress => ({
        missionId: h.mission_id,
        date: h.date,
        minutesDone: h.minutes_done,
        requiredMinutes: h.required_minutes,
        status: h.status as any
      }));

      set({ missions: mappedMissions, milestones: mappedMilestones, history: mappedHistory, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch timeline data', err);
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  fetchMonthlyTimeline: async (year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchMonthlyTimelineAction(year, month);
      set({ monthlyTimeline: data as any, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch monthly timeline', err);
      set({ error: err.message || 'Failed to fetch monthly timeline', isLoading: false });
    }
  },

  fetchDailyTimeline: async (date: string) => {
    try {
      const data = await fetchDailyTimelineAction(date);
      if (!data) return null;

      const mappedMissions = (data.missions || []).map((detail: any) => {
        const item = detail.mission;
        const baseSecs = item.logged_seconds !== undefined ? item.logged_seconds : (item.logged_minutes || 0) * 60;
        let currentSecs = baseSecs;
        if (item.timer_started_at) {
          const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(item.timer_started_at).getTime()) / 1000));
          currentSecs += elapsedSecs;
        }
        const currentMinutes = Math.min(item.minutes_per_day, Math.floor(currentSecs / 60));

        const missionObj = {
          id: item.id,
          name: item.title,
          reason: item.description || "",
          commitmentType: item.type === 'daily_habit' ? 'daily-habit' : 'challenge',
          commitmentLevel: 'normal',
          frequency: item.type === 'daily_habit' ? 'everyday' : 'custom',
          currentDays: item.current_day,
          minutesPerDay: item.minutes_per_day,
          targetMinutes: item.minutes_per_day,
          currentMinutes: currentMinutes,
          loggedMinutes: item.logged_minutes,
          loggedSeconds: baseSecs,
          status: item.status === 'cancelled' ? 'canceled' : item.status,
          streak: item.streak || 0,
          missed: item.missed_consecutive || 0,
          linkedMilestoneId: undefined,
          timerStartedAt: item.timer_started_at || undefined,
          startDate: item.start_date || undefined,
          selectedDays: item.days_of_week || undefined,
          duration: item.duration || undefined
        };

        const comp = detail.completion;
        const completionObj = comp ? {
          missionId: comp.mission_id,
          date: comp.date,
          status: comp.status,
          completedMinutes: comp.minutes_done,
          targetMinutes: comp.required_minutes,
        } : undefined;

        return {
          mission: missionObj,
          completion: completionObj,
        };
      });

      const mappedMilestones = (data.milestones || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        deadline: m.deadline,
        status: m.status,
      }));

      return {
        date: data.date,
        status: data.status,
        missions: mappedMissions,
        milestones: mappedMilestones,
      };
    } catch (err: any) {
      console.error('Failed to fetch daily timeline', err);
      return null;
    }
  },

  fetchMilestones: async () => {
    set({ milestones: [], isLoading: true, error: null });
    try {
      const backendMilestones = await fetchMilestonesAction();
      const mappedMilestones = mapBackendMilestones(backendMilestones);
      set({ milestones: mappedMilestones, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch milestones data', err);
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([get().fetchMissions(), get().fetchMilestones()]);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to sync with server', isLoading: false });
    }
  },

  addMission: async (mission) => {
    try {
      const payload = {
        title: mission.name,
        description: mission.reason || undefined,
        type: (mission.commitmentType === 'daily-habit' ? 'daily_habit' : 'challenge') as any,
        days_of_week: mission.selectedDays || [0, 1, 2, 3, 4, 5, 6],
        duration: mission.duration || undefined,
        minutes_per_day: mission.minutesPerDay,
      };

      await addMissionAction(payload);
      await get().fetchDailyMissions();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  updateMission: async (id, updates) => {
    set((state) => {
      const updated = state.missions.map((m) => m.id === id ? { ...m, ...updates } : m);
      return { missions: updated };
    });
  },

  deleteMission: async (id) => {
    try {
      await deleteMissionAction(id);
      await get().fetchDailyMissions();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  logMinutes: async (id, minutes) => {
    set((state) => {
      const updated = state.missions.map((m) => {
        if (m.id === id) {
          const currentSecs = m.loggedSeconds !== undefined ? m.loggedSeconds : (m.loggedMinutes || 0) * 60;
          const newLoggedSecs = currentSecs + minutes * 60;
          const newLoggedMins = Math.floor(newLoggedSecs / 60);
          return {
            ...m,
            loggedMinutes: newLoggedMins,
            loggedSeconds: newLoggedSecs,
            currentMinutes: Math.min(m.minutesPerDay, newLoggedMins),
            timerStartedAt: undefined
          };
        }
        return m;
      });
      return { missions: updated };
    });

    try {
      await logMinutesAction(id, minutes);
      await get().fetchDailyMissions();
    } catch (err: any) {
      console.error(err);
      await get().fetchDailyMissions();
      throw err;
    }
  },

  startTimer: async (id) => {
    set((state) => {
      const updated = state.missions.map((m) =>
        m.id === id ? { ...m, timerStartedAt: new Date().toISOString() } : m
      );
      return { missions: updated };
    });

    try {
      await startTimerAction(id);
      await get().fetchDailyMissions();
    } catch (err: any) {
      console.error(err);
      await get().fetchDailyMissions();
      throw err;
    }
  },

  pauseTimer: async (id, additionalSeconds = 0) => {
    set((state) => {
      const updated = state.missions.map((m) => {
        if (m.id === id) {
          const currentSecs = m.loggedSeconds !== undefined ? m.loggedSeconds : (m.loggedMinutes || 0) * 60;
          const newLoggedSecs = currentSecs + additionalSeconds;
          const newLoggedMins = Math.floor(newLoggedSecs / 60);
          return {
            ...m,
            loggedMinutes: newLoggedMins,
            loggedSeconds: newLoggedSecs,
            currentMinutes: Math.min(m.minutesPerDay, newLoggedMins),
            timerStartedAt: undefined
          };
        }
        return m;
      });
      return { missions: updated };
    });

    try {
      await pauseTimerAction(id, additionalSeconds);
      await get().fetchDailyMissions();
    } catch (err: any) {
      console.error(err);
      await get().fetchDailyMissions();
      throw err;
    }
  },

  addMilestone: async (milestone) => {
    try {
      await addMilestoneAction({
        title: milestone.title,
        description: milestone.description || "",
        deadline: milestone.deadline || undefined,
        subtasks: milestone.subtasks || undefined,
      });
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  deleteMilestone: async (id) => {
    try {
      await deleteMilestoneAction(id);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  updateMilestone: async (id, updates) => {
    try {
      await updateMilestoneAction(id, {
        title: updates.title,
        description: updates.description,
        deadline: updates.deadline || undefined
      });
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  toggleMilestone: async (id) => {
    try {
      await toggleMilestoneAction(id);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  addSubtask: async (milestoneId, title) => {
    try {
      await addSubtaskAction(milestoneId, title);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  toggleSubtask: async (subtaskId) => {
    try {
      await toggleSubtaskAction(subtaskId);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  deleteSubtask: async (subtaskId) => {
    try {
      await deleteSubtaskAction(subtaskId);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  updateSubtask: async (subtaskId, title) => {
    try {
      await updateSubtaskAction(subtaskId, title);
      await get().fetchMilestones();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
