import express, { Router } from "express";
import { handle } from "../../lib/errors.ts";
import { changePassword, isAdmin, login, logout, requireAdmin, requireJson } from "../../middleware/auth.ts";
import { contentRoutes } from "./content.ts";
import { orderRoutes } from "./orders.ts";
import { productRoutes } from "./products.ts";
import { supportAdminRoutes } from "./support.ts";

export const adminRoutes = Router();
const json = express.json({ limit: "200kb" });

adminRoutes.post("/login", express.json({ limit: "2kb" }), handle(login));
adminRoutes.post("/logout", logout);
adminRoutes.get("/me", (req, res) => {
  res.json({ admin: isAdmin(req) });
});

adminRoutes.use(requireAdmin);
adminRoutes.use((req, res, next) => (req.path === "/upload" ? next() : json(req, res, next)));
adminRoutes.use(requireJson);
adminRoutes.post("/password", handle(changePassword));
adminRoutes.use(orderRoutes, productRoutes, contentRoutes, supportAdminRoutes);
