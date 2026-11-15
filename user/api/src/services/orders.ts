import { randomBytes, timingSafeEqual } from "node:crypto";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../../shared/constants.ts";
import type { Order, OrderAccess, OrderStatus, OrderView, PaymentStatus } from "../../../shared/types.ts";
import { db, type Tx } from "../db/client.ts";
import { orderInclude, toOrder } from "../db/mappers.ts";
import { missing, reject } from "../lib/errors.ts";
import { clean, makeId } from "../lib/text.ts";
import type { ParsedOrder } from "../validation/public.ts";
import { getSettings, getVisibleProducts } from "./catalog.ts";
import { notifyAdminOrder, notifyAdminPayment, notifyCustomer } from "./notify.ts";
import { saveReceipt } from "./uploads.ts";
import { findUser } from "./users.ts";

export async function listOrders(): Promise<Order[]> {
  return (await db.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" } })).map(toOrder);
}

async function loadOrder(id: string, tx: Tx = db): Promise<Order> {
  const row = await tx.order.findUnique({ where: { id }, include: orderInclude });
  return row ? toOrder(row) : missing("Order not found");
}

export async function createOrder(input: ParsedOrder, userId: string | null = null): Promise<Order> {
  const [products, settings, user] = await Promise.all([getVisibleProducts(), getSettings(), userId ? findUser(userId) : undefined]);
  const items = input.lines.map((line, position) => {
    const product = products.find((item) => item.id === line.id);
    if (!product || !line.qty || typeof product.price !== "number") return reject(`Invalid item: ${line.id}`);
    return { position, productId: product.id, name: product.name.en, size: line.size, qty: line.qty, price: product.price, sum: product.price * line.qty };
  });
  const subtotal = items.reduce((sum, item) => sum + item.sum, 0);
  const deliveryFee = typeof settings.deliveryFee === "number" ? settings.deliveryFee : null;
  const row = await db.order.create({
    data: {
      id: makeId("T"),
      channel: input.channel,
      lang: input.lang,
      customerName: input.customer.name,
      customerPhone: input.customer.phone,
      customerAddress: input.customer.address,
      customerNote: input.customer.note,
      customerEmail: input.customer.email || user?.email || null,
      subtotal,
      deliveryFee,
      total: subtotal + (deliveryFee ?? 0),
      paymentToken: randomBytes(16).toString("hex"),
      userId: user?.id ?? null,
      items: { create: items }
    },
    include: orderInclude
  });
  const order = toOrder(row);
  console.log(`New order ${order.id}: ${order.customer.name}, ${order.total} AMD`);
  notifyCustomer(order, "placed");
  notifyAdminOrder(order);
  return order;
}

const sameToken = (expected: string, given: unknown) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(typeof given === "string" ? given : "");
  return a.length === b.length && timingSafeEqual(a, b);
};

async function orderForCustomer(id: string, token: unknown): Promise<Order> {
  const row = await db.order.findUnique({ where: { id }, include: orderInclude });
  if (!row || !sameToken(row.paymentToken, token)) return missing("Order not found");
  return toOrder(row);
}

