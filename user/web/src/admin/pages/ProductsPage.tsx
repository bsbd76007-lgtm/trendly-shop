import { useMemo, useState, type KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CATEGORIES } from "@shared/constants.ts";
import type { Category, Product } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { formatAmd, imageUrl } from "@/lib/format.ts";
import { useAdmin } from "../AdminContext.tsx";
import { adminButton, AdminButton, Badge, controlClass, ErrorState, FilterTabs, IconButton, Loading, PageHeader, Panel, td, th, Toolbar } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { CATEGORY_LABELS } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

type Filter = "all" | "noprice" | "nophoto" | "hidden";

const FILTERS: Record<Filter, { label: string; test: (product: Product) => boolean }> = {
  all: { label: "All", test: () => true },
  noprice: { label: "No price", test: (product) => product.price === null },
  nophoto: { label: "No photo", test: (product) => !product.img },
  hidden: { label: "Hidden", test: (product) => product.hidden }
};

const isFilter = (value: string | null): value is Filter => value !== null && value in FILTERS;

function Thumb({ product }: { product: Product }) {
  const [broken, setBroken] = useState(false);
  if (!product.img || broken) {
    return <span className="grid h-14 w-11 place-items-center bg-stone-100 text-center text-[10px] leading-tight text-muted">{product.img ? "missing file" : "no photo"}</span>;
  }
  return <img src={imageUrl(product.img)} alt="" loading="lazy" onError={() => setBroken(true)} className="h-14 w-11 bg-stone-100 object-cover" />;
}

function PhotoCell({ product, onSave }: { product: Product; onSave: (patch: Partial<Product>) => Promise<boolean> }) {
  const { fail } = useAdmin();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      await onSave({ img: await adminApi.uploadPhoto(file, product.id) });
    } catch (failure) {
      fail(failure);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label title="Click to change photo" className="group relative block h-14 w-11 cursor-pointer">
      <Thumb key={product.img} product={product} />
      <span className={cn("absolute inset-0 grid place-items-center bg-ink/60 text-[10px] font-semibold text-white", uploading ? "" : "opacity-0 group-hover:opacity-100")}>
        {uploading ? "…" : "Change"}
      </span>
      <input type="file" accept="image/*" hidden disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
    </label>
  );
}

