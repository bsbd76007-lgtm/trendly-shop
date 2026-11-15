import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { LogoMark } from "@/components/ui/Logo.tsx";
import { cn } from "@/lib/cn.ts";
import { useAdmin } from "./AdminContext.tsx";

const NAV: Array<{ to: string; label: string; count?: "orders" | "reviews" | "support"; end?: boolean }> = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Orders", count: "orders" },
  { to: "/admin/support", label: "Support", count: "support" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/reviews", label: "Reviews", count: "reviews" },
  { to: "/admin/instagram", label: "Instagram" },
  { to: "/admin/settings", label: "Settings" }
];

export function AdminLayout({ onSignOut }: { onSignOut: () => void }) {
  const { counts } = useAdmin();

  useEffect(() => {
    const pending = counts.orders + counts.reviews + counts.support;
    document.title = `${pending ? `(${pending}) ` : ""}Admin — Trendly Shop`;
  }, [counts]);

  return (
    <div className="grid min-h-screen bg-soft text-sm leading-normal min-[821px]:grid-cols-[232px_1fr]">
      <aside className="flex flex-wrap gap-1 bg-ink p-2.5 text-[#d6d6d6] min-[821px]:sticky min-[821px]:top-0 min-[821px]:h-screen min-[821px]:flex-col min-[821px]:flex-nowrap min-[821px]:px-3 min-[821px]:py-[18px]">
        <Link to="/admin" className="flex w-full items-center gap-2.5 px-2.5 pt-1 pb-[18px] text-[17px] font-extrabold tracking-[-0.03em] text-white no-underline max-[820px]:pb-1">
          <LogoMark tone="light" className="size-7" />
          <span>Trendly<small className="ml-0.5 text-xs font-medium tracking-normal text-[#8f8f8f]">admin</small></span>
        </Link>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn("flex items-center justify-between gap-2 px-2.5 py-[9px] font-medium no-underline", isActive ? "bg-white text-ink" : "hover:bg-[#222] hover:text-white")
            }
          >
            {item.label}
            {item.count && counts[item.count] > 0 && (
              <span className="h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-center text-[11px] leading-5 font-bold text-white">{counts[item.count]}</span>
            )}
          </NavLink>
        ))}
        <div className="flex gap-1 min-[821px]:mt-auto min-[821px]:flex-col min-[821px]:border-t min-[821px]:border-[#2a2a2a] min-[821px]:pt-3">
          <a href="/" target="_blank" rel="noopener" className="px-2.5 py-2 text-[#bdbdbd] no-underline hover:text-white">Open shop ↗</a>
          <button type="button" onClick={onSignOut} className="px-2.5 py-2 text-left text-[#bdbdbd] hover:text-white">Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 px-[clamp(16px,3vw,40px)] pt-7 pb-[60px]">
        <Outlet />
      </main>
    </div>
  );
}
