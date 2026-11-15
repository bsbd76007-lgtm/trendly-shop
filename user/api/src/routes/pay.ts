import { Router } from "express";
import { handle } from "../lib/errors.ts";
import { rateLimit } from "../lib/rateLimit.ts";
import { getOrderView, lookupOrder, submitPayment } from "../services/orders.ts";

export const payRoutes = Router();

payRoutes.post("/lookup", rateLimit(10, 15 * 60_000), handle(async (req, res) => {
  res.json(await lookupOrder(req.body?.id, req.body?.phone));
}));

payRoutes.get("/:id", handle(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await getOrderView(req.params.id, req.query.t));
}));

payRoutes.post("/:id/paid", rateLimit(20, 15 * 60_000), handle(async (req, res) => {
  res.json({ status: await submitPayment(req.params.id, req.body?.t, req.body?.receipt) });
}));
