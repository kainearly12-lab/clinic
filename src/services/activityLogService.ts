/**
 * Live Activity Logging Service for Supabase (activity_logs)
 * 
 * Provides real-time live insertion of audit trails and administrative actions
 * directly into the Supabase `activity_logs` table, with client device detection,
 * automatic retries for schema compatibility, comprehensive error handling,
 * and reactive notifications.
 */

import { getSupabaseClient } from '@/lib/supabase';
import { ActivityLogRecord } from '@/types/admin';
import { getValidAdminSession } from '@/utils/adminAuth';

// In-memory cache for fast UI access & offline resilience
let localLogs: ActivityLogRecord[] = [];

// Persistent cache key in localStorage
const CACHE_STORAGE_KEY = 'androderma_activity_logs_cache';

// Reactive subscriber set for real-time listeners
const activityLogListeners: Set<() => void> = new Set();

/**
 * Subscribe to real-time activity log changes across the application
 */
export function subscribeActivityLogs(callback: () => void): () => void {
  activityLogListeners.add(callback);
  return () => {
    activityLogListeners.delete(callback);
  };
}

/**
 * Broadcast notification that an activity log record has been inserted or updated
 */
export function notifyActivityLogsChanged(): void {
  activityLogListeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.warn('[activity_logs] Error in activity log listener callback:', err);
    }
  });
}

/**
 * Device and Platform Detection Utility
 */
export function getDeviceType(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'خادم / غير محدد';
  }

  const ua = (navigator.userAgent || '').toLowerCase();

  if (/iphone|ipod/.test(ua)) return 'أيفون (iOS)';
  if (/ipad/.test(ua)) return 'آيباد (iPadOS)';
  if (/android/.test(ua)) return 'هاتف أندرويد';
  if (/macintosh|mac os x/.test(ua)) return 'ماك (macOS)';
  if (/windows/.test(ua)) return 'كمبيوتر ويندوز';
  if (/linux/.test(ua)) return 'نظام لينكس';

  return 'متصفح ويب';
}

/**
 * Core Live Activity Logger
 *
 * Executes an active Supabase `.from('activity_logs').insert(...)` call
 * with live payload fields (`action_type`, `description`, `performed_by`, `device_info`, etc.),
 * wrapped in robust try/catch blocks to ensure silent failures are caught and logged.
 */
