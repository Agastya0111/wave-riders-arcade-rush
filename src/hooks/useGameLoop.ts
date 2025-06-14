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
  onCoinCollected?: () => void;
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
  onCoinCollected,
}: UseGameLoopProps) => {
  const { generateObstacle, generateCollectible } = useGameLogic({ level, gameSpeed, speedBoost });
  const followMode = level >= 5;

  // NEW: Checks if newY is too close vertically to existing obstacles
  const isObstacleTooClose = (newY: number, newX: number) => {
    return obstacles.some(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
      );
      // Tweak: Slightly increase min distance for more room in easy levels
      return distance < 130;
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

        // --- Increased but reasonable density for levels 1-4 ---
        let shouldSpawn = false;
        let effectiveMinSpawnInterval = 2450; // default for lv1-4, slightly busier than before

        if (level <= 4) {
          // Make levels slightly busier: interval 2.15–2.45s depending on level
          // Level 1: 2.45s, Level 2: 2.35s, Level 3: 2.25s, Level 4: 2.15s
          effectiveMinSpawnInterval = 2450 - (level - 1) * 100;

          const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
          const hasNoObstacles = updated.length === 0;

          // Always force a spawn if no obstacles and min interval passed
          if (timeSinceLastSpawn >= effectiveMinSpawnInterval && hasNoObstacles) {
            shouldSpawn = true;
            setLastObstacleSpawn(currentTime);
          } else if (
            // Otherwise, random chance if last spawn interval is met
            timeSinceLastSpawn >= effectiveMinSpawnInterval &&
            Math.random() < 0.26 + 0.08 * level // 0.34 at level 1 to 0.58 at lv4
          ) {
            shouldSpawn = true;
            setLastObstacleSpawn(currentTime);
          }
        } else {
          // Danger zone (lv5+): unchanged, hard
          if (Math.random() < 0.020) {
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
            attempts < 7 && // try up to 7 times for better vertical safety
            level <= 4 &&
            isObstacleTooClose(newObstacle.y, newObstacle.x)
          );

          if (attempts < 7 || level > 4) {
            updated.push(newObstacle);
          }
        }

        return updated;
      });

      setCollectibles(prev => {
        let updated = prev
          .map(collectible => ({
            ...collectible,
            x: collectible.x - collectible.speed,
          }))
          .filter(collectible => collectible.x > -100);

        // Spawn collectibles more frequently for WRC collection
        const timeSinceLastCollectible = currentTime - lastCollectibleSpawn;
        const spawnInterval = 1500; // More frequent spawning for coins
        
        if (timeSinceLastCollectible > spawnInterval + Math.random() * 1000) {
          // 80%: coin, 13%: bubble, 4%: starfish, 3%: magnet.
          const rnd = Math.random();
          if (rnd < 0.8) {
            // Coin (possible double coin)
            if (Math.random() < 0.12) {
              // Double Coin (special "glow" coin)
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
            // Bubble
            updated.push({
              id: Math.random().toString(),
              type: "bubble",
              x: 1200,
              y: Math.random() * 400 + 100,
              speed: gameSpeed * 0.76
            } as any);
          } else if (rnd < 0.97) {
            // Starfish (grant invincibility)
            updated.push({
              id: Math.random().toString(),
              type: "starfish",
              x: 1200,
              y: Math.random() * 400 + 100,
              speed: gameSpeed * 0.7
            } as any);
          } else {
            // Magnet
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

      setScore(prev => prev + 10); // Score increases by time, NOT by coins
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
    onCoinCollected,
  ]);

  // Collectible collision detection - WRC and score are COMPLETELY separate
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
          // Normal or double?
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
          // Invincibility, needs to be set by consuming component (Game)
          window.dispatchEvent(new Event("powerup-invincibility")); // communicate upwards
        } else if ((collectible as any).type === "magnet") {
          window.dispatchEvent(new Event("powerup-magnet"));
        }
        setCollectibles(prev => prev.filter(c => c.id !== collectible.id));
      }
    });
  }, [collectibles, playerX, playerY, gamePaused, setScore, setCoinsCollected, setCollectibles, onCoinCollected]);
};
