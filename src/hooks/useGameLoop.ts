
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
  1: 10,
  2: 15,
  3: 20,
  4: 25,
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
  const firstObstacleSpawned = useRef(false);

  useEffect(() => {
    // Reset count when level changes!
    if (level !== prevLevel.current) {
      setObstacleCount(0);
      prevLevel.current = level;
      firstObstacleSpawned.current = false; // Reset flag per new level
    }
  }, [level, setObstacleCount]);

  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      setObstacles(prevObstacles => {
        let maxObstacles = LEVEL_OBSTACLE_CAPS[level] || undefined;
        let didForceSpawn = false;
        let wasFirstSpawn = false;

        // --- Force first obstacle in Level 1 in the first 5 seconds
        if (level === 1 && !firstObstacleSpawned.current && prevObstacles.length === 0) {
          const elapsed = (currentTime - lastObstacleSpawn);
          // Always enforce timer from game start: if lastObstacleSpawn is 0, this is initial
          if ((lastObstacleSpawn === 0 && elapsed >= 0) || (elapsed >= 5000)) {
            firstObstacleSpawned.current = true;
            wasFirstSpawn = true;
            setLastObstacleSpawn(currentTime);
            setObstacleCount(obstacleCount + 1);
            return [
              ...prevObstacles,
              generateObstacle(),
            ];
          }
        }

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

        if (wasFirstSpawn) return prevObstacles; // Already forced the spawn above (skip normal logic this tick)

        if (newLastObstacleSpawn !== lastObstacleSpawn) {
          setLastObstacleSpawn(newLastObstacleSpawn);
        }
        if (spawned) {
          setObstacleCount(obstacleCount + 1);
          if (level === 1 && !firstObstacleSpawned.current) {
            firstObstacleSpawned.current = true;
          }
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
