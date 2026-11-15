import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { UPLOADS_DIR } from "../config/env.ts";
import { reject } from "../lib/errors.ts";
import { slugify } from "../lib/text.ts";
import { getInstagram, getProducts } from "./catalog.ts";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, { ext: string; magic: number[] }> = {
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] }
};

export async function saveUpload(dataUrl: unknown, name: unknown): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl ?? ""));
  if (!match) return reject("Upload a JPG, PNG or WebP image");
  const bytes = Buffer.from(match[2], "base64");
  const { ext, magic } = TYPES[match[1]];
  if (bytes.length > MAX_BYTES) reject("Image is larger than 8 MB");
  if (!magic.every((byte, index) => bytes[index] === byte)) reject("File is not a real image");
  const file = `${slugify(String(name ?? ""), "photo")}-${randomBytes(4).toString("hex")}.${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(UPLOADS_DIR + file, bytes);
  return `uploads/${file}`;
}

export async function removeUpload(file: string): Promise<void> {
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(file)) reject("Bad file name");
  const [products, posts] = await Promise.all([getProducts(), getInstagram()]);
  const path = `uploads/${file}`;
  if ([...products.map((item) => item.img), ...posts.map((item) => item.img)].includes(path)) reject("This photo is still used");
  await unlink(UPLOADS_DIR + file).catch(() => undefined);
}
