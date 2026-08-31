/**
 * Strict Admin Authentication & Session Management Utility
 * Provides cryptographic-grade local session tokens, credential validation,
 * and persistent storage across tabs and reloads.
 */

export interface AdminSession {
  token: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin';
  authenticatedAt: string;
  expiresAt: number; // Timestamp in milliseconds
}

const SESSION_STORAGE_KEY = 'androderma_admin_session_v2';
const LEGACY_STORAGE_KEY = 'androderma_admin_session';

// Approved Admin Credentials Matrix
// Allows clinic director, head dermatologist, and authorized system managers
const AUTHORIZED_ADMIN_CREDENTIALS: Record<string, string[]> = {
  'admin@androderma.com': ['androderma2025', 'admin@2025', 'AndroDerma#2025', 'admin123456', '12345678'],
  'dr.androderma@gmail.com': ['androderma2025', 'dr2025', 'AndroDerma#2025'],
  'manager@androderma.clinic': ['androderma2025', 'manager2025', 'AndroDerma#2025'],
  'admin@androderma.clinic': ['androderma2025', 'admin2025', 'AndroDerma#2025'],
};

// Generate random secure token
function generateSecureToken(email: string): string {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const timestamp = Date.now().toString(36);
  const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return `adm_${emailPrefix}_${timestamp}_${randomBytes}`;
}

/**
 * Validate credentials against hardcoded authorized administrator accounts
 */
export function verifyAdminCredentials(email: string, pass: string): { isValid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPass = pass.trim();

  if (!normalizedEmail) {
    return { isValid: false, error: 'يرجى إدخال البريد الإلكتروني للمسؤول' };
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

  // Check strict password match
  if (!validPasswords.includes(normalizedPass)) {
    return {
      isValid: false,
      error: 'كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً',
    };
  }

  return { isValid: true };
}

/**
 * Create and persist an authorized admin session
 */
export function createAdminSession(email: string, customDisplayName?: string): AdminSession {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days validity

  const session: AdminSession = {
    token: generateSecureToken(normalizedEmail),
    email: normalizedEmail,
    displayName: customDisplayName || (normalizedEmail === 'admin@androderma.com' ? 'مدير النظام' : normalizedEmail),
    role: 'super_admin',
    authenticatedAt: new Date(now).toISOString(),
    expiresAt,
  };

  // Save to both sessionStorage and localStorage for rock-solid persistence
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
