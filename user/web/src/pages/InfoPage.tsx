import { useEffect, type ReactNode } from "react";
import { Container } from "@/components/layout/Container.tsx";
import { RichText } from "@/components/ui/RichText.tsx";
import type { Block, InfoContent } from "@/content/types.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { contactLinks, instagramUrl } from "@/lib/links.ts";
import { useShop } from "@/state/ShopProvider.tsx";

const link = "text-ink underline underline-offset-[3px]";

export function useInfoTokens(extra: Record<string, ReactNode> = {}) {
  const { settings } = useShop();
  return {
    instagram: settings.instagram ? (
      <a className={link} href={instagramUrl(settings.instagram)} target="_blank" rel="noopener">@{settings.instagram}</a>
    ) : "Instagram",
    ...extra
  };
}

export function DocumentShell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} — Trendly Shop`;
    return () => {
      document.title = "Trendly Shop";
    };
  }, [title]);

  return (
    <Container>
      <article className="max-w-[760px] pt-[clamp(40px,6vw,72px)] pb-[clamp(56px,8vw,96px)] text-base leading-[1.65]">
        <h1 className="mb-6 text-[clamp(30px,4vw,44px)] font-bold">{title}</h1>
        {children}
      </article>
    </Container>
  );
}

function Contacts() {
  const { settings } = useShop();
  return (
    <ul className="mt-3 list-none space-y-2 p-0">
      {contactLinks(settings).map((item) => (
        <li key={item.href}>
          <a className={link} href={item.href} {...(item.external ? { target: "_blank", rel: "noopener" } : {})}>{item.label}</a>
        </li>
      ))}
    </ul>
  );
}

function BlockView({ block, tokens }: { block: Block; tokens: Record<string, ReactNode> }) {
  switch (block.kind) {
    case "lead":
      return <p className="mb-1 text-xl font-medium text-ink"><RichText text={block.text} tokens={tokens} /></p>;
    case "meta":
      return <p className="mb-5 text-sm text-muted"><RichText text={block.text} tokens={tokens} /></p>;
    case "p":
      return <p className="mt-3"><RichText text={block.text} tokens={tokens} /></p>;
    case "h2":
      return <h2 className="mt-9 mb-3 text-xl font-bold">{block.text}</h2>;
    case "list":
      return (
        <ul className="m-0 list-disc space-y-2 pl-5">
          {block.items.map((item, index) => (
            <li key={index}>
              {typeof item === "string" ? (
                <RichText text={item} tokens={tokens} />
              ) : (
                <>
                  <b className="font-semibold text-ink">{item.label}</b> <RichText text={item.text} tokens={tokens} />
                </>
              )}
            </li>
          ))}
        </ul>
      );
    case "contacts":
      return <Contacts />;
  }
}

export function InfoPage({ content, tokens = {} }: { content: InfoContent; tokens?: Record<string, ReactNode> }) {
  const { lang } = useI18n();
  const allTokens = useInfoTokens(tokens);
  return (
    <DocumentShell title={content.title}>
      {content.blocks.map((block, index) => (
        <BlockView key={`${lang}-${index}`} block={block} tokens={allTokens} />
      ))}
    </DocumentShell>
  );
}
