import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@shared/constants.ts";
import type { InstagramPost, PublicProduct, PublicReview, Settings } from "@shared/types.ts";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";

type Status = "loading" | "ready" | "error";

interface ShopValue {
  status: Status;
  settings: Settings;
  products: PublicProduct[];
  instagram: InstagramPost[];
  reviews: PublicReview[];
  productById: (id: string) => PublicProduct | undefined;
}

const ShopContext = createContext<ShopValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { applyDefault } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [instagram, setInstagram] = useState<InstagramPost[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    let active = true;
    shopApi
      .shop()
      .then((data) => {
        if (!active) return;
        setSettings({ ...DEFAULT_SETTINGS, ...data.config });
        setProducts(data.products);
        setInstagram(data.igPosts);
        applyDefault(data.config.defaultLang);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    shopApi
      .reviews()
      .then((list) => active && setReviews(list))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [applyDefault]);

  const value = useMemo<ShopValue>(() => {
    const index = new Map(products.map((product) => [product.id, product]));
    return { status, settings, products, instagram, reviews, productById: (id) => index.get(id) };
  }, [status, settings, products, instagram, reviews]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
