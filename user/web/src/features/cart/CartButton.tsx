import { CartIcon } from "@/components/ui/icons.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { useCart } from "@/state/CartProvider.tsx";

export function CartButton() {
  const { t } = useI18n();
  const { count, open, bumpKey } = useCart();

  return (
    <button type="button" onClick={open} aria-haspopup="dialog" className="relative grid size-10 place-items-center text-ink">
      <span key={bumpKey} className={bumpKey ? "animate-bump" : undefined}>
        <CartIcon className="size-[23px]" />
      </span>
      <span className="sr-only">{t.nav.cart}</span>
      {count > 0 && (
        <span className="absolute top-0.5 right-0 h-[17px] min-w-[17px] rounded-full bg-ink px-1 text-center text-[10px] leading-[17px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
