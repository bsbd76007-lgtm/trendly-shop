import type { Customer, Lang } from "@shared/types.ts";
import type { Messages } from "@/i18n/messages/en.ts";
import { formatAmd } from "@/lib/format.ts";
import type { CartEntry } from "@/state/CartProvider.tsx";

interface MessageInput {
  t: Messages;
  lang: Lang;
  shopName: string;
  entries: CartEntry[];
  total: number;
  customer: Customer;
}

export function buildOrderMessage({ t, lang, shopName, entries, total, customer }: MessageInput): string {
  const lines = entries.map((entry, index) => {
    const size = entry.size ? ` (${entry.size})` : "";
    return `${index + 1}. ${entry.product.name[lang]}${size} × ${entry.qty} — ${formatAmd(entry.product.price * entry.qty)}`;
  });
  return [
    `${t.checkout.orderTitle} — ${shopName}`,
    "",
    ...lines,
    "",
    `${t.cart.total}: ${formatAmd(total)}`,
    `${t.checkout.name}: ${customer.name}`,
    `${t.checkout.phone}: ${customer.phone}`,
    `${t.checkout.address}: ${customer.address}`,
    customer.note ? `${t.checkout.note}: ${customer.note}` : ""
  ]
    .join("\n")
    .trim();
}
