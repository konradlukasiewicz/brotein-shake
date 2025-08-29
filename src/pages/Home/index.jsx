import React, { lazy, Suspense } from "react";
import { useViewport } from "../../hooks/useViewport";

const HomeMobile = lazy(() => import("./Home.mobile"));
const HomeDesktop = lazy(() => import("./Home.desktop"));

export default function Home() {
  const { isHandset } = useViewport();

  return (
    <Suspense fallback={<main style={{ padding: "1rem" }}>Loading…</main>}>
      {isHandset ? <HomeMobile /> : <HomeDesktop />}
    </Suspense>
  );
}
