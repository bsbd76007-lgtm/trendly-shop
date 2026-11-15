import { randomBytes } from "node:crypto";
import { Router, type Request, type Response } from "express";
import type { MeResponse } from "../../../shared/types.ts";
import { APP_URL, GOOGLE } from "../config/env.ts";
import { handle } from "../lib/errors.ts";
import { rateLimit } from "../lib/rateLimit.ts";
import { cookieHeader, endSession, readCookie, sessionUserId, startSession } from "../middleware/customer.ts";
import { sendLater } from "../services/mail.ts";
import { ordersForUser } from "../services/orders.ts";
import { resetMail } from "../services/notify.ts";
import { createResetToken, findUser, resetPassword, signIn, signUp, toPublicUser, updateName, upsertGoogleUser } from "../services/users.ts";

export const authRoutes = Router();

const STATE_COOKIE = "trendly_oauth";
const googleEnabled = () => Boolean(GOOGLE.clientId && GOOGLE.clientSecret);
const safeNext = (value: unknown) => (typeof value === "string" && /^\/(?!\/)[\w\-/#?=&.%]*$/.test(value) ? value : "/account#orders");
const attempts = rateLimit(20, 15 * 60_000);

async function me(req: Request): Promise<MeResponse> {
  const id = sessionUserId(req);
  const user = id ? await findUser(id) : undefined;
  return { user: user ? toPublicUser(user) : null, googleEnabled: googleEnabled() };
}

authRoutes.get("/me", handle(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await me(req));
}));

authRoutes.post("/signup", attempts, handle(async (req, res) => {
  const user = await signUp(req.body ?? {});
  startSession(req, res, user.id);
  res.status(201).json({ user: toPublicUser(user), googleEnabled: googleEnabled() });
}));

authRoutes.post("/login", attempts, handle(async (req, res) => {
  const user = await signIn(req.body ?? {});
  startSession(req, res, user.id);
  res.json({ user: toPublicUser(user), googleEnabled: googleEnabled() });
}));

authRoutes.post("/logout", (req, res) => {
  endSession(req, res);
  res.json({ ok: true });
});

authRoutes.patch("/me", handle(async (req, res) => {
  const id = sessionUserId(req);
  if (!id) return res.status(401).json({ error: "Not signed in" });
  res.json({ user: toPublicUser(await updateName(id, req.body?.name)), googleEnabled: googleEnabled() });
}));

authRoutes.post("/forgot", rateLimit(5, 60 * 60_000), handle(async (req, res) => {
  const result = await createResetToken(req.body?.email);
  if (result) sendLater(resetMail(result.user.email, `${APP_URL}/account/reset?token=${result.token}`, req.body?.lang));
  res.json({ ok: true });
}));

authRoutes.post("/reset", attempts, handle(async (req, res) => {
  const user = await resetPassword(req.body?.token, req.body?.password);
  startSession(req, res, user.id);
  res.json({ user: toPublicUser(user), googleEnabled: googleEnabled() });
}));

authRoutes.get("/orders", handle(async (req, res) => {
  const id = sessionUserId(req);
  if (!id) return res.status(401).json({ error: "Not signed in" });
  const user = await findUser(id);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  res.setHeader("Cache-Control", "no-store");
  res.json(await ordersForUser(user.id, user.email));
}));

authRoutes.get("/google", (req: Request, res: Response) => {
  if (!googleEnabled()) return res.redirect(`${APP_URL}/account?auth=google-off`);
  const state = randomBytes(16).toString("hex");
  res.append("Set-Cookie", cookieHeader(req, STATE_COOKIE, `${state}|${safeNext(req.query.next)}`, 600, "/api/auth"));
  const params = new URLSearchParams({
    client_id: GOOGLE.clientId,
    redirect_uri: GOOGLE.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
}

async function googleProfile(code: string): Promise<GoogleProfile> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: GOOGLE.clientId, client_secret: GOOGLE.clientSecret, redirect_uri: GOOGLE.redirectUri, grant_type: "authorization_code" })
  });
  if (!tokenResponse.ok) throw new Error(`Google token exchange failed (${tokenResponse.status})`);
  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token?: string };
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!profileResponse.ok) throw new Error(`Google profile request failed (${profileResponse.status})`);
  return (await profileResponse.json()) as GoogleProfile;
}

authRoutes.get("/google/callback", async (req: Request, res: Response) => {
  const [state, next] = readCookie(req, STATE_COOKIE).split("|");
  res.append("Set-Cookie", cookieHeader(req, STATE_COOKIE, "", 0, "/api/auth"));
  const fail = (reason: string) => res.redirect(`${APP_URL}/account?auth=${reason}`);
  if (!state || req.query.state !== state || typeof req.query.code !== "string") return fail("google-failed");
  try {
    const profile = await googleProfile(req.query.code);
    if (!profile.email || !profile.email_verified) return fail("google-unverified");
    const user = await upsertGoogleUser({ sub: profile.sub, email: profile.email, name: profile.name ?? "" });
    startSession(req, res, user.id);
    res.redirect(`${APP_URL}${safeNext(next)}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    fail("google-failed");
  }
});
