"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, User } from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem("admin_user");
    const token = localStorage.getItem("admin_token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "ADMIN") {
          setUser(parsedUser);
        } else {
          // Not an admin, clear storage
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);

      if (response.status === "success" && response.data) {
        const { user: loggedInUser, tokens } = response.data;

        // Check if user is admin
        if (loggedInUser.role !== "ADMIN") {
          throw new Error("Access denied. Admin privileges required.");
        }

        localStorage.setItem("admin_token", tokens.accessToken);
        localStorage.setItem("admin_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
