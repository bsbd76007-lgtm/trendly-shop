import type { CATEGORIES, LANGS, ORDER_STATUSES, PAYMENT_STATUSES, SIZE_SETS } from "./constants.ts";

export type Lang = (typeof LANGS)[number];
export type Category = (typeof CATEGORIES)[number];
export type SizeSet = (typeof SIZE_SETS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
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
  cards: PaymentCard[];
}

export interface PaymentCard {
  bank: string;
  number: string;
  holder: string;
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
  email?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: string;
  reset?: { hash: string; expires: number };
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  google: boolean;
  hasPassword: boolean;
}

export interface MeResponse {
  user: PublicUser | null;
  googleEnabled: boolean;
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
  payment?: Payment;
  customerUpdate?: string;
  userId?: string;
}

export interface Payment {
  status: PaymentStatus;
  token: string;
  receipt?: string;
  submittedAt?: string;
  decidedAt?: string;
}

export interface OrderView {
  id: string;
  createdAt: string;
  items: Array<Pick<OrderItem, "name" | "size" | "qty" | "sum">>;
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  status: OrderStatus;
  history: StatusChange[];
  payment: PaymentStatus;
  update: string;
  cards: PaymentCard[];
}

export interface OrderAccess {
  id: string;
  token: string;
}

export type SupportAuthor = "customer" | "shop";

export interface SupportMessage {
  from: SupportAuthor;
  text: string;
  at: string;
}

export interface SupportChat {
  id: string;
  token: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  unread: number;
  messages: SupportMessage[];
}

export type SupportChatSummary = Omit<SupportChat, "token" | "messages"> & { last: SupportMessage | null };

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
  token: string;
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
    paymentsToCheck: number;
    needsAction: number;
  };
  products: { total: number; hidden: number; noPrice: number; noPhoto: number };
  support: { unreadChats: number; unreadMessages: number };
  reviews: { pending: number; approved: number; average: number | null };
  recent: Order[];
  top: SoldProduct[];
  days: DayStat[];
}

export interface ApiError {
  error: string;
}
