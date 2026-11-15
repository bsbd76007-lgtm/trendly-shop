import { useLocation, useNavigate, useSearchParams } from "react-router";
import { ForgotForm, SignInForm, SignUpForm } from "@/features/account/AuthForms.tsx";
import { MyPurchases } from "@/features/account/MyPurchases.tsx";
import { FormMessage } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";
import { fill } from "@/lib/format.ts";
import { listMyOrders } from "@/lib/myOrders.ts";
import { useAuth } from "@/state/AuthProvider.tsx";

type Tab = "orders" | "signin" | "signup" | "forgot";

const TABS: Tab[] = ["orders", "signin", "signup", "forgot"];

function SignedIn() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="text-[clamp(24px,3vw,30px)] font-bold">{fill(t.account.hello, { name: user.name.split(" ")[0] || user.email })}</h1>
          <p className="mt-1 truncate text-[13px] text-muted">{fill(t.account.signedInAs, { email: user.email })}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="shrink-0 pt-1.5 text-[13px] font-medium text-ink underline underline-offset-[3px]">
          {t.account.signOut}
        </button>
      </div>
      <MyPurchases />
    </div>
  );
}

export function AccountPage() {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const { hash } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromHash = TABS.find((key) => hash === `#${key}`);
  const tab: Tab = fromHash ?? (listMyOrders().length ? "orders" : "signin");
  const show = (next: Tab) => navigate({ search: "", hash: `#${next}` }, { replace: true });
  const tabs: Array<[Tab, string]> = [["orders", t.purchases.tab], ["signin", t.account.signIn], ["signup", t.account.signUp]];
  const authError = { "google-off": t.account.googleOff, "google-failed": t.account.googleFailed, "google-unverified": t.account.googleUnverified }[params.get("auth") ?? ""];

  return (
    <div className="grid min-[900px]:min-h-[calc(100vh-100px)] min-[900px]:grid-cols-2">
      <div aria-hidden="true" className="hidden overflow-hidden bg-soft min-[900px]:block">
        <img src="/assets/img/instagram/ig-01.jpg" alt="" className="size-full object-cover" />
      </div>
      <div className="flex items-start justify-center px-[clamp(16px,3.5vw,48px)] py-[clamp(32px,6vw,72px)] min-[900px]:items-center">
        <div className="w-full max-w-[460px]">
          {!ready ? (
            <p className="text-muted">…</p>
          ) : user ? (
            <SignedIn />
          ) : (
            <>
              <div role="tablist" className="mb-7 grid grid-cols-3 border-b border-line">
                {tabs.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key || (key === "signin" && tab === "forgot")}
                    onClick={() => show(key)}
                    className={cn(
                      "-mb-px border-b-2 py-3 text-[15px] font-medium",
                      tab === key || (key === "signin" && tab === "forgot") ? "border-ink font-semibold text-ink" : "border-transparent text-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {authError && <div className="mb-4"><FormMessage>{authError}</FormMessage></div>}
              {tab === "orders" && <MyPurchases />}
              {tab === "signin" && <SignInForm onSwitch={() => show("signup")} onForgot={() => show("forgot")} />}
              {tab === "signup" && <SignUpForm onSwitch={() => show("signin")} />}
              {tab === "forgot" && <ForgotForm onBack={() => show("signin")} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
