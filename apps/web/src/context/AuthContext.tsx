import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, logout as apiLogout, type DiscordUser } from "../lib/api";

interface AuthContextValue {
  user: DiscordUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await getMe();
      setUser(res?.data ?? null);
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}