import { Container } from "@/components/layout/Container.tsx";
import { textLinkClass } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { imageUrl } from "@/lib/format.ts";
import { instagramUrl } from "@/lib/links.ts";
import { useShop } from "@/state/ShopProvider.tsx";

export function InstagramGrid() {
  const { t } = useI18n();
  const { settings, instagram } = useShop();
  if (!instagram.length) return null;

  return (
    <section id="instagram" className="py-[clamp(48px,7vw,88px)]">
      <Container>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[clamp(24px,2.6vw,34px)]">{t.instagram.title}</h2>
          {settings.instagram && (
            <a className={textLinkClass} href={instagramUrl(settings.instagram)} target="_blank" rel="noopener">
              {t.instagram.follow} @{settings.instagram}
            </a>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 min-[900px]:grid-cols-4 min-[1100px]:grid-cols-6">
          {instagram.map((post) => (
            <a
              key={post.img}
              href={post.url || (settings.instagram ? instagramUrl(settings.instagram) : "#")}
              target="_blank"
              rel="noopener"
              className="aspect-square overflow-hidden bg-soft"
            >
              <img src={imageUrl(post.img)} alt="Instagram" loading="lazy" className="size-full object-cover transition-opacity hover:opacity-85" />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
