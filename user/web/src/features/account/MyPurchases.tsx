import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import type { OrderStatus, OrderView, PaymentStatus } from "@shared/types.ts";
import { Button, ButtonLink } from "@/components/ui/Button.tsx";
import { FormMessage, TextField } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { cn } from "@/lib/cn.ts";
import { formatAmd, formatLongDate } from "@/lib/format.ts";
import { listMyOrders, rememberOrder, trackPath, type SavedOrder } from "@/lib/myOrders.ts";
import { useAuth } from "@/state/AuthProvider.tsx";

function statusLabel(t: ReturnType<typeof useI18n>["t"], status: OrderStatus, payment: PaymentStatus) {
  if (status === "cancelled") return { text: t.track.cancelled, tone: "bg-stone-100 text-muted" };
  if (status === "delivered") return { text: t.track.delivered, tone: "bg-emerald-50 text-emerald-800" };
  if (status === "shipped") return { text: t.track.shipped, tone: "bg-violet-50 text-violet-700" };
  if (status === "confirmed" || payment === "paid") return { text: t.track.preparing, tone: "bg-blue-50 text-blue-700" };
  if (payment === "submitted") return { text: t.track.paymentChecking, tone: "bg-amber-50 text-amber-800" };
  if (payment === "rejected") return { text: t.track.paymentRejected, tone: "bg-red-50 text-red-700" };
  return { text: t.track.paymentAwaiting, tone: "bg-amber-50 text-amber-800" };
}

function PurchaseRow({ order, view }: { order: SavedOrder; view?: OrderView }) {
  const { t, lang } = useI18n();
  const label = view && statusLabel(t, view.status, view.payment);
  const count = view?.items.reduce((sum, item) => sum + item.qty, 0);
  return (
    <li>
      <Link to={trackPath(order.id, order.token)} className="flex items-center justify-between gap-3 border border-line p-4 no-underline hover:border-ink">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">#{order.id}</div>
          <div className="text-[13px] text-muted">
            {formatLongDate(order.createdAt, lang)} · {formatAmd(view?.total ?? order.total)}{count ? ` · ${count} ×` : ""}
          </div>
          {view && <div className="mt-1 truncate text-[13px] text-muted">{view.items.map((item) => item.name).join(", ")}</div>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {label && <span className={cn("px-2 py-0.5 text-xs font-semibold", label.tone)}>{label.text}</span>}
          <span className="text-[13px] font-medium text-ink underline underline-offset-2">{t.purchases.track}</span>
        </div>
      </Link>
    </li>
  );
}

function FindOrder() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id.trim() || !phone.trim()) return setMessage(t.purchases.notFound);
    setBusy(true);
    setMessage("");
    try {
      const access = await shopApi.findOrder(id, phone);
      const view = await shopApi.order(access.id, access.token);
      rememberOrder({ ...access, createdAt: view.createdAt, total: view.total });
      navigate(trackPath(access.id, access.token));
    } catch {
      setMessage(t.purchases.notFound);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 border-t border-line pt-6">
      <h2 className="text-lg font-semibold">{t.purchases.findTitle}</h2>
      <p className="-mt-1 text-[13px] text-muted">{t.purchases.findText}</p>
      <div className="grid gap-3 min-[480px]:grid-cols-2">
        <TextField label={t.purchases.orderId} placeholder="TMW…" value={id} onChange={(event) => setId(event.target.value)} />
        <TextField label={t.purchases.phone} type="tel" placeholder="+374" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <FormMessage>{message}</FormMessage>
      <Button type="submit" variant="outline" disabled={busy}>{t.purchases.find}</Button>
    </form>
  );
}

export function MyPurchases() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState(listMyOrders);
  const [views, setViews] = useState<Record<string, OrderView>>({});

  useEffect(() => {
    if (!user) return;
    let active = true;
    shopApi.myOrders().then((remote) => {
      if (!active) return;
      remote.forEach(rememberOrder);
      setOrders(listMyOrders());
    }, () => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;
    for (const order of orders) {
      shopApi.order(order.id, order.token).then(
        (view) => active && setViews((current) => ({ ...current, [order.id]: view })),
        () => undefined
      );
    }
    return () => {
      active = false;
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      {user ? <h2 className="text-xl font-bold">{t.purchases.title}</h2> : <h1 className="text-[clamp(26px,3vw,34px)] font-bold">{t.purchases.title}</h1>}
      {orders.length ? (
        <>
          <ul className="flex flex-col gap-2.5">
            {orders.map((order) => <PurchaseRow key={order.id} order={order} view={views[order.id]} />)}
          </ul>
          {!user && <p className="-mt-3 text-xs text-muted">{t.purchases.deviceNote}</p>}
        </>
      ) : (
        <div className="border border-line p-5">
          <div className="font-semibold text-ink">{t.purchases.empty}</div>
          <p className="mt-1 text-[13px] text-muted">{t.purchases.emptyText}</p>
          <ButtonLink to="/#catalog" size="sm" className="mt-4">{t.purchases.browse}</ButtonLink>
        </div>
      )}
      <FindOrder />
    </div>
  );
}
