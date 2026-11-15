import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container } from "@/components/layout/Container.tsx";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextField } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { HttpError } from "@/lib/http.ts";
import { useAuth } from "@/state/AuthProvider.tsx";
import { useToast } from "@/state/ToastProvider.tsx";

export function ResetPasswordPage() {
  const { t } = useI18n();
  const { accept } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setMessage(t.account.passwordHint);
    setBusy(true);
    setMessage("");
    try {
      accept(await shopApi.resetPassword(params.get("token") ?? "", password));
      toast(t.account.resetDone);
      navigate("/account#orders", { replace: true });
    } catch (error) {
      setMessage(error instanceof HttpError && error.status < 500 ? error.message : t.account.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container className="py-16">
      <form noValidate onSubmit={(event) => void onSubmit(event)} className="mx-auto flex max-w-[400px] flex-col gap-3.5">
        <h1 className="mb-1 text-[clamp(26px,3vw,34px)] font-bold">{t.account.resetTitle}</h1>
        <TextField label={t.account.newPassword} type="password" autoComplete="new-password" hint={t.account.passwordHint} value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormMessage>{message}</FormMessage>
        <Button type="submit" block disabled={busy}>{t.account.savePassword}</Button>
      </form>
    </Container>
  );
}
