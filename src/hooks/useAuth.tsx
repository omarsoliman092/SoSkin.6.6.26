import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { ensureAdminRole } from "@/lib/admin.functions";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthCtx = createContext<AuthState | null>(null);
const ADMIN_EMAIL = "omar.soliman.092@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const maybeEnsureAdmin = (s: Session | null) => {
      if (s?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
        ensureAdminRole().catch(() => {});
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      maybeEnsureAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      maybeEnsureAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider
      value={{ user, session, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
