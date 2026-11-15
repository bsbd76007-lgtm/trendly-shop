import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ORDER_STATUSES } from "@shared/constants.ts";
import type { Order, OrderStatus, PaymentStatus } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { formatAmd } from "@/lib/format.ts";
import { useAdmin } from "../AdminContext.tsx";
import { AdminButton, adminButton, ErrorState, Loading, PageHeader, PaymentBadge, Panel, StatusBadge, td, th } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { formatDateTime, PAYMENT_LABELS, STATUS_LABELS } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

function orderText(order: Order) {
  return [
    `Order ${order.id}`,
    ...order.items.map((item) => `${item.name}${item.size ? ` (${item.size})` : ""} × ${item.qty} — ${formatAmd(item.sum)}`),
    `Total: ${formatAmd(order.total)}`,
    `${order.customer.name}, ${order.customer.phone}`,
    order.customer.address,
    order.customer.note
  ].filter(Boolean).join("\n");
}

export function OrderPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { counts, refreshCounts, notify, fail } = useAdmin();
  const load = useCallback(async () => {
    const order = (await adminApi.orders()).find((item) => item.id === id);
    if (!order) throw new Error("Order not found");
    return order;
  }, [id]);
  const { data: order, setData, reload, error, loading } = useResource(load);
  const [note, setNote] = useState("");
  const [update, setUpdate] = useState("");

  useEffect(() => {
    void reload();
  }, [counts.orders, reload]);

  useEffect(() => {
    if (order) {
      setNote(order.adminNote);
      setUpdate(order.customerUpdate ?? "");
    }
  }, [order]);

  if (loading) return <Loading />;
  if (!order) return <><PageHeader title="Order" back={{ to: "/admin/orders", label: "Orders" }} /><ErrorState message={error} /></>;

  const save = async (patch: { status?: OrderStatus; adminNote?: string; payment?: PaymentStatus; customerUpdate?: string }, message: string) => {
    try {
      setData(await adminApi.updateOrder(order.id, patch));
      notify(message);
      void refreshCounts();
    } catch (failure) {
      fail(failure);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete order ${order.id}? This can't be undone.`)) return;
    try {
      await adminApi.deleteOrder(order.id);
      notify("Order deleted");
      void refreshCounts();
      navigate("/admin/orders");
    } catch (failure) {
      fail(failure);
    }
  };

  const copy = async () => {
    const copied = await navigator.clipboard.writeText(orderText(order)).then(() => true, () => false);
    notify(copied ? "Copied" : "Could not copy");
  };

  const payLink = order.payment ? `${window.location.origin}/pay/${encodeURIComponent(order.id)}?t=${order.payment.token}` : "";

  const copyPayLink = async () => {
    const copied = await navigator.clipboard.writeText(payLink).then(() => true, () => false);
    notify(copied ? "Payment link copied" : "Could not copy");
  };

  const copyTrackLink = async () => {
    const copied = await navigator.clipboard.writeText(payLink.replace("/pay/", "/track/")).then(() => true, () => false);
    notify(copied ? "Tracking link copied" : "Could not copy");
  };

  const decide = (payment: PaymentStatus) => {
    if (payment === "rejected" && !confirm("Mark this payment as not received? The customer will see it and can try again.")) return;
    void save({ payment }, `Order ${order.id}: ${PAYMENT_LABELS[payment]}`);
  };

  const phone = order.customer.phone.replace(/[^\d+]/g, "");
  const whatsapp = phone.replace(/\D/g, "");

  return (
    <>
      <PageHeader
        back={{ to: "/admin/orders", label: "Orders" }}
        title={`Order ${order.id}`}
        subtitle={`${formatDateTime(order.createdAt)} · sent via ${order.channel || "—"} · language ${order.lang || "—"}`}
        actions={<StatusBadge status={order.status} />}
      />
      <div className="grid items-start gap-4 min-[1101px]:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Items">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr><th className={th}>Product</th><th className={th}>Size</th><th className={th}>Qty</th><th className={th}>Price</th><th className={th}>Sum</th></tr></thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${item.id}-${item.size}`}>
                      <td className={td}><Link to={`/admin/products/${encodeURIComponent(item.id)}`} className="font-bold text-ink">{item.name}</Link><div className="text-xs text-muted">{item.id}</div></td>
                      <td className={td}>{item.size || "—"}</td>
                      <td className={cn(td, "tabular-nums")}>{item.qty}</td>
                      <td className={cn(td, "whitespace-nowrap tabular-nums")}>{formatAmd(item.price)}</td>
                      <td className={cn(td, "whitespace-nowrap tabular-nums")}>{formatAmd(item.sum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto w-full max-w-[320px] p-[18px]">
              <div className="flex justify-between py-1"><dt className="text-muted">Items</dt><dd className="tabular-nums">{formatAmd(order.subtotal)}</dd></div>
              <div className="flex justify-between py-1"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{order.deliveryFee === null ? "to confirm" : formatAmd(order.deliveryFee)}</dd></div>
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-bold text-ink"><dt>Total</dt><dd className="tabular-nums">{formatAmd(order.total)}</dd></div>
            </dl>
          </Panel>
          <Panel title="Status" bodyClassName="p-[18px]">
            <div className="flex flex-wrap gap-1.5">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={order.status === status}
                  onClick={() => void save({ status }, `Order ${order.id}: ${STATUS_LABELS[status]}`)}
                  className={cn(adminButton("default", true), order.status === status && "border-ink bg-ink text-white hover:border-ink")}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
            {order.history?.length ? (
              <ul className="mt-3.5 list-none p-0">
                {order.history.map((change) => (
                  <li key={change.at} className="flex justify-between gap-2.5 border-b border-line py-1.5 text-[13px]">
                    <span>{STATUS_LABELS[change.status]}</span>
                    <span className="text-muted">{formatDateTime(change.at)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          {order.payment && (
            <Panel title="Payment" actions={<PaymentBadge status={order.payment.status} />} bodyClassName="flex flex-col gap-3.5 p-[18px]">
              {order.payment.status === "submitted" && (
                <p className="bg-amber-50 p-3 text-amber-900">
                  The customer says they paid <b>{formatAmd(order.total)}</b>{order.payment.submittedAt ? ` (${formatDateTime(order.payment.submittedAt)})` : ""}. Check your bank app, then confirm.
                </p>
              )}
              {order.payment.status === "awaiting" && <p className="text-muted">The customer hasn't marked the transfer as done yet.</p>}
              {order.payment.decidedAt && order.payment.status !== "submitted" && order.payment.status !== "awaiting" && (
                <p className="text-muted">{PAYMENT_LABELS[order.payment.status]} · {formatDateTime(order.payment.decidedAt)}</p>
              )}
              {order.payment.receipt ? (
                <a href={adminApi.receiptUrl(order.payment.receipt)} target="_blank" rel="noopener" className="self-start">
                  <img src={adminApi.receiptUrl(order.payment.receipt)} alt="Payment screenshot" className="max-h-64 border border-line object-contain" />
                  <span className="mt-1 block text-xs text-muted">Payment screenshot · open full size ↗</span>
                </a>
              ) : order.payment.status === "submitted" ? (
                <p className="text-xs text-muted">No screenshot attached.</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {order.payment.status !== "paid" && <AdminButton tone="primary" small onClick={() => decide("paid")}>Confirm payment</AdminButton>}
                {order.payment.status === "submitted" && <AdminButton tone="danger" small onClick={() => decide("rejected")}>Not received</AdminButton>}
                {order.payment.status === "paid" && <AdminButton small onClick={() => decide("awaiting")}>Undo, mark not paid</AdminButton>}
                <AdminButton small className="ml-auto" onClick={() => void copyPayLink()}>Copy payment link</AdminButton>
              </div>
            </Panel>
          )}
          <Panel title="Customer" bodyClassName="p-[18px]">
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2">
              <dt className="text-muted">Name</dt><dd className="break-words text-ink">{order.customer.name}</dd>
              <dt className="text-muted">Phone</dt><dd className="break-words text-ink">{order.customer.phone}</dd>
              <dt className="text-muted">Email</dt><dd className="break-words text-ink">{order.customer.email ? <a href={`mailto:${order.customer.email}`} className="text-ink">{order.customer.email}</a> : "—"}{order.userId ? <span className="ml-1.5 text-xs text-muted">· has account</span> : null}</dd>
              <dt className="text-muted">Address</dt><dd className="break-words text-ink">{order.customer.address}</dd>
              <dt className="text-muted">Note</dt><dd className="break-words text-ink">{order.customer.note || "—"}</dd>
            </dl>
            <div className="mt-[18px] flex flex-wrap gap-2">
              <a href={`tel:${phone}`} className={adminButton("default", true)}>Call</a>
              {whatsapp.length >= 8 && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" className={adminButton("default", true)}>WhatsApp</a>}
              <AdminButton small onClick={() => void copy()}>Copy order text</AdminButton>
            </div>
          </Panel>
          <Panel title="Message for the customer" bodyClassName="p-[18px]">
            <textarea
              value={update}
              onChange={(event) => setUpdate(event.target.value)}
              maxLength={500}
              placeholder="Shown on the customer's tracking page, e.g. “Courier arrives tomorrow 12:00–15:00”"
              className="min-h-[70px] w-full resize-y border border-line-strong bg-white px-[11px] py-2 text-ink outline-none focus:border-ink"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton tone="primary" small onClick={() => void save({ customerUpdate: update }, "Customer message saved")}>Save message</AdminButton>
              {payLink && <AdminButton small className="ml-auto" onClick={() => void copyTrackLink()}>Copy tracking link</AdminButton>}
            </div>
          </Panel>
          <Panel title="Private note" bodyClassName="p-[18px]">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Only you see this: payment, courier, tracking…"
              className="min-h-[84px] w-full resize-y border border-line-strong bg-white px-[11px] py-2 text-ink outline-none focus:border-ink"
            />
            <div className="mt-[18px] flex flex-wrap gap-2">
              <AdminButton tone="primary" small onClick={() => void save({ adminNote: note }, "Note saved")}>Save note</AdminButton>
              <AdminButton tone="danger" small className="ml-auto" onClick={() => void remove()}>Delete order</AdminButton>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
