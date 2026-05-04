const AUTH_USERS_KEY = "veratax_auth_users";
const AUTH_SESSION_KEY = "veratax_auth_session";
const CURRENT_USER_KEY = "veratax_current_user";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  displayName: string;
}

export const DEFAULT_AUTH_USERS: AuthUser[] = [
  {
    id: "admin",
    email: "veratax.ad@gmail.com",
    username: "veratax.ad@gmail.com",
    password: "Vera123@@",
    role: "admin",
    displayName: "Admin"
  }
];

export function loadAuthUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasAdmin = parsed.some(user => {
        const email = String(user.email || "").trim().toLowerCase();
        const username = String(user.username || "").trim().toLowerCase();
        return email === "veratax.ad@gmail.com" || username === "veratax.ad@gmail.com";
      });

      if (hasAdmin) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Cannot parse auth users. Reseeding default auth users.", error);
  }

  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_AUTH_USERS));
  return DEFAULT_AUTH_USERS;
}

export function validateCredentials(loginInput: string, passwordInput: string): AuthUser | null {
  const loginId = String(loginInput || "").trim().toLowerCase();
  const password = String(passwordInput || "");

  const authUsers = loadAuthUsers();

  return authUsers.find(user => {
    const email = String(user.email || "").trim().toLowerCase();
    const username = String(user.username || "").trim().toLowerCase();
    const userPassword = String(user.password || "");

    return (email === loginId || username === loginId) && userPassword === password;
  }) || null;
}

export function createAuthSession(user: AuthUser) {
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    displayName: user.displayName
  };

  const session = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return safeUser;
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem("veratax_access_token");
  localStorage.removeItem("veratax_login_state");
}

// Global reset helper for development
if (typeof window !== 'undefined') {
  (window as any).__resetVerataxAuth = function() {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_AUTH_USERS));
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log("VERATAX auth reset done");
  };
}
