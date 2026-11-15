import type { Settings } from "./types.ts";

export const LANGS = ["hy", "ru", "en"] as const;
export const CATEGORIES = ["outerwear", "tops", "bottoms", "shoes", "accessories"] as const;
export const SIZE_SETS = ["clothes", "shoes", "one"] as const;
export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export const IMAGE_PATH = /^(assets\/img\/|uploads\/)[\w./-]+$/;
export const PRODUCT_ID = /^[a-z0-9][a-z0-9-]{1,59}$/;

export const DEFAULT_SETTINGS: Settings = {
  name: "Trendly Shop",
  city: "Yerevan",
  instagram: "",
  whatsapp: "",
  telegram: "",
  phone: "",
  deliveryFee: null,
  defaultLang: "hy",
  sizes: {
    clothes: ["S", "M", "L", "XL", "XXL"],
    shoes: ["40", "41", "42", "43", "44", "45"],
    one: []
  }
};
