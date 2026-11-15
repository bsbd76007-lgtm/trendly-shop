import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextField } from "@/components/ui/Field.tsx";
import { GoogleIcon } from "@/components/ui/icons.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { HttpError } from "@/lib/http.ts";
import { googleSignInUrl, useAuth } from "@/state/AuthProvider.tsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleButton() {
  const { t } = useI18n();
  const { googleEnabled } = useAuth();
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        type="button"
        onClick={() => (googleEnabled ? window.location.assign(googleSignInUrl()) : setMessage(t.account.googleOff))}
        className="flex min-h-[46px] w-full items-center justify-center gap-2.5 border border-line-strong bg-white text-sm font-medium text-ink hover:border-ink"
      >
        <GoogleIcon className="size-5" />
        {t.account.google}
      </button>
      {message && <FormMessage>{message}</FormMessage>}
    </>
  );
}

function Divider() {
  const { t } = useI18n();
  return (
    <p className="flex items-center gap-3 text-[13px] text-muted before:flex-1 before:border-t before:border-line after:flex-1 after:border-t after:border-line">
      {t.account.or}
    </p>
  );
}

function AuthForm({ title, children, onSubmit, message, tone = "error", footer }: {
  title: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  message: string;
  tone?: "error" | "info";
  footer: ReactNode;
}) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <h1 className="mb-1 text-[clamp(26px,3vw,34px)] font-bold">{title}</h1>
      {children}
      <FormMessage tone={tone}>{message}</FormMessage>
      {footer}
    </form>
  );
}

const SwitchLink = ({ label, action, onClick }: { label: string; action: string; onClick: () => void }) => (
  <p className="text-center text-sm text-muted">
    {label}{" "}
    <button type="button" onClick={onClick} className="font-medium text-ink underline underline-offset-[3px]">{action}</button>
  </p>
);

const errorText = (error: unknown, fallback: string) => (error instanceof HttpError && error.status < 500 ? error.message : fallback);

export function SignInForm({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
  const { t } = useI18n();
  const { accept } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim()) || !password) return setMessage(`${t.account.email} / ${t.account.password}`);
    setBusy(true);
    setMessage("");
    try {
      accept(await shopApi.signIn({ email: email.trim(), password }));
    } catch (error) {
      setMessage(errorText(error, t.account.failed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title={t.account.signInTitle}
      onSubmit={(event) => void onSubmit(event)}
      message={message}
      footer={
        <>
          <Button type="submit" block disabled={busy}>{t.account.signInButton}</Button>
          <SwitchLink label={t.account.noAccount} action={t.account.signUp} onClick={onSwitch} />
        </>
      }
    >
      <GoogleButton />
      <Divider />
      <TextField label={t.account.email} type="email" autoComplete="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label={t.account.password} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="button" onClick={onForgot} className="-mt-1 self-end text-[13px] text-muted underline underline-offset-[3px] hover:text-ink">
        {t.account.forgot}
      </button>
    </AuthForm>
  );
}

export function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { t } = useI18n();
  const { accept } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !EMAIL.test(email.trim()) || password.length < 8) return setMessage(t.account.checkFields);
    setBusy(true);
    setMessage("");
    try {
      accept(await shopApi.signUp({ name: name.trim(), email: email.trim(), password }));
    } catch (error) {
      setMessage(errorText(error, t.account.failed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title={t.account.signUpTitle}
      onSubmit={(event) => void onSubmit(event)}
      message={message}
      footer={
        <>
          <Button type="submit" block disabled={busy}>{t.account.signUpButton}</Button>
          <SwitchLink label={t.account.haveAccount} action={t.account.signIn} onClick={onSwitch} />
        </>
      }
    >
      <div className="flex items-center gap-3.5 bg-soft px-4 py-3.5 text-sm text-ink">
        <b className="max-w-[10ch] shrink-0 text-[15px] leading-tight font-bold">{t.promo.title}</b>
        <span>{t.promo.text}</span>
      </div>
      <GoogleButton />
      <Divider />
      <TextField label={t.checkout.name} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label={t.account.email} type="email" autoComplete="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label={t.account.password} type="password" autoComplete="new-password" hint={t.account.passwordHint} value={password} onChange={(e) => setPassword(e.target.value)} />
    </AuthForm>
  );
}

export function ForgotForm({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) return setMessage(t.account.email);
    setBusy(true);
    setMessage("");
    try {
      await shopApi.forgotPassword(email.trim(), lang);
      setSent(true);
      setMessage(t.account.linkSent);
    } catch (error) {
      setMessage(errorText(error, t.account.failed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title={t.account.forgotTitle}
      onSubmit={(event) => void onSubmit(event)}
      message={message}
      tone={sent ? "info" : "error"}
      footer={
        <>
          <Button type="submit" block disabled={busy || sent}>{t.account.sendLink}</Button>
          <button type="button" onClick={onBack} className="text-center text-sm font-medium text-ink underline underline-offset-[3px]">{t.account.backToSignIn}</button>
        </>
      }
    >
      <p className="-mt-2 text-sm text-muted">{t.account.forgotText}</p>
      <TextField label={t.account.email} type="email" autoComplete="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
    </AuthForm>
  );
}
