import { DEFAULT_SETTINGS } from "../../../shared/constants.ts";
import type { InstagramPost, Product, PublicProduct, Settings } from "../../../shared/types.ts";
import { load, overwrite, update } from "../lib/store.ts";
import { missing, reject } from "../lib/errors.ts";

export const toPublicProduct = ({ id, cat, brand, price, sizes, img, name }: Product): PublicProduct =>
  ({ id, cat, brand, price, sizes, img, name });

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await load<Partial<Settings>>("settings", DEFAULT_SETTINGS)) };
}

export const saveSettings = (settings: Settings) => overwrite("settings", settings);

export const getProducts = () => load<Product[]>("products", []);

export async function getVisibleProducts(): Promise<PublicProduct[]> {
  return (await getProducts()).filter((product) => !product.hidden).map(toPublicProduct);
}

export const getInstagram = () => load<InstagramPost[]>("instagram", []);
export const saveInstagram = (posts: InstagramPost[]) => overwrite("instagram", posts);

export function createProduct(product: Product): Promise<Product> {
  return update<Product[], Product>("products", [], (list) => {
    if (list.some((item) => item.id === product.id)) reject(`ID "${product.id}" is already used`);
    list.unshift(product);
    return product;
  });
}

export function replaceProduct(product: Product): Promise<Product> {
  return update<Product[], Product>("products", [], (list) => {
    const index = list.findIndex((item) => item.id === product.id);
    if (index < 0) missing("Product not found");
    list[index] = product;
    return product;
  });
}

export function changeProduct(id: string, change: (current: Product) => Product): Promise<Product> {
  return update<Product[], Product>("products", [], (list) => {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) missing("Product not found");
    list[index] = change(list[index]);
    return list[index];
  });
}

export function moveProduct(id: string, direction: "up" | "down"): Promise<void> {
  return update<Product[], void>("products", [], (list) => {
    const from = list.findIndex((item) => item.id === id);
    const to = from + (direction === "up" ? -1 : 1);
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
  });
}

export function deleteProduct(id: string): Promise<void> {
  return update<Product[], void>("products", [], (list) => {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) missing("Product not found");
    list.splice(index, 1);
  });
}
