import { Router } from "express";
import type { NewOrderResponse, ShopData } from "../../../shared/types.ts";
import { handle, missing } from "../lib/errors.ts";
import { getInstagram, getSettings, getVisibleProducts } from "../services/catalog.ts";
import { createOrder } from "../services/orders.ts";
import { listPublicReviews, submitReview } from "../services/reviews.ts";
import { parseOrder, parseReview } from "../validation/public.ts";

export const publicRoutes = Router();

publicRoutes.get("/health", (_req, res) => {
  res.json({ ok: true });
});

publicRoutes.get("/shop", handle(async (_req, res) => {
  const [config, products, igPosts] = await Promise.all([getSettings(), getVisibleProducts(), getInstagram()]);
  const data: ShopData = { config, products, igPosts };
  res.json(data);
}));

publicRoutes.get("/config", handle(async (_req, res) => {
  res.json(await getSettings());
}));

publicRoutes.get("/products", handle(async (_req, res) => {
  res.json(await getVisibleProducts());
}));

publicRoutes.get("/products/:id", handle(async (req, res) => {
  const product = (await getVisibleProducts()).find((item) => item.id === req.params.id);
  res.json(product ?? missing("Product not found"));
}));

publicRoutes.get("/instagram", handle(async (_req, res) => {
  res.json(await getInstagram());
}));

publicRoutes.post("/orders", handle(async (req, res) => {
  const order = await createOrder(parseOrder(req.body ?? {}));
  const response: NewOrderResponse = { id: order.id, total: order.total };
  res.status(201).json(response);
}));

publicRoutes.get("/reviews", handle(async (_req, res) => {
  res.json(await listPublicReviews());
}));

publicRoutes.post("/reviews", handle(async (req, res) => {
  await submitReview(parseReview(req.body ?? {}));
  res.status(201).json({ ok: true });
}));
