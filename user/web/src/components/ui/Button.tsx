import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "@/lib/cn.ts";

type Variant = "primary" | "outline" | "light";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  primary: "border-ink bg-ink text-white hover:border-[#333] hover:bg-[#333]",
  outline: "border-line-strong bg-white text-ink hover:border-ink",
  light: "border-white bg-white text-ink"
};

const SIZES: Record<Size, string> = {
  md: "min-h-[46px] px-6 text-sm",
  sm: "min-h-10 px-3.5 text-[13px]"
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const buttonClass = ({ variant = "primary", size = "md", block = false }: StyleProps = {}) =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium no-underline transition-colors duration-200 disabled:cursor-default disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full"
  );

export function Button({ variant, size, block, className, type = "button", ...props }: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(buttonClass({ variant, size, block }), className)} {...props} />;
}

export function ButtonLink({ variant, size, block, className, ...props }: StyleProps & LinkProps) {
  return <Link className={cn(buttonClass({ variant, size, block }), className)} {...props} />;
}

export function ButtonAnchor({ variant, size, block, className, ...props }: StyleProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn(buttonClass({ variant, size, block }), className)} {...props} />;
}

export const textLinkClass = "text-sm font-medium text-ink underline underline-offset-4 hover:text-muted";
