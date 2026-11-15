import { CATEGORIES } from "@shared/constants.ts";
import type { Category } from "@shared/types.ts";
import { Container } from "@/components/layout/Container.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import { useShop } from "@/state/ShopProvider.tsx";
import { ProductCard } from "./ProductCard.tsx";

export type CategoryFilter = Category | "all";

export function Catalog({ filter, onFilter }: { filter: CategoryFilter; onFilter: (filter: CategoryFilter) => void }) {
  const { t } = useI18n();
  const { status, products } = useShop();
  const visible = filter === "all" ? products : products.filter((product) => product.cat === filter);
  const filters: CategoryFilter[] = ["all", ...CATEGORIES];

  return (
    <section id="catalog" className="py-[clamp(48px,7vw,88px)]">
      <Container>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3.5">
          <h2 className="text-[clamp(24px,2.6vw,34px)]">{t.catalog.title}</h2>
          <div
            role="tablist"
            className="flex max-w-full gap-2 overflow-x-auto [scrollbar-width:none] min-[900px]:flex-wrap"
          >
            {filters.map((item) => {
              const count = item === "all" ? products.length : products.filter((product) => product.cat === item).length;
              const active = filter === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onFilter(item)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 border px-3.5 text-[13px] font-medium",
                    active ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-body hover:border-ink"
                  )}
                >
                  {t.categories[item]}
                  <span className={cn("text-[11px]", active ? "text-[#bdbdbd]" : "text-muted")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {status === "error" ? (
          <p className="py-10 text-muted">{t.catalog.loadError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-[30px] min-[900px]:grid-cols-3 min-[900px]:gap-x-3 min-[900px]:gap-y-9 min-[1100px]:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
