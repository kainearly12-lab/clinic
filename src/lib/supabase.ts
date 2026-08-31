import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials for direct out-of-the-box connection
export const SUPABASE_URL = 'https://ivsakdeyqovxvammqftt.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2c2FrZGV5cW92eHZhbW1xZnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDQ1NzQsImV4cCI6MjEwMzc4MDU3NH0.gAs5zX3YbKGvgkSFcZVuCHQQuFhpxZIht2S_A_DxnDM';

// Fallback checking if env vars are additionally provided
function getEnv(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env[key] as string) || '';
    }
  } catch {
    // Ignore environment access errors in sandboxed runtimes
  }
  return '';
}

export const activeSupabaseUrl = getEnv('VITE_SUPABASE_URL').trim() || SUPABASE_URL;
export const activeSupabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY').trim() || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  activeSupabaseUrl &&
    activeSupabaseAnonKey &&
    activeSupabaseAnonKey.length >= 10
);

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(activeSupabaseUrl, activeSupabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.warn('Supabase initialization warning:', err);
      return null;
    }
  }

  return clientInstance;
}

// Export singleton instance
export const supabase = getSupabaseClient()!;

export default supabase;
