import { useLocation, useNavigate } from "react-router";
import { SignInForm, SignUpForm } from "@/features/account/AuthForms.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { cn } from "@/lib/cn.ts";

type Tab = "signin" | "signup";

export function AccountPage() {
  const { t } = useI18n();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const tab: Tab = hash === "#signup" ? "signup" : "signin";
  const show = (next: Tab) => navigate({ hash: `#${next}` }, { replace: true });
  const tabs: Array<[Tab, string]> = [["signin", t.account.signIn], ["signup", t.account.signUp]];

  return (
    <div className="grid min-[900px]:min-h-[calc(100vh-100px)] min-[900px]:grid-cols-2">
      <div aria-hidden="true" className="hidden overflow-hidden bg-soft min-[900px]:block">
        <img src="/assets/img/instagram/ig-01.jpg" alt="" className="size-full object-cover" />
      </div>
      <div className="flex items-center justify-center px-[clamp(16px,3.5vw,48px)] py-[clamp(32px,6vw,72px)]">
        <div className="w-full max-w-[400px]">
          <div role="tablist" className="mb-7 grid grid-cols-2 border-b border-line">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => show(key)}
                className={cn(
                  "-mb-px border-b-2 py-3 text-[15px] font-medium",
                  tab === key ? "border-ink font-semibold text-ink" : "border-transparent text-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "signin" ? <SignInForm onSwitch={() => show("signup")} /> : <SignUpForm onSwitch={() => show("signin")} />}
        </div>
      </div>
    </div>
  );
}
