import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);

export const PORT = Number(process.env.PORT) || 4000;
export const DATA_DIR = fileURLToPath(new URL("data/", root));
export const UPLOADS_DIR = fileURLToPath(new URL("uploads/", root));
export const RECEIPTS_DIR = fileURLToPath(new URL("data/receipts/", root));
export const SESSION_HOURS = 12;

function resolveAdminPassword(): string {
  const raw = process.env.ADMIN_PASSWORD ?? "";
  // Pasting into a hosting dashboard often adds a space or line break; it would make every login fail.
  const fromEnv = raw.trim();
  if (fromEnv !== raw) console.log("  ADMIN_PASSWORD had spaces or line breaks at the start or end. They were removed.");
  if (fromEnv.length >= 8) return fromEnv;
  const temporary = randomBytes(9).toString("base64url");
  console.log("\n  ADMIN_PASSWORD is not set (or shorter than 8 characters).");
  console.log(`  Temporary admin password for this run: ${temporary}`);
  console.log("  Set your own in user/api/.env:  ADMIN_PASSWORD=your-long-password\n");
  return temporary;
}

export const ADMIN_PASSWORD = resolveAdminPassword();

const env = (name: string) => (process.env[name] ?? "").trim();

export const APP_URL = (env("APP_URL") || "http://localhost:3000").replace(/\/+$/, "");

function resolveAuthSecret(): string {
  const fromEnv = env("AUTH_SECRET");
  if (fromEnv.length >= 32) return fromEnv;
  console.log("  AUTH_SECRET is not set (32+ characters). Customers will be signed out when the API restarts.");
  return randomBytes(32).toString("hex");
}

export const AUTH_SECRET = resolveAuthSecret();

export const GOOGLE = {
  clientId: env("GOOGLE_CLIENT_ID"),
  clientSecret: env("GOOGLE_CLIENT_SECRET"),
  redirectUri: env("GOOGLE_REDIRECT_URI") || `${APP_URL}/api/auth/google/callback`
};

export const SMTP = {
  host: env("SMTP_HOST"),
  port: Number(env("SMTP_PORT")) || 587,
  secure: env("SMTP_SECURE") === "true" || env("SMTP_PORT") === "465",
  user: env("SMTP_USER"),
  pass: env("SMTP_PASS"),
  from: env("MAIL_FROM") || env("SMTP_USER")
};

export const ADMIN_EMAIL = env("ADMIN_EMAIL");
