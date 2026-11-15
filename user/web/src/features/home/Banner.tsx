import { buttonClass } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import type { CategoryFilter } from "@/features/catalog/Catalog.tsx";

export function Banner({ onPick }: { onPick: (filter: CategoryFilter) => void }) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-soft min-[900px]:h-[min(70vh,680px)] min-[900px]:min-h-[400px]">
      <img src="/assets/img/instagram/ig-04.jpg" alt="" loading="lazy" className="aspect-[4/5] w-full object-cover min-[900px]:aspect-auto min-[900px]:size-full" />
      <div className="flex flex-col items-start gap-2.5 px-[clamp(16px,3.5vw,48px)] py-[22px] min-[900px]:absolute min-[900px]:right-[clamp(16px,3.5vw,48px)] min-[900px]:bottom-[clamp(16px,3.5vw,48px)] min-[900px]:z-10 min-[900px]:w-[min(440px,calc(100%-96px))] min-[900px]:bg-white min-[900px]:p-[clamp(20px,2.4vw,32px)]">
        <h2 className="text-[clamp(28px,3.2vw,42px)] font-bold">{t.banner.title}</h2>
        <a href="#catalog" onClick={() => onPick("outerwear")} className={cn(buttonClass(), "mt-2")}>
          {t.banner.cta}
        </a>
      </div>
    </section>
  );
}
