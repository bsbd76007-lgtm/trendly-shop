import { useState, type FormEvent } from "react";
import type { Customer } from "@shared/types.ts";
import { Button } from "@/components/ui/Button.tsx";
import { FormMessage, TextArea, TextField } from "@/components/ui/Field.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { instagramDm, telegramUrl, whatsappUrl } from "@/lib/links.ts";
import { useCart } from "@/state/CartProvider.tsx";
import { useShop } from "@/state/ShopProvider.tsx";
import { buildOrderMessage } from "./orderMessage.ts";

type Channel = "wa" | "tg" | "ig";

const EMPTY: Customer = { name: "", phone: "", address: "", note: "" };

export function CheckoutForm({ onBack, total }: { onBack: () => void; total: number }) {
  const { t, lang } = useI18n();
  const { settings } = useShop();
  const { entries } = useCart();
  const [customer, setCustomer] = useState<Customer>(EMPTY);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const set = (key: keyof Customer) => (value: string) => setCustomer((current) => ({ ...current, [key]: value }));

  const send = async (channel: Channel) => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setError(true);
      setMessage(t.checkout.fillRequired);
      return;
    }
    setError(false);
    const text = buildOrderMessage({ t, lang, shopName: settings.name, entries, total, customer });
    shopApi
      .placeOrder({ customer, channel, lang, items: entries.map(({ id, size, qty }) => ({ id, size, qty })) })
      .catch(() => undefined);
    if (channel === "wa") {
      window.open(whatsappUrl(settings.whatsapp, text), "_blank", "noopener");
      return;
    }
    const copied = await navigator.clipboard.writeText(text).then(() => true, () => false);
    setMessage(copied ? t.checkout.copied : text);
    window.open(channel === "tg" ? telegramUrl(settings.telegram) : instagramDm(settings.instagram), "_blank", "noopener");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void send((submitter?.value as Channel | undefined) ?? "ig");
  };

  const channels: Array<{ channel: Channel; label: string; enabled: boolean }> = [
    { channel: "wa", label: t.checkout.sendWhatsapp, enabled: Boolean(settings.whatsapp) },
    { channel: "tg", label: t.checkout.sendTelegram, enabled: Boolean(settings.telegram) },
    { channel: "ig", label: t.checkout.sendInstagram, enabled: true }
  ];
  const enabled = channels.filter((item) => item.enabled);

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3.5 pt-4">
      <button type="button" onClick={onBack} className="self-start text-[13px] text-muted underline underline-offset-[3px] hover:text-ink">
        {t.cart.back}
      </button>
      <TextField label={t.checkout.name} autoComplete="name" value={customer.name} onChange={(e) => set("name")(e.target.value)} required />
      <TextField label={t.checkout.phone} type="tel" autoComplete="tel" placeholder="+374" value={customer.phone} onChange={(e) => set("phone")(e.target.value)} required />
      <TextField label={t.checkout.address} autoComplete="street-address" value={customer.address} onChange={(e) => set("address")(e.target.value)} required />
      <TextArea label={t.checkout.note} rows={2} value={customer.note} onChange={(e) => set("note")(e.target.value)} />
      <FormMessage tone={error ? "error" : "info"}>{message}</FormMessage>
      <div className="flex flex-col gap-2">
        {enabled.map((item, index) => (
          <Button key={item.channel} type="submit" value={item.channel} block variant={index === 0 ? "primary" : "outline"}>
            {item.label}
          </Button>
        ))}
      </div>
    </form>
  );
}
