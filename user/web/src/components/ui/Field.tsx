import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn.ts";

export const inputClass =
  "w-full border border-line-strong bg-white px-[13px] py-[11px] text-[15px] text-ink outline-none focus:border-ink";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function TextField({ label, hint, className, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px] font-medium text-ink", className)}>
      <span>{label}</span>
      <input className={inputClass} {...props} />
      {hint && <small className="font-normal text-muted">{hint}</small>}
    </label>
  );
}

export function TextArea({ label, hint, className, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px] font-medium text-ink", className)}>
      <span>{label}</span>
      <textarea className={inputClass} {...props} />
      {hint && <small className="font-normal text-muted">{hint}</small>}
    </label>
  );
}

export function FormMessage({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  return (
    <p role="status" className={cn("min-h-[1.2em] text-[13px]", tone === "error" ? "text-error" : "text-ink")}>
      {children}
    </p>
  );
}
