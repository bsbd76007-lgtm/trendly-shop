import { buttonClass, textLinkClass } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { instagramDm } from "@/lib/links.ts";
import { useShop } from "@/state/ShopProvider.tsx";
import type { CategoryFilter } from "@/features/catalog/Catalog.tsx";

const TILES: Array<{ img: string; cat: CategoryFilter }> = [
  { img: "/assets/img/instagram/ig-05.jpg", cat: "outerwear" },
  { img: "/assets/img/instagram/ig-08.jpg", cat: "tops" }
];

export function Hero({ onPick }: { onPick: (filter: CategoryFilter) => void }) {
  const { t } = useI18n();
  const { settings } = useShop();

  return (
    <section aria-labelledby="hero-title" className="relative grid grid-cols-1 gap-1 min-[900px]:h-[min(82vh,820px)] min-[900px]:min-h-[460px] min-[900px]:grid-cols-2">
      {TILES.map((tile, index) => (
        <a
          key={tile.img}
          href="#catalog"
          onClick={() => onPick(tile.cat)}
          className={index ? "relative hidden overflow-hidden bg-soft min-[900px]:block" : "group relative aspect-[4/5] overflow-hidden bg-soft min-[900px]:aspect-auto"}
        >
          <img src={tile.img} alt="" className="size-full object-cover transition-transform duration-700 ease-shop hover:scale-[1.02]" />
        </a>
      ))}
      <div className="px-[clamp(16px,3.5vw,48px)] pt-[22px] min-[900px]:absolute min-[900px]:bottom-[clamp(16px,3.5vw,48px)] min-[900px]:left-[clamp(16px,3.5vw,48px)] min-[900px]:z-10 min-[900px]:w-[min(500px,calc(100%-96px))] min-[900px]:bg-white min-[900px]:p-[clamp(20px,2.4vw,32px)]">
        <h1 id="hero-title" className="text-[clamp(30px,3.6vw,48px)] leading-[1.05] font-bold">{t.hero.title}</h1>
        <p className="mt-3">{t.hero.text}</p>
        <div className="mt-[22px] flex flex-wrap items-center gap-x-[22px] gap-y-3">
          <a href="#catalog" className={buttonClass()}>{t.hero.cta}</a>
          {settings.instagram && (
            <a className={textLinkClass} href={instagramDm(settings.instagram)} target="_blank" rel="noopener">{t.hero.instagram}</a>
          )}
        </div>
      </div>
    </section>
  );
}
