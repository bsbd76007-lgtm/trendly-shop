import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Stats } from "@shared/types.ts";
import { useToast } from "@/state/ToastProvider.tsx";
import { adminApi } from "./lib/adminApi.ts";
import { errorMessage } from "./lib/labels.ts";

interface AdminValue {
  counts: { orders: number; reviews: number; support: number };
  refreshCounts: () => Promise<Stats | undefined>;
  notify: (message: string) => void;
  fail: (error: unknown) => void;
}

const AdminContext = createContext<AdminValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [counts, setCounts] = useState({ orders: 0, reviews: 0, support: 0 });
  const seen = useRef<{ orders: number; payments: number; messages: number } | null>(null);

  const fail = useCallback((error: unknown) => toast(errorMessage(error), "error"), [toast]);

  const refreshCounts = useCallback(async () => {
    try {
      const stats = await adminApi.stats();
      setCounts({ orders: stats.orders.needsAction, reviews: stats.reviews.pending, support: stats.support.unreadChats });
      const now = { orders: stats.orders.total, payments: stats.orders.paymentsToCheck, messages: stats.support.unreadMessages };
      if (seen.current) {
        if (now.payments > seen.current.payments) toast("💳 New payment to check");
        else if (now.messages > seen.current.messages) toast("💬 New support message");
        else if (now.orders > seen.current.orders) toast("🛍 New order");
      }
      seen.current = now;
      return stats;
    } catch (error) {
      fail(error);
      return undefined;
    }
  }, [fail, toast]);

  useEffect(() => {
    void refreshCounts();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshCounts();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshCounts]);

  const value = useMemo(() => ({ counts, refreshCounts, notify: (message: string) => toast(message), fail }), [counts, refreshCounts, toast, fail]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminProvider");
  return value;
}
