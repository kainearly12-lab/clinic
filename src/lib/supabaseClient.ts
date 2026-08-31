import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable accessor that will never throw if import.meta.env is empty, undefined, or missing
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

const rawUrl = getEnv('VITE_SUPABASE_URL').trim();
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY').trim();

// Check if credentials exist and are syntactically valid
const isValidHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    isValidHttpUrl(rawUrl) &&
    rawKey.length >= 10
);

let clientInstance: SupabaseClient | null = null;

/**
 * Creates a safe dummy/fallback chain proxy so calling query methods never crashes if Supabase is offline.
 */
function createSafeDummyClient(): SupabaseClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      // Methods like .from(), .select(), .insert(), .update(), .delete(), .eq(), .order(), etc.
      return () => {
        // Return a proxy that resolves like a Promise to { data: [], error: null, count: 0 }
        const chain: Record<string, unknown> = {
          then(resolve: (value: { data: unknown[]; error: null; count: number }) => void) {
            resolve({ data: [], error: null, count: 0 });
          },
          catch() {
            return chain;
          },
        };
        return new Proxy(chain, handler);
      };
    },
  };

  return new Proxy({}, handler) as unknown as SupabaseClient;
}

/**
 * Returns the initialized Supabase client instance, or a safe fallback proxy if unconfigured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(rawUrl, rawKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
    } catch (err) {
      console.warn('Supabase initialization warning (using local fallback mode):', err);
      return null;
    }
  }

  return clientInstance;
}

// Export a safe fallback instance
export const supabase = getSupabaseClient() || createSafeDummyClient();
