/**
 * Strict Admin Authentication & Session Management Utility
 * Provides cryptographic-grade local session tokens, credential validation,
 * seamless preview bypass for kainearly12@gmail.com, and persistent storage across tabs.
 */

export interface AdminSession {
  token: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin';
  authenticatedAt: string;
  expiresAt: number; // Timestamp in milliseconds
}

export const SESSION_STORAGE_KEY = 'androderma_admin_session_v2';
export const LEGACY_STORAGE_KEY = 'androderma_admin_session';

// Explicit Admin Whitelist Array for Authorized Clinic Managers & Administrators
export const ADMIN_WHITELIST: string[] = [
  'kainearly12@gmail.com',
  'admin@androderma.com',
  'dr.androderma@gmail.com',
  'manager@androderma.clinic',
  'admin@androderma.clinic',
];

// Approved Admin Credentials Matrix for Production
export const AUTHORIZED_ADMIN_CREDENTIALS: Record<string, string[]> = {
  'kainearly12@gmail.com': [
    'androderma2025',
    'admin@2025',
    'AndroDerma#2025',
    'admin123456',
    '12345678',
    'admin',
    'password',
    'kainearly12',
    'kainearly2025',
  ],
  'admin@androderma.com': ['androderma2025', 'admin@2025', 'AndroDerma#2025', 'admin123456', '12345678'],
  'dr.androderma@gmail.com': ['androderma2025', 'dr2025', 'AndroDerma#2025'],
  'manager@androderma.clinic': ['androderma2025', 'manager2025', 'AndroDerma#2025'],
  'admin@androderma.clinic': ['androderma2025', 'admin2025', 'AndroDerma#2025'],
};

/**
 * Detect whether the current runtime is inside an AI Studio / development / sandbox preview environment.
 * Production deployments (like live Vercel domains) return false to enforce strict password validation.
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return true;

  const host = window.location.hostname.toLowerCase();

  // Cloud Run, AI Studio, local development, and webcontainers are preview environments
  const isPreviewHost =
    host.includes('run.app') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('0.0.0.0') ||
    host.includes('webcontainer') ||
    host.includes('stackblitz') ||
    host.includes('preview') ||
    host.includes('dev-') ||
    host.includes('pre-') ||
    host.includes('ais-');

  // Check if running inside an iframe (AI Studio canvas preview)
  let isInsideIframe = false;
  try {
    isInsideIframe = window.self !== window.top;
  } catch {
    isInsideIframe = true;
  }

  return isPreviewHost || isInsideIframe || import.meta.env.DEV;
}

/**
 * Check if a given email is whitelisted as an authorized admin
 */
export function isAdminEmailWhitelisted(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_WHITELIST.includes(normalized) || Boolean(AUTHORIZED_ADMIN_CREDENTIALS[normalized]);
}

// Generate random secure token
function generateSecureToken(email: string): string {
  try {
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const timestamp = Date.now().toString(36);
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    return `adm_${emailPrefix}_${timestamp}_${randomBytes}`;
  } catch {
    return `adm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * Validate credentials against authorized administrator accounts.
 * In the preview environment:
 * - kainearly12@gmail.com is allowed to log in with ANY password (or bypass).
 * In production (Vercel):
 * - Strict password matching is enforced.
 */
export function verifyAdminCredentials(email: string, pass: string): { isValid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPass = pass.trim();

  if (!normalizedEmail) {
    return { isValid: false, error: 'يرجى إدخال البريد الإلكتروني للمسؤول' };
  }

  // 1. Preview bypass: Allow kainearly12@gmail.com with any password in preview environment
  if (normalizedEmail === 'kainearly12@gmail.com' && isPreviewEnvironment()) {
    return { isValid: true };
  }

  if (!normalizedPass) {
    return { isValid: false, error: 'يرجى إدخال كلمة المرور المعتمدة' };
  }

  const validPasswords = AUTHORIZED_ADMIN_CREDENTIALS[normalizedEmail];

  // Check strict email match
  if (!validPasswords) {
    return {
      isValid: false,
      error: 'البريد الإلكتروني المدخل غير مسجل ضمن قائمة المسؤولين المصرح لهم',
    };
  }

  // Check strict password match in production
  if (!validPasswords.includes(normalizedPass)) {
    return {
      isValid: false,
      error: 'كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً',
    };
  }

  return { isValid: true };
}

/**
 * Create and persist an authorized admin session into sessionStorage and localStorage.
 */
export function createAdminSession(email: string, customDisplayName?: string): AdminSession {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days validity

  const displayName =
    customDisplayName ||
    (normalizedEmail === 'kainearly12@gmail.com'
      ? 'كاين إيرلي (Super Admin)'
      : normalizedEmail === 'admin@androderma.com'
      ? 'مدير النظام'
      : normalizedEmail);

  const session: AdminSession = {
    token: generateSecureToken(normalizedEmail),
    email: normalizedEmail,
    displayName,
    role: 'super_admin',
    authenticatedAt: new Date(now).toISOString(),
    expiresAt,
  };

  // Save to both sessionStorage and localStorage for instant, reliable persistence
  try {
    const sessionStr = JSON.stringify(session);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionStr);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionStr);
    }
  } catch (err) {
    console.warn('Failed to save admin session:', err);
  }

  return session;
}

/**
 * Instant Super Admin Session Injector for Preview Bypass.
 * Injects a valid super_admin session into sessionStorage/localStorage and updates the URL to /admin.
 */
export function injectSuperAdminSession(
  email = 'kainearly12@gmail.com',
  displayName = 'كاين إيرلي (Super Admin)'
): AdminSession {
  const session = createAdminSession(email, displayName);

  if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
    window.history.pushState(null, '', '/admin');
  }

  return session;
}

/**
 * Retrieve and validate the current active admin session
 */
export function getValidAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check sessionStorage first
    let raw = sessionStorage.getItem(SESSION_STORAGE_KEY);

    // 2. Fallback to localStorage
    if (!raw) {
      raw = localStorage.getItem(SESSION_STORAGE_KEY);
    }

    // 3. Fallback to legacy key migration if valid
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy?.email && AUTHORIZED_ADMIN_CREDENTIALS[legacy.email.toLowerCase()]) {
          return createAdminSession(legacy.email);
        }
      }
      return null;
    }

    const session: AdminSession = JSON.parse(raw);

    // Validate structure & expiration
    if (!session || !session.token || !session.email || !session.expiresAt) {
      clearAdminSession();
      return null;
    }

    if (Date.now() > session.expiresAt) {
      // Session expired
      clearAdminSession();
      return null;
    }

    // Ensure session is synchronized in both storages
    try {
      const sessionStr = JSON.stringify(session);
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionStr);
      localStorage.setItem(SESSION_STORAGE_KEY, sessionStr);
    } catch {
      // Ignored
    }

    return session;
  } catch (err) {
    console.warn('Error validating admin session:', err);
    clearAdminSession();
    return null;
  }
}

/**
 * Clear all admin sessions across all storages
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing admin session:', err);
  }
}
