import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { DATA_DIR } from "../config/env.ts";

export type Collection = "products" | "instagram" | "settings" | "reviews" | "orders";

const queues = new Map<Collection, Promise<unknown>>();
const pathOf = (name: Collection) => `${DATA_DIR}${name}.json`;

export async function load<T>(name: Collection, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(pathOf(name), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(fallback);
    throw error;
  }
}

async function write(name: Collection, value: unknown): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${pathOf(name)}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temp, pathOf(name));
}

function enqueue<R>(name: Collection, task: () => Promise<R>): Promise<R> {
  const next = (queues.get(name) ?? Promise.resolve()).then(task);
  queues.set(name, next.catch(() => undefined));
  return next;
}

export function update<T, R>(name: Collection, fallback: T, change: (data: T) => R | Promise<R>): Promise<R> {
  return enqueue(name, async () => {
    const data = await load(name, fallback);
    const result = await change(data);
    await write(name, data);
    return result;
  });
}

export function overwrite<T>(name: Collection, value: T): Promise<T> {
  return enqueue(name, async () => {
    await write(name, value);
    return value;
  });
}
