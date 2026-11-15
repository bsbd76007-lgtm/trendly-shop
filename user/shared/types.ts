import type { CATEGORIES, LANGS, ORDER_STATUSES, SIZE_SETS } from "./constants.ts";

export type Lang = (typeof LANGS)[number];
export type Category = (typeof CATEGORIES)[number];
export type SizeSet = (typeof SIZE_SETS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Localized = Record<Lang, string>;

export interface Product {
  id: string;
  cat: Category;
  brand: string;
  price: number | null;
  sizes: SizeSet;
  img: string;
  name: Localized;
  hidden: boolean;
}

export type PublicProduct = Omit<Product, "hidden">;

export interface Settings {
  name: string;
  city: string;
  instagram: string;
  whatsapp: string;
  telegram: string;
  phone: string;
  deliveryFee: number | null;
  defaultLang: Lang;
  sizes: Record<SizeSet, string[]>;
}

export interface InstagramPost {
  img: string;
  url: string;
}

export interface ShopData {
  config: Settings;
  products: PublicProduct[];
  igPosts: InstagramPost[];
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  qty: number;
  price: number;
  sum: number;
}

export interface StatusChange {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  adminNote: string;
  channel: string;
  lang: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  history?: StatusChange[];
}

export interface CartLine {
  id: string;
  size: string;
  qty: number;
}

export interface NewOrderRequest {
  customer: Customer;
  items: CartLine[];
  channel: string;
  lang: Lang;
}

export interface NewOrderResponse {
  id: string;
  total: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  approved: boolean;
  reply?: string;
}

export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  reply: string;
}

export interface NewReviewRequest {
  name: string;
  rating: number;
  text: string;
}

export interface SoldProduct {
  id: string;
  name: string;
  qty: number;
  sum: number;
}

export interface DayStat {
  day: string;
  orders: number;
  revenue: number;
}

export interface Stats {
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
    last30: number;
    revenue: number;
    revenue30: number;
    average: number;
  };
  products: { total: number; hidden: number; noPrice: number; noPhoto: number };
  reviews: { pending: number; approved: number; average: number | null };
  recent: Order[];
  top: SoldProduct[];
  days: DayStat[];
}

export interface ApiError {
  error: string;
}
