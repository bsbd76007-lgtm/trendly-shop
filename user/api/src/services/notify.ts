import type { Order, SupportChat } from "../../../shared/types.ts";
import { ADMIN_EMAIL, APP_URL } from "../config/env.ts";
import { sendLater, type Mail } from "./mail.ts";

type Lang = "hy" | "ru" | "en";

const COPY = {
  en: {
    placed: ["Order {id} received", "Thanks for your order! Pay by card transfer and follow your order here:", "Track order"],
    paid: ["Payment confirmed — order {id}", "We received your payment and are preparing your order.", "Track order"],
    shipped: ["Your order {id} is on the way", "Your order has been sent and is on its way to you.", "Track order"],
    delivered: ["Order {id} delivered", "Your order has been delivered. Thank you for shopping with us!", "Leave a review"],
    reset: ["Reset your password", "Someone asked to reset the password for your Trendly Shop account. The link works for 1 hour. If it wasn't you, ignore this email.", "Choose a new password"],
    items: "Items",
    total: "Total",
    footer: "Trendly Shop · Yerevan"
  },
  ru: {
    placed: ["Заказ {id} принят", "Спасибо за заказ! Оплатите переводом на карту и следите за заказом здесь:", "Отследить заказ"],
    paid: ["Оплата подтверждена — заказ {id}", "Мы получили оплату и собираем ваш заказ.", "Отследить заказ"],
    shipped: ["Заказ {id} в пути", "Ваш заказ отправлен и уже в пути.", "Отследить заказ"],
    delivered: ["Заказ {id} доставлен", "Ваш заказ доставлен. Спасибо за покупку!", "Оставить отзыв"],
    reset: ["Сброс пароля", "Кто-то запросил сброс пароля для вашего аккаунта Trendly Shop. Ссылка действует 1 час. Если это были не вы, просто проигнорируйте письмо.", "Задать новый пароль"],
    items: "Товары",
    total: "Итого",
    footer: "Trendly Shop · Ереван"
  },
  hy: {
    placed: ["Պատվեր {id}-ն ընդունված է", "Շնորհակալություն պատվերի համար։ Վճարեք քարտին փոխանցումով և հետևեք պատվերին այստեղ՝", "Հետևել պատվերին"],
    paid: ["Վճարումը հաստատված է — պատվեր {id}", "Ստացել ենք ձեր վճարումը և պատրաստում ենք պատվերը։", "Հետևել պատվերին"],
    shipped: ["Պատվեր {id}-ն ճանապարհին է", "Ձեր պատվերն ուղարկված է և ճանապարհին է։", "Հետևել պատվերին"],
    delivered: ["Պատվեր {id}-ն առաքված է", "Ձեր պատվերն առաքված է։ Շնորհակալություն գնումի համար։", "Թողնել կարծիք"],
    reset: ["Գաղտնաբառի վերականգնում", "Ինչ-որ մեկը խնդրել է վերականգնել ձեր Trendly Shop հաշվի գաղտնաբառը։ Հղումը գործում է 1 ժամ։ Եթե դա դուք չէիք, անտեսեք այս նամակը։", "Ընտրել նոր գաղտնաբառ"],
    items: "Ապրանքներ",
    total: "Ընդամենը",
    footer: "Trendly Shop · Երևան"
  }
} as const;

type CustomerEvent = "placed" | "paid" | "shipped" | "delivered";

const langOf = (value: string | undefined): Lang => (value === "ru" || value === "en" ? value : "hy");
const amd = (value: number) => `${value.toLocaleString("en-US")} ֏`;
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const fill = (template: string, id: string) => template.replace("{id}", id);

export const trackUrl = (order: Order) => `${APP_URL}/track/${encodeURIComponent(order.id)}?t=${order.payment?.token ?? ""}`;
const adminOrderUrl = (id: string) => `${APP_URL}/admin/orders/${encodeURIComponent(id)}`;

