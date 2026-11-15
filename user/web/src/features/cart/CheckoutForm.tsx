import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Customer } from "@shared/types.ts";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextArea, TextField } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { payPath, rememberOrder } from "@/lib/myOrders.ts";
import { useAuth } from "@/state/AuthProvider.tsx";
import { useCart } from "@/state/CartProvider.tsx";

const EMPTY: Customer = { name: "", phone: "", address: "", note: "", email: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutForm({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { entries, clear, close } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer>(EMPTY);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) setCustomer((current) => ({ ...current, name: current.name || user.name, email: current.email || user.email }));
  }, [user]);

  const set = (key: keyof Customer) => (value: string) => setCustomer((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setMessage(t.checkout.fillRequired);
      return;
    }
    if (customer.email?.trim() && !EMAIL.test(customer.email.trim())) {
      setMessage(t.checkout.email);
      return;
    }
    setSending(true);
    setMessage("");
    try {
      const order = await shopApi.placeOrder({ customer, channel: "web", lang, items: entries.map(({ id, size, qty }) => ({ id, size, qty })) });
      rememberOrder({ id: order.id, token: order.token, createdAt: new Date().toISOString(), total: order.total });
      clear();
      close();
      navigate(payPath(order.id, order.token));
    } catch {
      setMessage(t.checkout.failed);
    } finally {
      setSending(false);
    }
  };

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3.5 pt-4">
      <button type="button" onClick={onBack} className="self-start text-[13px] text-muted underline underline-offset-[3px] hover:text-ink">
        {t.cart.back}
      </button>
      <TextField label={t.checkout.name} autoComplete="name" value={customer.name} onChange={(e) => set("name")(e.target.value)} required />
      <TextField label={t.checkout.phone} type="tel" autoComplete="tel" placeholder="+374" value={customer.phone} onChange={(e) => set("phone")(e.target.value)} required />
      <TextField label={t.checkout.email} type="email" autoComplete="email" placeholder="name@gmail.com" hint={t.checkout.emailHint} value={customer.email ?? ""} onChange={(e) => set("email")(e.target.value)} />
      <TextField label={t.checkout.address} autoComplete="street-address" value={customer.address} onChange={(e) => set("address")(e.target.value)} required />
      <TextArea label={t.checkout.note} rows={2} value={customer.note} onChange={(e) => set("note")(e.target.value)} />
      <FormMessage>{message}</FormMessage>
      <Button type="submit" block disabled={sending}>{sending ? t.checkout.sending : t.checkout.toPayment}</Button>
    </form>
  );
}