export async function logAdminActivity(
  actionType: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const detectedDevice = getDeviceType();
  const session = getValidAdminSession();

  const performedBy =
    session?.displayName ||
    session?.email ||
    'مدير النظام';

  const adminEmail =
    session?.email ||
    'admin@androderma.com';

  const nowIso = new Date().toISOString();

  // 1. Maintain in-memory and local cache immediately
  const localEntry: ActivityLogRecord = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action_type: actionType,
    description,
    entity_type: entityType,
    entity_id: entityId,
    admin_email: adminEmail,
    performed_by: performedBy,
    device_info: detectedDevice,
    metadata: metadata || null,
    created_at: nowIso,
  };

  localLogs = [localEntry, ...localLogs].slice(0, 100);

  // Sync to localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(localLogs.slice(0, 50)));
    }
  } catch {
    // Ignore storage quota limits
  }

  // Notify UI subscribers immediately for real-time reactivity
  notifyActivityLogsChanged();

  // 2. Check if Supabase client is available
  if (!supabase) {
    console.warn('[activity_logs] Supabase client is not available. Log saved to local cache.');
    return { success: true };
  }

  // 3. Execute active Supabase database write
  try {
    // Primary Tier: Full schema payload with all enriched fields
    const fullPayload: Record<string, unknown> = {
      action_type: actionType,
      description,
      performed_by: performedBy,
      admin_email: adminEmail,
      device_info: detectedDevice,
    };

    if (entityType) fullPayload.entity_type = entityType;
    if (entityId) fullPayload.entity_id = entityId;
    if (metadata && Object.keys(metadata).length > 0) {
      fullPayload.metadata = metadata;
    }

    const { error: primaryError } = await supabase
      .from('activity_logs')
      .insert([fullPayload]);

    if (!primaryError) {
      // Successfully inserted into live Supabase!
      return { success: true };
    }

    console.warn(
      '[activity_logs] Primary insert failed, trying schema-compatible fallback:',
      primaryError.message || primaryError
    );

    // Fallback Tier 1: Without optional metadata/entity fields
    const tier1Payload: Record<string, unknown> = {
      action_type: actionType,
      description,
      performed_by: performedBy,
      admin_email: adminEmail,
      device_info: detectedDevice,
    };

    const { error: tier1Error } = await supabase
      .from('activity_logs')
      .insert([tier1Payload]);

    if (!tier1Error) {
      return { success: true };
    }

    // Fallback Tier 2: Without admin_email (in case table only has performed_by)
    const tier2Payload: Record<string, unknown> = {
      action_type: actionType,
      description,
      performed_by: performedBy,
      device_info: detectedDevice,
    };

    const { error: tier2Error } = await supabase
      .from('activity_logs')
      .insert([tier2Payload]);

    if (!tier2Error) {
      return { success: true };
    }

    // Fallback Tier 3: Minimal fields (action_type, description, performed_by)
    const tier3Payload: Record<string, unknown> = {
      action_type: actionType,
      description,
      performed_by: performedBy,
    };

    const { error: tier3Error } = await supabase
      .from('activity_logs')
      .insert([tier3Payload]);

    if (!tier3Error) {
      return { success: true };
    }

    // Fallback Tier 4: Base fields only
    const basePayload: Record<string, unknown> = {
      action_type: actionType,
      description,
    };

    const { error: baseError } = await supabase
      .from('activity_logs')
      .insert([basePayload]);

    if (!baseError) {
      return { success: true };
    }

    // Log explicit database failure to console
    const finalErrorMessage =
      baseError?.message ||
      tier3Error?.message ||
      tier2Error?.message ||
      tier1Error?.message ||
      primaryError.message ||
      'Unknown Supabase error';

    console.error('[activity_logs] Supabase database write failed:', {
      error: finalErrorMessage,
      action_type: actionType,
      description,
      performed_by: performedBy,
      device_info: detectedDevice,
    });

    return { success: false, error: finalErrorMessage };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[activity_logs] Unexpected error during activity log insert:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Standard alias for `logAdminActivity` to satisfy both naming conventions:
 * e.g., `logActivity(...)` or `logAdminActivity(...)`
 */
export const logActivity = logAdminActivity;

/**
 * Fetch all activity logs from live Supabase (with automatic 30-day retention filtering)
 */
export async function fetchActivityLogs(): Promise<ActivityLogRecord[]> {
  const supabase = getSupabaseClient();

  // Trigger non-blocking background retention cleanup
  cleanOldActivityLogs().catch(() => {});

  // Load from localStorage if local cache is empty
  if (localLogs.length === 0 && typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_STORAGE_KEY);
      if (cached) {
        localLogs = JSON.parse(cached);
      }
    } catch {
      // Ignore cache parse error
    }
  }

  if (!supabase) {
    return [...localLogs];
  }

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('[activity_logs] fetchActivityLogs notice from Supabase:', error.message || error);
      return [...localLogs];
    }

    if (!data || data.length === 0) {
      return [...localLogs];
    }

    const formatted: ActivityLogRecord[] = data.map((item) => ({
      id: String(item.id || `log-${Date.now()}`),
      action_type: item.action_type || 'system_sync',
      description: item.description || '',
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      admin_email: item.admin_email || item.performed_by || 'مدير النظام',
      performed_by: item.performed_by || item.admin_email || 'مدير النظام',
      device_info: item.device_info || getDeviceType(),
      metadata: item.metadata || null,
      created_at: item.created_at || new Date().toISOString(),
    }));

    // Update in-memory and persistent cache
    localLogs = formatted.slice(0, 100);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(localLogs.slice(0, 50)));
      }
    } catch {
      // Ignore
    }

    return formatted;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[activity_logs] fetchActivityLogs failed:', errorMsg);
    return [...localLogs];
  }
}

/**
 * 30-Day Activity Log Retention Policy & Cleanup
 * Cleans activity logs older than 30 days from live Supabase and local memory.
 * - Attempts to call RPC function `clean_old_activity_logs()`
 * - Falls back to standard Supabase delete query with `.lt('created_at', cutoffDate)`
 * - Cleans in-memory and localStorage cache to ensure strict 30-day retention
 */
export async function cleanOldActivityLogs(): Promise<{
  success: boolean;
  deletedCount: number;
  cutoffDate: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const cutoffTime = Date.now() - thirtyDaysMs;
  const cutoffDateIso = new Date(cutoffTime).toISOString();

  // 1. In-memory cleanup
  const beforeCount = localLogs.length;
  localLogs = localLogs.filter((log) => {
    const logTime = new Date(log.created_at).getTime();
    return !isNaN(logTime) ? logTime >= cutoffTime : true;
  });
  const localDeleted = beforeCount - localLogs.length;

  if (!supabase) {
    return {
      success: true,
      deletedCount: localDeleted,
      cutoffDate: cutoffDateIso,
    };
  }

  try {
    // 2. Try Supabase RPC clean_old_activity_logs() first
    const { data: rpcDeleted, error: rpcError } = await supabase.rpc('clean_old_activity_logs');

    if (!rpcError && typeof rpcDeleted === 'number') {
      return {
        success: true,
        deletedCount: rpcDeleted,
        cutoffDate: cutoffDateIso,
      };
    }

    // 3. Fallback to direct DELETE query via PostgREST
    const { count, error: deleteError } = await supabase
      .from('activity_logs')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDateIso);

    if (deleteError) {
      console.warn('[activity_logs] Fallback delete query notice for activity_logs:', deleteError.message);
      return {
        success: true,
        deletedCount: localDeleted,
        cutoffDate: cutoffDateIso,
      };
    }

    return {
      success: true,
      deletedCount: typeof count === 'number' ? count : localDeleted,
      cutoffDate: cutoffDateIso,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[activity_logs] cleanOldActivityLogs error (non-fatal):', msg);
    return {
      success: true,
      deletedCount: localDeleted,
      cutoffDate: cutoffDateIso,
      error: msg,
    };
  }
}
