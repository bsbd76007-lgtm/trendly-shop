import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { ToastProvider } from "@/state/ToastProvider.tsx";
import { AdminProvider } from "./AdminContext.tsx";
import { AdminLayout } from "./AdminLayout.tsx";
import { adminApi, UNAUTHORIZED_EVENT } from "./lib/adminApi.ts";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { InstagramPage } from "./pages/InstagramPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { OrderPage } from "./pages/OrderPage.tsx";
import { OrdersPage } from "./pages/OrdersPage.tsx";
import { ProductEditPage } from "./pages/ProductEditPage.tsx";
import { ProductsPage } from "./pages/ProductsPage.tsx";
import { ReviewsPage } from "./pages/ReviewsPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { SupportPage } from "./pages/SupportPage.tsx";

type Session = "checking" | "signed-in" | "signed-out";

export default function AdminApp() {
  const [session, setSession] = useState<Session>("checking");

  useEffect(() => {
    document.title = "Admin — Trendly Shop";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    adminApi.me().then((result) => setSession(result.admin ? "signed-in" : "signed-out"), () => setSession("signed-out"));
    const onUnauthorized = () => setSession("signed-out");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      meta.remove();
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const signOut = async () => {
    await adminApi.logout().catch(() => undefined);
    setSession("signed-out");
  };

  if (session === "checking") return <p className="p-10 text-muted">Loading…</p>;

  return (
    <ToastProvider placement="right">
      {session === "signed-out" ? (
        <LoginPage onSignedIn={() => setSession("signed-in")} />
      ) : (
        <AdminProvider>
          <Routes>
            <Route element={<AdminLayout onSignOut={() => void signOut()} />}>
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductEditPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="support/:id" element={<SupportPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="instagram" element={<InstagramPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<h1 className="text-2xl font-bold">Not found</h1>} />
            </Route>
          </Routes>
        </AdminProvider>
      )}
    </ToastProvider>
  );
}
