import { useEffect, useState } from "react";

/** 媒体查询 hook：布局分支一律读它，禁止在 JS 里写断点数字（用 @/shared/constants/breakpoints） */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined" && "matchMedia" in window ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (!("matchMedia" in window)) return;
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
