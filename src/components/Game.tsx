
import { useState, useEffect, useRef, useCallback } from "react";
import { GameBackground } from "./GameBackground";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Collectible } from "./Collectible";
import { GameUI } from "./GameUI";
import { GameOver } from "./GameOver";
import { Victory } from "./Victory";
import { StoryPopup } from "./StoryPopup";
import { SignupPrompt } from "./SignupPrompt";
import { DolphinHelper } from "./DolphinHelper";
import { TouchControls } from "./TouchControls";
import { useGameState } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameSession } from "@/hooks/useGameSession";
import { useTouchControls } from "@/hooks/useTouchControls";
import type { Avatar } from "@/pages/Index";

export interface ObstacleType {
  id: string;
  type: "shark" | "whale" | "octopus" | "rock" | "jellyfish" | "whirlpool" | "crate" | "seaweed";
  x: number;
  y: number;
  speed: number;
  warning?: boolean;
  jumping?: boolean;
  jumpStart?: number;
  jumpDirection?: number;
}

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
}

export const Game = ({ avatar, onRestart }: GameProps) => {
  const gameState = useGameState();
  const [playerX] = useState(100);
  const [gamePaused, setGamePaused] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [livesUsed, setLivesUsed] = useState(0);
  const [dolphinsUsed, setDolphinsUsed] = useState(0);

  // Track lives used
  useEffect(() => {
    const initialLives = 3;
    setLivesUsed(initialLives - gameState.lives);
  }, [gameState.lives]);

  // Touch controls
  const { touchY, handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    onMove: gameState.setPlayerY,
    currentY: gameState.playerY,
    gamePaused
  });

  // Game controls
  useGameControls({
    playerY: gameState.playerY,
    setPlayerY: gameState.setPlayerY,
    speedBoost: gameState.speedBoost,
    setSpeedBoost: gameState.setSpeedBoost,
    speedBoostCount: gameState.speedBoostCount,
    setSpeedBoostCount: gameState.setSpeedBoostCount,
    gamePaused,
    setGamePaused,
    touchY
  });

  // Game loop
  useGameLoop({
    ...gameState,
    playerX,
    playerY: gameState.playerY,
    gamePaused,
    avatar
  });

  // Game events
  useGameEvents({
    ...gameState,
    playerX,
    playerY: gameState.playerY,
    avatar,
    gamePaused,
    storyShown: gameState.storyShown
  });

  // Game session tracking
  useGameSession({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    score: gameState.score,
    level: gameState.level,
    avatar,
    startTime,
    livesUsed,
    dolphinsUsed
  });

  const handleRestart = useCallback(() => {
    gameState.resetGame();
    setGamePaused(false);
    setLivesUsed(0);
    setDolphinsUsed(0);
    onRestart();
  }, [gameState, onRestart]);

  const handleChooseAvatar = useCallback(() => {
    gameState.resetGame();
    setGamePaused(false);
    setLivesUsed(0);
    setDolphinsUsed(0);
  }, [gameState]);

  if (gameState.gameOver) {
    return (
      <GameOver
        score={gameState.score}
        level={gameState.level}
        onRestart={handleRestart}
        onChooseAvatar={handleChooseAvatar}
        rescueMission={gameState.level >= 7}
      />
    );
  }

  if (gameState.victory) {
    return (
      <Victory
        score={gameState.score}
        onPlayAgain={handleRestart}
        onChooseAvatar={handleChooseAvatar}
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-800">
      <div
        ref={gameAreaRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <GameBackground level={gameState.level} />
        
        <Player 
          x={playerX} 
          y={gameState.playerY} 
          avatar={avatar}
          speedBoost={gameState.speedBoost}
        />
        
        {gameState.obstacles.map((obstacle) => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        
        {gameState.collectibles.map((collectible) => (
          <Collectible key={collectible.id} collectible={collectible} />
        ))}
        
        <GameUI
          score={gameState.score}
          level={gameState.level}
          lives={gameState.lives}
          speedBoostCount={gameState.speedBoostCount}
          coinsCollected={gameState.coinsCollected}
        />
        
        <DolphinHelper
          level={gameState.level}
          onUse={() => setDolphinsUsed(prev => prev + 1)}
        />
        
        <TouchControls />
        
        {gameState.showStoryPopup && (
          <StoryPopup onClose={() => {
            gameState.setShowStoryPopup(false);
            gameState.setStoryShown(true);
          }} />
        )}
        
        {gameState.showSignupPrompt && (
          <SignupPrompt onClose={() => gameState.setShowSignupPrompt(false)} />
        )}
      </div>
    </div>
  );
};
