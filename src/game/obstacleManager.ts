import type { ObstacleType } from "@/components/Game.d";

const isObstacleTooClose = (newY: number, newX: number, obstacles: ObstacleType[]) => {
  return obstacles.some(obstacle => {
    const distance = Math.sqrt(
      Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
    );
    return distance < 130;
  });
};

interface UpdateObstaclesProps {
  obstacles: ObstacleType[];
  currentTime: number;
  lastObstacleSpawn: number;
  level: number;
  playerY: number;
  followMode: boolean;
  generateObstacle: () => ObstacleType;
  obstacleCount: number;
  maxObstacles: number | undefined;
}

interface UpdateObstaclesResult {
    updatedObstacles: ObstacleType[];
    newLastObstacleSpawn: number;
    spawned: boolean; // tells if a new one was spawned
}

export const updateObstacles = ({
  obstacles,
  currentTime,
  lastObstacleSpawn,
  level,
  playerY,
  followMode,
  generateObstacle,
  obstacleCount,
  maxObstacles,
}: UpdateObstaclesProps): UpdateObstaclesResult => {
  let updated = obstacles
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

  let newLastObstacleSpawn = lastObstacleSpawn;
  let shouldSpawn = false;
  let effectiveMinSpawnInterval = 2450; 
  let spawned = false;

  // Per-level obstacle count cap
  const isLevelCap = typeof maxObstacles === "number" && obstacleCount >= maxObstacles;

  if (!isLevelCap) {
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
      if (Math.random() < 0.020) {
        shouldSpawn = true;
      }
    }
  }
  
  if (shouldSpawn) {
    newLastObstacleSpawn = currentTime;
    let attempts = 0;
    let newObstacle;
    do {
      newObstacle = generateObstacle();
      attempts++;
    } while (
      attempts < 7 && 
      level <= 4 &&
      isObstacleTooClose(newObstacle.y, newObstacle.x, updated)
    );

    if (attempts < 7 || level > 4) {
      updated.push(newObstacle);
      spawned = true;
    }
  }
  
  return { updatedObstacles: updated, newLastObstacleSpawn, spawned };
};
