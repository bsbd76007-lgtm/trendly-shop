import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Stats } from "@shared/types.ts";
import { useToast } from "@/state/ToastProvider.tsx";
import { adminApi } from "./lib/adminApi.ts";
import { errorMessage } from "./lib/labels.ts";

interface AdminValue {
  counts: { orders: number; reviews: number };
  refreshCounts: () => Promise<Stats | undefined>;
  notify: (message: string) => void;
  fail: (error: unknown) => void;
}

const AdminContext = createContext<AdminValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [counts, setCounts] = useState({ orders: 0, reviews: 0 });

  const fail = useCallback((error: unknown) => toast(errorMessage(error), "error"), [toast]);

  const refreshCounts = useCallback(async () => {
    try {
      const stats = await adminApi.stats();
      setCounts({ orders: stats.orders.byStatus.new, reviews: stats.reviews.pending });
      return stats;
    } catch (error) {
      fail(error);
      return undefined;
    }
  }, [fail]);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

  const value = useMemo(() => ({ counts, refreshCounts, notify: (message: string) => toast(message), fail }), [counts, refreshCounts, toast, fail]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminProvider");
  return value;
}
