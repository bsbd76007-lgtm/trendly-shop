import { ORDER_STATUSES } from "../../../shared/constants.ts";
import type { DayStat, Order, OrderStatus, Review, SoldProduct, Stats } from "../../../shared/types.ts";
import { load } from "../lib/store.ts";
import { getProducts } from "./catalog.ts";
import { listOrders } from "./orders.ts";

const DAY = 864e5;
const revenueOf = (orders: Order[]) => orders.reduce((sum, order) => sum + (order.total || 0), 0);

function bestSellers(orders: Order[]): SoldProduct[] {
  const sold = new Map<string, SoldProduct>();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = sold.get(item.id) ?? { id: item.id, name: item.name, qty: 0, sum: 0 };
      entry.qty += item.qty;
      entry.sum += item.sum;
      sold.set(item.id, entry);
    }
  }
  return [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
}

function lastDays(orders: Order[], count: number): DayStat[] {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(Date.now() - (count - 1 - index) * DAY).toISOString().slice(0, 10);
    const onDay = orders.filter((order) => order.createdAt.slice(0, 10) === day);
    return { day, orders: onDay.length, revenue: revenueOf(onDay) };
  });
}

export async function getStats(): Promise<Stats> {
  const [orders, products, reviews] = await Promise.all([listOrders(), getProducts(), load<Review[]>("reviews", [])]);
  const live = orders.filter((order) => order.status !== "cancelled");
  const since = Date.now() - 30 * DAY;
  const last30 = live.filter((order) => Date.parse(order.createdAt) >= since);
  const approved = reviews.filter((review) => review.approved);
  const revenue = revenueOf(live);
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, orders.filter((order) => order.status === status).length])
  ) as Record<OrderStatus, number>;

  return {
    orders: {
      total: orders.length,
      byStatus,
      last30: last30.length,
      revenue,
      revenue30: revenueOf(last30),
      average: live.length ? Math.round(revenue / live.length) : 0
    },
    products: {
      total: products.length,
      hidden: products.filter((product) => product.hidden).length,
      noPrice: products.filter((product) => product.price === null).length,
      noPhoto: products.filter((product) => !product.img).length
    },
    reviews: {
      pending: reviews.length - approved.length,
      approved: approved.length,
      average: approved.length
        ? Number((approved.reduce((sum, review) => sum + review.rating, 0) / approved.length).toFixed(1))
        : null
    },
    recent: orders.slice(0, 6),
    top: bestSellers(live),
    days: lastDays(live, 14)
  };
}
