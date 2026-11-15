import express, { Router } from "express";
import { handle, reject } from "../../lib/errors.ts";
import { getInstagram, getSettings, saveInstagram, saveSettings } from "../../services/catalog.ts";
import { deleteReview, listReviews, updateReview } from "../../services/reviews.ts";
import { getStats } from "../../services/stats.ts";
import { removeUpload, saveUpload } from "../../services/uploads.ts";
import { parseInstagramPost, parseSettings } from "../../validation/settings.ts";

export const contentRoutes = Router();

contentRoutes.get("/stats", handle(async (_req, res) => {
  res.json(await getStats());
}));

contentRoutes.post("/upload", express.json({ limit: "12mb" }), handle(async (req, res) => {
  res.status(201).json({ path: await saveUpload(req.body?.data, req.body?.name) });
}));

contentRoutes.delete("/upload/:name", handle(async (req, res) => {
  await removeUpload(req.params.name);
  res.json({ ok: true });
}));

contentRoutes.get("/reviews", handle(async (_req, res) => {
  res.json(await listReviews());
}));

contentRoutes.patch("/reviews/:id", handle(async (req, res) => {
  res.json(await updateReview(req.params.id, req.body ?? {}));
}));

contentRoutes.delete("/reviews/:id", handle(async (req, res) => {
  await deleteReview(req.params.id);
  res.json({ ok: true });
}));

contentRoutes.get("/instagram", handle(async (_req, res) => {
  res.json(await getInstagram());
}));

contentRoutes.put("/instagram", handle(async (req, res) => {
  if (!Array.isArray(req.body)) reject("Send a list of posts");
  res.json(await saveInstagram((req.body as Record<string, unknown>[]).slice(0, 60).map(parseInstagramPost)));
}));

contentRoutes.get("/settings", handle(async (_req, res) => {
  res.json(await getSettings());
}));

contentRoutes.put("/settings", handle(async (req, res) => {
  res.json(await saveSettings(parseSettings(req.body ?? {})));
}));
