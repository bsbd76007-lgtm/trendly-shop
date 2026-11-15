import { randomBytes, timingSafeEqual } from "node:crypto";
import type { SupportAuthor, SupportChat, SupportChatSummary, SupportMessage } from "../../../shared/types.ts";
import { db, type Tx } from "../db/client.ts";
import { toChat, toMessage } from "../db/mappers.ts";
import { missing, reject } from "../lib/errors.ts";
import { clean, makeId } from "../lib/text.ts";
import { notifyAdminChat } from "./notify.ts";

const MAX_MESSAGES = 300;
const withMessages = { messages: { orderBy: { at: "asc" } } } as const;

const sameToken = (expected: string, given: unknown) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(typeof given === "string" ? given : "");
  return a.length === b.length && timingSafeEqual(a, b);
};

const messageText = (value: unknown) => clean(value, 1000) || reject("Write a message");

async function append(tx: Tx, chatId: string, from: SupportAuthor, text: string): Promise<void> {
  const at = new Date();
  await tx.supportMessage.create({ data: { chatId, from, text, at } });
  await tx.supportChat.update({
    where: { id: chatId },
    data: { updatedAt: at, unread: from === "customer" ? { increment: 1 } : 0 }
  });
  const extra = await tx.supportMessage.findMany({ where: { chatId }, orderBy: { at: "desc" }, skip: MAX_MESSAGES, select: { id: true } });
  if (extra.length) await tx.supportMessage.deleteMany({ where: { id: { in: extra.map((row) => row.id) } } });
}

async function customerChatId(id: string, token: unknown, tx: Tx = db): Promise<string> {
  const chat = await tx.supportChat.findUnique({ where: { id }, select: { id: true, token: true } });
  return chat && sameToken(chat.token, token) ? chat.id : missing("Chat not found");
}

const messagesOf = async (tx: Tx, chatId: string): Promise<SupportMessage[]> =>
  (await tx.supportMessage.findMany({ where: { chatId }, orderBy: { at: "asc" } })).map(toMessage);

export async function startChat(name: unknown, text: unknown): Promise<SupportChat> {
  const body = messageText(text);
  const chat = await db.$transaction(async (tx) => {
    const created = await tx.supportChat.create({ data: { id: makeId("S"), token: randomBytes(16).toString("hex"), name: clean(name, 60) } });
    await append(tx, created.id, "customer", body);
    return toChat((await tx.supportChat.findUnique({ where: { id: created.id }, include: withMessages }))!);
  });
  console.log(`New support chat ${chat.id}`);
  notifyAdminChat(chat);
  return chat;
}

export async function readChat(id: string, token: unknown): Promise<SupportMessage[]> {
  return messagesOf(db, await customerChatId(id, token));
}

export async function customerReply(id: string, token: unknown, text: unknown): Promise<SupportMessage[]> {
  const body = messageText(text);
  return db.$transaction(async (tx) => {
    const chatId = await customerChatId(id, token, tx);
    await append(tx, chatId, "customer", body);
    return messagesOf(tx, chatId);
  });
}

export async function listChats(): Promise<SupportChatSummary[]> {
  const rows = await db.supportChat.findMany({
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { at: "desc" }, take: 1 } }
  });
  return rows.map(({ token: _token, messages, ...chat }) => ({
    id: chat.id,
    name: chat.name,
    unread: chat.unread,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    last: messages[0] ? toMessage(messages[0]) : null
  }));
}

export async function openChat(id: string): Promise<SupportChat> {
  const result = await db.supportChat.updateMany({ where: { id }, data: { unread: 0 } });
  if (!result.count) missing("Chat not found");
  return toChat((await db.supportChat.findUnique({ where: { id }, include: withMessages }))!);
}

export async function shopReply(id: string, text: unknown): Promise<SupportChat> {
  const body = messageText(text);
  return db.$transaction(async (tx) => {
    if (!(await tx.supportChat.findUnique({ where: { id }, select: { id: true } }))) missing("Chat not found");
    await append(tx, id, "shop", body);
    return toChat((await tx.supportChat.findUnique({ where: { id }, include: withMessages }))!);
  });
}

export async function deleteChat(id: string): Promise<void> {
  const result = await db.supportChat.deleteMany({ where: { id } });
  if (!result.count) missing("Chat not found");
}

export async function supportCounts() {
  const [unreadChats, total] = await Promise.all([
    db.supportChat.count({ where: { unread: { gt: 0 } } }),
    db.supportChat.aggregate({ _sum: { unread: true } })
  ]);
  return { unreadChats, unreadMessages: total._sum.unread ?? 0 };
}
