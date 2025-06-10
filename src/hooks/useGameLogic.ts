
import { useCallback } from "react";
import { ObstacleType } from "@/components/Game";

interface UseGameLogicProps {
  level: number;
  gameSpeed: number;
  speedBoost: boolean;
}

export const useGameLogic = ({ level, gameSpeed, speedBoost }: UseGameLogicProps) => {
  const generateObstacle = useCallback(() => {
    const types: ("shark" | "whale" | "octopus" | "rock")[] = ["shark", "whale", "octopus", "rock"];
    let type = types[Math.floor(Math.random() * types.length)];
    
    // Increase octopus spawn rate after level 5
    if (level >= 5 && Math.random() < 0.4) {
      type = "octopus";
    }
    
    let speed = gameSpeed;
    
    // For levels 1-4, make obstacles very slow and negligible
    if (level <= 4) {
      speed = gameSpeed * 0.3; // Much slower obstacles
    } else {
      speed = gameSpeed + Math.random() * 2;
    }
    
    // Apply speed boost if active
    if (speedBoost) {
      speed *= 0.5; // Slow down obstacles when boost is active
    }
    
    // Level-based speed increases for sharks and whales (only after level 4)
    if (level > 4) {
      if (type === "shark") {
        speed *= (1 + level * 0.3);
      } else if (type === "whale") {
        speed *= (1 + level * 0.25);
      }
    }
    
    const obstacle: ObstacleType = {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: Math.random() * 400 + 100,
      speed,
    };

    // Add jumping behavior for whales (only after level 4)
    if (type === "whale" && level > 4 && Math.random() < 0.3) {
      obstacle.jumping = true;
      obstacle.jumpStart = Date.now();
      obstacle.jumpDirection = Math.random() < 0.5 ? -1 : 1;
    }
    
    return obstacle;
  }, [gameSpeed, level, speedBoost]);

  return { generateObstacle };
};
