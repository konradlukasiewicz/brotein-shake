import { useEffect, useState } from "react";

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(orientation: portrait)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(orientation: portrait)");
    const onChange = () => setIsPortrait(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { isPortrait };
}
