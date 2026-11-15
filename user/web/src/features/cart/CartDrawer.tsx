import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button.tsx";
import { CloseIcon } from "@/components/ui/icons.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import { formatAmd } from "@/lib/format.ts";
import { useCart } from "@/state/CartProvider.tsx";
import { useShop } from "@/state/ShopProvider.tsx";
import { CartLines } from "./CartLines.tsx";
import { CheckoutForm } from "./CheckoutForm.tsx";

export function CartDrawer() {
  const { t } = useI18n();
  const { settings } = useShop();
  const { isOpen, close, entries, subtotal } = useCart();
  const [view, setView] = useState<"cart" | "checkout">("cart");
  const [mounted, setMounted] = useState(isOpen);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fee = settings.deliveryFee;
  const total = subtotal + (fee ?? 0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setView("cart");
      const previous = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => closeRef.current?.focus());
      const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
      document.addEventListener("keydown", onKey);
      return () => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
        previous?.focus();
      };
    }
    const timer = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [isOpen, close]);

  if (!mounted && !isOpen) return null;

  return (
    <>
      <div
        onClick={close}
        className={cn("fixed inset-0 z-40 bg-black/40 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-white transition-transform duration-300 ease-shop",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id="cart-title" className="text-xl">{t.cart.title}</h2>
          <button ref={closeRef} type="button" onClick={close} aria-label={t.cart.close} className="grid size-10 place-items-center">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 pt-1 pb-5">
          {view === "cart" ? <CartLines /> : <CheckoutForm total={total} onBack={() => setView("cart")} />}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-line px-5 pt-4 pb-5">
            <dl className="mb-4 text-sm text-muted">
              <div className="flex justify-between py-[3px]"><dt>{t.cart.subtotal}</dt><dd className="text-ink">{formatAmd(subtotal)}</dd></div>
              <div className="flex justify-between py-[3px]">
                <dt>{t.cart.delivery}</dt>
                <dd className="text-ink">{fee === null ? t.cart.deliveryConfirm : formatAmd(fee)}</dd>
              </div>
              <div className="mt-1.5 flex justify-between border-t border-line pt-2.5 text-[15px] font-semibold text-ink">
                <dt>{t.cart.total}</dt>
                <dd className="text-lg font-bold">{formatAmd(total)}</dd>
              </div>
            </dl>
            {view === "cart" && (
              <Button block onClick={() => setView("checkout")}>{t.cart.checkout}</Button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
