import { CATEGORIES, IMAGE_PATH, LANGS, PRODUCT_ID, SIZE_SETS } from "../../../shared/constants.ts";
import type { Category, Localized, Product, SizeSet } from "../../../shared/types.ts";
import { reject } from "../lib/errors.ts";
import { clean } from "../lib/text.ts";

const isCategory = (value: unknown): value is Category => CATEGORIES.includes(value as Category);
const isSizeSet = (value: unknown): value is SizeSet => SIZE_SETS.includes(value as SizeSet);

export function parsePrice(value: unknown, label = "Price"): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount < 0 || amount > 100_000_000) reject(`${label} must be a whole number of AMD`);
  return amount;
}

function parseName(value: unknown): Localized {
  const source = (value ?? {}) as Partial<Record<string, unknown>>;
  const name = Object.fromEntries(LANGS.map((lang) => [lang, clean(source[lang], 120)])) as Localized;
  const first = LANGS.map((lang) => name[lang]).find(Boolean);
  if (!first) reject("Enter the product name");
  for (const lang of LANGS) if (!name[lang]) name[lang] = first as string;
  return name;
}

export function parseProduct(body: Record<string, unknown>, fixedId?: string): Product {
  const id = fixedId ?? clean(body.id, 60).toLowerCase();
  if (!PRODUCT_ID.test(id)) reject("ID: 2–60 characters, a–z, 0–9 and dashes");
  if (!isCategory(body.cat)) reject("Choose a category");
  const img = clean(body.img, 300);
  if (img && !IMAGE_PATH.test(img)) reject("Photo path must start with assets/img/ or uploads/");
  return {
    id,
    cat: body.cat as Category,
    brand: clean(body.brand, 60),
    price: parsePrice(body.price),
    sizes: isSizeSet(body.sizes) ? body.sizes : "one",
    img,
    name: parseName(body.name),
    hidden: Boolean(body.hidden)
  };
}
