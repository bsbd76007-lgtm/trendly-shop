import type { CartLine, Customer, NewReviewRequest } from "../../../shared/types.ts";
import { reject } from "../lib/errors.ts";
import { clean } from "../lib/text.ts";

export interface ParsedOrder {
  customer: Customer;
  lines: CartLine[];
  channel: string;
  lang: string;
}

export function parseOrder(body: Record<string, unknown>): ParsedOrder {
  const source = (body.customer ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    name: clean(source.name, 100),
    phone: clean(source.phone, 40),
    address: clean(source.address),
    note: clean(source.note, 1000)
  };
  const email = clean(source.email, 120).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) reject("Enter a valid email");
  if (email) customer.email = email;
  if (!customer.name || !customer.phone || !customer.address) reject("name, phone and address are required");
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) reject("Cart is empty");
  const lines = items.slice(0, 50).map((item: Record<string, unknown>) => ({
    id: clean(item?.id, 60),
    size: clean(item?.size, 10),
    qty: Math.min(Math.max(Number.parseInt(String(item?.qty), 10) || 0, 0), 99)
  }));
  return { customer, lines, channel: clean(body.channel, 10), lang: clean(body.lang, 5) };
}

export function parseReview(body: Record<string, unknown>): NewReviewRequest {
  const name = clean(body.name, 60);
  const text = clean(body.text, 1000);
  const rating = Number.parseInt(String(body.rating), 10);
  if (!name || !text) reject("name and text are required");
  if (!(rating >= 1 && rating <= 5)) reject("rating must be 1-5");
  return { name, text, rating };
}
