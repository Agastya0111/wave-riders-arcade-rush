
import { useRef } from "react";
import { Avatar } from "@/pages/Index";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Lives } from "./Lives";
import { Score } from "./Score";
import { GameOver } from "./GameOver";
import { StoryPopup } from "./StoryPopup";
import { Victory } from "./Victory";
import { GameBackground } from "./GameBackground";
import { GameUI } from "./GameUI";
import { TouchControls } from "./TouchControls";
import { DolphinHelper } from "./DolphinHelper";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useGameState } from "@/hooks/useGameState";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameLoop } from "@/hooks/useGameLoop";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
}

export interface ObstacleType {
  id: string;
  type: "shark" | "whale" | "octopus" | "rock";
  x: number;
  y: number;
  speed: number;
  jumping?: boolean;
  jumpStart?: number;
  jumpDirection?: number;
  warning?: boolean;
}

export type Gear = "surfboard" | "bike" | "ship";

export const Game = ({ avatar, onRestart }: GameProps) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerX = 100;

  // Use custom hooks for state management
  const gameState = useGameState();
  const {
    playerY,
    obstacles,
    lives,
    score,
    level,
    gameOver,
    showStoryPopup,
    victory,
    speedBoost,
    speedBoostCount,
    lastObstacleSpawn,
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
    resetGame,
  } = gameState;

  const followMode = level >= 5;
  const gamePaused = showStoryPopup;

  const getCurrentGear = (): Gear => {
    if (level >= 8) return "ship";
    if (level >= 5) return "bike";
    return "surfboard";
  };
  const currentGear = getCurrentGear();

  // Use game controls hook
  const { moveUp, moveDown, activateSpeedBoost } = useGameControls({
    gameOver,
    victory,
    gamePaused,
    speedBoostCount,
    speedBoost,
    setPlayerY,
    setSpeedBoost,
    setSpeedBoostCount,
  });

  // Use game events hook
  useGameEvents({
    level,
    lives,
    score,
    gameOver,
    victory,
    gamePaused,
    storyShown: gameState.storyShown,
    showStoryPopup,
    obstacles,
    playerX,
    playerY,
    avatar,
    setShowStoryPopup,
    setVictory,
    setLevel,
    setGameSpeed,
    setLives,
    setObstacles,
    setGameOver,
  });

  // Use game loop hook
  useGameLoop({
    gameOver,
    victory,
    gamePaused,
    level,
    gameSpeed: gameState.gameSpeed,
    speedBoost,
    playerY,
    lastObstacleSpawn,
    obstacles,
    setObstacles,
    setScore,
    setLastObstacleSpawn,
  });

  const handleDolphinSave = () => {
    if (lives > 0) {
      setLives(prev => Math.min(3, prev + 1));
    }
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    moveUp,
    moveDown,
    activateSpeedBoost
  });

  const handleStoryClose = () => {
    setShowStoryPopup(false);
    setStoryShown(true);
  };

  const handleRestart = () => {
    resetGame();
  };

  if (victory) {
    return (
      <Victory
        score={score}
        onPlayAgain={handleRestart}
        onChooseAvatar={onRestart}
      />
    );
  }

  if (gameOver) {
    const rescueMission = level >= 7;
    return (
      <GameOver
        score={score}
        level={level}
        onRestart={handleRestart}
        onChooseAvatar={onRestart}
        rescueMission={rescueMission}
      />
    );
  }

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showStoryPopup && <StoryPopup onContinue={handleStoryClose} />}
      <GameBackground />
      <Lives lives={lives} />
      <Score score={score} level={level} />
      <DolphinHelper
        lives={lives}
        onSave={handleDolphinSave}
        gameOver={gameOver}
        gamePaused={gamePaused}
      />
      <GameUI
        level={level}
        followMode={followMode}
        currentGear={currentGear}
        speedBoost={speedBoost}
      />
      <TouchControls
        speedBoostCount={speedBoostCount}
        speedBoost={speedBoost}
        onSpeedBoost={activateSpeedBoost}
      />
      <Player avatar={avatar} x={playerX} y={playerY} gear={currentGear} />
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm md:text-lg font-bold drop-shadow-lg text-center">
        <div className="hidden md:block">
          Use ↑↓ Arrow Keys to Move, Space for Speed Boost, Ctrl+D for Dolphin - Level {level} ({currentGear.toUpperCase()})
        </div>
        <div className="md:hidden text-xs">
          Level {level} ({currentGear.toUpperCase()}) - Swipe to move, tap to jump
        </div>
      </div>
    </div>
  );
};
