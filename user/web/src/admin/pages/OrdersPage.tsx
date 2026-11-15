import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ORDER_STATUSES } from "@shared/constants.ts";
import type { Order, OrderStatus } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { formatAmd } from "@/lib/format.ts";
import { useAdmin } from "../AdminContext.tsx";
import { adminButton, controlClass, ErrorState, FilterTabs, Loading, PageHeader, PaymentBadge, Panel, td, th, Toolbar } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { formatDateTime, STATUS_LABELS } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

type Filter = OrderStatus | "all" | "payment";

const toCheck = (order: Order) => order.payment?.status === "submitted";

export const itemsSummary = (order: Order) =>
  order.items.map((item) => `${item.name}${item.size ? ` (${item.size})` : ""}${item.qty > 1 ? ` ×${item.qty}` : ""}`).join(", ");

export function StatusSelect({ order, onChange }: { order: Order; onChange: (status: OrderStatus) => void }) {
  return (
    <select
      aria-label="Status"
      value={order.status}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.value as OrderStatus)}
      className="min-h-[30px] border border-line-strong bg-white px-2 py-0.5 text-[13px]"
    >
      {ORDER_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
    </select>
  );
}

export function OrdersPage() {
  const { counts, refreshCounts, notify, fail } = useAdmin();
  const navigate = useNavigate();
  const { data: orders, setData, reload, error, loading } = useResource(adminApi.orders);

  useEffect(() => {
    void reload();
  }, [counts.orders, reload]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (orders ?? []).filter((order) =>
      (filter === "all" || (filter === "payment" ? toCheck(order) : order.status === filter)) &&
      (!needle || [order.id, order.customer.name, order.customer.phone, order.customer.address, order.customer.note].join(" ").toLowerCase().includes(needle))
    );
  }, [orders, filter, query]);

  if (loading) return <Loading />;
  if (!orders) return <ErrorState message={error} />;

  const changeStatus = async (order: Order, status: OrderStatus) => {
    try {
      const updated = await adminApi.updateOrder(order.id, { status });
      setData((list) => list?.map((item) => (item.id === updated.id ? updated : item)));
      notify(`Order ${order.id}: ${STATUS_LABELS[status]}`);
      void refreshCounts();
    } catch (failure) {
      fail(failure);
    }
  };

  const tabs = [
    { value: "all" as Filter, label: "All", count: orders.length },
    { value: "payment" as Filter, label: "Payment to check", count: orders.filter(toCheck).length },
    ...ORDER_STATUSES.map((status) => ({ value: status as Filter, label: STATUS_LABELS[status], count: orders.filter((order) => order.status === status).length }))
  ];

  return (
    <>
      <PageHeader title="Orders" actions={<a href={adminApi.ordersCsvUrl} className={adminButton()}>Export CSV</a>} />
      <Panel>
        <Toolbar>
          <FilterTabs value={filter} options={tabs} onChange={setFilter} />
          <input
            type="search"
            placeholder="Search name, phone, address, ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(controlClass, "ml-auto min-h-[34px] w-auto min-w-[220px] max-w-[340px] flex-1")}
          />
        </Toolbar>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th><th className={th}>Total</th><th className={th}>Status</th></tr>
            </thead>
            <tbody>
              {visible.length ? visible.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)} className="cursor-pointer hover:bg-stone-50">
                  <td className={cn(td, "whitespace-nowrap")}><b>{order.id}</b><div className="text-xs text-muted">{formatDateTime(order.createdAt)}</div></td>
                  <td className={td}><b>{order.customer.name}</b><div className="text-xs text-muted">{order.customer.phone}</div></td>
                  <td className={cn(td, "max-w-[340px] text-xs")}>{itemsSummary(order)}</td>
                  <td className={cn(td, "whitespace-nowrap tabular-nums")}>
                    {formatAmd(order.total)}
                    {order.deliveryFee === null && <div className="text-xs text-muted">+ delivery</div>}
                  </td>
                  <td className={td}>
                    <StatusSelect order={order} onChange={(status) => void changeStatus(order, status)} />
                    {order.payment && <div className="mt-1"><PaymentBadge status={order.payment.status} /></div>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className={cn(td, "py-10 text-center text-muted")}>No orders{query || filter !== "all" ? " match" : " yet"}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
