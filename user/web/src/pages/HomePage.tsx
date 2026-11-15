import { useState } from "react";
import { Catalog, type CategoryFilter } from "@/features/catalog/Catalog.tsx";
import { Banner } from "@/features/home/Banner.tsx";
import { CategoryTiles } from "@/features/home/CategoryTiles.tsx";
import { Hero } from "@/features/home/Hero.tsx";
import { InstagramGrid } from "@/features/home/InstagramGrid.tsx";
import { Promo } from "@/features/home/Promo.tsx";
import { Reviews } from "@/features/reviews/Reviews.tsx";

export function HomePage() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  return (
    <>
      <Hero onPick={setFilter} />
      <CategoryTiles onPick={setFilter} />
      <Promo />
      <Catalog filter={filter} onFilter={setFilter} />
      <Banner onPick={setFilter} />
      <InstagramGrid />
      <Reviews />
    </>
  );
}
