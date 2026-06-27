import { useEffect, useCallback, useRef } from 'react';
import { getCurrentUser, UserError } from '../services/userService';
import { getUserSettings, updateUserSettings, SettingsError } from '../services/settingsService';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';

const getTimezoneManualSetKey = (userId: string): string =>
  `timezone_manual_set_${userId}`;
const getTimezoneAutoUpdatedKey = (userId: string): string =>
  `timezone_auto_updated_${userId}`;

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const shouldAutoUpdateTimezone = (
  backendTimezone: string,
  browserTimezone: string,
  userId: string | null,
): boolean => {
  if (userId === null) {
    return false;
  }

  // Step 1: Check if backend timezone is UTC (default value from backend response)
  if (backendTimezone !== 'UTC') {
    return false;
  }

  // Step 2: Check if timezone was manually set by user (skip auto-update if user already set it)
  const timezoneManualSet = localStorage.getItem(getTimezoneManualSetKey(userId));
  if (timezoneManualSet === 'true') {
    return false;
  }

  // Step 3: Check browser/client timezone (NOT from backend, but from client browser)
  // If browser timezone is also UTC, no need to update
  if (browserTimezone === 'UTC') {
    return false;
  }

  // Step 4: If backend is UTC (default) AND browser timezone is NOT UTC, auto-update
  return true;
};


export const useUserData = () => {
  const {
    user,
    isLoading: userLoading,
    error: userError,
    setUser,
    setLoading: setUserLoading,
    setError: setUserError,
  } = useUserStore();

  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    lastFetched,
    hasFetched: settingsHasFetched,
    setSettings,
    setLoading: setSettingsLoading,
    setError: setSettingsError,
  } = useSettingsStore();

  const {
    hasFetched: userHasFetched,
  } = useUserStore();

  // Use refs to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  const isFetchingSettingsRef = useRef(false);

  const fetchUserProfile = useCallback(async () => {
    // Skip if already have user data or currently fetching
    if (user || userLoading) {
      return;
    }

    setUserLoading(true);
    setUserError(null);

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      if (error instanceof UserError) {
        setUserError(error.message);
      } else {
        setUserError('Failed to fetch user profile');
      }
    } finally {
      setUserLoading(false);
    }
  }, [user, userLoading, setUser, setUserLoading, setUserError]);

  const fetchUserSettings = useCallback(async () => {
    // Skip if already have settings data or currently fetching
    if (settings || settingsLoading || isFetchingSettingsRef.current) {
      return;
    }

    isFetchingSettingsRef.current = true;
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      const settingsData = await getUserSettings();
      setSettings(settingsData);

      // Auto-update timezone logic:
      // - Backend timezone is UTC (default)
      // - Browser timezone is NOT UTC
      // - User hasn't manually set timezone
      const userId = useUserStore.getState().user?.id ?? null;
      const browserTimezone = getBrowserTimezone();
      if (shouldAutoUpdateTimezone(settingsData.timezone, browserTimezone, userId)) {
        try {
          // Use updateUserSettings response directly, no need to fetch again
          const updatedSettings = await updateUserSettings({ timezone: browserTimezone });
          setSettings(updatedSettings);
          if (userId !== null) {
            localStorage.setItem(getTimezoneAutoUpdatedKey(userId), 'true');
          }
        } catch (updateError) {
          // Silently fail if CORS or other error - don't block the app
          // User can manually set timezone later
          console.warn('Auto timezone update failed:', updateError);
        }
      }
    } catch (error) {
      if (error instanceof SettingsError) {
        setSettingsError(error.message);
      } else {
        setSettingsError('Failed to fetch user settings');
      }
    } finally {
      setSettingsLoading(false);
      isFetchingSettingsRef.current = false;
    }
  }, [settings, settingsLoading, setSettings, setSettingsLoading, setSettingsError]);

  // Store functions in refs to avoid dependency issues
  const fetchUserProfileRef = useRef(fetchUserProfile);
  const fetchUserSettingsRef = useRef(fetchUserSettings);
  fetchUserProfileRef.current = fetchUserProfile;
  fetchUserSettingsRef.current = fetchUserSettings;

  const fetchAllData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    // Only fetch if not already fetched recently
    const FETCH_COOLDOWN = 5000; // 5 second cooldown
    const now = Date.now();
    if (lastFetched && now - lastFetched < FETCH_COOLDOWN) {
      return;
    }

    isFetchingRef.current = true;
    try {
      await Promise.all([
        fetchUserProfileRef.current(),
        fetchUserSettingsRef.current(),
      ]);
    } finally {
      isFetchingRef.current = false;
    }
  }, [lastFetched]); // Only depend on lastFetched

  // Store fetchAllData in ref to avoid stale closure
  const fetchAllDataRef = useRef(fetchAllData);
  fetchAllDataRef.current = fetchAllData;

  const refreshUserData = useCallback(async () => {
    // Reset fetching flag to allow fresh fetch
    isFetchingRef.current = false;
    await fetchAllData();
  }, [fetchAllData]);

  const refreshSettings = useCallback(async () => {
    // Skip if currently fetching
    if (isFetchingSettingsRef.current || settingsLoading) {
      return;
    }

    // Reset flags to allow fresh fetch
    isFetchingSettingsRef.current = false;
    
    // Force refetch by bypassing the settings check
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      const settingsData = await getUserSettings();
      setSettings(settingsData);
    } catch (error) {
      if (error instanceof SettingsError) {
        setSettingsError(error.message);
      } else {
        setSettingsError('Failed to fetch user settings');
      }
    } finally {
      setSettingsLoading(false);
      isFetchingSettingsRef.current = false;
    }
  }, [settingsLoading, setSettings, setSettingsLoading, setSettingsError]);

  useEffect(() => {
    // Fetch data on mount if not already fetched
    // Check store flags instead of refs to prevent re-fetching across re-renders
    if (!userHasFetched && !settingsHasFetched && !isFetchingRef.current) {
      fetchAllDataRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  return {
    user,
    settings,
    isLoading: userLoading || settingsLoading,
    error: userError || settingsError,
    refreshUserData,
    refreshSettings,
  };
};

// Helper function to mark timezone as manually set (per user)
export const markTimezoneAsManual = (userId: string) => {
  if (!userId) return;
  localStorage.setItem(getTimezoneManualSetKey(userId), 'true');
};

