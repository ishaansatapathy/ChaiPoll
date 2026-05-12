import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../services/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (userData: any) => Promise<User>;
  login: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
  setDisplayName: (displayName: string) => Promise<User>;
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

  const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

  // Listen for 401 events from the API interceptor
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await API.get<User>("/auth/me");
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const signup = async (userData: any) => {
    const response = await API.post<User>("/auth/signup", userData);
    setUser(response.data);
    return response.data;
  };

  const login = async (userData: any) => {
    const response = await API.post<User>("/auth/login", userData);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const setDisplayName = async (displayName: string) => {
    const response = await API.patch<User>("/auth/update-display-name", { displayName });
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, setDisplayName, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
