"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const COOKIE = "spade_theme";

function readCookie(): Theme | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )spade_theme=(dark|light)/);
  return (m?.[1] as Theme) ?? null;
}

function writeCookie(t: Theme) {
  document.cookie = `${COOKIE}=${t}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function applyTheme(t: Theme) {
  const html = document.documentElement;
  if (t === "light") html.classList.add("light");
  else html.classList.remove("light");
  html.style.colorScheme = t;
}

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Sync state with whatever the inline pre-paint script set.
  useEffect(() => {
    const fromCookie = readCookie();
    if (fromCookie) {
      setThemeState(fromCookie);
      applyTheme(fromCookie);
    } else {
      applyTheme("dark");
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme: (t) => {
        setThemeState(t);
        writeCookie(t);
        applyTheme(t);
      },
      toggle: () => {
        const next = theme === "dark" ? "light" : "dark";
        setThemeState(next);
        writeCookie(next);
        applyTheme(next);
      },
    }),
    [theme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) {
    return {
      theme: "dark" as Theme,
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return c;
}

/**
 * Inline script run before hydration to apply the theme class so there's
 * no flash. Inject as <script dangerouslySetInnerHTML> in the layout.
 */
export const themeBootScript = `
(function(){try{
  var m = document.cookie.match(/(?:^|; )spade_theme=(dark|light)/);
  var t = m ? m[1] : 'dark';
  if (t === 'light') document.documentElement.classList.add('light');
  document.documentElement.style.colorScheme = t;
}catch(e){}})();
`;
