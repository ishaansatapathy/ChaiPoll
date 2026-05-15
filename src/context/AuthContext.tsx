import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../services/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  displayName?: string;
  isOnboarded?: boolean;
  role: "user" | "moderator" | "admin";
  twoFactorEnabled?: boolean;
  permissions?: string[];
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse extends Partial<User> {
  twoFactorRequired?: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (userData: SignupData) => Promise<User>;
  login: (userData: LoginData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  setDisplayName: (displayName: string) => Promise<User>;
  toggle2FA: (enabled: boolean) => Promise<void>;
  verify2FA: (email: string, otp: string) => Promise<User>;
  API_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api/v1";

  // Clear auth state when the API signals an unauthorized event (e.g. token revoked)
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await API.get<User>("/auth/me");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const signup = async (userData: SignupData): Promise<User> => {
    const response = await API.post<User>("/auth/signup", userData);
    setUser(response.data);
    return response.data;
  };

  const login = async (userData: LoginData): Promise<LoginResponse> => {
    const response = await API.post<LoginResponse>("/auth/login", userData);
    if (!response.data.twoFactorRequired) {
      setUser(response.data as User);
    }
    return response.data;
  };

  const logout = async (): Promise<void> => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const setDisplayName = async (displayName: string): Promise<User> => {
    const response = await API.patch<User>("/auth/update-display-name", { displayName });
    setUser(response.data);
    return response.data;
  };

  const verify2FA = async (email: string, otp: string): Promise<User> => {
    const response = await API.post<User>("/auth/verify-2fa", { email, otp });
    setUser(response.data);
    return response.data;
  };

  const toggle2FA = async (enabled: boolean): Promise<void> => {
    await API.post("/auth/toggle-2fa", { enabled });
    if (user) {
      setUser({ ...user, twoFactorEnabled: enabled });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, setDisplayName, verify2FA, toggle2FA, API_URL }}
    >
      {children}
    </AuthContext.Provider>
  );
};
