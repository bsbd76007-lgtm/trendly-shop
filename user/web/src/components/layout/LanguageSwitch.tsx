import { LANGS } from "@shared/constants.ts";
import { LANG_LABELS, useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";

export function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t.nav.language} className={cn("flex gap-0.5", className)}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "px-1.5 py-1 text-xs font-medium text-muted hover:text-ink",
            lang === code && "font-bold text-ink"
          )}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
