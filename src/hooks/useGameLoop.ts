import { useEffect } from "react";
import { ObstacleType } from "@/components/Game";
import { CollectibleType, useGameLogic } from "@/hooks/useGameLogic";
import { checkCollision } from "@/utils/gameUtils";

interface UseGameLoopProps {
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  level: number;
  score: number; // Added score to props
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
  onCoinCollected?: () => void;
}

export const useGameLoop = ({
  gameOver,
  victory,
  gamePaused,
  level,
  score, // Destructure score
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
}: UseGameLoopProps) => {
  const { generateObstacle, generateCollectible } = useGameLogic({ level, gameSpeed, speedBoost });
  const followMode = level >= 5;

  const isObstacleTooClose = (newY: number, newX: number) => {
    return obstacles.some(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
      );
      return distance < 130;
    });
  };


  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      // Obstacle logic: movement and spawning
      setObstacles(prev => {
        let updated = prev
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

        // Only spawn obstacles if score is 500 or more
        if (score >= 500) {
          let shouldSpawn = false;
          let effectiveMinSpawnInterval = 2450; 

          if (level <= 4) {
            effectiveMinSpawnInterval = 2450 - (level - 1) * 100;
            const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
            const hasNoObstacles = updated.length === 0;

            if (timeSinceLastSpawn >= effectiveMinSpawnInterval && hasNoObstacles) {
              shouldSpawn = true;
            } else if (
              timeSinceLastSpawn >= effectiveMinSpawnInterval &&
              Math.random() < 0.26 + 0.08 * level
            ) {
              shouldSpawn = true;
            }
          } else {
            // Danger zone (lv5+): unchanged, hard
            if (Math.random() < 0.020) { // Reduced original threshold from 0.05 to 0.02 for testing, revert if too sparse
              shouldSpawn = true;
            }
          }
          
          if (shouldSpawn) {
            setLastObstacleSpawn(currentTime); // Set spawn time here before potential early exit
            let attempts = 0;
            let newObstacle;
            do {
              newObstacle = generateObstacle();
              attempts++;
            } while (
              attempts < 7 && 
              level <= 4 &&
              isObstacleTooClose(newObstacle.y, newObstacle.x)
            );

            if (attempts < 7 || level > 4) {
              updated.push(newObstacle);
            }
          }
        }
        return updated;
      });

      // Collectible logic (spawns regardless of score)
      setCollectibles(prev => {
        let updated = prev
          .map(collectible => ({
            ...collectible,
            x: collectible.x - collectible.speed,
          }))
          .filter(collectible => collectible.x > -100);

        const timeSinceLastCollectible = currentTime - lastCollectibleSpawn;
        const spawnInterval = 1500; 
        
        if (timeSinceLastCollectible > spawnInterval + Math.random() * 1000) {
          const rnd = Math.random();
          if (rnd < 0.8) {
            if (Math.random() < 0.12) {
              updated.push({
                id: Math.random().toString(),
                type: "coin",
                x: 1200,
                y: Math.random() * 400 + 100,
                speed: gameSpeed * 0.8,
                double: true
              } as any);
            } else {
              updated.push(generateCollectible());
            }
          } else if (rnd < 0.93) {
            updated.push({
              id: Math.random().toString(),
              type: "bubble",
              x: 1200,
              y: Math.random() * 400 + 100,
              speed: gameSpeed * 0.76
            } as any);
          } else if (rnd < 0.97) {
            updated.push({
              id: Math.random().toString(),
              type: "starfish",
              x: 1200,
              y: Math.random() * 400 + 100,
              speed: gameSpeed * 0.7
            } as any);
          } else {
            updated.push({
              id: Math.random().toString(),
              type: "magnet",
              x: 1200,
              y: Math.random() * 400 + 100,
              speed: gameSpeed * 0.8
            } as any);
          }
          setLastCollectibleSpawn(currentTime);
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
    score, // Added score to dependency array
    lastObstacleSpawn,
    lastCollectibleSpawn,
    gameSpeed, // Added gameSpeed as generateCollectible depends on it.
    speedBoost, // Added speedBoost as generateObstacle depends on it.
    setObstacles,
    setCollectibles,
    setScore,
    setCoinsCollected, // This seems to be unused in this specific useEffect, but it's a prop.
    setLastObstacleSpawn,
    setLastCollectibleSpawn,
    onCoinCollected, // This is also for the collectible collision effect.
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
          if ((collectible as any).double) {
            setCoinsCollected(prev => prev + 2);
            onCoinCollected && onCoinCollected();
            onCoinCollected && onCoinCollected();
          } else {
            setCoinsCollected(prev => prev + 1);
            if (onCoinCollected) onCoinCollected();
          }
        } else if (collectible.type === "bubble") {
          setScore(prev => prev + 50);
        } else if ((collectible as any).type === "starfish") {
          window.dispatchEvent(new Event("powerup-invincibility")); 
        } else if ((collectible as any).type === "magnet") {
          window.dispatchEvent(new Event("powerup-magnet"));
        }
        setCollectibles(prev => prev.filter(c => c.id !== collectible.id));
      }
    });
  }, [collectibles, playerX, playerY, gamePaused, setScore, setCoinsCollected, setCollectibles, onCoinCollected]);
};
