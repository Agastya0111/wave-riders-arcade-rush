
import React from "react";

interface EffectOverlayProps {
  shieldActive: boolean;
  swordActive: boolean;
}
export const EffectOverlay = ({ shieldActive, swordActive }: EffectOverlayProps) => (
  <>
    {shieldActive && (
      <div className="absolute inset-0 bg-blue-300/30 animate-pulse pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-spin">
          ✨
        </div>
      </div>
    )}
    {swordActive && (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-bounce">
          ⚡
        </div>
      </div>
    )}
  </>
);
