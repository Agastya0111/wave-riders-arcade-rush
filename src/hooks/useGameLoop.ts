import { useEffect, useRef } from "react";
import type { ObstacleType, GameCollectibleType } from "@/components/Game.d";
import { useGameLogic } from "@/hooks/useGameLogic";
import { updateObstacles } from "@/game/obstacleManager";
import { updateCollectibles, handleCollectibleCollisions } from "@/game/collectibleManager";

interface UseGameLoopProps {
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  level: number;
  score: number;
  gameSpeed: number;
  speedBoost: boolean;
  playerY: number;
  lastObstacleSpawn: number;
  lastCollectibleSpawn: number;
  obstacles: ObstacleType[];
  collectibles: GameCollectibleType[];
  playerX: number;
  setObstacles: (fn: (prev: ObstacleType[]) => ObstacleType[]) => void;
  setCollectibles: (fn: (prev: GameCollectibleType[]) => GameCollectibleType[]) => void;
  setScore: (fn: (prev: number) => number) => void;
  setCoinsCollected: (fn: (prev: number) => number) => void;
  setLastObstacleSpawn: (value: number) => void;
  setLastCollectibleSpawn: (value: number) => void;
  onCoinCollected?: () => void;
  setInvincibilityItems: (fn: (prev: number) => number) => void;
  setMagnetItems: (fn: (prev: number) => number) => void;
  obstacleCount: number;
  setObstacleCount: (value: number) => void;
}

const LEVEL_OBSTACLE_CAPS: Record<number, number> = {
  1: 5,
  2: 15,
  3: 20,
  4: 25
};

export const useGameLoop = ({
  gameOver,
  victory,
  gamePaused,
  level,
  score,
  gameSpeed,
  speedBoost,
  playerY,
  lastObstacleSpawn,
  lastCollectibleSpawn,
  obstacles,
  collectibles,
  playerX,
  setObstacles,
  setCollectibles,
  setScore,
  setCoinsCollected,
  setLastObstacleSpawn,
  setLastCollectibleSpawn,
  onCoinCollected,
  setInvincibilityItems,
  setMagnetItems,
  obstacleCount,
  setObstacleCount
}: UseGameLoopProps) => {
  const { generateObstacle, generateCollectible } = useGameLogic({ level, gameSpeed, speedBoost });
  const followMode = level >= 5;
  const prevLevel = useRef(level);

  useEffect(() => {
    // Reset count when level changes!
    if (level !== prevLevel.current) {
      setObstacleCount(0);
      prevLevel.current = level;
    }
  }, [level, setObstacleCount]);

  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      setObstacles(prevObstacles => {
        const maxObstacles = LEVEL_OBSTACLE_CAPS[level];
        const { updatedObstacles, newLastObstacleSpawn, spawned } = updateObstacles({
          obstacles: prevObstacles,
          currentTime,
          lastObstacleSpawn,
          level,
          playerY,
          followMode,
          generateObstacle,
          obstacleCount,
          maxObstacles
        });
        if (newLastObstacleSpawn !== lastObstacleSpawn) {
          setLastObstacleSpawn(newLastObstacleSpawn);
        }
        if (spawned) {
          setObstacleCount(obstacleCount + 1);
        }
        return updatedObstacles;
      });

      setCollectibles(prevCollectibles => {
        const { updatedCollectibles, newLastCollectibleSpawn } = updateCollectibles({
            collectibles: prevCollectibles,
            currentTime,
            lastCollectibleSpawn: lastCollectibleSpawn,
            gameSpeed,
            generateCollectible,
        });
        if (newLastCollectibleSpawn !== lastCollectibleSpawn) {
            setLastCollectibleSpawn(newLastCollectibleSpawn);
        }
        return updatedCollectibles;
      });

      setScore(prev => prev + 10);
    }, 16);

    return () => clearInterval(gameLoop);
  }, [
    gameOver,
    victory,
    gamePaused,
    generateObstacle,
    generateCollectible,
    followMode,
    playerY,
    level,
    score,
    lastObstacleSpawn,
    lastCollectibleSpawn,
    gameSpeed,
    speedBoost,
    setObstacles,
    setCollectibles,
    setScore,
    setLastObstacleSpawn,
    setLastCollectibleSpawn,
    obstacleCount,
    setObstacleCount,
  ]);

  useEffect(() => {
    if (gamePaused) return;
    
    handleCollectibleCollisions({
      collectibles,
      playerX,
      playerY,
      setScore,
      setCoinsCollected,
      setCollectibles,
      onCoinCollected,
      setInvincibilityItems,
      setMagnetItems,
    });
  }, [collectibles, playerX, playerY, gamePaused, setScore, setCoinsCollected, setCollectibles, onCoinCollected, setInvincibilityItems, setMagnetItems]);
};
