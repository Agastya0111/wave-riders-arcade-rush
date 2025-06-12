
import { useState } from "react";
import { ObstacleType } from "@/components/Game";

export const useGameState = () => {
  const [playerY, setPlayerY] = useState(300);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
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

  const resetGame = () => {
    setPlayerY(300);
    setObstacles([]);
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
  };

  return {
    // State
    playerY,
    obstacles,
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
    // Setters
    setPlayerY,
    setObstacles,
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
    setGameOver,
    // Utils
    resetGame,
  };
};
