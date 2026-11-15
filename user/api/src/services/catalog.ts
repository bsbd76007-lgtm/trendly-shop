import { DEFAULT_SETTINGS } from "../../../shared/constants.ts";
import type { InstagramPost, Product, PublicProduct, Settings } from "../../../shared/types.ts";
import { db } from "../db/client.ts";
import { fromProduct, toInstagram, toProduct, toSettings } from "../db/mappers.ts";
import { missing, reject } from "../lib/errors.ts";

export const toPublicProduct = ({ id, cat, brand, price, sizes, img, name }: Product): PublicProduct =>
  ({ id, cat, brand, price, sizes, img, name });

export async function getSettings(): Promise<Settings> {
  const [row, cards] = await Promise.all([
    db.settings.findUnique({ where: { id: 1 } }),
    db.paymentCard.findMany({ orderBy: { position: "asc" } })
  ]);
  return row ? toSettings(row, cards) : { ...DEFAULT_SETTINGS, cards: cards.map(({ bank, number, holder }) => ({ bank, number, holder })) };
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const { cards, ...fields } = settings;
  await db.$transaction([
    db.settings.upsert({ where: { id: 1 }, create: { id: 1, ...fields }, update: fields }),
    db.paymentCard.deleteMany(),
    db.paymentCard.createMany({ data: cards.map((card, position) => ({ ...card, position })) })
  ]);
  return getSettings();
}

export async function getProducts(): Promise<Product[]> {
  return (await db.product.findMany({ orderBy: { position: "asc" } })).map(toProduct);
}

export async function getVisibleProducts(): Promise<PublicProduct[]> {
  return (await db.product.findMany({ where: { hidden: false }, orderBy: { position: "asc" } })).map(toProduct).map(toPublicProduct);
}

export async function getInstagram(): Promise<InstagramPost[]> {
  return (await db.instagramPost.findMany({ orderBy: { position: "asc" } })).map(toInstagram);
}

export async function saveInstagram(posts: InstagramPost[]): Promise<InstagramPost[]> {
  await db.$transaction([
    db.instagramPost.deleteMany(),
    db.instagramPost.createMany({ data: posts.map((post, position) => ({ ...post, position })) })
  ]);
  return getInstagram();
}

export async function createProduct(product: Product): Promise<Product> {
  return db.$transaction(async (tx) => {
    if (await tx.product.findUnique({ where: { id: product.id } })) reject(`ID "${product.id}" is already used`);
    const first = await tx.product.aggregate({ _min: { position: true } });
    const row = await tx.product.create({ data: { id: product.id, position: (first._min.position ?? 1) - 1, ...fromProduct(product) } });
    return toProduct(row);
  });
}

export async function replaceProduct(product: Product): Promise<Product> {
  const result = await db.product.updateMany({ where: { id: product.id }, data: fromProduct(product) });
  if (!result.count) missing("Product not found");
  return toProduct((await db.product.findUnique({ where: { id: product.id } }))!);
}

export async function changeProduct(id: string, change: (current: Product) => Product): Promise<Product> {
  return db.$transaction(async (tx) => {
    const row = (await tx.product.findUnique({ where: { id } })) ?? missing("Product not found");
    const next = change(toProduct(row));
    return toProduct(await tx.product.update({ where: { id }, data: fromProduct(next) }));
  });
}

export async function moveProduct(id: string, direction: "up" | "down"): Promise<void> {
  await db.$transaction(async (tx) => {
    const current = await tx.product.findUnique({ where: { id } });
    if (!current) return;
    const neighbour = await tx.product.findFirst({
      where: { position: direction === "up" ? { lt: current.position } : { gt: current.position } },
      orderBy: { position: direction === "up" ? "desc" : "asc" }
    });
    if (!neighbour) return;
    await tx.product.update({ where: { id: current.id }, data: { position: neighbour.position } });
    await tx.product.update({ where: { id: neighbour.id }, data: { position: current.position } });
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const result = await db.product.deleteMany({ where: { id } });
  if (!result.count) missing("Product not found");
}
