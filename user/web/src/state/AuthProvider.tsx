import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MeResponse, PublicUser } from "@shared/types.ts";
import { shopApi } from "@/lib/api.ts";

interface AuthValue {
  user: PublicUser | null;
  googleEnabled: boolean;
  ready: boolean;
  accept: (response: MeResponse) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export const googleSignInUrl = (next = "/account#orders") => `/api/auth/google?next=${encodeURIComponent(next)}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MeResponse & { ready: boolean }>({ user: null, googleEnabled: false, ready: false });

  const accept = useCallback((response: MeResponse) => setState({ ...response, ready: true }), []);

  useEffect(() => {
    shopApi.me().then(accept, () => setState((current) => ({ ...current, ready: true })));
  }, [accept]);

  const signOut = useCallback(async () => {
    await shopApi.signOut().catch(() => undefined);
    setState((current) => ({ ...current, user: null }));
  }, []);

  const value = useMemo(() => ({ ...state, accept, signOut }), [state, accept, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
