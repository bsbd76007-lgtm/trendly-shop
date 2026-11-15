import type { Settings } from "@shared/types.ts";

export interface ContactLink {
  label: string;
  href: string;
  external: boolean;
}

export const instagramUrl = (username: string) => `https://www.instagram.com/${username}/`;
export const instagramDm = (username: string) => `https://ig.me/m/${username}`;
export const telegramUrl = (username: string) => `https://t.me/${username}`;
export const whatsappUrl = (number: string, text?: string) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export function contactLinks(settings: Settings): ContactLink[] {
  const links: ContactLink[] = [];
  if (settings.instagram) links.push({ label: `Instagram · @${settings.instagram}`, href: instagramUrl(settings.instagram), external: true });
  if (settings.telegram) links.push({ label: `Telegram · @${settings.telegram}`, href: telegramUrl(settings.telegram), external: true });
  if (settings.whatsapp) links.push({ label: "WhatsApp", href: whatsappUrl(settings.whatsapp), external: true });
  if (settings.phone) links.push({ label: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, external: false });
  return links;
}
