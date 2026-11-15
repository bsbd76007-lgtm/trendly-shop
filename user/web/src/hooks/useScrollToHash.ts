import { useEffect } from "react";
import { useLocation } from "react-router";

export function useScrollToHash(ready: boolean): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    if (!ready) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, ready]);
}
