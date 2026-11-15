import { ButtonLink } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { DocumentShell } from "./InfoPage.tsx";

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <DocumentShell title={t.notFound.title}>
      <ButtonLink to="/">{t.notFound.back}</ButtonLink>
    </DocumentShell>
  );
}
