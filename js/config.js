// ─────────────────────────────────────────────
//  Shop settings — edit these first
// ─────────────────────────────────────────────
window.SHOP_CONFIG = {
  name: "Trendly Shop",
  city: "Yerevan",

  // Instagram username (orders via DM)
  instagram: "trendly._.shop",

  // WhatsApp number in international format, digits only, e.g. "37499123456".
  // Leave "" to hide the WhatsApp button.
  whatsapp: "",

  // Telegram username without @, e.g. "trendly_shop". Leave "" to hide.
  telegram: "",

  // Phone shown in the footer, e.g. "+374 99 12 34 56". Leave "" to hide.
  phone: "",

  // Delivery fee in AMD. null = "we'll confirm the price" text instead of a number.
  deliveryFee: null,

  // Default language: "hy" | "ru" | "en"
  defaultLang: "hy",

  // Size sets used by products (products.js -> sizes: "clothes" | "shoes" | "one")
  sizes: {
    clothes: ["S", "M", "L", "XL", "XXL"],
    shoes: ["40", "41", "42", "43", "44", "45"],
    one: []
  }
};
