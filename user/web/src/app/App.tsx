import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { SiteLayout } from "@/components/layout/SiteLayout.tsx";
import { I18nProvider } from "@/i18n/I18nProvider.tsx";
import { AboutPage } from "@/pages/AboutPage.tsx";
import { AccountPage } from "@/pages/AccountPage.tsx";
import { FaqPage } from "@/pages/FaqPage.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { NotFoundPage } from "@/pages/NotFoundPage.tsx";
import { PrivacyPage } from "@/pages/PrivacyPage.tsx";
import { CartProvider } from "@/state/CartProvider.tsx";
import { ShopProvider } from "@/state/ShopProvider.tsx";
import { ToastProvider } from "@/state/ToastProvider.tsx";

const AdminApp = lazy(() => import("@/admin/AdminApp.tsx"));

function Shop() {
  return (
    <I18nProvider>
      <ShopProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </CartProvider>
      </ShopProvider>
    </I18nProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="p-10 text-muted">Loading…</p>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  );
}
