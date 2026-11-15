import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn.ts";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-[clamp(16px,3.5vw,48px)]", className)} {...props} />;
}
