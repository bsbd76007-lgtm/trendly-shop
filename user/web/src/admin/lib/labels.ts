import type { Category, Lang, OrderStatus, PaymentStatus, SizeSet } from "@shared/types.ts";

export const CATEGORY_LABELS: Record<Category, string> = {
  outerwear: "Outerwear",
  tops: "Hoodies & tops",
  bottoms: "Pants & sets",
  shoes: "Shoes",
  accessories: "Accessories"
};

export const SIZE_SET_LABELS: Record<SizeSet, string> = {
  clothes: "Clothes sizes",
  shoes: "Shoe sizes",
  one: "One size"
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  confirmed: "bg-amber-50 text-amber-800",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-stone-100 text-muted"
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  awaiting: "Not paid yet",
  submitted: "Payment to check",
  paid: "Paid",
  rejected: "Payment rejected"
};

export const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  awaiting: "bg-stone-100 text-muted",
  submitted: "bg-amber-100 text-amber-900",
  paid: "bg-green-50 text-green-800",
  rejected: "bg-red-50 text-red-700"
};

export const LANG_NAMES: Record<Lang, string> = { hy: "Armenian", ru: "Russian", en: "English" };

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong");

export const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
