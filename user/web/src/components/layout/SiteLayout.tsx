import { Outlet } from "react-router";
import { CartDrawer } from "@/features/cart/CartDrawer.tsx";
import { SupportWidget } from "@/features/support/SupportWidget.tsx";
import { useScrollToHash } from "@/hooks/useScrollToHash.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { useShop } from "@/state/ShopProvider.tsx";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";

export function SiteLayout() {
  const { t } = useI18n();
  const { status } = useShop();
  useScrollToHash(status !== "loading");

  return (
    <>
      <a href="#main" className="absolute -left-[999px] top-2 z-[100] bg-ink px-3.5 py-2 text-white focus:left-2">
        {t.skipToContent}
      </a>
      <div className="bg-ink px-4 py-2 text-center text-[13px] font-medium text-white">{t.announce}</div>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SupportWidget />
    </>
  );
}
