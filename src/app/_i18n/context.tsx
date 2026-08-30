"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TranslationKey } from "./translations";

const STORAGE_KEY = "spectrum-lang";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
});

export function LangProvider({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Migration / fallback: if the cookie wasn't set (existing users) but
  // localStorage has a language, apply it and write the cookie so the next
  // SSR render is already correct (no flash).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "th" || saved === "en" || saved === "zh" || saved === "vi" || saved === "pt") {
      if (saved !== lang) setLangState(saved);
      document.cookie = `${STORAGE_KEY}=${saved}; path=/; max-age=31536000; samesite=lax`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.cookie = `${STORAGE_KEY}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] as string,
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
