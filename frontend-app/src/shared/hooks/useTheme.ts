/**
 * 主题（暗色档）—— 19.7 / 02 · 2.1.9
 *
 * 机制：只在 `<html data-theme="dark">` 上换档，**所有颜色由 Token 自动切换**，
 * 页面不写任何暗色专属规则（这是"暗色不漂移"的唯一保障）。
 */
import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const KEY = "gm-theme";

export function useTheme(): { theme: ThemeMode; toggle: () => void; set: (m: ThemeMode) => void } {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage?.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    window.localStorage?.setItem(KEY, theme);
  }, [theme]);

  const set = useCallback((m: ThemeMode) => setTheme(m), []);
  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle, set };
}
