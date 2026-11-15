import { useState, type DragEvent } from "react";
import { imageUrl } from "@/lib/format.ts";
import { cn } from "@/lib/cn.ts";
import { useAdmin } from "../AdminContext.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { adminButton, AdminButton, Input } from "./ui.tsx";

export function PhotoPicker({ value, onChange, uploadName }: { value: string; onChange: (path: string) => void; uploadName: string }) {
  const { notify, fail } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [over, setOver] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await adminApi.uploadPhoto(file, uploadName || "product"));
      notify("Photo uploaded — save to keep it");
    } catch (failure) {
      fail(failure);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    void upload(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex items-start gap-4 max-[820px]:flex-col">
      <div className="grid aspect-[3/4] w-[150px] shrink-0 place-items-center overflow-hidden bg-stone-100 text-xs text-muted">
        {uploading ? "Uploading…" : value ? <img src={imageUrl(value)} alt="" className="size-full object-cover" /> : "No photo"}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          onDragEnter={(event) => { event.preventDefault(); setOver(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={cn("border border-dashed p-3.5 text-center text-muted", over ? "border-ink bg-stone-50 text-ink" : "border-line-strong")}
        >
          Drop a photo here or
          <br />
          <label className={cn(adminButton("default", true), "mt-2 cursor-pointer")}>
            Choose file
            <input type="file" accept="image/*" hidden onChange={(event) => void upload(event.target.files?.[0])} />
          </label>
        </div>
        <Input label="File path" value={value} placeholder="uploads/… or assets/img/…" onChange={(event) => onChange(event.target.value.trim())} />
        {value && <AdminButton small className="self-start" onClick={() => onChange("")}>Remove photo</AdminButton>}
      </div>
    </div>
  );
}
