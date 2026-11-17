import { useState, type FormEvent } from "react";
import { LogoMark } from "@/components/ui/Logo.tsx";
import { AdminButton, PasswordInput } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { errorMessage } from "../lib/labels.ts";

export function LoginPage({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.login(password);
      onSignedIn();
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-soft p-5 text-sm">
      <form onSubmit={onSubmit} className="flex w-full max-w-[360px] flex-col gap-3.5 border border-line bg-white p-7">
        <div className="flex items-center gap-2.5 pb-1.5 text-[17px] font-extrabold tracking-[-0.03em] text-ink">
          <LogoMark className="size-7" />
          <span>Trendly<small className="ml-0.5 text-xs font-medium tracking-normal text-muted">admin</small></span>
        </div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <PasswordInput label="Password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="min-h-[1.2em] font-medium text-red-700">{error}</p>
        <AdminButton tone="primary" type="submit" disabled={busy}>Sign in</AdminButton>
      </form>
    </div>
  );
}
