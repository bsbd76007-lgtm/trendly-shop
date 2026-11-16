import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ADMIN_PASSWORD, SESSION_HOURS } from "../config/env.ts";

const COOKIE = "trendly_admin";
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60e3;

const sessions = new Map<string, number>();
const attempts = new Map<string, { count: number; reset: number }>();
const digest = (value: string) => createHash("sha256").update(value).digest();
const passwordDigest = digest(ADMIN_PASSWORD);

function readToken(req: Request): string {
  const match = (req.headers.cookie ?? "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return match ? match[1] : "";
}

function cookie(req: Request, value: string, maxAge: number): string {
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict${req.secure ? "; Secure" : ""}; Max-Age=${maxAge}`;
}

function isLockedOut(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 0, reset: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function isAdmin(req: Request): boolean {
  const token = readToken(req);
  const expires = token ? sessions.get(token) : undefined;
  if (!expires) return false;
  if (expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) return res.status(401).json({ error: "Not signed in" });
  next();
}

export function requireJson(req: Request, res: Response, next: NextFunction) {
  if (!["GET", "HEAD", "DELETE"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({ error: "Send JSON" });
  }
  next();
}

export function login(req: Request, res: Response) {
  const ip = req.ip ?? "unknown";
  if (isLockedOut(ip)) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const password = String((req.body as { password?: unknown } | undefined)?.password ?? "").trim();
  if (!timingSafeEqual(digest(password), passwordDigest)) {
    const entry = attempts.get(ip);
    if (entry) entry.count += 1;
    return res.status(401).json({ error: "Wrong password" });
  }
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_HOURS * 3600e3);
  res.setHeader("Set-Cookie", cookie(req, token, SESSION_HOURS * 3600));
  res.json({ ok: true });
}

export function logout(req: Request, res: Response) {
  sessions.delete(readToken(req));
  res.setHeader("Set-Cookie", cookie(req, "", 0));
  res.json({ ok: true });
}
