import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextField } from "@/components/ui/Field.tsx";
import { GoogleIcon } from "@/components/ui/icons.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[46px] w-full items-center justify-center gap-2.5 border border-line-strong bg-white text-sm font-medium text-ink hover:border-ink"
    >
      <GoogleIcon className="size-5" />
      {t.account.google}
    </button>
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

function AuthForm({ title, children, onSubmit, message, footer }: {
  title: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  message: string;
  footer: ReactNode;
}) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <h1 className="mb-1 text-[clamp(26px,3vw,34px)] font-bold">{title}</h1>
      {children}
      <FormMessage>{message}</FormMessage>
      {footer}
    </form>
  );
}

export function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL.test(email) || !password) return setMessage(`${t.account.email} / ${t.account.password}`);
    setMessage(t.account.notConnected);
  };

  return (
    <AuthForm
      title={t.account.signInTitle}
      onSubmit={onSubmit}
      message={message}
      footer={
        <>
          <Button type="submit" block>{t.account.signInButton}</Button>
          <p className="text-center text-sm text-muted">
            {t.account.noAccount}{" "}
            <button type="button" onClick={onSwitch} className="font-medium text-ink underline underline-offset-[3px]">{t.account.signUp}</button>
          </p>
        </>
      }
    >
      <GoogleButton onClick={() => setMessage(t.account.notConnected)} />
      <Divider />
      <TextField label={t.account.email} type="email" autoComplete="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label={t.account.password} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="button" onClick={() => setMessage(t.account.notConnected)} className="-mt-1 self-end text-[13px] text-muted underline underline-offset-[3px] hover:text-ink">
        {t.account.forgot}
      </button>
    </AuthForm>
  );
}

export function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !EMAIL.test(email) || password.length < 8) {
      return setMessage(`${t.checkout.name} / ${t.account.email} / ${t.account.password} (${t.account.passwordHint})`);
    }
    setMessage(t.account.notConnected);
  };

  return (
    <AuthForm
      title={t.account.signUpTitle}
      onSubmit={onSubmit}
      message={message}
      footer={
        <>
          <Button type="submit" block>{t.account.signUpButton}</Button>
          <p className="text-center text-sm text-muted">
            {t.account.haveAccount}{" "}
            <button type="button" onClick={onSwitch} className="font-medium text-ink underline underline-offset-[3px]">{t.account.signIn}</button>
          </p>
        </>
      }
    >
      <div className="flex items-center gap-3.5 bg-soft px-4 py-3.5 text-sm text-ink">
        <b className="max-w-[10ch] shrink-0 text-[15px] leading-tight font-bold">{t.promo.title}</b>
        <span>{t.promo.text}</span>
      </div>
      <GoogleButton onClick={() => setMessage(t.account.notConnected)} />
      <Divider />
      <TextField label={t.checkout.name} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label={t.account.email} type="email" autoComplete="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label={t.account.password} type="password" autoComplete="new-password" hint={t.account.passwordHint} value={password} onChange={(e) => setPassword(e.target.value)} />
    </AuthForm>
  );
}
