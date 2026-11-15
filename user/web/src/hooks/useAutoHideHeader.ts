import { useCallback, useEffect, useState, type RefObject } from "react";

const THRESHOLD = 6;

export function useAutoHideHeader(ref: RefObject<HTMLElement | null>, locked: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      const height = ref.current?.offsetHeight ?? 64;
      if (locked || y < height * 2) setHidden(false);
      else if (delta > THRESHOLD) setHidden(true);
      else if (delta < -THRESHOLD) setHidden(false);
      if (Math.abs(delta) > THRESHOLD) lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, locked]);

  const reveal = useCallback(() => setHidden(false), []);
  return { hidden: hidden && !locked, reveal };
}
