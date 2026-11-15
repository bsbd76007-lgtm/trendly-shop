import cors from "cors";
import express from "express";
import { errorHandler, handle } from "./lib/errors.ts";
import { adminRoutes } from "./routes/admin/index.ts";
import { authRoutes } from "./routes/auth.ts";
import { payRoutes } from "./routes/pay.ts";
import { publicRoutes } from "./routes/public.ts";
import { supportRoutes } from "./routes/support.ts";
import { readStored } from "./services/uploads.ts";

export function createApp() {
  const app = express();
  // Behind Render (and Vercel's /api rewrite) set TRUST_PROXY=true so req.ip and req.secure use the
  // X-Forwarded-* headers. Locally only the Vite dev proxy on loopback is trusted.
  const trustProxy = (process.env.TRUST_PROXY ?? "").trim();
  app.set("trust proxy", trustProxy === "true" ? true : /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy || "loopback");
  app.disable("x-powered-by");
  app.get("/uploads/:file", handle(async (req, res) => {
    const file = await readStored("uploads", req.params.file);
    if (!file) return res.status(404).end();
    res.setHeader("Content-Type", file.mime);
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    res.send(file.data);
  }));
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api/admin", adminRoutes);
  app.use("/api/auth", express.json({ limit: "10kb" }), authRoutes);
  app.use("/api/pay", express.json({ limit: "6mb" }), payRoutes);
  app.use("/api/support", express.json({ limit: "20kb" }), supportRoutes);
  app.use("/api", cors(), express.json({ limit: "100kb" }), publicRoutes);
  app.use(errorHandler);
  return app;
}
