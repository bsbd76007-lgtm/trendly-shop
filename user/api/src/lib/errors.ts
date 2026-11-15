import type { NextFunction, Request, Response } from "express";

export class BadInput extends Error {}
export class NotFound extends Error {}

export const reject = (message: string): never => {
  throw new BadInput(message);
};

export const missing = (message: string): never => {
  throw new NotFound(message);
};

export function handle(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof BadInput) return res.status(400).json({ error: error.message });
  if (error instanceof NotFound) return res.status(404).json({ error: error.message });
  const { status, type } = error as { status?: number; type?: string };
  if (status === 404) return res.status(404).end();
  if (type === "entity.too.large") return res.status(413).json({ error: "Too large" });
  if (type === "entity.parse.failed") return res.status(400).json({ error: "Bad JSON" });
  console.error(error);
  return res.status(500).json({ error: "Server error" });
}
