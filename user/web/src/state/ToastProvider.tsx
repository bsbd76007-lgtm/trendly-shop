import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn.ts";

type Tone = "default" | "error";

interface ToastState {
  message: string;
  tone: Tone;
  visible: boolean;
}

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

export function ToastProvider({ children, placement = "center" }: { children: ReactNode; placement?: "center" | "right" }) {
  const [toast, setToast] = useState<ToastState>({ message: "", tone: "default", visible: false });
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, tone: Tone = "default") => {
    window.clearTimeout(timer.current);
    setToast({ message, tone, visible: true });
    timer.current = window.setTimeout(() => setToast((current) => ({ ...current, visible: false })), 2400);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-5 z-[60] max-w-[calc(100%-32px)] px-[18px] py-[11px] text-sm text-white transition duration-200",
          placement === "center" ? "left-1/2 -translate-x-1/2" : "right-5",
          toast.tone === "error" ? "bg-red-700" : "bg-ink",
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        )}
      >
        {toast.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}
