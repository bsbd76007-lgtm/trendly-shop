import type {
  NewOrderRequest,
  NewOrderResponse,
  NewReviewRequest,
  PublicReview,
  ShopData
} from "@shared/types.ts";
import { request } from "./http.ts";

export const shopApi = {
  shop: () => request<ShopData>("/api/shop"),
  reviews: () => request<PublicReview[]>("/api/reviews"),
  placeOrder: (order: NewOrderRequest) => request<NewOrderResponse>("/api/orders", { method: "POST", body: order }),
  sendReview: (review: NewReviewRequest) => request<{ ok: true }>("/api/reviews", { method: "POST", body: review })
};
