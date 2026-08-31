import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTodayDynamicSchedule,
  fetchWeeklyScheduleWithBranches,
  calculateOpenStatus,
} from '@/services/scheduleService';
import {
  TodayScheduleResult,
  WeeklyScheduleItem,
  NormalizedBranch,
} from '@/types/schedule';

interface UseTodayScheduleOptions {
  /** Target date override, defaults to current date */
  targetDate?: Date;
  /** ISO date string override 'YYYY-MM-DD' */
  dateString?: string;
  /** Whether to auto-refresh real-time open/close status every minute (default true) */
  autoRefreshStatus?: boolean;
}

/**
 * React hook to fetch and subscribe to today's dynamic clinic schedule,
 * active branch, working hours, and real-time open/exception status.
 */
export function useTodaySchedule(options: UseTodayScheduleOptions = {}) {
  const { targetDate, dateString, autoRefreshStatus = true } = options;
  const [data, setData] = useState<TodayScheduleResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTodayDynamicSchedule({ targetDate, dateString });
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(e);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [targetDate, dateString]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    loadSchedule();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadSchedule]);

  // Periodic real-time recalculation of open/closed status every 60 seconds
  useEffect(() => {
    if (!autoRefreshStatus) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        if (!prevData) return prevData;

        const isClosed =
          prevData.exception.isClosed ||
          prevData.status.isHoliday ||
          !prevData.todayWorkingHours.openTime;

        const statusCalc = calculateOpenStatus(
          prevData.todayWorkingHours.openTime,
          prevData.todayWorkingHours.closeTime,
          isClosed,
          new Date()
        );

        return {
          ...prevData,
          status: {
            ...prevData.status,
            isOpen: statusCalc.isOpen,
            statusTextAr: statusCalc.statusTextAr,
            isClosingSoon: statusCalc.isClosingSoon,
          },
          timestamp: new Date().toISOString(),
        };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefreshStatus]);

  // Re-fetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSchedule();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadSchedule]);

  return {
    schedule: data,
    isLoading,
    error,
    refetch: loadSchedule,
  };
}

/**
 * React hook to fetch the complete weekly schedule joined with branches
 */
export function useWeeklySchedule() {
  const [scheduleList, setScheduleList] = useState<WeeklyScheduleItem[]>([]);
  const [branches, setBranches] = useState<NormalizedBranch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'supabase' | 'fallback'>('fallback');

  const loadWeekly = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWeeklyScheduleWithBranches();
      setScheduleList(res.data);
      setBranches(res.branches);
      setSource(res.source);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeekly();
  }, [loadWeekly]);

  return {
    scheduleList,
    branches,
    source,
    isLoading,
    error,
    refetch: loadWeekly,
  };
}
