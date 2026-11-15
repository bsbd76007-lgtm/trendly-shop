import { RichText } from "@/components/ui/RichText.tsx";
import { faq } from "@/content/faq.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { DocumentShell, useInfoTokens } from "./InfoPage.tsx";

export function FaqPage() {
  const { lang } = useI18n();
  const content = faq[lang];
  const tokens = useInfoTokens();

  return (
    <DocumentShell title={content.title}>
      {content.items.map((item, index) => (
        <details key={`${lang}-${index}`} open={index === 0} className="group border-b border-line first-of-type:border-t">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[18px] text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden="true" className="shrink-0 text-[22px] leading-none font-normal">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <p className="max-w-[62ch] pb-5">
            <RichText text={item.a} tokens={tokens} />
          </p>
        </details>
      ))}
    </DocumentShell>
  );
}
