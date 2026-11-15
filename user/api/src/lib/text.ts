import { randomBytes } from "node:crypto";

export const clean = (value: unknown, max = 300): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export const makeId = (prefix: string): string =>
  prefix + Date.now().toString(36).toUpperCase() + randomBytes(1).toString("hex").toUpperCase();

export const slugify = (value: string, fallback: string): string =>
  value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || fallback;
