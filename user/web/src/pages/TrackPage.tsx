import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import type { OrderStatus, OrderView } from "@shared/types.ts";
import { Container } from "@/components/layout/Container.tsx";
import { ButtonLink } from "@/components/ui/Button.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { cn } from "@/lib/cn.ts";
import { fill, formatAmd } from "@/lib/format.ts";
import { HttpError } from "@/lib/http.ts";
import { payPath } from "@/lib/myOrders.ts";

const STAGE: Record<OrderStatus, number> = { new: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1 };

type StepState = "done" | "current" | "todo" | "problem";

interface Step {
  title: string;
  state: StepState;
  at?: string;
  action?: { to: string; label: string };
}

const formatTime = (iso: string, lang: string) =>
  new Date(iso).toLocaleString(lang === "hy" ? "hy-AM" : lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Timeline({ steps, lang }: { steps: Step[]; lang: string }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 && (
            <span className={cn("absolute top-7 bottom-0 left-[13px] w-0.5", step.state === "done" ? "bg-ink" : "bg-line")} />
          )}
          <span
            className={cn(
              "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2 text-[13px] font-bold",
              step.state === "done" && "border-ink bg-ink text-white",
              step.state === "current" && "border-amber-500 bg-amber-50 text-amber-700",
              step.state === "problem" && "border-red-500 bg-red-50 text-red-700",
              step.state === "todo" && "border-line bg-white text-muted"
            )}
          >
            {step.state === "done" ? "✓" : step.state === "problem" ? "!" : index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <div className={cn("text-[15px] font-semibold", step.state === "todo" ? "text-muted" : "text-ink")}>
              {step.title}
              {step.state === "current" && <span className="ml-2 inline-block size-2 animate-pulse rounded-full bg-amber-500 align-middle" />}
            </div>
            {step.at && <div className="text-[13px] text-muted">{formatTime(step.at, lang)}</div>}
            {step.action && <ButtonLink to={step.action.to} size="sm" className="mt-2">{step.action.label}</ButtonLink>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TrackPage() {
  const { t, lang } = useI18n();
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [view, setView] = useState<OrderView | null>(null);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    try {
      setView(await shopApi.order(id, token));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) setMissing(true);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (missing) {
    return (
      <Container className="py-16">
        <h1 className="text-2xl">{t.track.title}</h1>
        <p className="mt-3 text-muted">{t.track.notFound}</p>
        <ButtonLink to="/account#orders" className="mt-6">{t.track.purchases}</ButtonLink>
      </Container>
    );
  }

  if (!view) return <Container className="py-16 text-muted">…</Container>;

  const stage = STAGE[view.status];
  const reached = (status: OrderStatus) => [...view.history].reverse().find((change) => change.status === status)?.at;
  const later = (target: number): StepState => (stage >= target ? "done" : stage === target - 1 && view.payment === "paid" ? "current" : "todo");

  const paymentStep: Step =
    view.payment === "paid" ? { title: t.track.paymentPaid, state: "done" }
    : view.payment === "submitted" ? { title: t.track.paymentChecking, state: "current" }
    : view.payment === "rejected" ? { title: t.track.paymentRejected, state: "problem", action: { to: payPath(id, token), label: t.track.payAgain } }
    : { title: t.track.paymentAwaiting, state: "current", action: { to: payPath(id, token), label: t.track.payNow } };

  const steps: Step[] = [
    { title: t.track.placed, state: "done", at: view.createdAt },
    view.status === "new" || view.payment !== "awaiting" ? paymentStep : { ...paymentStep, state: "done", action: undefined, title: t.track.payment },
    { title: t.track.preparing, state: later(1), at: reached("confirmed") },
    { title: t.track.shipped, state: later(2), at: reached("shipped") },
    { title: t.track.delivered, state: stage >= 3 ? "done" : "todo", at: reached("delivered") }
  ];

  return (
    <Container className="py-10 min-[821px]:py-14">
      <div className="mx-auto flex max-w-[560px] flex-col gap-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted">{fill(t.track.order, { id: view.id })}</p>
            <h1 className="mt-1 text-[28px] leading-tight">{t.track.title}</h1>
          </div>
          <span className="flex items-center gap-1.5 pb-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {t.track.live}
          </span>
        </header>

        {view.update && (
          <div className="border border-ink bg-soft p-4">
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">{t.track.update}</div>
            <p className="mt-1 whitespace-pre-line text-[15px] text-ink">{view.update}</p>
          </div>
        )}

        {view.status === "cancelled" ? (
          <div className="border border-red-300 bg-red-50 p-4">
            <div className="text-base font-semibold text-ink">{t.track.cancelled}</div>
            <p className="mt-1 text-sm">{t.track.cancelledText}</p>
          </div>
        ) : (
          <section className="border border-line p-5">
            <Timeline steps={steps} lang={lang} />
          </section>
        )}

        <section className="border border-line p-5 text-sm">
          <div className="mb-2 font-semibold text-ink">{t.track.items}</div>
          <ul className="flex flex-col gap-1.5">
            {view.items.map((item) => (
              <li key={`${item.name}-${item.size}`} className="flex justify-between gap-3">
                <span>{item.name}{item.size ? ` (${item.size})` : ""} × {item.qty}</span>
                <span className="whitespace-nowrap tabular-nums">{formatAmd(item.sum)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-2.5 text-[15px] font-bold text-ink">
            <span>{t.track.total}</span>
            <span className="tabular-nums">{formatAmd(view.total)}</span>
          </div>
        </section>

        <Link to="/account#orders" className="self-start text-sm text-ink underline underline-offset-4">{t.track.purchases}</Link>
      </div>
    </Container>
  );
}