function PriceCell({ product, onSave }: { product: Product; onSave: (patch: Partial<Product>) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const start = () => {
    setText(product.price === null ? "" : String(product.price));
    setEditing(true);
  };

  const commit = async () => {
    const trimmed = text.trim();
    const price = trimmed === "" ? null : Number(trimmed);
    if (price === product.price) return setEditing(false);
    setSaving(true);
    const ok = await onSave({ price });
    setSaving(false);
    if (ok) setEditing(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") void commit();
    if (event.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        step={500}
        placeholder="on request"
        disabled={saving}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => void commit()}
        className={cn(controlClass, "min-h-[32px] w-28 tabular-nums")}
      />
    );
  }

  return (
    <button type="button" title="Click to change price" onClick={start} className="-mx-1.5 px-1.5 py-1 text-left tabular-nums hover:bg-stone-100">
      {product.price === null ? <Badge className="bg-red-50 text-red-700">on request</Badge> : formatAmd(product.price)}
      <span className="ml-1.5 text-xs text-muted">✎</span>
    </button>
  );
}

export function ProductsPage() {
  const { notify, fail } = useAdmin();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: products, setData, reload, error, loading } = useResource(adminApi.products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const filterParam = params.get("filter");
  const filter: Filter = isFilter(filterParam) ? filterParam : "all";

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (products ?? []).filter((product) =>
      FILTERS[filter].test(product) &&
      (category === "all" || product.cat === category) &&
      (!needle || [product.id, product.brand, product.name.hy, product.name.ru, product.name.en].join(" ").toLowerCase().includes(needle))
    );
  }, [products, filter, category, query]);

  if (loading) return <Loading />;
  if (!products) return <ErrorState message={error} />;

  const canMove = !query && category === "all" && filter === "all";

  const toggle = async (product: Product) => {
    try {
      const updated = await adminApi.patchProduct(product.id, { hidden: !product.hidden });
      setData((list) => list?.map((item) => (item.id === updated.id ? updated : item)));
      notify(updated.hidden ? "Hidden from the shop" : "Visible in the shop");
    } catch (failure) {
      fail(failure);
    }
  };

  const savePatch = async (product: Product, patch: Partial<Product>) => {
    try {
      const updated = await adminApi.patchProduct(product.id, patch);
      setData((list) => list?.map((item) => (item.id === updated.id ? updated : item)));
      notify("Saved");
      return true;
    } catch (failure) {
      fail(failure);
      return false;
    }
  };

  const move = async (product: Product, dir: "up" | "down") => {
    try {
      await adminApi.moveProduct(product.id, dir);
      await reload();
    } catch (failure) {
      fail(failure);
    }
  };

  const remove = async (product: Product) => {
    if (!confirm(`Delete "${product.name.en}"? This can't be undone.`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      setData((list) => list?.filter((item) => item.id !== product.id));
      notify("Product deleted");
    } catch (failure) {
      fail(failure);
    }
  };

  const tabs = (Object.keys(FILTERS) as Filter[]).map((key) => ({ value: key, label: FILTERS[key].label, count: products.filter(FILTERS[key].test).length }));

  return (
    <>
      <PageHeader title="Products" actions={<Link to="/admin/products/new" className={adminButton("primary")}>+ New product</Link>} />
      <Panel>
        <Toolbar>
          <input
            type="search"
            placeholder="Search name, brand, ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(controlClass, "min-h-[34px] w-auto min-w-[220px] max-w-[340px] flex-1")}
          />
          <select value={category} onChange={(event) => setCategory(event.target.value as Category | "all")} className={cn(controlClass, "min-h-[34px] w-auto")}>
            <option value="all">All categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
          </select>
          <FilterTabs value={filter} options={tabs} onChange={(next) => setParams(next === "all" ? {} : { filter: next })} />
        </Toolbar>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr><th className={th} /><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}>On site</th><th className={th} /></tr>
            </thead>
            <tbody>
              {visible.length ? visible.map((product) => (
                <tr key={product.id} onClick={() => navigate(`/admin/products/${encodeURIComponent(product.id)}`)} className="cursor-pointer hover:bg-stone-50">
                  <td className={td} onClick={(event) => event.stopPropagation()}><PhotoCell product={product} onSave={(patch) => savePatch(product, patch)} /></td>
                  <td className={td}>
                    <div className="font-semibold text-ink">{product.name.en}</div>
                    <div className="text-xs text-muted">{product.name.ru} · {product.brand || "—"}</div>
                  </td>
                  <td className={td}>{CATEGORY_LABELS[product.cat]}</td>
                  <td className={cn(td, "whitespace-nowrap")} onClick={(event) => event.stopPropagation()}>
                    <PriceCell product={product} onSave={(patch) => savePatch(product, patch)} />
                  </td>
                  <td className={td} onClick={(event) => event.stopPropagation()}>
                    <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-ink">
                      <input type="checkbox" className="size-4 accent-ink" checked={!product.hidden} onChange={() => void toggle(product)} />
                      {product.hidden ? "Hidden" : "Visible"}
                    </label>
                  </td>
                  <td className={cn(td, "text-right whitespace-nowrap")} onClick={(event) => event.stopPropagation()}>
                    {canMove && (
                      <>
                        <IconButton aria-label="Move up" title="Move up" onClick={() => void move(product, "up")}>↑</IconButton>{" "}
                        <IconButton aria-label="Move down" title="Move down" onClick={() => void move(product, "down")}>↓</IconButton>{" "}
                      </>
                    )}
                    <AdminButton tone="danger" small onClick={() => void remove(product)}>Delete</AdminButton>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className={cn(td, "py-10 text-center text-muted")}>No products match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
