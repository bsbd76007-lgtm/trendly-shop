import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { OrderAccess, SupportMessage } from "@shared/types.ts";
import { ChatIcon, CloseIcon } from "@/components/ui/icons.tsx";
import { useI18n } from "@/i18n/I18nProvider.tsx";
import { shopApi } from "@/lib/api.ts";
import { cn } from "@/lib/cn.ts";
import { HttpError } from "@/lib/http.ts";
import { contactLinks } from "@/lib/links.ts";
import { readStored, STORAGE_KEYS, writeStored } from "@/lib/storage.ts";
import { useCart } from "@/state/CartProvider.tsx";
import { useShop } from "@/state/ShopProvider.tsx";

interface StoredChat extends OrderAccess {
  seen: number;
}

const OPEN_POLL = 4000;
const CLOSED_POLL = 30000;

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function SupportWidget() {
  const { t } = useI18n();
  const { settings } = useShop();
  const { isOpen: cartOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<StoredChat | null>(() => readStored<StoredChat | null>(STORAGE_KEYS.support, null));
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const save = useCallback((next: StoredChat | null) => {
    setChat(next);
    writeStored(STORAGE_KEYS.support, next);
  }, []);

  const refresh = useCallback(async () => {
    if (!chat) return;
    try {
      setMessages((await shopApi.chat(chat.id, chat.token)).messages);
    } catch (failure) {
      if (failure instanceof HttpError && failure.status === 404) save(null);
    }
  }, [chat, save]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, open ? OPEN_POLL : CLOSED_POLL);
    return () => window.clearInterval(timer);
  }, [refresh, open]);

  const shopCount = messages.filter((message) => message.from === "shop").length;
  const unread = chat ? Math.max(0, shopCount - chat.seen) : 0;

  useEffect(() => {
    if (open && chat && chat.seen !== shopCount) save({ ...chat, seen: shopCount });
  }, [open, chat, shopCount, save]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages.length]);

  const send = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      if (chat) {
        setMessages((await shopApi.sendChat(chat.id, chat.token, body)).messages);
      } else {
        const started = await shopApi.startChat(name.trim(), body);
        save({ id: started.id, token: started.token, seen: 0 });
        setMessages(started.messages);
      }
      setText("");
    } catch {
      setError(t.support.failed);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const contacts = contactLinks(settings).filter((link) => link.external);

  if (cartOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 min-[821px]:right-6 min-[821px]:bottom-6">
      {open && (
        <section
          role="dialog"
          aria-label={t.support.title}
          className="flex h-[min(560px,calc(100dvh-110px))] w-[min(370px,calc(100vw-32px))] flex-col border border-line bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        >
          <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white">
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="size-2 rounded-full bg-emerald-400" />
                {t.support.title}
              </div>
              <div className="text-xs text-white/70">{t.support.subtitle}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.support.close} className="grid size-9 place-items-center">
              <CloseIcon className="size-4" />
            </button>
          </header>

          <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-soft p-3">
            {messages.map((message, index) => (
              <div key={`${message.at}-${index}`} className={cn("max-w-[85%]", message.from === "customer" ? "self-end" : "self-start")}>
                <div className={cn("px-3 py-2 text-sm whitespace-pre-wrap break-words", message.from === "customer" ? "bg-ink text-white" : "border border-line bg-white text-ink")}>
                  {message.text}
                </div>
                <div className={cn("mt-0.5 text-[11px] text-muted", message.from === "customer" && "text-right")}>
                  {message.from === "shop" ? `${t.support.shop} · ` : ""}{time(message.at)}
                </div>
              </div>
            ))}
            {!messages.length && contacts.length > 0 && (
              <p className="mt-auto text-center text-xs text-muted">
                {t.support.or}{" "}
                {contacts.map((link, index) => (
                  <span key={link.href}>
                    {index > 0 && " · "}
                    <a href={link.href} target="_blank" rel="noopener" className="text-ink underline underline-offset-2">{link.label}</a>
                  </span>
                ))}
              </p>
            )}
          </div>

          <form onSubmit={(event) => void send(event)} className="flex flex-col gap-2 border-t border-line p-3">
            {!chat && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.support.name}
                maxLength={60}
                className="border border-line-strong px-3 py-2 text-sm outline-none focus:border-ink"
              />
            )}
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t.support.placeholder}
                rows={2}
                maxLength={1000}
                className="flex-1 resize-none border border-line-strong px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <button type="submit" disabled={sending || !text.trim()} className="self-stretch bg-ink px-4 text-sm font-medium text-white disabled:opacity-40">
                {sending ? "…" : t.support.send}
              </button>
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="relative flex h-14 items-center gap-2 rounded-full bg-ink pr-5 pl-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-[#333]"
      >
        {open ? <CloseIcon className="size-5" /> : <ChatIcon className="size-6" />}
        <span className="max-[480px]:hidden">{t.support.button}</span>
        {!open && unread > 0 && (
          <span aria-label={t.support.newReply} className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold">{unread}</span>
        )}
      </button>
    </div>
  );
}
