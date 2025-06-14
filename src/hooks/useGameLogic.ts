import { useCallback } from "react";
import type { ObstacleType, GameCollectibleType } from "@/components/Game.d";

interface UseGameLogicProps {
  level: number;
  gameSpeed: number;
  speedBoost: boolean;
}

export const useGameLogic = ({ level, gameSpeed, speedBoost }: UseGameLogicProps) => {
  const generateObstacle = useCallback(() => {
    const types: ("shark" | "whale" | "octopus" | "rock" | "jellyfish" | "whirlpool" | "crate" | "seaweed")[] = 
      ["shark", "whale", "octopus", "rock", "jellyfish", "whirlpool", "crate", "seaweed"];
    
    let type = types[Math.floor(Math.random() * types.length)];
    
    // For levels 1-4, use varied obstacle types with better distribution
    if (level <= 4) {
      const levelTypes = {
        1: ["jellyfish", "crate", "seaweed"] as ("jellyfish" | "crate" | "seaweed")[],
        2: ["jellyfish", "crate", "seaweed", "rock"] as ("jellyfish" | "crate" | "seaweed" | "rock")[],
        3: ["shark", "rock", "whirlpool", "crate"] as ("shark" | "rock" | "whirlpool" | "crate")[],
        4: ["shark", "whale", "octopus", "rock"] as ("shark" | "whale" | "octopus" | "rock")[]
      };
      const availableTypes = levelTypes[level as keyof typeof levelTypes];
      type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }
    
    // Increase octopus spawn rate after level 5
    if (level >= 5 && Math.random() < 0.4) {
      type = "octopus";
    }
    
    // Progressive speed increases for levels 1-4
    let speed = gameSpeed;
    if (level <= 4) {
      const levelSpeeds = {
        1: gameSpeed * 0.5, // Very slow
        2: gameSpeed * 0.65, // Slow
        3: gameSpeed * 0.8, // Moderate
        4: gameSpeed * 0.95  // Faster
      };
      speed = levelSpeeds[level as keyof typeof levelSpeeds];
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
    
    // Randomize Y position with some safe zones for levels 1-4
    let yPosition = Math.random() * 400 + 100;
    if (level <= 4) {
      // Create safe lanes for easier navigation
      const lanes = [150, 250, 350, 450];
      yPosition = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() - 0.5) * 40;
    }
    
    const obstacle: ObstacleType = {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: yPosition,
      speed,
      warning: level <= 4, // Add warning for levels 1-4
    };

    // Add jumping behavior for whales (only after level 4)
    if (type === "whale" && level > 4 && Math.random() < 0.3) {
      obstacle.jumping = true;
      obstacle.jumpStart = Date.now();
      obstacle.jumpDirection = Math.random() < 0.5 ? -1 : 1;
    }
    
    return obstacle;
  }, [gameSpeed, level, speedBoost]);

  const generateCollectible = useCallback((): GameCollectibleType => {
    // Prioritize coins for WRC collection - 90% chance for coins
    const coinChance = 0.9;
    const type = Math.random() < coinChance ? "coin" : "bubble";
    
    return {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: Math.random() * 400 + 100,
      speed: gameSpeed * 0.8, // Slightly slower than obstacles
    };
  }, [gameSpeed]);

  return { generateObstacle, generateCollectible };
};
