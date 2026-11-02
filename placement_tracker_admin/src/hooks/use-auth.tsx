"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (redirectPath?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "assesspro_admin_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem(AUTH_KEY);
      if (authStatus === "true") {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Could not access session storage:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (redirectPath: string = "/dashboard") => {
    try {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      router.push(redirectPath);
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
  };
  
  const value = { isAuthenticated, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
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

export function ProtectRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated && pathname.startsWith('/dashboard')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
