import type {
  MeResponse,
  NewOrderRequest,
  NewOrderResponse,
  NewReviewRequest,
  OrderAccess,
  OrderView,
  PaymentStatus,
  SupportMessage,
  PublicReview,
  ShopData
} from "@shared/types.ts";
import { request } from "./http.ts";

export const shopApi = {
  shop: () => request<ShopData>("/api/shop"),
  reviews: () => request<PublicReview[]>("/api/reviews"),
  placeOrder: (order: NewOrderRequest) => request<NewOrderResponse>("/api/orders", { method: "POST", body: order }),
  order: (id: string, token: string) =>
    request<OrderView>(`/api/pay/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`),
  submitPayment: (id: string, token: string, receipt?: string) =>
    request<{ status: PaymentStatus }>(`/api/pay/${encodeURIComponent(id)}/paid`, { method: "POST", body: { t: token, receipt } }),
  findOrder: (id: string, phone: string) => request<OrderAccess>("/api/pay/lookup", { method: "POST", body: { id, phone } }),
  startChat: (name: string, text: string) =>
    request<OrderAccess & { messages: SupportMessage[] }>("/api/support", { method: "POST", body: { name, text } }),
  chat: (id: string, token: string) =>
    request<{ messages: SupportMessage[] }>(`/api/support/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`),
  sendChat: (id: string, token: string, text: string) =>
    request<{ messages: SupportMessage[] }>(`/api/support/${encodeURIComponent(id)}/messages`, { method: "POST", body: { t: token, text } }),
  me: () => request<MeResponse>("/api/auth/me"),
  signUp: (body: { name: string; email: string; password: string }) => request<MeResponse>("/api/auth/signup", { method: "POST", body }),
  signIn: (body: { email: string; password: string }) => request<MeResponse>("/api/auth/login", { method: "POST", body }),
  signOut: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  forgotPassword: (email: string, lang: string) => request<{ ok: true }>("/api/auth/forgot", { method: "POST", body: { email, lang } }),
  resetPassword: (token: string, password: string) => request<MeResponse>("/api/auth/reset", { method: "POST", body: { token, password } }),
  myOrders: () => request<Array<OrderAccess & { createdAt: string; total: number }>>("/api/auth/orders"),
  sendReview: (review: NewReviewRequest) => request<{ ok: true }>("/api/reviews", { method: "POST", body: review })
};
