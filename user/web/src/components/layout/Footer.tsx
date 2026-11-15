import { Link } from "react-router";
import { Logo } from "@/components/ui/Logo.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { contactLinks } from "@/lib/links.ts";
import { useShop } from "@/state/ShopProvider.tsx";
import { Container } from "./Container.tsx";

const footerLink = "text-white no-underline hover:underline hover:underline-offset-4";

export function Footer() {
  const { t } = useI18n();
  const { settings } = useShop();

  return (
    <footer id="contact" className="bg-ink py-10 text-sm text-[#bdbdbd]">
      <Container className="flex flex-wrap items-center justify-between gap-5 max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <Logo tone="light" className="mb-2" />
          <p>{t.footer.city}</p>
        </div>
        <nav aria-label="Info" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className={footerLink} to="/about">{t.nav.about}</Link>
          <Link className={footerLink} to="/faq">{t.nav.faq}</Link>
          <Link className={footerLink} to="/privacy">{t.nav.privacy}</Link>
        </nav>
        <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          {contactLinks(settings).map((link) => (
            <li key={link.href}>
              <a className={footerLink} href={link.href} {...(link.external ? { target: "_blank", rel: "noopener" } : {})}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
