import React from "react";
import { GameBackground } from "./GameBackground";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Collectible } from "./Collectible";
import { BossObstacle } from "./BossObstacle";
import type { Avatar } from "@/pages/Index";
import type { ObstacleType, Gear } from "./Game"; // Assuming types are still here
import type { CollectibleType } from "@/hooks/useGameLogic"; // Or move this type

interface GameRendererProps {
  playerX: number;
  playerY: number;
  avatar: Avatar;
  currentGear: Gear;
  obstacles: ObstacleType[];
  collectibles: CollectibleType[];
  bossActive: boolean;
  gameAreaRef: React.RefObject<HTMLDivElement>;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export const GameRenderer = ({
  playerX,
  playerY,
  avatar,
  currentGear,
  obstacles,
  collectibles,
  bossActive,
  gameAreaRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: GameRendererProps) => {
  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <GameBackground />
      <Player x={playerX} y={playerY} avatar={avatar} gear={currentGear} />
      <BossObstacle x={700} y={320} active={bossActive} />
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      {collectibles.map((collectible) => {
          if ((collectible as any).type === "starfish") {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0 pointer-events-none"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 48, height: 48,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[40px] animate-pulse">🌟</span>
              </div>
            )
          }
          // Magnet
          if ((collectible as any).type === "magnet") {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 44, height: 44,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[34px] animate-spin">🧲</span>
              </div>
            );
          }
          // Double coin
          if ((collectible as any).double) {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 52, height: 52,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[36px] drop-shadow-lg animate-bounce animate-pulse" style={{ color: "#ffd700" }}>🪙✨</span>
              </div>
            );
          }
          // Normal
          return <Collectible key={collectible.id} collectible={collectible} />;
      })}
    </div>
  );
};
