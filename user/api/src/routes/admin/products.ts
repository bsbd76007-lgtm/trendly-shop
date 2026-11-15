import { Router } from "express";
import { handle } from "../../lib/errors.ts";
import {
  changeProduct,
  createProduct,
  deleteProduct,
  getProducts,
  moveProduct,
  replaceProduct
} from "../../services/catalog.ts";
import { parseProduct } from "../../validation/product.ts";

export const productRoutes = Router();

productRoutes.get("/products", handle(async (_req, res) => {
  res.json(await getProducts());
}));

productRoutes.post("/products", handle(async (req, res) => {
  res.status(201).json(await createProduct(parseProduct(req.body ?? {})));
}));

productRoutes.put("/products/:id", handle(async (req, res) => {
  res.json(await replaceProduct(parseProduct(req.body ?? {}, req.params.id)));
}));

productRoutes.patch("/products/:id", handle(async (req, res) => {
  res.json(await changeProduct(req.params.id, (current) => parseProduct({ ...current, ...req.body }, current.id)));
}));

productRoutes.post("/products/:id/move", handle(async (req, res) => {
  await moveProduct(req.params.id, req.body?.dir === "up" ? "up" : "down");
  res.json({ ok: true });
}));

productRoutes.delete("/products/:id", handle(async (req, res) => {
  await deleteProduct(req.params.id);
  res.json({ ok: true });
}));
