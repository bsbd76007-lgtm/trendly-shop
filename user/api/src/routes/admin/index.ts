import express, { Router } from "express";
import { isAdmin, login, logout, requireAdmin, requireJson } from "../../middleware/auth.ts";
import { contentRoutes } from "./content.ts";
import { orderRoutes } from "./orders.ts";
import { productRoutes } from "./products.ts";

export const adminRoutes = Router();
const json = express.json({ limit: "200kb" });

adminRoutes.post("/login", express.json({ limit: "2kb" }), login);
adminRoutes.post("/logout", logout);
adminRoutes.get("/me", (req, res) => {
  res.json({ admin: isAdmin(req) });
});

adminRoutes.use(requireAdmin);
adminRoutes.use((req, res, next) => (req.path === "/upload" ? next() : json(req, res, next)));
adminRoutes.use(requireJson);
adminRoutes.use(orderRoutes, productRoutes, contentRoutes);
