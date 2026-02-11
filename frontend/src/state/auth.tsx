import React from "react";
import { http, setAccessToken } from "../lib/http";

export type Role = "admin" | "manager" | "staff" | "delivery" | "client";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type AuthCtx = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const Ctx = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const r = await http.post("/auth/login", { email, password });
    setToken(r.data.accessToken);
    setAccessToken(r.data.accessToken);
    setUser(r.data.user);
  };

  const hydrate = async () => {
    try {
      const r = await http.post("/auth/refresh");
      setToken(r.data.accessToken);
      setAccessToken(r.data.accessToken);
      const me = await http.get("/auth/me");
      setUser(me.data.user);
    } catch {
      setToken(null);
      setAccessToken(null);
      setUser(null);
    }
  };

  const logout = async () => {
    try { await http.post("/auth/logout"); } catch {}
    setToken(null);
    setAccessToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, accessToken: token, login, logout, hydrate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
