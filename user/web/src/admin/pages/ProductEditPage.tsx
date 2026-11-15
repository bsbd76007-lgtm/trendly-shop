import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { CATEGORIES, LANGS, SIZE_SETS } from "@shared/constants.ts";
import type { Category, Product, Settings, SizeSet } from "@shared/types.ts";
import { useAdmin } from "../AdminContext.tsx";
import { PhotoPicker } from "../components/PhotoPicker.tsx";
import { AdminButton, adminButton, Checkbox, ErrorState, Input, Loading, PageHeader, Panel, Select } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { CATEGORY_LABELS, errorMessage, LANG_NAMES, SIZE_SET_LABELS, slugify } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

const BLANK: Product = { id: "", cat: "tops", brand: "", price: null, sizes: "clothes", img: "", name: { hy: "", ru: "", en: "" }, hidden: false };

interface Loaded {
  product: Product | null;
  settings: Settings;
}

export function ProductEditPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { notify, fail } = useAdmin();
  const load = useCallback(async (): Promise<Loaded> => {
    const [products, settings] = await Promise.all([adminApi.products(), adminApi.settings()]);
    const product = isNew ? BLANK : products.find((item) => item.id === id);
    if (!product) throw new Error("Product not found");
    return { product, settings };
  }, [id, isNew]);
  const { data, error, loading } = useResource(load);

  const [form, setForm] = useState<Product>(BLANK);
  const [priceText, setPriceText] = useState("");
  const [onRequest, setOnRequest] = useState(true);
  const [idTouched, setIdTouched] = useState(!isNew);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data?.product) return;
    setForm(data.product);
    setPriceText(data.product.price === null ? "" : String(data.product.price));
    setOnRequest(data.product.price === null);
    setIdTouched(!isNew);
  }, [data, isNew]);

  if (loading) return <Loading />;
  if (!data) return <><PageHeader title="Product" back={{ to: "/admin/products", label: "Products" }} /><ErrorState message={error} /></>;

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setName = (lang: keyof Product["name"], value: string) =>
    setForm((current) => ({
      ...current,
      name: { ...current.name, [lang]: value },
      id: lang === "en" && isNew && !idTouched ? slugify(value) : current.id
    }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onRequest && priceText === "") return setMessage("Enter a price or tick “Price on request”.");
    setSaving(true);
    setMessage("");
    try {
      const body: Product = { ...form, price: onRequest ? null : Number(priceText) };
      const saved = isNew ? await adminApi.createProduct(body) : await adminApi.saveProduct(body);
      notify(isNew ? "Product created" : "Saved");
      if (isNew) navigate(`/admin/products/${encodeURIComponent(saved.id)}`, { replace: true });
      else setForm(saved);
    } catch (failure) {
      setMessage(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${form.name.en}"? This can't be undone.`)) return;
    try {
      await adminApi.deleteProduct(form.id);
      notify("Product deleted");
      navigate("/admin/products");
    } catch (failure) {
      fail(failure);
    }
  };

  const sizeHint = (set: SizeSet) => data.settings.sizes[set].join(", ") || "no sizes";

  return (
    <>
      <PageHeader
        back={{ to: "/admin/products", label: "Products" }}
        title={isNew ? "New product" : form.name.en || form.id}
        actions={!isNew && <a href={`/#p-${form.id}`} target="_blank" rel="noopener" className={adminButton()}>View in shop ↗</a>}
      />
      <form noValidate onSubmit={onSubmit} className="grid items-start gap-4 min-[1101px]:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Name" bodyClassName="grid gap-3.5 p-[18px] min-[821px]:grid-cols-2">
            {LANGS.map((lang) => (
              <Input key={lang} className="min-[821px]:col-span-2" label={LANG_NAMES[lang]} maxLength={120} value={form.name[lang]} onChange={(event) => setName(lang, event.target.value)} />
            ))}
            <Input label="Brand" maxLength={60} value={form.brand} onChange={(event) => set("brand", event.target.value)} hint="Shown on the grey tile when there's no photo" />
            <Input
              label="ID (in the link)"
              maxLength={60}
              readOnly={!isNew}
              value={form.id}
              onChange={(event) => { setIdTouched(true); set("id", event.target.value); }}
              hint={isNew ? "Made from the English name. a–z, 0–9, dashes." : "Can't be changed."}
            />
          </Panel>
          <Panel title="Price and sizes" bodyClassName="grid gap-3.5 p-[18px] min-[821px]:grid-cols-2">
            <Input label="Price, AMD" type="number" min={0} step={500} disabled={onRequest} value={priceText} onChange={(event) => setPriceText(event.target.value)} />
            <Checkbox className="min-h-[38px] self-end" label="Price on request" checked={onRequest} onChange={(event) => setOnRequest(event.target.checked)} />
            <Select label="Category" value={form.cat} onChange={(event) => set("cat", event.target.value as Category)}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
            </Select>
            <Select label="Sizes" value={form.sizes} hint="Edit the size lists in Settings" onChange={(event) => set("sizes", event.target.value as SizeSet)}>
              {SIZE_SETS.map((sizeSet) => <option key={sizeSet} value={sizeSet}>{SIZE_SET_LABELS[sizeSet]} ({sizeHint(sizeSet)})</option>)}
            </Select>
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          <Panel title="Photo" bodyClassName="p-[18px]">
            <PhotoPicker value={form.img} uploadName={form.id || slugify(form.name.en)} onChange={(path) => set("img", path)} />
          </Panel>
          <Panel title="Visibility" bodyClassName="p-[18px]">
            <Checkbox label="Hide from the shop" checked={form.hidden} onChange={(event) => set("hidden", event.target.checked)} />
            <p className="mt-1.5 text-xs text-muted">Hidden products stay here but customers don't see them and can't order them.</p>
          </Panel>
          <p className="min-h-[1.2em] font-medium text-red-700">{message}</p>
          <div className="flex flex-wrap gap-2">
            <AdminButton tone="primary" type="submit" disabled={saving}>{isNew ? "Create product" : "Save changes"}</AdminButton>
            <AdminButton onClick={() => navigate("/admin/products")}>Cancel</AdminButton>
            {!isNew && <AdminButton tone="danger" className="ml-auto" onClick={() => void remove()}>Delete</AdminButton>}
          </div>
        </div>
      </form>
    </>
  );
}
