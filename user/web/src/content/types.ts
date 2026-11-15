import type { Lang } from "@shared/types.ts";

export type ListItem = string | { label: string; text: string };

export type Block =
  | { kind: "lead"; text: string }
  | { kind: "meta"; text: string }
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "list"; items: ListItem[] }
  | { kind: "contacts" };

export interface InfoContent {
  title: string;
  blocks: Block[];
}

export interface FaqContent {
  title: string;
  items: Array<{ q: string; a: string }>;
}

export type Localized<T> = Record<Lang, T>;