export async function getOrderView(id: string, token: unknown): Promise<OrderView> {
  const [order, settings] = await Promise.all([orderForCustomer(id, token), getSettings()]);
  return {
    id: order.id,
    createdAt: order.createdAt,
    items: order.items.map(({ name, size, qty, sum }) => ({ name, size, qty, sum })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    status: order.status,
    history: order.history ?? [],
    payment: order.payment?.status ?? "awaiting",
    update: order.customerUpdate ?? "",
    cards: settings.cards
  };
}

const lastDigits = (phone: string) => phone.replace(/\D/g, "").slice(-8);

export async function lookupOrder(id: unknown, phone: unknown): Promise<OrderAccess> {
  const wanted = String(id ?? "").trim().toUpperCase().replace(/^#/, "");
  const digits = lastDigits(String(phone ?? ""));
  const row = wanted ? await db.order.findUnique({ where: { id: wanted } }) : null;
  if (!row || digits.length < 6 || lastDigits(row.customerPhone) !== digits) return missing("Order not found");
  return { id: row.id, token: row.paymentToken };
}

export async function ordersForUser(userId: string, email: string): Promise<Array<OrderAccess & { createdAt: string; total: number }>> {
  const rows = await db.order.findMany({
    where: { OR: [{ userId }, { customerEmail: { equals: email, mode: "insensitive" } }] },
    orderBy: { createdAt: "desc" },
    select: { id: true, paymentToken: true, createdAt: true, total: true }
  });
  return rows.map((row) => ({ id: row.id, token: row.paymentToken, createdAt: row.createdAt.toISOString(), total: row.total }));
}

export async function submitPayment(id: string, token: unknown, receipt: unknown): Promise<PaymentStatus> {
  const current = await orderForCustomer(id, token);
  if (current.payment?.status === "paid") return "paid";
  const file = receipt ? await saveReceipt(receipt, id.toLowerCase()) : undefined;
  const result = await db.order.updateMany({
    where: { id, paymentStatus: { not: "paid" } },
    data: { paymentStatus: "submitted", paymentSubmittedAt: new Date(), ...(file ? { receipt: file } : {}) }
  });
  if (!result.count) return "paid";
  const order = await loadOrder(id);
  console.log(`Payment submitted for ${order.id}: ${order.total} AMD`);
  notifyAdminPayment(order);
  return "submitted";
}

async function setStatus(tx: Tx, orderId: string, from: string, to: OrderStatus): Promise<void> {
  if (from === to) return;
  await tx.order.update({ where: { id: orderId }, data: { status: to, history: { create: { status: to } } } });
}

export async function updateOrder(id: string, patch: { status?: unknown; adminNote?: unknown; payment?: unknown; customerUpdate?: unknown }): Promise<Order> {
  if (patch.status !== undefined && !ORDER_STATUSES.includes(patch.status as OrderStatus)) reject("Unknown status");
  if (patch.payment !== undefined && !PAYMENT_STATUSES.includes(patch.payment as PaymentStatus)) reject("Unknown payment status");
  const { before, after } = await db.$transaction(async (tx) => {
    const before = await loadOrder(id, tx);
    let status = before.status;
    if (patch.status !== undefined) {
      await setStatus(tx, id, status, patch.status as OrderStatus);
      status = patch.status as OrderStatus;
    }
    if (patch.payment !== undefined) {
      const payment = patch.payment as PaymentStatus;
      await tx.order.update({ where: { id }, data: { paymentStatus: payment, paymentDecidedAt: new Date() } });
      if (payment === "paid" && status === "new") await setStatus(tx, id, status, "confirmed");
    }
    const fields: { adminNote?: string; customerUpdate?: string } = {};
    if (patch.adminNote !== undefined) fields.adminNote = clean(patch.adminNote, 2000);
    if (patch.customerUpdate !== undefined) fields.customerUpdate = clean(patch.customerUpdate, 500);
    if (Object.keys(fields).length) await tx.order.update({ where: { id }, data: fields });
    return { before, after: await loadOrder(id, tx) };
  });
  if (after.payment?.status === "paid" && before.payment?.status !== "paid") notifyCustomer(after, "paid");
  if (after.status !== before.status && (after.status === "shipped" || after.status === "delivered")) notifyCustomer(after, after.status);
  return after;
}

export async function deleteOrder(id: string): Promise<void> {
  const result = await db.order.deleteMany({ where: { id } });
  if (!result.count) missing("Order not found");
}

export async function ordersCsv(): Promise<string> {
  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = ["id", "date", "status", "payment", "name", "phone", "email", "address", "note", "items", "subtotal", "delivery", "total", "channel", "admin note"];
  const rows = (await listOrders()).map((order) => [
    order.id, order.createdAt, order.status, order.payment?.status ?? "", order.customer.name, order.customer.phone, order.customer.email ?? "",
    order.customer.address, order.customer.note,
    order.items.map((item) => `${item.name}${item.size ? ` (${item.size})` : ""} x${item.qty}`).join("; "),
    order.subtotal, order.deliveryFee ?? "", order.total, order.channel, order.adminNote
  ]);
  return `﻿${[header, ...rows].map((row) => row.map(quote).join(",")).join("\r\n")}`;
}
