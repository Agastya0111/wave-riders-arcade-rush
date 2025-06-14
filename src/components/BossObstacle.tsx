
import React from "react";

interface BossObstacleProps {
  x: number;
  y: number;
  active: boolean;
}

export const BossObstacle = ({ x, y, active }: BossObstacleProps) => {
  // A giant octopus with wobble
  return active ? (
    <div
      className="absolute z-50 animate-boss-shake pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        width: 140,
        height: 120,
        transform: "translate(-50%, -50%)",
      }}
    >
      <span className="text-[96px]">🐙</span>
      <span className="absolute left-8 -bottom-2 text-4xl animate-pulse">💥</span>
    </div>
  ) : null;
};
