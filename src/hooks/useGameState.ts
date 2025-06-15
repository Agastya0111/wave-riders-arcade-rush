import { useState } from "react";
import type { ObstacleType, GameCollectibleType } from "@/components/Game.d";

export const useGameState = () => {
  const [playerY, setPlayerY] = useState(300);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [collectibles, setCollectibles] = useState<GameCollectibleType[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [storyShown, setStoryShown] = useState(false);
  const [victory, setVictory] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [speedBoostCount, setSpeedBoostCount] = useState(3);
  const [lastObstacleSpawn, setLastObstacleSpawn] = useState(0);
  const [lastCollectibleSpawn, setLastCollectibleSpawn] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [showMilestonePopup, setShowMilestonePopup] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState<number[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [invincibilityItems, setInvincibilityItems] = useState(0);
  const [magnetItems, setMagnetItems] = useState(0);
  const [obstacleCount, setObstacleCount] = useState(0); // NEW: counts obstacles spawned this level
  // Removed wcrTriggered and showWCRPopup states

  const resetGame = () => {
    setPlayerY(300);
    setObstacles([]);
    setCollectibles([]);
    setLives(3);
    setScore(0);
    setLevel(1);
    setGameSpeed(3);
    setGameOver(false);
    setShowStoryPopup(false);
    setStoryShown(false);
    setVictory(false);
    setSpeedBoost(false);
    setSpeedBoostCount(3);
    setLastObstacleSpawn(0);
    setLastCollectibleSpawn(0);
    setShowSignupPrompt(false);
    setCoinsCollected(0);
    setShowMilestonePopup(false);
    setMilestoneReached([]);
    setShowShop(false);
    setGamePaused(false);
    setInvincibilityItems(0);
    setMagnetItems(0);
    setObstacleCount(0); // Reset count on new game
    // Removed reset for WCR state
  };

  return {
    // State
    playerY,
    obstacles,
    collectibles,
    lives,
    score,
    level,
    gameOver,
    gameSpeed,
    showStoryPopup,
    storyShown,
    victory,
    speedBoost,
    speedBoostCount,
    lastObstacleSpawn,
    lastCollectibleSpawn,
    showSignupPrompt,
    coinsCollected,
    showMilestonePopup,
    milestoneReached,
    showShop,
    gamePaused,
    invincibilityItems,
    magnetItems,
    obstacleCount,
    setObstacleCount,
    // Removed wcrTriggered, showWCRPopup from returned state
    // Setters
    setPlayerY,
    setObstacles,
    setCollectibles,
    setLives,
    setScore,
    setLevel,
    setGameSpeed,
    setShowStoryPopup,
    setStoryShown,
    setVictory,
    setSpeedBoost,
    setSpeedBoostCount,
    setLastObstacleSpawn,
    setLastCollectibleSpawn,
    setGameOver,
    setShowSignupPrompt,
    setCoinsCollected,
    setShowMilestonePopup,
    setMilestoneReached,
    setShowShop,
    setGamePaused,
    setInvincibilityItems,
    setMagnetItems,
    // Removed setWcrTriggered, setShowWCRPopup from returned setters
    // Utils
    resetGame,
  };
};

export type GameStateHook = ReturnType<typeof useGameState>;
