import { useEffect, useState, type ChangeEvent } from "react";
import type { InstagramPost } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { imageUrl } from "@/lib/format.ts";
import { useAdmin } from "../AdminContext.tsx";
import { AdminButton, adminButton, controlClass, ErrorState, IconButton, Loading, PageHeader, Panel } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { useResource } from "../lib/useResource.ts";

export function InstagramPage() {
  const { notify, fail } = useAdmin();
  const { data, error, loading } = useResource(adminApi.instagram);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setPosts(data);
  }, [data]);

  if (loading) return <Loading />;
  if (!data) return <ErrorState message={error} />;

  const update = (index: number, patch: Partial<InstagramPost>) =>
    setPosts((list) => list.map((post, i) => (i === index ? { ...post, ...patch } : post)));

  const move = (index: number, delta: number) =>
    setPosts((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const add = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    setBusy(true);
    for (const file of files) {
      try {
        const img = await adminApi.uploadPhoto(file, "instagram");
        setPosts((list) => [{ img, url: "" }, ...list]);
      } catch (failure) {
        fail(failure);
      }
    }
    setBusy(false);
    if (files.length) notify("Uploaded — press Save");
  };

  const save = async () => {
    try {
      setPosts(await adminApi.saveInstagram(posts));
      notify("Saved");
    } catch (failure) {
      fail(failure);
    }
  };

  return (
    <>
      <PageHeader
        title="Instagram"
        subtitle={'Photos in the "We\'re on Instagram" block on the home page, in this order.'}
        actions={
          <>
            <label className={cn(adminButton(), "cursor-pointer", busy && "opacity-50")}>
              {busy ? "Uploading…" : "+ Add photos"}
              <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(event) => void add(event)} />
            </label>
            <AdminButton tone="primary" onClick={() => void save()}>Save</AdminButton>
          </>
        }
      />
      <Panel>
        {posts.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 p-3.5">
            {posts.map((post, index) => (
              <div key={`${post.img}-${index}`} className="flex flex-col gap-2 border border-line bg-white p-2.5">
                <img src={imageUrl(post.img)} alt="" loading="lazy" className="aspect-square w-full bg-stone-100 object-cover" />
                <input
                  className={controlClass}
                  placeholder="https://www.instagram.com/p/…"
                  value={post.url}
                  onChange={(event) => update(index, { url: event.target.value.trim() })}
                />
                <div className="flex gap-1">
                  <IconButton aria-label="Move left" onClick={() => move(index, -1)}>←</IconButton>
                  <IconButton aria-label="Move right" onClick={() => move(index, 1)}>→</IconButton>
                  <AdminButton small tone="danger" className="ml-auto" onClick={() => setPosts((list) => list.filter((_, i) => i !== index))}>Remove</AdminButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-muted">No photos. Add some.</p>
        )}
      </Panel>
    </>
  );
}
