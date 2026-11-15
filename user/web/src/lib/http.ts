import type { ApiError } from "@shared/types.ts";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function request<T>(url: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const isJson = (response.headers.get("content-type") ?? "").includes("application/json");
  const data: unknown = isJson ? await response.json() : null;
  if (!response.ok) throw new HttpError(response.status, (data as ApiError | null)?.error ?? `Error ${response.status}`);
  return data as T;
}
