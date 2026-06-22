import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import type { AuthResponse, User } from "../types";

type Credentials = {
  email: string;
  password: string;
};

type RegisterData = Credentials & {
  username: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (data: Credentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  setSessionToken: (token: string) => Promise<User>;
  refreshUser: () => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "chifita_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((session: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const loadUser = useCallback(async (currentToken: string) => {
    const data = await apiRequest<{ user: User }>("/auth/me", { token: currentToken });
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const boot = async () => {
      if (token) {
        try {
          await loadUser(token);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }

      try {
        const session = await apiRequest<AuthResponse>("/auth/refresh", { method: "POST" });
        persistSession(session);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [loadUser, token]);

  const login = useCallback(
    async (data: Credentials) => {
      const session = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      persistSession(session);
      return session.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const session = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      persistSession(session);
      return session.user;
    },
    [persistSession],
  );

  const setSessionToken = useCallback(
    async (newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      return loadUser(newToken);
    },
    [loadUser],
  );

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    return loadUser(token);
  }, [loadUser, token]);

  const logout = useCallback(() => {
    apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, login, register, setSessionToken, refreshUser, logout }),
    [loading, login, logout, refreshUser, register, setSessionToken, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
