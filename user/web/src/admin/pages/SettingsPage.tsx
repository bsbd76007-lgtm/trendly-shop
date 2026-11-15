import { useEffect, useState, type FormEvent } from "react";
import { LANGS } from "@shared/constants.ts";
import type { Lang, Settings } from "@shared/types.ts";
import { useAdmin } from "../AdminContext.tsx";
import { AdminButton, ErrorState, Input, Loading, PageHeader, Panel, Select } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { errorMessage, LANG_NAMES } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

interface FormState {
  name: string;
  city: string;
  defaultLang: Lang;
  instagram: string;
  telegram: string;
  whatsapp: string;
  phone: string;
  deliveryFee: string;
  clothes: string;
  shoes: string;
}

const toForm = (settings: Settings): FormState => ({
  name: settings.name,
  city: settings.city,
  defaultLang: settings.defaultLang,
  instagram: settings.instagram,
  telegram: settings.telegram,
  whatsapp: settings.whatsapp,
  phone: settings.phone,
  deliveryFee: settings.deliveryFee === null ? "" : String(settings.deliveryFee),
  clothes: settings.sizes.clothes.join(", "),
  shoes: settings.sizes.shoes.join(", ")
});

const grid = "grid gap-3.5 p-[18px] min-[821px]:grid-cols-2";

export function SettingsPage() {
  const { notify } = useAdmin();
  const { data, error, loading } = useResource(adminApi.settings);
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(toForm(data));
  }, [data]);

  if (loading || (data && !form)) return <Loading />;
  if (!data || !form) return <ErrorState message={error} />;

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value })
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const saved = await adminApi.saveSettings({
        name: form.name,
        city: form.city,
        defaultLang: form.defaultLang,
        instagram: form.instagram,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
        phone: form.phone,
        deliveryFee: form.deliveryFee === "" ? null : Number(form.deliveryFee),
        sizes: { clothes: form.clothes, shoes: form.shoes }
      });
      setForm(toForm(saved));
      notify("Settings saved");
    } catch (failure) {
      setMessage(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" />
      <form noValidate onSubmit={onSubmit} className="flex max-w-[820px] flex-col gap-4">
        <Panel title="Shop" bodyClassName={grid}>
          <Input label="Shop name" maxLength={60} {...field("name")} />
          <Input label="City" maxLength={60} {...field("city")} />
          <Select label="Default language" hint="For visitors who haven't picked a language yet" {...field("defaultLang")}>
            {LANGS.map((lang) => <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>)}
          </Select>
        </Panel>
        <Panel title="Contacts" bodyClassName={grid}>
          <Input label="Instagram username" placeholder="trendly._.shop" {...field("instagram")} />
          <Input label="Telegram username" placeholder="trendly_shop" hint="Empty = no Telegram button" {...field("telegram")} />
          <Input label="WhatsApp number" placeholder="37499123456" inputMode="numeric" hint="Digits with country code. Empty = no WhatsApp button" {...field("whatsapp")} />
          <Input label="Phone in the footer" placeholder="+374 99 12 34 56" {...field("phone")} />
        </Panel>
        <Panel title="Delivery and sizes" bodyClassName={grid}>
          <Input label="Delivery fee, AMD" type="number" min={0} step={100} placeholder="empty = we confirm the price" hint={'Empty: the cart says "we\'ll confirm"'} {...field("deliveryFee")} />
          <div />
          <Input label="Clothes sizes" hint="Comma separated" {...field("clothes")} />
          <Input label="Shoe sizes" hint="Comma separated" {...field("shoes")} />
        </Panel>
        <p className="min-h-[1.2em] font-medium text-red-700">{message}</p>
        <div><AdminButton tone="primary" type="submit" disabled={saving}>Save settings</AdminButton></div>
      </form>
    </>
  );
}
