import React from "react";
import { useViewport } from "../../hooks/useViewport";
import { useOrientation } from "../../hooks/useOrientation";

export default function MobileGuard({ children }) {
  const { isHandset } = useViewport();
  const { isPortrait } = useOrientation();

  if (isHandset && !isPortrait) {
    return (
      <div className="rotate-overlay">
        <div className="rotate-card">
          <div className="rotate-icon">📱↻</div>
          <p>Please rotate your device to portrait.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}