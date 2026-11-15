import { useRef } from "react";
import { Link, NavLink } from "react-router";
import { LogoMark } from "@/components/ui/Logo.tsx";
import { UserIcon } from "@/components/ui/icons.tsx";
import { CartButton } from "@/features/cart/CartButton.tsx";
import { useAutoHideHeader } from "@/hooks/useAutoHideHeader.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import { useCart } from "@/state/CartProvider.tsx";
import { Container } from "./Container.tsx";
import { LanguageSwitch } from "./LanguageSwitch.tsx";

const navLink = "text-sm font-medium text-body no-underline hover:text-ink hover:underline hover:underline-offset-[6px]";
const activeLink = ({ isActive }: { isActive: boolean }) => cn(navLink, isActive && "text-ink underline underline-offset-[6px]");

export function Header() {
  const { t } = useI18n();
  const { isOpen } = useCart();
  const ref = useRef<HTMLElement>(null);
  const { hidden, reveal } = useAutoHideHeader(ref, isOpen);

  return (
    <header
      ref={ref}
      onFocus={reveal}
      className={cn(
        "sticky top-0 z-30 border-b border-line bg-white transition-transform duration-300 ease-shop",
        hidden && "-translate-y-full"
      )}
    >
      <Container className="grid h-[58px] grid-cols-[auto_1fr] items-center min-[900px]:h-16 min-[900px]:grid-cols-[1fr_auto_1fr]">
        <nav aria-label="Main" className="hidden gap-6 min-[900px]:flex">
          <Link className={navLink} to={{ pathname: "/", hash: "#catalog" }}>{t.nav.catalog}</Link>
          <Link className={navLink} to={{ pathname: "/", hash: "#reviews" }}>{t.nav.reviews}</Link>
          <NavLink className={activeLink} to="/about">{t.nav.about}</NavLink>
          <NavLink className={activeLink} to="/faq">{t.nav.faq}</NavLink>
          <a className={navLink} href="#contact">{t.nav.contact}</a>
        </nav>

        <Link to="/" aria-label="Trendly Shop" className="flex items-center gap-2.5 text-ink no-underline">
          <LogoMark className="size-[30px] min-[900px]:size-[34px]" />
          <span className="flex items-baseline gap-[5px] whitespace-nowrap text-lg leading-none font-extrabold tracking-[-0.035em] min-[900px]:text-[21px]">
            Trendly
            <span className="font-medium tracking-[-0.02em] text-muted max-[420px]:hidden">Shop</span>
          </span>
        </Link>

        <div className="flex items-center justify-end gap-3.5">
          <LanguageSwitch />
          <Link to="/account" aria-label={t.nav.account} className="grid size-10 place-items-center text-ink">
            <UserIcon className="size-[23px]" />
          </Link>
          <CartButton />
        </div>
      </Container>
    </header>
  );
}
