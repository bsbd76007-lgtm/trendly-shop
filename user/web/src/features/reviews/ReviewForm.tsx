import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextArea, TextField } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { cn } from "@/lib/cn.ts";

export function ReviewForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      setMessage({ text: t.reviews.fill, error: true });
      return;
    }
    setSending(true);
    try {
      await shopApi.sendReview({ name, text, rating });
      setName("");
      setText("");
      setRating(5);
      setMessage({ text: t.reviews.thanks, error: false });
    } catch {
      setMessage({ text: t.reviews.error, error: true });
    } finally {
      setSending(false);
    }
  };

  const shown = hover || rating;

  return (
    <form noValidate onSubmit={onSubmit} className="mt-[clamp(36px,5vw,56px)] flex max-w-[520px] flex-col gap-3.5">
      <h3 className="text-[22px]">{t.reviews.write}</h3>
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1 text-[13px] font-medium text-ink">{t.reviews.rating}</legend>
        <div className="inline-flex gap-0.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span className={cn("text-[28px] leading-none transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-ink", value <= shown ? "text-ink" : "text-line-strong")}>
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <TextField label={t.reviews.name} maxLength={60} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextArea label={t.reviews.text} rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      <FormMessage tone={message?.error ? "error" : "info"}>{message?.text}</FormMessage>
      <Button type="submit" disabled={sending} className="min-w-[180px] self-start">{t.reviews.send}</Button>
    </form>
  );
}
