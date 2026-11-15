import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import type { Stats } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { formatAmd } from "@/lib/format.ts";
import { useAdmin } from "../AdminContext.tsx";
import { adminButton, ErrorState, Loading, PageHeader, Panel, StatusBadge, td } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { formatDateTime } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

function Tile({ label, value, sub, to, warn }: { label: string; value: string | number; sub: string; to?: string; warn?: boolean }) {
  const body = (
    <>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1.5 text-[26px] font-bold tracking-[-0.02em] tabular-nums", warn ? "text-red-700" : "text-ink")}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </>
  );
  const className = "block border border-line bg-white px-[18px] py-4 no-underline";
  return to ? <Link to={to} className={cn(className, "hover:border-line-strong")}>{body}</Link> : <div className={className}>{body}</div>;
}

function OrdersChart({ days }: { days: Stats["days"] }) {
  const max = Math.max(1, ...days.map((day) => day.orders));
  return (
    <div className="px-[18px] pt-[18px] pb-10">
      <div className="grid h-[140px] grid-cols-14 items-end gap-1.5">
        {days.map((day) => (
          <div key={day.day} title={`${day.day}: ${day.orders} orders, ${formatAmd(day.revenue)}`} className="relative flex h-full flex-col justify-end">
            <span className={day.orders ? "bg-ink" : "bg-line"} style={{ height: `${Math.max(2, (day.orders / max) * 100)}%` }} />
            <small className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-muted">{day.day.slice(8)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { refreshCounts } = useAdmin();
  const navigate = useNavigate();
  const load = useCallback(async () => {
    const stats = await refreshCounts();
    if (!stats) throw new Error("Could not load the dashboard");
    return stats;
  }, [refreshCounts]);
  const { data: stats, error, loading } = useResource(load);

  if (loading) return <Loading />;
  if (!stats) return <ErrorState message={error} />;

  const { orders, products, reviews } = stats;

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <Link to="/admin/products/new" className={adminButton()}>+ New product</Link>
            <a href={adminApi.ordersCsvUrl} className={adminButton()}>Export orders (CSV)</a>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 min-[1101px]:grid-cols-4">
        <Tile to="/admin/orders" label="New orders" value={orders.byStatus.new} sub="waiting for confirmation" />
        <Tile label="Revenue (all time)" value={formatAmd(orders.revenue)} sub={`${orders.total - orders.byStatus.cancelled} orders, cancelled not counted`} />
        <Tile label="Last 30 days" value={formatAmd(orders.revenue30)} sub={`${orders.last30} orders`} />
        <Tile label="Average order" value={formatAmd(orders.average)} sub="excluding cancelled" />
        <Tile to="/admin/products" label="Products" value={products.total} sub={`${products.hidden} hidden`} />
        <Tile to="/admin/products?filter=noprice" label="Without a price" value={products.noPrice} sub={'show "Price on request"'} warn={products.noPrice > 0} />
        <Tile to="/admin/products?filter=nophoto" label="Without a photo" value={products.noPhoto} sub="path not set" warn={products.noPhoto > 0} />
        <Tile
          to="/admin/reviews"
          label="Reviews to check"
          value={reviews.pending}
          sub={`${reviews.approved} published${reviews.average ? ` · ${reviews.average}★` : ""}`}
          warn={reviews.pending > 0}
        />
      </div>

      <div className="grid items-start gap-4 min-[1101px]:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Orders, last 14 days"><OrdersChart days={stats.days} /></Panel>
          <Panel title="Recent orders" actions={<Link to="/admin/orders" className={adminButton("default", true)}>All orders</Link>}>
            <table className="w-full border-collapse">
              <tbody>
                {stats.recent.length ? stats.recent.map((order) => (
                  <tr key={order.id} onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)} className="cursor-pointer hover:bg-stone-50">
                    <td className={td}>
                      <b>{order.customer.name}</b>
                      <div className="text-xs text-muted">{order.id} · {formatDateTime(order.createdAt)}</div>
                    </td>
                    <td className={cn(td, "whitespace-nowrap tabular-nums")}>{formatAmd(order.total)}</td>
                    <td className={td}><StatusBadge status={order.status} /></td>
                  </tr>
                )) : (
                  <tr><td className={cn(td, "py-10 text-center text-muted")}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </Panel>
        </div>
        <Panel title="Best sellers">
          <table className="w-full border-collapse">
            <tbody>
              {stats.top.length ? stats.top.map((item, index) => (
                <tr key={item.id}>
                  <td className={cn(td, "text-muted")}>{index + 1}</td>
                  <td className={td}><b>{item.name}</b></td>
                  <td className={cn(td, "whitespace-nowrap tabular-nums")}>{item.qty} pcs</td>
                  <td className={cn(td, "whitespace-nowrap tabular-nums")}>{formatAmd(item.sum)}</td>
                </tr>
              )) : (
                <tr><td className={cn(td, "py-10 text-center text-muted")}>Nothing sold yet.</td></tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
