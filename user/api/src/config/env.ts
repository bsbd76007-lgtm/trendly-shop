import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);

export const PORT = Number(process.env.PORT) || 4000;
export const DATA_DIR = fileURLToPath(new URL("data/", root));
export const UPLOADS_DIR = fileURLToPath(new URL("uploads/", root));
export const SESSION_HOURS = 12;

function resolveAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD ?? "";
  if (fromEnv.length >= 8) return fromEnv;
  const temporary = randomBytes(9).toString("base64url");
  console.log("\n  ADMIN_PASSWORD is not set (or shorter than 8 characters).");
  console.log(`  Temporary admin password for this run: ${temporary}`);
  console.log("  Set your own in user/api/.env:  ADMIN_PASSWORD=your-long-password\n");
  return temporary;
}

export const ADMIN_PASSWORD = resolveAdminPassword();
