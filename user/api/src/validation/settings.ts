import { DEFAULT_SETTINGS, IMAGE_PATH, LANGS } from "../../../shared/constants.ts";
import type { InstagramPost, Lang, Settings } from "../../../shared/types.ts";
import { reject } from "../lib/errors.ts";
import { clean } from "../lib/text.ts";
import { parsePrice } from "./product.ts";

const sizeList = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value ?? "").split(","))
    .map((item) => clean(String(item), 10))
    .filter(Boolean)
    .slice(0, 20);

export function parseSettings(body: Record<string, unknown>): Settings {
  const instagram = clean(body.instagram, 60).replace(/^@/, "");
  if (instagram && !/^[\w.]+$/.test(instagram)) reject("Instagram: username only, e.g. trendly._.shop");
  const telegram = clean(body.telegram, 40).replace(/^@/, "");
  if (telegram && !/^\w+$/.test(telegram)) reject("Telegram: username only");
  const sizes = (body.sizes ?? {}) as Record<string, unknown>;
  return {
    name: clean(body.name, 60) || DEFAULT_SETTINGS.name,
    city: clean(body.city, 60),
    instagram,
    whatsapp: clean(body.whatsapp, 20).replace(/\D/g, ""),
    telegram,
    phone: clean(body.phone, 30),
    deliveryFee: parsePrice(body.deliveryFee, "Delivery fee"),
    defaultLang: LANGS.includes(body.defaultLang as Lang) ? (body.defaultLang as Lang) : "hy",
    sizes: { clothes: sizeList(sizes.clothes), shoes: sizeList(sizes.shoes), one: [] }
  };
}

export function parseInstagramPost(body: Record<string, unknown>): InstagramPost {
  const img = clean(body.img, 300);
  const url = clean(body.url, 300);
  if (!IMAGE_PATH.test(img)) reject("Upload a photo");
  if (url && !/^https:\/\/(www\.)?instagram\.com\//.test(url)) reject("Link must be an instagram.com link");
  return { img, url };
}
