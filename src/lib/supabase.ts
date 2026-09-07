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

// Fallback no-op proxy if clientInstance is null
const safeMockClient = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: new Error('Supabase storage not configured') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        };
      }
      if (prop === 'rpc') {
        return async () => ({ data: null, error: null });
      }
      if (prop === 'from') {
        const chain: Record<string, unknown> = {
          select: () => chain,
          insert: async () => ({ data: null, error: null }),
          upsert: async () => ({ data: null, error: null }),
          update: () => chain,
          delete: () => chain,
          eq: () => chain,
          order: () => chain,
          single: async () => ({ data: null, error: null }),
        };
        return () => chain;
      }
      return async () => ({ data: null, error: null });
    },
  }
) as unknown as SupabaseClient;

// Export singleton instance
export const supabase = getSupabaseClient() || safeMockClient;

export default supabase;
