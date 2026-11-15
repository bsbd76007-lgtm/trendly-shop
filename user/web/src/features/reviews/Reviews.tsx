import { useState } from "react";
import { Container } from "@/components/layout/Container.tsx";
import { Button } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { fill, formatLongDate } from "@/lib/format.ts";
import { useShop } from "@/state/ShopProvider.tsx";
import { ReviewForm } from "./ReviewForm.tsx";
import { Stars } from "./Stars.tsx";

const PAGE = 8;

export function Reviews() {
  const { t, lang } = useI18n();
  const { reviews, settings } = useShop();
  const [shown, setShown] = useState(PAGE);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="pb-[clamp(48px,7vw,88px)]">
      <Container>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-line pt-[clamp(48px,7vw,88px)]">
          <h2 id="reviews-title" className="text-[clamp(24px,2.6vw,34px)]">{t.reviews.title}</h2>
          {reviews.length ? (
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none font-bold text-ink">{average.toFixed(1)}</span>
              <Stars value={Math.round(average)} />
              <span className="text-sm text-muted">{fill(t.reviews.count, { n: reviews.length })}</span>
            </div>
          ) : (
            <p className="text-sm text-muted">{t.reviews.empty}</p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="grid gap-3 min-[421px]:grid-cols-2 min-[1100px]:grid-cols-4">
            {reviews.slice(0, shown).map((review) => (
              <article key={review.id} className="flex flex-col gap-3 border border-line p-5">
                <Stars value={review.rating} />
                <p className="flex-1 text-sm text-ink">{review.text}</p>
                {review.reply && (
                  <p className="bg-soft px-3 py-2.5 text-[13px]">
                    <b className="font-semibold text-ink">{settings.name}:</b> {review.reply}
                  </p>
                )}
                <p className="text-[13px] text-muted">
                  <b className="font-semibold text-body">{review.name}</b> · {formatLongDate(review.date, lang)}
                </p>
              </article>
            ))}
          </div>
        )}

        {shown < reviews.length && (
          <Button variant="outline" className="mt-5" onClick={() => setShown((count) => count + PAGE)}>
            {t.reviews.more}
          </Button>
        )}

        <ReviewForm />
      </Container>
    </section>
  );
}
