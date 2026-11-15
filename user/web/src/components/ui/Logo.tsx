import { cn } from "@/lib/cn.ts";

type Tone = "dark" | "light";

const COLORS: Record<Tone, { tag: string; cut: string; word: string; sub: string }> = {
  dark: { tag: "#111111", cut: "#ffffff", word: "text-ink", sub: "text-muted" },
  light: { tag: "#ffffff", cut: "#111111", word: "text-white", sub: "text-[#9a9a9a]" }
};

export function LogoMark({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const { tag, cut } = COLORS[tone];
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M0 0H48V35L35 48H0Z" fill={tag} />
      <path d="M9 10H39V19H28.5V39H19.5V19H9Z" fill={cut} />
    </svg>
  );
}

export function Logo({ tone = "dark", compact = false, className }: { tone?: Tone; compact?: boolean; className?: string }) {
  const colors = COLORS[tone];
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className="size-8 md:size-[34px]" />
      <span className={cn("flex items-baseline gap-[5px] whitespace-nowrap text-lg leading-none font-extrabold tracking-[-0.035em] md:text-[21px]", colors.word)}>
        Trendly
        <span className={cn("font-medium tracking-[-0.02em]", colors.sub, compact && "max-[420px]:hidden")}>Shop</span>
      </span>
    </span>
  );
}
