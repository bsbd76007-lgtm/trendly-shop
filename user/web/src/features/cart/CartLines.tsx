import { useI18n } from "@/i18n/I18nProvider.tsx";
import { formatAmd, imageUrl } from "@/lib/format.ts";
import { useCart } from "@/state/CartProvider.tsx";

export function CartLines() {
  const { t, lang } = useI18n();
  const { entries, changeQty, remove } = useCart();

  if (!entries.length) return <p className="py-10 text-muted">{t.cart.empty}</p>;

  return (
    <ul className="m-0 list-none p-0">
      {entries.map((entry, index) => (
        <li key={`${entry.id}-${entry.size}`} className="grid grid-cols-[68px_1fr_auto] gap-3.5 border-b border-line py-4">
          <div className="h-[90px] w-[68px] overflow-hidden bg-soft">
            {entry.product.img && (
              <img src={imageUrl(entry.product.img)} alt="" className="size-full object-cover" onError={(event) => event.currentTarget.remove()} />
            )}
          </div>
          <div>
            <p className="leading-snug font-medium text-ink">{entry.product.name[lang]}</p>
            <p className="mt-0.5 mb-2 text-[13px] text-muted">{entry.size ? `${t.catalog.size}: ${entry.size}` : t.catalog.oneSize}</p>
            <div className="inline-flex items-center border border-line-strong">
              <button type="button" aria-label={t.cart.decrease} onClick={() => changeQty(index, -1)} className="h-[30px] w-[30px] hover:bg-soft">−</button>
              <span className="min-w-6 text-center text-[13px] font-medium">{entry.qty}</span>
              <button type="button" aria-label={t.cart.increase} onClick={() => changeQty(index, 1)} className="h-[30px] w-[30px] hover:bg-soft">+</button>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between font-semibold whitespace-nowrap text-ink">
            <p>{formatAmd(entry.product.price * entry.qty)}</p>
            <button type="button" onClick={() => remove(index)} className="text-[13px] font-normal text-muted underline underline-offset-[3px] hover:text-ink">
              {t.cart.remove}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
