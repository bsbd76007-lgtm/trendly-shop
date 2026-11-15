import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { AUTH_SECRET } from "../config/env.ts";

const COOKIE = "trendly_user";
const DAYS = 30;

const sign = (value: string) => createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");

export function readCookie(req: Request, name: string): string {
  const match = (req.headers.cookie ?? "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function cookieHeader(req: Request, name: string, value: string, maxAge: number, path = "/"): string {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; SameSite=Lax${req.secure ? "; Secure" : ""}; Max-Age=${maxAge}`;
}

export function startSession(req: Request, res: Response, userId: string): void {
  const payload = `${userId}.${Date.now() + DAYS * 864e5}`;
  res.append("Set-Cookie", cookieHeader(req, COOKIE, `${payload}.${sign(payload)}`, DAYS * 86400));
}

export function endSession(req: Request, res: Response): void {
  res.append("Set-Cookie", cookieHeader(req, COOKIE, "", 0));
}

export function sessionUserId(req: Request): string | null {
  const [id, expires, signature] = readCookie(req, COOKIE).split(".");
  if (!id || !expires || !signature) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return Number(expires) > Date.now() ? id : null;
}
