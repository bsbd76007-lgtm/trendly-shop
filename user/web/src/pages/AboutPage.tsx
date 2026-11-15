import { about } from "@/content/about.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { InfoPage } from "./InfoPage.tsx";

export function AboutPage() {
  const { lang } = useI18n();
  return <InfoPage content={about[lang]} />;
}
