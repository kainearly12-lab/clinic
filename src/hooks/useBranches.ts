import { useState, useEffect, useCallback } from 'react';
import { fetchAllBranches, subscribeScheduleChanges } from '@/services/scheduleService';
import { NormalizedBranch } from '@/types/schedule';
import { branches as fallbackBranches } from '@/data/clinicData';

/**
 * Custom React hook to fetch and dynamically subscribe to all branches in Supabase.
 * Any admin edit to a branch name, address, or phone number immediately reflects
 * across all subscriber components (Footer, Booking, Matrix, WhatsApp buttons).
 */
export function useBranches() {
  const [branches, setBranches] = useState<NormalizedBranch[]>(() => {
    return fallbackBranches.map((b) => ({
      id: b.id,
      nameAr: b.nameAr,
      cityAr: b.cityAr,
      addressAr: b.addressAr,
      phone: b.phones[0]?.number || '',
      displayPhone: b.phones[0]?.display || b.phones[0]?.number || '',
      phones: b.phones,
      mapSrc: b.mapSrc,
      mapsUrl: b.mapsUrl,
      isActive: true,
    }));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      const data = await fetchAllBranches();
      if (data && data.length > 0) {
        setBranches(data);
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();

    const unsubscribe = subscribeScheduleChanges(() => {
      loadBranches();
    });

    return () => {
      unsubscribe();
    };
  }, [loadBranches]);

  return {
    branches,
    isLoading,
    error,
    refetch: loadBranches,
  };
}
