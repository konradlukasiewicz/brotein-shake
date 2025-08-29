import { useEffect, useState } from "react";

/* Treat as "mobile app" if any are true:
   - narrow width
   - device can't hover
   - coarse pointer (finger)
*/
const QUERY = "(max-width: 900px), (hover: none), (pointer: coarse)";

export function useViewport() {
  const [isHandset, setIsHandset] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsHandset(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Optional override for quick testing: ?mode=mobile or ?mode=desktop
  let forced = null;
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("mode");
    if (v === "mobile") forced = true;
    if (v === "desktop") forced = false;
  } catch {}

  return { isHandset: forced ?? isHandset };
}
