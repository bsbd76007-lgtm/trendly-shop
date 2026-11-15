import { cn } from "@/lib/cn.ts";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} / 5`} className={cn("inline-flex gap-px text-[15px] leading-none", className)}>
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index} className={index <= value ? "text-ink" : "text-line-strong"}>★</span>
      ))}
    </span>
  );
}
