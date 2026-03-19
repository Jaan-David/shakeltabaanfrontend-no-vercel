"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { UserStorage, type User as LoginUser } from "@/services/auth/login";
import { saveAuthToken } from "@/utils/auth";

export type AuthUser = Omit<LoginUser, "phoneNumber"> & {
  nationality?: "Egyptian" | "Other";
  phoneNumber?: string | null;
};

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  clearAuth: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = "auth_token";
const LEGACY_TOKEN_KEY = "authToken";
const USER_KEY = "user_data";

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
};

const toStorageUser = (value: AuthUser): LoginUser => {
  return {
    ...(value as LoginUser),
    phoneNumber: value.phoneNumber ?? "",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const userRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshAuth = useCallback(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    userRef.current = storedUser;
    setToken(storedToken);
    setUser(storedUser);
  }, []);

  const setAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    if (typeof window !== "undefined") {
      UserStorage.saveToken(nextToken);
      UserStorage.saveUser(toStorageUser(nextUser));
      saveAuthToken(nextToken);

      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
      localStorage.setItem(LEGACY_TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }

    setToken(nextToken);
    userRef.current = nextUser;
    setUser(nextUser);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    const merged = { ...(userRef.current ?? {}), ...updates } as AuthUser;

    if (typeof window !== "undefined") {
      UserStorage.saveUser(toStorageUser(merged));
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
    }

    userRef.current = merged;
    setUser(merged);
  }, []);

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      UserStorage.removeUser();
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    setToken(null);
    userRef.current = null;
    setUser(null);
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleStorage = (event: StorageEvent) => {
      if ([AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY, USER_KEY].includes(event.key ?? "")) {
        refreshAuth();
      }
    };

    const handleAuthUpdated = () => {
      refreshAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("authUpdated", handleAuthUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authUpdated", handleAuthUpdated as EventListener);
    };
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      setAuth,
      updateUser,
      clearAuth,
      refreshAuth,
    }),
    [token, user, setAuth, updateUser, clearAuth, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
