import type { Category } from "@shared/types.ts";
import { Container } from "@/components/layout/Container.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import type { CategoryFilter } from "@/features/catalog/Catalog.tsx";

const TILES: Array<{ cat: Category; img: string }> = [
  { cat: "outerwear", img: "/assets/img/instagram/ig-01.jpg" },
  { cat: "tops", img: "/assets/img/instagram/ig-06.jpg" },
  { cat: "bottoms", img: "/assets/img/instagram/ig-02.jpg" },
  { cat: "shoes", img: "/assets/img/instagram/ig-12.jpg" }
];

export function CategoryTiles({ onPick }: { onPick: (filter: CategoryFilter) => void }) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="cats-title" className="pt-[clamp(48px,7vw,88px)]">
      <Container>
        <h2 id="cats-title" className="text-[clamp(24px,2.6vw,34px)]">{t.categories.title}</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-2.5 gap-y-5 min-[900px]:grid-cols-4 min-[900px]:gap-3">
          {TILES.map((tile) => (
            <a key={tile.cat} href="#catalog" onClick={() => onPick(tile.cat)} className="group no-underline">
              <span className="block aspect-[3/4] overflow-hidden bg-soft">
                <img src={tile.img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 ease-shop group-hover:scale-[1.03]" />
              </span>
              <span className="mt-2.5 block text-[15px] font-semibold text-ink group-hover:underline group-hover:underline-offset-4">
                {t.categories[tile.cat]}
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