function layout(title: string, body: string, button: { href: string; label: string } | null, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border:1px solid #e7e5e4" cellpadding="0" cellspacing="0">
<tr><td style="background:#111;color:#fff;padding:18px 24px;font-size:18px;font-weight:800;letter-spacing:-0.02em">Trendly</td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${escape(title)}</h1>
${body}
${button ? `<p style="margin:24px 0 0"><a href="${escape(button.href)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;font-weight:600">${escape(button.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;color:#78716c;font-size:12px">${escape(footer)}</td></tr>
</table></td></tr></table></body></html>`;
}

function itemsTable(order: Order, lang: Lang): string {
  const copy = COPY[lang];
  const rows = order.items
    .map((item) => `<tr><td style="padding:6px 0">${escape(item.name)}${item.size ? ` (${escape(item.size)})` : ""} × ${item.qty}</td><td align="right" style="padding:6px 0;white-space:nowrap">${amd(item.sum)}</td></tr>`)
    .join("");
  return `<p style="margin:20px 0 6px;font-weight:600">${copy.items}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td style="padding:10px 0 0;border-top:1px solid #e7e5e4;font-weight:700">${copy.total}</td><td align="right" style="padding:10px 0 0;border-top:1px solid #e7e5e4;font-weight:700">${amd(order.total)}</td></tr></table>`;
}

function customerMail(order: Order, event: CustomerEvent): Mail | null {
  const to = order.customer.email ?? "";
  if (!to) return null;
  const lang = langOf(order.lang);
  const copy = COPY[lang];
  const [subject, intro, action] = copy[event];
  const title = fill(subject, order.id);
  const href = event === "delivered" ? `${APP_URL}/#reviews` : trackUrl(order);
  const update = order.customerUpdate ? `<p style="margin:14px 0 0;padding:12px;background:#f5f5f4">${escape(order.customerUpdate)}</p>` : "";
  const html = layout(title, `<p style="margin:0;font-size:15px;line-height:1.5">${escape(intro)}</p>${update}${itemsTable(order, lang)}`, { href, label: action }, copy.footer);
  const text = [title, "", intro, order.customerUpdate ?? "", "", ...order.items.map((item) => `${item.name}${item.size ? ` (${item.size})` : ""} × ${item.qty} — ${amd(item.sum)}`), `${copy.total}: ${amd(order.total)}`, "", `${action}: ${href}`].join("\n");
  return { to, subject: title, html, text };
}

export const notifyCustomer = (order: Order, event: CustomerEvent) => sendLater(customerMail(order, event));

function adminMail(subject: string, lines: string[], href: string): Mail | null {
  if (!ADMIN_EMAIL) return null;
  const html = layout(subject, lines.map((line) => `<p style="margin:0 0 6px;font-size:15px">${escape(line)}</p>`).join(""), { href, label: "Open in admin" }, "Trendly admin");
  return { to: ADMIN_EMAIL, subject: `[Trendly] ${subject}`, html, text: [...lines, "", href].join("\n") };
}

export function notifyAdminOrder(order: Order): void {
  sendLater(adminMail(`New order ${order.id} — ${amd(order.total)}`, [
    `${order.customer.name}, ${order.customer.phone}`,
    order.customer.address,
    ...order.items.map((item) => `• ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.qty}`)
  ], adminOrderUrl(order.id)));
}

export function notifyAdminPayment(order: Order): void {
  sendLater(adminMail(`💳 Payment to check — ${order.id}`, [
    `${order.customer.name} says they paid ${amd(order.total)}.`,
    order.payment?.receipt ? "A screenshot is attached in the admin." : "No screenshot attached."
  ], adminOrderUrl(order.id)));
}

export function notifyAdminChat(chat: SupportChat): void {
  sendLater(adminMail(`💬 New chat${chat.name ? ` from ${chat.name}` : ""}`, [chat.messages.at(-1)?.text ?? ""], `${APP_URL}/admin/support/${encodeURIComponent(chat.id)}`));
}

export function resetMail(to: string, link: string, langInput: string | undefined): Mail {
  const lang = langOf(langInput);
  const copy = COPY[lang];
  const [subject, intro, action] = copy.reset;
  return {
    to,
    subject,
    html: layout(subject, `<p style="margin:0;font-size:15px;line-height:1.5">${escape(intro)}</p>`, { href: link, label: action }, copy.footer),
    text: [subject, "", intro, "", `${action}: ${link}`].join("\n")
  };
}
