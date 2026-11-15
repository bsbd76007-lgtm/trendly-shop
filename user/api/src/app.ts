import cors from "cors";
import express from "express";
import { UPLOADS_DIR } from "./config/env.ts";
import { errorHandler } from "./lib/errors.ts";
import { adminRoutes } from "./routes/admin/index.ts";
import { publicRoutes } from "./routes/public.ts";

export function createApp() {
  const app = express();
  app.set("trust proxy", "loopback");
  app.disable("x-powered-by");
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "30d", fallthrough: false }));
  app.use("/api/admin", adminRoutes);
  app.use("/api", cors(), express.json({ limit: "100kb" }), publicRoutes);
  app.use(errorHandler);
  return app;
}
