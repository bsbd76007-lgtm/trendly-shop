import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { RECEIPTS_DIR, UPLOADS_DIR } from "../config/env.ts";
import { db } from "../db/client.ts";
import { reject } from "../lib/errors.ts";
import { slugify } from "../lib/text.ts";
import { getInstagram, getProducts } from "./catalog.ts";

// Uploaded photos and payment receipts are stored in Postgres (table StoredFile), so they survive
// restarts and redeploys on hosts with a temporary disk (Render). Ids look like "uploads/<file>"
// and "receipts/<file>". Files left in the old uploads/ and data/receipts/ folders are still served.

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, { ext: string; magic: number[] }> = {
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] }
};
const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export const FILE_NAME = /^[a-z0-9-]+\.(jpg|png|webp)$/;
export const RECEIPT_FILE = FILE_NAME;

type Folder = "uploads" | "receipts";
const DISK: Record<Folder, string> = { uploads: UPLOADS_DIR, receipts: RECEIPTS_DIR };

async function saveImage(dataUrl: unknown, name: unknown, folder: Folder): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl ?? ""));
  if (!match) return reject("Upload a JPG, PNG or WebP image");
  const bytes = Buffer.from(match[2], "base64");
  const { ext, magic } = TYPES[match[1]];
  if (bytes.length > MAX_BYTES) reject("Image is larger than 8 MB");
  if (!magic.every((byte, index) => bytes[index] === byte)) reject("File is not a real image");
  const file = `${slugify(String(name ?? ""), "photo")}-${randomBytes(4).toString("hex")}.${ext}`;
  await db.storedFile.create({ data: { id: `${folder}/${file}`, mime: match[1], data: bytes } });
  return file;
}

export async function saveUpload(dataUrl: unknown, name: unknown): Promise<string> {
  return `uploads/${await saveImage(dataUrl, name, "uploads")}`;
}

export const saveReceipt = (dataUrl: unknown, orderId: string) => saveImage(dataUrl, `receipt-${orderId}`, "receipts");

export async function readStored(folder: Folder, file: string): Promise<{ mime: string; data: Buffer } | null> {
  if (!FILE_NAME.test(file)) return null;
  const row = await db.storedFile.findUnique({ where: { id: `${folder}/${file}` } });
  if (row) return { mime: row.mime, data: Buffer.from(row.data) };
  const data = await readFile(DISK[folder] + file).catch(() => null);
  return data ? { mime: MIME[file.split(".").pop() ?? ""] ?? "application/octet-stream", data } : null;
}

export async function removeUpload(file: string): Promise<void> {
  if (!FILE_NAME.test(file)) reject("Bad file name");
  const [products, posts] = await Promise.all([getProducts(), getInstagram()]);
  const path = `uploads/${file}`;
  if ([...products.map((item) => item.img), ...posts.map((item) => item.img)].includes(path)) reject("This photo is still used");
  await db.storedFile.deleteMany({ where: { id: path } });
}
