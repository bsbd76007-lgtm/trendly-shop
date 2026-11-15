import { ORDER_STATUSES } from "../../../shared/constants.ts";
import type { Order, OrderItem, OrderStatus } from "../../../shared/types.ts";
import { missing, reject } from "../lib/errors.ts";
import { load, update } from "../lib/store.ts";
import { clean, makeId } from "../lib/text.ts";
import type { ParsedOrder } from "../validation/public.ts";
import { getSettings, getVisibleProducts } from "./catalog.ts";

const withDefaults = (order: Order): Order => ({ ...order, status: order.status ?? "new", adminNote: order.adminNote ?? "" });
const newestFirst = (a: Order, b: Order) => (a.createdAt < b.createdAt ? 1 : -1);

export async function listOrders(): Promise<Order[]> {
  return (await load<Order[]>("orders", [])).map(withDefaults).sort(newestFirst);
}

export async function createOrder(input: ParsedOrder): Promise<Order> {
  const [products, settings] = await Promise.all([getVisibleProducts(), getSettings()]);
  const items: OrderItem[] = input.lines.map((line) => {
    const product = products.find((item) => item.id === line.id);
    if (!product || !line.qty || typeof product.price !== "number") return reject(`Invalid item: ${line.id}`);
    return { id: product.id, name: product.name.en, size: line.size, qty: line.qty, price: product.price, sum: product.price * line.qty };
  });
  const subtotal = items.reduce((sum, item) => sum + item.sum, 0);
  const deliveryFee = typeof settings.deliveryFee === "number" ? settings.deliveryFee : null;
  const order: Order = {
    id: makeId("T"),
    createdAt: new Date().toISOString(),
    status: "new",
    adminNote: "",
    channel: input.channel,
    lang: input.lang,
    customer: input.customer,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + (deliveryFee ?? 0)
  };
  await update<Order[], void>("orders", [], (list) => {
    list.push(order);
  });
  console.log(`New order ${order.id}: ${order.customer.name}, ${order.total} AMD`);
  return order;
}

export function updateOrder(id: string, patch: { status?: unknown; adminNote?: unknown }): Promise<Order> {
  return update<Order[], Order>("orders", [], (list) => {
    const order = list.find((item) => item.id === id) ?? missing("Order not found");
    if (patch.status !== undefined) {
      if (!ORDER_STATUSES.includes(patch.status as OrderStatus)) reject("Unknown status");
      const status = patch.status as OrderStatus;
      if (order.status !== status) (order.history ??= []).push({ status, at: new Date().toISOString() });
      order.status = status;
    }
    if (patch.adminNote !== undefined) order.adminNote = clean(patch.adminNote, 2000);
    return withDefaults(order);
  });
}

export function deleteOrder(id: string): Promise<void> {
  return update<Order[], void>("orders", [], (list) => {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) missing("Order not found");
    list.splice(index, 1);
  });
}

export async function ordersCsv(): Promise<string> {
  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = ["id", "date", "status", "name", "phone", "address", "note", "items", "subtotal", "delivery", "total", "channel", "admin note"];
  const rows = (await listOrders()).map((order) => [
    order.id, order.createdAt, order.status, order.customer.name, order.customer.phone, order.customer.address,
    order.customer.note,
    order.items.map((item) => `${item.name}${item.size ? ` (${item.size})` : ""} x${item.qty}`).join("; "),
    order.subtotal, order.deliveryFee ?? "", order.total, order.channel, order.adminNote
  ]);
  return `﻿${[header, ...rows].map((row) => row.map(quote).join(",")).join("\r\n")}`;
}
