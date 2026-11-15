import { Router } from "express";
import { handle } from "../lib/errors.ts";
import { rateLimit } from "../lib/rateLimit.ts";
import { customerReply, readChat, startChat } from "../services/support.ts";

export const supportRoutes = Router();

const writes = rateLimit(30, 10 * 60_000);

supportRoutes.post("/", rateLimit(5, 60 * 60_000), handle(async (req, res) => {
  const chat = await startChat(req.body?.name, req.body?.text);
  res.status(201).json({ id: chat.id, token: chat.token, messages: chat.messages });
}));

supportRoutes.get("/:id", handle(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ messages: await readChat(req.params.id, req.query.t) });
}));

supportRoutes.post("/:id/messages", writes, handle(async (req, res) => {
  res.json({ messages: await customerReply(req.params.id, req.body?.t, req.body?.text) });
}));
