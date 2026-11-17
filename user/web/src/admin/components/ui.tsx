import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link } from "react-router";
import type { OrderStatus, PaymentStatus } from "@shared/types.ts";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons.tsx";
import { cn } from "@/lib/cn.ts";
import { PAYMENT_LABELS, PAYMENT_STYLES, STATUS_LABELS, STATUS_STYLES } from "../lib/labels.ts";

type Tone = "default" | "primary" | "danger";

const TONES: Record<Tone, string> = {
  default: "border-line-strong bg-white text-ink hover:border-ink",
  primary: "border-ink bg-ink text-white hover:border-[#333] hover:bg-[#333]",
  danger: "border-line-strong bg-white text-red-700 hover:border-red-700 hover:bg-red-50"
};

export const adminButton = (tone: Tone = "default", small = false) =>
  cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap border font-medium no-underline disabled:cursor-default disabled:opacity-50",
    small ? "min-h-[30px] px-2.5 text-[13px]" : "min-h-9 px-3.5 text-sm",
    TONES[tone]
  );

export function AdminButton({ tone, small, className, type = "button", ...props }: { tone?: Tone; small?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(adminButton(tone, small), className)} {...props} />;
}

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn(adminButton("default", true), "w-[30px] px-0", className)} {...props} />;
}

export const controlClass = "min-h-[38px] w-full border border-line-strong bg-white px-[11px] py-2 text-sm text-ink outline-none focus:border-ink disabled:bg-soft";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function Field({ label, hint, className, children }: FieldProps & { children: ReactNode }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint && <small className="text-xs text-muted">{hint}</small>}
    </label>
  );
}

export function Input({ label, hint, className, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input className={controlClass} {...props} />
    </Field>
  );
}

export function PasswordInput({ label, hint, className, ...props }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} className={className}>
      <span className="relative flex">
        <input type={visible ? "text" : "password"} className={cn(controlClass, "pr-10")} autoCapitalize="none" autoCorrect="off" spellCheck={false} {...props} />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-ink"
        >
          {visible ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
        </button>
      </span>
    </Field>
  );
}

export function Select({ label, hint, className, children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select className={controlClass} {...props}>{children}</select>
    </Field>
  );
}

export function TextArea({ label, hint, className, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea className={cn(controlClass, "min-h-[84px] resize-y")} {...props} />
    </Field>
  );
}

export function Checkbox({ label, className, ...props }: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 font-medium text-ink", className)}>
      <input type="checkbox" className="size-4 accent-ink" {...props} />
      {label}
    </label>
  );
}

export function Panel({ title, actions, children, className, bodyClassName }: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-3.5">
          <h2 className="text-[17px] font-bold">{title}</h2>
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, back, actions }: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <>
      {back && <Link to={back.to} className="mb-2 inline-block text-[13px] text-muted no-underline hover:text-ink">← {back.label}</Link>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={PAYMENT_STYLES[status]}>{PAYMENT_LABELS[status]}</Badge>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap px-2 text-xs font-semibold", className ?? "bg-stone-100 text-body")}>{children}</span>;
}

export function FilterTabs<T extends string>({ value, options, onChange }: {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 border px-3 font-medium",
            value === option.value ? "border-ink bg-white text-ink" : "border-transparent text-muted hover:text-ink"
          )}
        >
          {option.label}
          {option.count !== undefined && <b className="text-xs font-semibold text-muted">{option.count}</b>}
        </button>
      ))}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-3">{children}</div>;
}

export function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} of 5`} className="tracking-[1px] text-ink">
      {"★".repeat(value)}
      <span className="text-line-strong">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function Loading() {
  return <p className="text-muted">Loading…</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted">{message}</p>
    </div>
  );
}

export const th = "whitespace-nowrap border-b border-line px-3.5 py-2.5 text-left text-xs font-semibold text-muted";
export const td = "border-b border-line px-3.5 py-2.5 align-middle";
