
import { useEffect } from "react";
import { ObstacleType } from "@/components/Game";
import { CollectibleType, useGameLogic } from "@/hooks/useGameLogic";
import { checkCollision } from "@/utils/gameUtils";

interface UseGameLoopProps {
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  level: number;
  gameSpeed: number;
  speedBoost: boolean;
  playerY: number;
  lastObstacleSpawn: number;
  lastCollectibleSpawn: number;
  obstacles: ObstacleType[];
  collectibles: CollectibleType[];
  playerX: number;
  setObstacles: (fn: (prev: ObstacleType[]) => ObstacleType[]) => void;
  setCollectibles: (fn: (prev: CollectibleType[]) => CollectibleType[]) => void;
  setScore: (fn: (prev: number) => number) => void;
  setCoinsCollected: (fn: (prev: number) => number) => void;
  setLastObstacleSpawn: (value: number) => void;
  setLastCollectibleSpawn: (value: number) => void;
}

export const useGameLoop = ({
  gameOver,
  victory,
  gamePaused,
  level,
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
}: UseGameLoopProps) => {
  const { generateObstacle, generateCollectible } = useGameLogic({ level, gameSpeed, speedBoost });
  const followMode = level >= 5;

  const isObstacleTooClose = (newY: number, newX: number) => {
    return obstacles.some(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
      );
      return distance < 120;
    });
  };

  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      // Update obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obstacle => {
            let newX = obstacle.x - obstacle.speed;
            let newY = obstacle.y;

            if (obstacle.type === "whale" && obstacle.jumping && obstacle.jumpStart) {
              const jumpDuration = Date.now() - obstacle.jumpStart;
              if (jumpDuration < 3000) {
                const jumpProgress = jumpDuration / 3000;
                const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100;
                newY = obstacle.y + (obstacle.jumpDirection || 1) * jumpHeight;
              } else {
                obstacle.jumping = false;
                obstacle.jumpStart = undefined;
                obstacle.jumpDirection = undefined;
              }
            }

            if (followMode && !obstacle.jumping) {
              const deltaY = playerY - obstacle.y;
              const followSpeed = 1.5;
              newY += Math.sign(deltaY) * Math.min(Math.abs(deltaY), followSpeed);
            }

            return { ...obstacle, x: newX, y: newY };
          })
          .filter(obstacle => obstacle.x > -100);

        // Enhanced obstacle spawning for levels 1-4 - ensure spawn every 4 seconds max
        let shouldSpawn = false;
        if (level <= 4) {
          const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
          const maxSpawnInterval = 4000; // 4 seconds maximum
          const minSpawnInterval = 2000; // 2 seconds minimum
          if (timeSinceLastSpawn > maxSpawnInterval || 
              (timeSinceLastSpawn > minSpawnInterval && Math.random() < 0.3)) {
            shouldSpawn = true;
            setLastObstacleSpawn(currentTime);
          }
        } else {
          if (Math.random() < 0.02) {
            shouldSpawn = true;
          }
        }

        if (shouldSpawn) {
          let attempts = 0;
          let newObstacle;
          do {
            newObstacle = generateObstacle();
            attempts++;
          } while (
            attempts < 5 &&
            level <= 4 &&
            isObstacleTooClose(newObstacle.y, newObstacle.x)
          );

          if (attempts < 5 || level > 4) {
            updated.push(newObstacle);
          }
        }

        return updated;
      });

      // Update collectibles - always spawn for levels 1-4
      setCollectibles(prev => {
        const updated = prev
          .map(collectible => ({
            ...collectible,
            x: collectible.x - collectible.speed,
          }))
          .filter(collectible => collectible.x > -100);

        // Spawn collectibles more frequently for levels 1-4
        if (level <= 4) {
          const timeSinceLastCollectible = currentTime - lastCollectibleSpawn;
          if (timeSinceLastCollectible > 3000 + Math.random() * 2000) { // 3-5 seconds
            updated.push(generateCollectible());
            setLastCollectibleSpawn(currentTime);
          }
        }

        return updated;
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
  ]);

  // Collectible collision detection
  useEffect(() => {
    if (gamePaused) return;
    
    collectibles.forEach(collectible => {
      if (
        checkCollision(
          { x: playerX, y: playerY, width: 60, height: 60 },
          { x: collectible.x, y: collectible.y, width: 40, height: 40 }
        )
      ) {
        if (collectible.type === "coin") {
          setScore(prev => prev + 100);
          setCoinsCollected(prev => prev + 1);
        } else if (collectible.type === "bubble") {
          setScore(prev => prev + 50);
        }
        setCollectibles(prev => prev.filter(c => c.id !== collectible.id));
      }
    });
  }, [collectibles, playerX, playerY, gamePaused, setScore, setCoinsCollected, setCollectibles]);
};
