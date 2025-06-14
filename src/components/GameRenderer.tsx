
import React from "react";
import { GameBackground } from "./GameBackground";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Collectible } from "./Collectible";
import { BossObstacle } from "./BossObstacle";
import type { Avatar } from "@/pages/Index";
import type { ObstacleType, Gear, GameCollectibleType } from "./Game.d";

interface GameRendererProps {
  playerX: number;
  playerY: number;
  avatar: Avatar;
  currentGear: Gear;
  obstacles: ObstacleType[];
  collectibles: GameCollectibleType[];
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
      {collectibles.map((collectible) => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
    </div>
  );
};
