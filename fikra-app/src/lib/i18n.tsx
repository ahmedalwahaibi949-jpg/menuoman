import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type Bi = { en: string; ar: string };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (en: string, ar: string) => string; L: (b: Bi | undefined) => string; rtl: boolean };
const I18n = createContext<Ctx>(null as unknown as Ctx);

function initial(): Lang {
  try { return localStorage.getItem("fikra-lang") === "ar" ? "ar" : "en"; } catch { return "en"; }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  const setLang = useCallback((l: Lang) => { set(l); try { localStorage.setItem("fikra-lang", l); } catch { /* private mode */ } }, []);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; }, [lang]);
  const value = useMemo<Ctx>(() => ({
    lang, setLang, rtl: lang === "ar",
    t: (en, ar) => (lang === "ar" ? ar : en),
    L: b => (b ? (lang === "ar" ? b.ar || b.en : b.en || b.ar) : "")
  }), [lang, setLang]);
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}
export const useI18n = () => useContext(I18n);

/** Sets the page title and description for the current route. */
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
      m.setAttribute("content", description);
    }
  }, [title, description]);
}
