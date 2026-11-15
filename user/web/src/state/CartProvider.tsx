import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, PublicProduct } from "@shared/types.ts";
import { readStored, STORAGE_KEYS, writeStored } from "@/lib/storage.ts";
import { useShop } from "./ShopProvider.tsx";

export interface CartEntry extends CartLine {
  product: PublicProduct & { price: number };
}

interface CartValue {
  entries: CartEntry[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  bumpKey: number;
  open: () => void;
  close: () => void;
  add: (id: string, size: string) => void;
  changeQty: (index: number, delta: number) => void;
  remove: (index: number) => void;
}

const CartContext = createContext<CartValue | null>(null);

const isPriced = (product: PublicProduct | undefined): product is PublicProduct & { price: number } =>
  typeof product?.price === "number";

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, productById } = useShop();
  const [lines, setLines] = useState<CartLine[]>(() => readStored<CartLine[]>(STORAGE_KEYS.cart, []));
  const [isOpen, setIsOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    writeStored(STORAGE_KEYS.cart, lines);
  }, [lines]);

  const entries = useMemo<CartEntry[]>(() => {
    if (status !== "ready") return [];
    return lines.flatMap((line) => {
      const product = productById(line.id);
      return isPriced(product) ? [{ ...line, product }] : [];
    });
  }, [lines, productById, status]);

  const add = useCallback((id: string, size: string) => {
    setLines((current) => {
      const existing = current.find((line) => line.id === id && line.size === size);
      if (existing) return current.map((line) => (line === existing ? { ...line, qty: line.qty + 1 } : line));
      return [...current, { id, size, qty: 1 }];
    });
    setBumpKey((key) => key + 1);
  }, []);

  const changeQty = useCallback((index: number, delta: number) => {
    setLines((current) => {
      const target = entries[index];
      if (!target) return current;
      return current
        .map((line) => (line.id === target.id && line.size === target.size ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0);
    });
  }, [entries]);

  const remove = useCallback((index: number) => {
    const target = entries[index];
    if (!target) return;
    setLines((current) => current.filter((line) => !(line.id === target.id && line.size === target.size)));
  }, [entries]);

  const value = useMemo<CartValue>(() => ({
    entries,
    count: entries.reduce((sum, entry) => sum + entry.qty, 0),
    subtotal: entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0),
    isOpen,
    bumpKey,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    add,
    changeQty,
    remove
  }), [entries, isOpen, bumpKey, add, changeQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
