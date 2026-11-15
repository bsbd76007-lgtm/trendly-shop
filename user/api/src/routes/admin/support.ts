import { Router } from "express";
import { handle } from "../../lib/errors.ts";
import { deleteChat, listChats, openChat, shopReply } from "../../services/support.ts";

export const supportAdminRoutes = Router();

supportAdminRoutes.get("/support", handle(async (_req, res) => {
  res.json(await listChats());
}));

supportAdminRoutes.get("/support/:id", handle(async (req, res) => {
  const { token: _token, ...chat } = await openChat(req.params.id);
  res.json(chat);
}));

supportAdminRoutes.post("/support/:id/messages", handle(async (req, res) => {
  const { token: _token, ...chat } = await shopReply(req.params.id, req.body?.text);
  res.json(chat);
}));

supportAdminRoutes.delete("/support/:id", handle(async (req, res) => {
  await deleteChat(req.params.id);
  res.json({ ok: true });
}));
