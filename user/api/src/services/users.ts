import { createHash, randomBytes } from "node:crypto";
import type { PublicUser, User } from "../../../shared/types.ts";
import { db } from "../db/client.ts";
import { toUser } from "../db/mappers.ts";
import { missing, reject } from "../lib/errors.ts";
import { checkPassword, hashPassword } from "../lib/password.ts";
import { clean, makeId } from "../lib/text.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_MS = 60 * 60e3;
const DUMMY_HASH = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export const normalizeEmail = (value: unknown) => clean(value, 120).toLowerCase();
export const isEmail = (value: string) => EMAIL.test(value);
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const validPassword = (value: unknown) => {
  const password = typeof value === "string" ? value : "";
  if (password.length < 8 || password.length > 200) reject("Password must be at least 8 characters");
  return password;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  google: Boolean(user.googleId),
  hasPassword: Boolean(user.passwordHash)
});

export async function findUser(id: string): Promise<User | undefined> {
  const row = await db.user.findUnique({ where: { id } });
  return row ? toUser(row) : undefined;
}

export async function signUp(body: Record<string, unknown>): Promise<User> {
  const email = normalizeEmail(body.email);
  const name = clean(body.name, 80);
  if (!isEmail(email)) reject("Enter a valid email");
  if (!name) reject("Enter your name");
  const passwordHash = await hashPassword(validPassword(body.password));
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) reject(existing.googleId && !existing.passwordHash
    ? "This email is linked to Google. Continue with Google instead."
    : "An account with this email already exists. Sign in instead.");
  try {
    return toUser(await db.user.create({ data: { id: makeId("U"), email, name, passwordHash } }));
  } catch {
    return reject("An account with this email already exists. Sign in instead.");
  }
}

export async function signIn(body: Record<string, unknown>): Promise<User> {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const row = await db.user.findUnique({ where: { email } });
  const ok = await checkPassword(password, row?.passwordHash ?? DUMMY_HASH);
  if (row && ok) return toUser(row);
  if (row && !row.passwordHash && row.googleId) reject("This account uses Google. Continue with Google instead.");
  return reject("Wrong email or password");
}

export async function upsertGoogleUser(profile: { sub: string; email: string; name: string }): Promise<User> {
  const email = normalizeEmail(profile.email);
  const name = clean(profile.name, 80);
  return db.$transaction(async (tx) => {
    const existing = (await tx.user.findUnique({ where: { googleId: profile.sub } })) ?? (await tx.user.findUnique({ where: { email } }));
    if (existing) {
      return toUser(await tx.user.update({ where: { id: existing.id }, data: { googleId: profile.sub, name: existing.name || name } }));
    }
    return toUser(await tx.user.create({ data: { id: makeId("U"), email, name, googleId: profile.sub } }));
  });
}

export async function createResetToken(emailInput: unknown): Promise<{ user: User; token: string } | null> {
  const email = normalizeEmail(emailInput);
  const row = email ? await db.user.findUnique({ where: { email } }) : null;
  if (!row) return null;
  const token = randomBytes(32).toString("hex");
  const updated = await db.user.update({ where: { id: row.id }, data: { resetHash: sha256(token), resetExpires: new Date(Date.now() + RESET_MS) } });
  return { user: toUser(updated), token };
}

export async function resetPassword(tokenInput: unknown, passwordInput: unknown): Promise<User> {
  const token = typeof tokenInput === "string" ? tokenInput : "";
  const passwordHash = await hashPassword(validPassword(passwordInput));
  const row = token ? await db.user.findUnique({ where: { resetHash: sha256(token) } }) : null;
  if (!row || !row.resetExpires || row.resetExpires.getTime() < Date.now()) return reject("This reset link has expired. Request a new one.");
  return toUser(await db.user.update({ where: { id: row.id }, data: { passwordHash, resetHash: null, resetExpires: null } }));
}

export async function updateName(id: string, name: unknown): Promise<User> {
  const value = clean(name, 80) || reject("Enter your name");
  const result = await db.user.updateMany({ where: { id }, data: { name: value } });
  if (!result.count) missing("Account not found");
  return (await findUser(id))!;
}
