
import type { CollectibleType as OriginalGameCollectibleType } from "@/hooks/useGameLogic";

export interface ObstacleType {
  id: string;
  type: "shark" | "whale" | "octopus" | "rock" | "jellyfish" | "whirlpool" | "crate" | "seaweed";
  x: number;
  y: number;
  speed: number;
  warning?: boolean;
  jumping?: boolean;
  jumpStart?: number;
  jumpDirection?: number;
}
export type Gear = "surfboard" | "bike" | "ship";

export interface GameCollectibleType {
  id: string;
  type: "coin" | "bubble" | "starfish" | "magnet";
  x: number;
  y: number;
  speed: number;
  double?: boolean;
}
