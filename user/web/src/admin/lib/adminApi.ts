import type { InstagramPost, Order, OrderStatus, PaymentStatus, Product, Review, Settings, Stats, SupportChat, SupportChatSummary } from "@shared/types.ts";
import { HttpError, request, type RequestOptions } from "@/lib/http.ts";
import { resizeToJpeg } from "@/lib/image.ts";

export const UNAUTHORIZED_EVENT = "admin:unauthorized";

async function call<T>(path: string, options?: RequestOptions): Promise<T> {
  try {
    return await request<T>(`/api/admin${path}`, options);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401 && path !== "/login") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw error;
  }
}

const id = (value: string) => encodeURIComponent(value);
type Ok = { ok: true };

export const adminApi = {
  me: () => call<{ admin: boolean }>("/me"),
  login: (password: string) => call<Ok>("/login", { method: "POST", body: { password } }),
  logout: () => call<Ok>("/logout", { method: "POST" }),
  stats: () => call<Stats>("/stats"),

  orders: () => call<Order[]>("/orders"),
  updateOrder: (orderId: string, patch: { status?: OrderStatus; adminNote?: string; payment?: PaymentStatus; customerUpdate?: string }) =>
    call<Order>(`/orders/${id(orderId)}`, { method: "PATCH", body: patch }),
  deleteOrder: (orderId: string) => call<Ok>(`/orders/${id(orderId)}`, { method: "DELETE" }),
  ordersCsvUrl: "/api/admin/orders.csv",
  receiptUrl: (file: string) => `/api/admin/receipts/${encodeURIComponent(file)}`,

  products: () => call<Product[]>("/products"),
  createProduct: (product: Product) => call<Product>("/products", { method: "POST", body: product }),
  saveProduct: (product: Product) => call<Product>(`/products/${id(product.id)}`, { method: "PUT", body: product }),
  patchProduct: (productId: string, patch: Partial<Product>) =>
    call<Product>(`/products/${id(productId)}`, { method: "PATCH", body: patch }),
  moveProduct: (productId: string, dir: "up" | "down") =>
    call<Ok>(`/products/${id(productId)}/move`, { method: "POST", body: { dir } }),
  deleteProduct: (productId: string) => call<Ok>(`/products/${id(productId)}`, { method: "DELETE" }),

  uploadPhoto: async (file: File, name: string) => {
    const data = await resizeToJpeg(file);
    return (await call<{ path: string }>("/upload", { method: "POST", body: { data, name } })).path;
  },

  reviews: () => call<Review[]>("/reviews"),
  updateReview: (reviewId: string, patch: { approved?: boolean; reply?: string }) =>
    call<Review>(`/reviews/${id(reviewId)}`, { method: "PATCH", body: patch }),
  deleteReview: (reviewId: string) => call<Ok>(`/reviews/${id(reviewId)}`, { method: "DELETE" }),

  instagram: () => call<InstagramPost[]>("/instagram"),
  saveInstagram: (posts: InstagramPost[]) => call<InstagramPost[]>("/instagram", { method: "PUT", body: posts }),

  chats: () => call<SupportChatSummary[]>("/support"),
  chat: (chatId: string) => call<Omit<SupportChat, "token">>(`/support/${id(chatId)}`),
  replyChat: (chatId: string, text: string) => call<Omit<SupportChat, "token">>(`/support/${id(chatId)}/messages`, { method: "POST", body: { text } }),
  deleteChat: (chatId: string) => call<Ok>(`/support/${id(chatId)}`, { method: "DELETE" }),

  settings: () => call<Settings>("/settings"),
  saveSettings: (settings: unknown) => call<Settings>("/settings", { method: "PUT", body: settings })
};
