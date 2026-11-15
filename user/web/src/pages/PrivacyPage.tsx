import { PRIVACY_UPDATED, privacy } from "@/content/privacy.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { formatLongDate } from "@/lib/format.ts";
import { InfoPage } from "./InfoPage.tsx";

export function PrivacyPage() {
  const { lang } = useI18n();
  return <InfoPage content={privacy[lang]} tokens={{ updated: formatLongDate(PRIVACY_UPDATED, lang) }} />;
}
