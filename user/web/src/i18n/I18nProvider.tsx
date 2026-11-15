import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGS } from "@shared/constants.ts";
import type { Lang } from "@shared/types.ts";
import { readStored, STORAGE_KEYS, writeStored } from "@/lib/storage.ts";
import { en, type Messages } from "./messages/en.ts";
import { hy } from "./messages/hy.ts";
import { ru } from "./messages/ru.ts";

const MESSAGES: Record<Lang, Messages> = { hy, ru, en };

export const LANG_LABELS: Record<Lang, string> = { hy: "ՀԱՅ", ru: "РУС", en: "ENG" };

interface I18nValue {
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
  applyDefault: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = readStored<string | null>(STORAGE_KEYS.lang, null);
  const [lang, setLangState] = useState<Lang>(isLang(stored) ? stored : "hy");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    writeStored(STORAGE_KEYS.lang, next);
    setLangState(next);
  }, []);

  const applyDefault = useCallback((fallback: Lang) => {
    if (!isLang(readStored<string | null>(STORAGE_KEYS.lang, null))) setLangState(fallback);
  }, []);

  const value = useMemo(() => ({ lang, t: MESSAGES[lang], setLang, applyDefault }), [lang, setLang, applyDefault]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
