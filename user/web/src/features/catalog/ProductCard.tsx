import { useState } from "react";
import type { PublicProduct } from "@shared/types.ts";
import { ButtonAnchor, buttonClass } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import { formatAmd, imageUrl } from "@/lib/format.ts";
import { instagramDm } from "@/lib/links.ts";
import { useCart } from "@/state/CartProvider.tsx";
import { useShop } from "@/state/ShopProvider.tsx";
import { useToast } from "@/state/ToastProvider.tsx";

function ProductImage({ product }: { product: PublicProduct }) {
  const { t, lang } = useI18n();
  const [broken, setBroken] = useState(false);
  const empty = !product.img || broken;

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-soft">
      {empty ? (
        <div className="absolute inset-0 flex flex-col justify-between p-3.5">
          <b className="text-[15px] font-bold text-ink">{product.brand}</b>
          <small className="text-xs text-muted">{t.catalog.noPhoto}</small>
        </div>
      ) : (
        <img
          src={imageUrl(product.img)}
          alt={product.name[lang]}
          loading="lazy"
          onError={() => setBroken(true)}
          className="size-full object-cover transition-transform duration-700 ease-shop group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: PublicProduct }) {
  const { t, lang } = useI18n();
  const { settings } = useShop();
  const { add } = useCart();
  const toast = useToast();
  const sizes = settings.sizes[product.sizes] ?? [];
  const [size, setSize] = useState(sizes[1] ?? sizes[0] ?? "");
  const name = product.name[lang];

  const onAdd = () => {
    add(product.id, size);
    toast(`${t.catalog.added}: ${name}${size ? ` · ${size}` : ""}`);
  };

  return (
    <article id={`p-${product.id}`} className="group flex flex-col">
      <ProductImage product={product} />
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <h3 className="text-sm leading-snug font-medium tracking-normal text-ink">{name}</h3>
        {typeof product.price === "number" ? (
          <>
            <p className="text-[15px] font-bold text-ink tabular-nums">{formatAmd(product.price)}</p>
            {sizes.length ? (
              <fieldset className="mb-1 flex min-h-[30px] flex-wrap gap-1 border-0 p-0">
                <legend className="sr-only">{t.catalog.size}</legend>
                {sizes.map((value) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name={`size-${product.id}`}
                      value={value}
                      checked={size === value}
                      onChange={() => setSize(value)}
                      className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
                    />
                    <span
                      className={cn(
                        "grid h-[30px] min-w-[34px] place-items-center border border-line-strong bg-white px-1.5 text-xs font-medium text-body",
                        "peer-hover:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                        "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white"
                      )}
                    >
                      {value}
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <p className="flex min-h-[30px] items-center text-xs text-muted">{t.catalog.oneSize}</p>
            )}
            <button type="button" onClick={onAdd} className={cn(buttonClass({ variant: "outline", size: "sm", block: true }), "mt-auto")}>
              {t.catalog.add}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] font-medium text-muted">{t.catalog.priceOnRequest}</p>
            <ButtonAnchor variant="outline" size="sm" block className="mt-auto" href={instagramDm(settings.instagram)} target="_blank" rel="noopener">
              {t.catalog.askOnInstagram}
            </ButtonAnchor>
          </>
        )}
      </div>
    </article>
  );
}
