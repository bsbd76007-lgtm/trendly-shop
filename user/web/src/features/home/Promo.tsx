import { Container } from "@/components/layout/Container.tsx";
import { ButtonLink } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";

export function Promo() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="promo-title" className="mt-[clamp(48px,7vw,88px)]">
      <Container className="grid items-center gap-x-8 gap-y-2 bg-soft py-6 min-[900px]:grid-cols-[auto_1fr_auto] min-[900px]:py-7">
        <h2 id="promo-title" className="text-[clamp(26px,3vw,40px)] font-bold">{t.promo.title}</h2>
        <p className="max-w-[46ch]">{t.promo.text}</p>
        <ButtonLink to="/account#signup" className="justify-self-start">{t.promo.cta}</ButtonLink>
      </Container>
    </section>
  );
}
