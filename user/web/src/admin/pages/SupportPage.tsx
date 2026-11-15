import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router";
import type { SupportChat, SupportChatSummary } from "@shared/types.ts";
import { cn } from "@/lib/cn.ts";
import { useAdmin } from "../AdminContext.tsx";
import { AdminButton, PageHeader, Panel } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { formatDateTime } from "../lib/labels.ts";

type Chat = Omit<SupportChat, "token">;

const QUICK_REPLIES = [
  "Hello! How can we help?",
  "Yes, it's in stock 👍",
  "Delivery in Yerevan takes 1–2 days.",
  "Thank you! We'll get back to you shortly."
];

function every(ms: number, fn: () => void) {
  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible") fn();
  }, ms);
  return () => window.clearInterval(timer);
}

function ChatList({ chats, activeId }: { chats: SupportChatSummary[]; activeId?: string }) {
  const navigate = useNavigate();
  if (!chats.length) return <p className="p-[18px] text-muted">No messages yet. When a customer writes in the chat on the site, it appears here.</p>;
  return (
    <ul className="max-h-[70vh] overflow-y-auto">
      {chats.map((chat) => (
        <li key={chat.id}>
          <button
            type="button"
            onClick={() => navigate(`/admin/support/${encodeURIComponent(chat.id)}`)}
            className={cn("flex w-full flex-col gap-0.5 border-b border-line px-[18px] py-3 text-left hover:bg-stone-50", chat.id === activeId && "bg-stone-100")}
          >
            <span className="flex items-center justify-between gap-2">
              <b className="truncate text-ink">{chat.name || `Visitor ${chat.id.slice(-4)}`}</b>
              {chat.unread > 0 && <span className="h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-center text-[11px] leading-5 font-bold text-white">{chat.unread}</span>}
            </span>
            <span className="truncate text-xs text-muted">{chat.last ? `${chat.last.from === "shop" ? "You: " : ""}${chat.last.text}` : "—"}</span>
            <span className="text-[11px] text-muted">{formatDateTime(chat.updatedAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Conversation({ chatId, onChanged }: { chatId: string; onChanged: () => void }) {
  const { fail, notify } = useAdmin();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const count = chat?.messages.length ?? 0;

  const load = useCallback(async () => {
    try {
      setChat(await adminApi.chat(chatId));
    } catch (failure) {
      fail(failure);
    }
  }, [chatId, fail]);

  useEffect(() => {
    setChat(null);
    void load().then(onChanged);
    return every(4000, () => void load());
  }, [load, onChanged]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [count]);

  const send = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      setChat(await adminApi.replyChat(chatId, body));
      setText("");
      onChanged();
    } catch (failure) {
      fail(failure);
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

  const remove = async () => {
    if (!confirm("Delete this conversation? The customer will start a new chat next time.")) return;
    try {
      await adminApi.deleteChat(chatId);
      notify("Conversation deleted");
      onChanged();
      navigate("/admin/support");
    } catch (failure) {
      fail(failure);
    }
  };

  if (!chat) return <p className="p-[18px] text-muted">Loading…</p>;

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-3">
        <div>
          <b className="text-ink">{chat.name || `Visitor ${chat.id.slice(-4)}`}</b>
          <div className="text-xs text-muted">Started {formatDateTime(chat.createdAt)} · {chat.id}</div>
        </div>
        <AdminButton tone="danger" small onClick={() => void remove()}>Delete</AdminButton>
      </div>
      <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-soft p-[18px]">
        {chat.messages.map((message, index) => (
          <div key={`${message.at}-${index}`} className={cn("max-w-[75%]", message.from === "shop" ? "self-end" : "self-start")}>
            <div className={cn("px-3 py-2 whitespace-pre-wrap break-words", message.from === "shop" ? "bg-ink text-white" : "border border-line bg-white text-ink")}>{message.text}</div>
            <div className={cn("mt-0.5 text-[11px] text-muted", message.from === "shop" && "text-right")}>{formatDateTime(message.at)}</div>
          </div>
        ))}
      </div>
      <form onSubmit={(event) => void send(event)} className="flex flex-col gap-2 border-t border-line p-3">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((reply) => (
            <button key={reply} type="button" onClick={() => setText(reply)} className="border border-line px-2 py-1 text-xs text-muted hover:border-ink hover:text-ink">{reply}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={1000}
            placeholder="Reply… (Enter to send, Shift+Enter for a new line)"
            className="flex-1 resize-none border border-line-strong bg-white px-[11px] py-2 text-ink outline-none focus:border-ink"
          />
          <AdminButton tone="primary" type="submit" disabled={sending || !text.trim()}>Send</AdminButton>
        </div>
      </form>
    </div>
  );
}

export function SupportPage() {
  const { id } = useParams();
  const { fail, refreshCounts } = useAdmin();
  const [chats, setChats] = useState<SupportChatSummary[]>([]);

  const loadChats = useCallback(async () => {
    try {
      setChats(await adminApi.chats());
    } catch (failure) {
      fail(failure);
    }
  }, [fail]);

  const changed = useCallback(() => {
    void loadChats();
    void refreshCounts();
  }, [loadChats, refreshCounts]);

  useEffect(() => {
    void loadChats();
    return every(5000, () => void loadChats());
  }, [loadChats]);

  return (
    <>
      <PageHeader title="Support" subtitle="Live chat with visitors of the shop. New messages also pop up anywhere in the admin." />
      <div className="grid items-start gap-4 min-[1101px]:grid-cols-[320px_1fr]">
        <Panel title="Conversations" className={cn(id && "max-[1100px]:hidden")}>
          <ChatList chats={chats} activeId={id} />
        </Panel>
        {id ? (
          <Panel>
            <Conversation key={id} chatId={id} onChanged={changed} />
          </Panel>
        ) : (
          <Panel className="max-[1100px]:hidden"><p className="p-[18px] text-muted">Pick a conversation.</p></Panel>
        )}
      </div>
    </>
  );
}
