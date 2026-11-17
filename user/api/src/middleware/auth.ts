import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ADMIN_PASSWORD, SESSION_HOURS } from "../config/env.ts";
import { db } from "../db/client.ts";
import { checkPassword, hashPassword } from "../lib/password.ts";

const COOKIE = "trendly_admin";
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60e3;
const MIN_LENGTH = 8;
const MAX_LENGTH = 200;

const sessions = new Map<string, number>();
const attempts = new Map<string, { count: number; reset: number }>();
const digest = (value: string) => createHash("sha256").update(value).digest();
const envPasswordDigest = digest(ADMIN_PASSWORD);

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

function countFailure(ip: string) {
  const entry = attempts.get(ip);
  if (entry) entry.count += 1;
}

// A password saved from the admin panel wins; until one is saved, ADMIN_PASSWORD from the env is used.
async function passwordMatches(password: string): Promise<boolean> {
  const saved = await db.adminAuth.findUnique({ where: { id: 1 } });
  if (saved) return checkPassword(password, saved.passwordHash);
  return timingSafeEqual(digest(password), envPasswordDigest);
}

function startSession(req: Request, res: Response) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_HOURS * 3600e3);
  res.setHeader("Set-Cookie", cookie(req, token, SESSION_HOURS * 3600));
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

export async function login(req: Request, res: Response) {
  const ip = req.ip ?? "unknown";
  if (isLockedOut(ip)) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const password = String((req.body as { password?: unknown } | undefined)?.password ?? "");
  if (!(await passwordMatches(password))) {
    countFailure(ip);
    return res.status(401).json({ error: "Wrong password" });
  }
  startSession(req, res);
  res.json({ ok: true });
}

export async function changePassword(req: Request, res: Response) {
  const ip = req.ip ?? "unknown";
  if (isLockedOut(ip)) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const body = (req.body ?? {}) as { current?: unknown; next?: unknown };
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";
  if (next.length < MIN_LENGTH || next.length > MAX_LENGTH) {
    return res.status(400).json({ error: `New password must be ${MIN_LENGTH}–${MAX_LENGTH} characters` });
  }
  if (next.trim() !== next) return res.status(400).json({ error: "New password can't start or end with a space" });
  if (!(await passwordMatches(current))) {
    countFailure(ip);
    return res.status(400).json({ error: "Current password is wrong" });
  }
  if (next === current) return res.status(400).json({ error: "New password is the same as the current one" });
  const passwordHash = await hashPassword(next);
  await db.adminAuth.upsert({ where: { id: 1 }, create: { id: 1, passwordHash }, update: { passwordHash } });
  // Sign out every other browser that was logged in with the old password; keep this one signed in.
  sessions.clear();
  startSession(req, res);
  res.json({ ok: true });
}

export function logout(req: Request, res: Response) {
  sessions.delete(readToken(req));
  res.setHeader("Set-Cookie", cookie(req, "", 0));
  res.json({ ok: true });
}
