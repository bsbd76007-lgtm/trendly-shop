import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import type { OrderView, PaymentCard, PaymentStatus } from "@shared/types.ts";
import { Container } from "@/components/layout/Container.tsx";
import { Button, ButtonLink } from "@/components/ui/Button.tsx";
import { FormMessage } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { cn } from "@/lib/cn.ts";
import { fill, formatAmd } from "@/lib/format.ts";
import { HttpError } from "@/lib/http.ts";
import { resizeToJpeg } from "@/lib/image.ts";
import { contactLinks } from "@/lib/links.ts";
import { trackPath } from "@/lib/myOrders.ts";
import { useShop } from "@/state/ShopProvider.tsx";

const groupDigits = (number: string) => number.replace(/(\d{4})(?=\d)/g, "$1 ");

function CardRow({ card }: { card: PaymentCard }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await navigator.clipboard.writeText(card.number).then(() => true, () => false);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <li className="flex items-center justify-between gap-3 border border-line p-4">
      <div className="min-w-0">
        <div className="text-xs font-medium tracking-wide text-muted uppercase">{card.bank || t.pay.card}</div>
        <div className="mt-1 font-mono text-lg font-semibold tracking-wider text-ink tabular-nums">{groupDigits(card.number)}</div>
        {card.holder && <div className="mt-0.5 text-[13px] text-muted">{t.pay.holder}: {card.holder}</div>}
      </div>
      <Button variant="outline" size="sm" onClick={() => void copy()}>{copied ? t.pay.copied : t.pay.copy}</Button>
    </li>
  );
}

function StatusBanner({ status }: { status: PaymentStatus }) {
  const { t } = useI18n();
  const content: Record<PaymentStatus, { title: string; text?: string; tone: string }> = {
    awaiting: { title: t.pay.awaitingTitle, text: t.pay.howTo, tone: "border-line bg-soft" },
    submitted: { title: t.pay.submittedTitle, text: t.pay.submittedText, tone: "border-amber-300 bg-amber-50" },
    paid: { title: t.pay.paidTitle, text: t.pay.paidText, tone: "border-emerald-300 bg-emerald-50" },
    rejected: { title: t.pay.rejectedTitle, text: t.pay.rejectedText, tone: "border-red-300 bg-red-50" }
  };
  const { title, text, tone } = content[status];
  return (
    <div role="status" className={cn("border p-4", tone)}>
      <div className="flex items-center gap-2.5 text-base font-semibold text-ink">
        {status === "submitted" && <span className="size-2.5 animate-pulse rounded-full bg-amber-500" />}
        {status === "paid" && <span className="text-emerald-700">✓</span>}
        {title}
      </div>
      {text && <p className="mt-1 text-sm text-ink/80">{text}</p>}
    </div>
  );
}

export function PayPage() {
  const { t } = useI18n();
  const { settings } = useShop();
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const navigate = useNavigate();
  const [view, setView] = useState<OrderView | null>(null);
  const [missing, setMissing] = useState(false);
  const [receipt, setReceipt] = useState<string>();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setView(await shopApi.order(id, token));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) setMissing(true);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const pickReceipt = async (file: File | undefined) => {
    if (!file) return;
    setMessage("");
    try {
      setReceipt(await resizeToJpeg(file));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.pay.failed);
    }
  };

  const submit = async () => {
    setSending(true);
    setMessage("");
    try {
      await shopApi.submitPayment(id, token, receipt);
      navigate(trackPath(id, token), { replace: true });
    } catch {
      setMessage(t.pay.failed);
    } finally {
      setSending(false);
    }
  };

  if (missing) {
    return (
      <Container className="py-16">
        <h1 className="text-2xl">{t.pay.title}</h1>
        <p className="mt-3 text-muted">{t.pay.notFound}</p>
        <ButtonLink to="/" className="mt-6">{t.notFound.back}</ButtonLink>
      </Container>
    );
  }

  if (!view) return <Container className="py-16 text-muted">…</Container>;
  if (view.payment === "submitted" || view.payment === "paid" || view.status === "cancelled") return <Navigate to={trackPath(id, token)} replace />;

  const canSubmit = view.payment === "awaiting" || view.payment === "rejected";
  const contacts = contactLinks(settings);

  return (
    <Container className="py-10 min-[821px]:py-14">
      <div className="mx-auto flex max-w-[560px] flex-col gap-6">
        <header>
          <p className="text-[13px] font-medium text-muted">{fill(t.pay.order, { id: view.id })}</p>
          <h1 className="mt-1 text-[28px] leading-tight">{t.pay.title}</h1>
        </header>

        <StatusBanner status={view.payment} />

        <section className="border border-line p-5">
          <div className="text-[13px] text-muted">{t.pay.total}</div>
          <div className="mt-1 text-[34px] leading-none font-bold text-ink tabular-nums">{formatAmd(view.total)}</div>
          {view.deliveryFee === null && <p className="mt-2 text-[13px] text-muted">{t.pay.deliveryLater}</p>}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted">{t.pay.items} ({view.items.reduce((sum, item) => sum + item.qty, 0)})</summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {view.items.map((item) => (
                <li key={`${item.name}-${item.size}`} className="flex justify-between gap-3">
                  <span>{item.name}{item.size ? ` (${item.size})` : ""} × {item.qty}</span>
                  <span className="whitespace-nowrap tabular-nums">{formatAmd(item.sum)}</span>
                </li>
              ))}
              <li className="mt-1 flex justify-between gap-3 border-t border-line pt-2 text-muted">
                <span>{t.pay.delivery}</span>
                <span>{view.deliveryFee === null ? t.pay.deliveryConfirm : formatAmd(view.deliveryFee)}</span>
              </li>
            </ul>
          </details>
        </section>

        {(
          view.cards.length ? (
            <ul className="flex flex-col gap-2.5">
              {view.cards.map((card) => <CardRow key={card.number} card={card} />)}
            </ul>
          ) : (
            <p className="border border-line p-4 text-sm">{t.pay.noCards}</p>
          )
        )}

        {canSubmit && view.cards.length > 0 && (
          <section className="flex flex-col gap-3">
            <label className="flex cursor-pointer flex-col gap-1.5 border border-dashed border-line-strong p-4 text-[13px] font-medium text-ink hover:border-ink">
              <span>{receipt ? `✓ ${t.pay.receiptChosen}` : t.pay.receipt}</span>
              <small className="font-normal text-muted">{t.pay.receiptHint}</small>
              <input type="file" accept="image/*" hidden onChange={(event) => void pickReceipt(event.target.files?.[0])} />
            </label>
            {receipt && <img src={receipt} alt="" className="max-h-56 self-start border border-line object-contain" />}
            <FormMessage>{message}</FormMessage>
            <Button block disabled={sending} onClick={() => void submit()}>
              {sending ? t.pay.sendingPaid : view.payment === "rejected" ? t.pay.tryAgain : t.pay.paid}
            </Button>
          </section>
        )}

        {contacts.length > 0 && (
          <footer className="text-sm text-muted">
            {t.pay.contact}{" "}
            {contacts.map((link, index) => (
              <span key={link.href}>
                {index > 0 && " · "}
                <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener" : undefined} className="text-ink underline underline-offset-2">{link.label}</a>
              </span>
            ))}
          </footer>
        )}
      </div>
    </Container>
  );
}
