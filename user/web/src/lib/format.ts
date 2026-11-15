import type { Lang } from "@shared/types.ts";

const LOCALES: Record<Lang, string> = { hy: "hy-AM", ru: "ru-RU", en: "en-GB" };

export const formatAmd = (amount: number) => `${amount.toLocaleString("en-US")} ֏`;

export const imageUrl = (path: string) => (path ? `/${path.replace(/^\//, "")}` : "");

export const formatLongDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(LOCALES[lang], { day: "numeric", month: "long", year: "numeric" });

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
