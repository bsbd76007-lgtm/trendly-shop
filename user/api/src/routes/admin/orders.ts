import { Router } from "express";
import { handle } from "../../lib/errors.ts";
import { deleteOrder, listOrders, ordersCsv, updateOrder } from "../../services/orders.ts";

export const orderRoutes = Router();

orderRoutes.get("/orders", handle(async (_req, res) => {
  res.json(await listOrders());
}));

orderRoutes.get("/orders.csv", handle(async (_req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(await ordersCsv());
}));

orderRoutes.patch("/orders/:id", handle(async (req, res) => {
  res.json(await updateOrder(req.params.id, req.body ?? {}));
}));

orderRoutes.delete("/orders/:id", handle(async (req, res) => {
  await deleteOrder(req.params.id);
  res.json({ ok: true });
}));
