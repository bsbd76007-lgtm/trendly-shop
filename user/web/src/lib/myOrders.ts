import { readStored, STORAGE_KEYS, writeStored } from "./storage.ts";

export interface SavedOrder {
  id: string;
  token: string;
  createdAt: string;
  total: number;
}

export const listMyOrders = () =>
  readStored<SavedOrder[]>(STORAGE_KEYS.orders, []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

export function rememberOrder(order: SavedOrder): void {
  const others = listMyOrders().filter((item) => item.id !== order.id);
  writeStored(STORAGE_KEYS.orders, [order, ...others].slice(0, 50));
}

export const trackPath = (id: string, token: string) => `/track/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`;
export const payPath = (id: string, token: string) => `/pay/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`;
