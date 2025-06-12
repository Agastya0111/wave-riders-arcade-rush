
import { useEffect } from "react";
import { ObstacleType } from "@/components/Game";
import { useGameLogic } from "@/hooks/useGameLogic";

interface UseGameLoopProps {
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  level: number;
  gameSpeed: number;
  speedBoost: boolean;
  playerY: number;
  lastObstacleSpawn: number;
  obstacles: ObstacleType[];
  setObstacles: (fn: (prev: ObstacleType[]) => ObstacleType[]) => void;
  setScore: (fn: (prev: number) => number) => void;
  setLastObstacleSpawn: (value: number) => void;
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
  obstacles,
  setObstacles,
  setScore,
  setLastObstacleSpawn,
}: UseGameLoopProps) => {
  const { generateObstacle } = useGameLogic({ level, gameSpeed, speedBoost });
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

        let shouldSpawn = false;

        if (level <= 4) {
          const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
          const minSpawnInterval = 4000 + Math.random() * 2000;
          if (timeSinceLastSpawn > minSpawnInterval) {
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

      setScore(prev => prev + 10);
    }, 16);

    return () => clearInterval(gameLoop);
  }, [
    gameOver,
    victory,
    gamePaused,
    generateObstacle,
    followMode,
    playerY,
    level,
    lastObstacleSpawn,
    obstacles,
    setObstacles,
    setScore,
    setLastObstacleSpawn,
  ]);
};
