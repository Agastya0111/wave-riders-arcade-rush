
import { useState, useEffect, useRef, useCallback } from "react";
import { GameOver } from "./GameOver";
import { Victory } from "./Victory";
import { useGameState } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameSession } from "@/hooks/useGameSession";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useWRCSystem } from "@/hooks/useWRCSystem";
import { useItemEffects } from "@/hooks/useItemEffects";
import type { Avatar } from "@/pages/Index";

import { useGameInteractions } from "@/hooks/useGameInteractions";
import { useGameActions } from "@/hooks/useGameActions";
import { GameRenderer } from "./GameRenderer";
import { GameHUD } from "./GameHUD";
import { GamePopups } from "./GamePopups";
import { Challenge, ChallengeBanner } from "./ChallengeBanner"; // Added ChallengeBanner import
import { useGameDerivedState } from "@/hooks/useGameDerivedState"; // Import new hook
import { useGameLifecycleEffects } from "@/hooks/useGameLifecycleEffects"; // Import new hook

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
export type Gear = "surfboard" | "bike" | "ship";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
}

export const Game = ({ avatar, onRestart }: GameProps) => {
  const gameState = useGameState();
  const playerX = 100;
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [livesUsed, setLivesUsed] = useState(0);
  const [dolphinsUsed, setDolphinsUsed] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const wrcSystem = useWRCSystem();
  const itemEffects = useItemEffects();

  const [challenge, setChallenge] = useState<Challenge>({
    text: "Collect 7 coins in a round!",
    completed: false
  });

  const gameInteractions = useGameInteractions({
    coinsCollected: gameState.coinsCollected,
    challenge,
    setChallenge,
    wrcSystemEarnWRC: wrcSystem.earnWRC,
  });

  const gameActions = useGameActions({
    gameState,
    wrcSystem,
    itemEffects,
    onRestart,
    setLivesUsed, // Pass setLivesUsed here
    setDolphinsUsed,
    showError: gameInteractions.showError,
  });

  const gameControls = useGameControls({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    gamePaused: gameState.gamePaused,
    speedBoostCount: gameState.speedBoostCount,
    speedBoost: gameState.speedBoost,
    setPlayerY: gameState.setPlayerY,
    setSpeedBoost: gameState.setSpeedBoost,
    setSpeedBoostCount: gameState.setSpeedBoostCount,
  });

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    moveUp: gameControls.moveUp,
    moveDown: gameControls.moveDown,
    activateSpeedBoost: gameControls.activateSpeedBoost,
  });
  
  useGameLoop({
    ...gameState,
    playerX,
    onCoinCollected: gameInteractions.handleCoinCollected,
  });

  useGameEvents({
    ...gameState,
    playerX,
  });

  useGameSession({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    score: gameState.score,
    level: gameState.level,
    avatar,
    startTime,
    livesUsed,
    dolphinsUsed,
  });

  const [localShowShop, setLocalShowShop] = useState(false);
  const [replayOverlayVisible, setReplayOverlayVisible] = useState(false);

  // Use the new lifecycle effects hook
  useGameLifecycleEffects({
    gameState,
    gameActions,
    localShowShop,
    setReplayOverlayVisible,
    setIsMobile,
    setLivesUsed,
    initialLives: 3, // Assuming 3 initial lives, can be prop if dynamic
  });

  // Use the new derived state hook
  const {
    currentGear,
    followMode,
    bossActive,
    canAffordShop,
    showShopButton,
  } = useGameDerivedState({
    gameState,
    wrcSystem,
    localShowShop,
  });

  // Removed useEffect blocks for mobile check, livesUsed, keyboard shortcuts, game pause, and replay overlay visibility
  // as they are now in useGameLifecycleEffects.
  // Removed calculations for currentGear, followMode, bossActive, canAffordShop, showShopButton
  // as they are now in useGameDerivedState.


  const handleReplayRequest = () => {
    setReplayOverlayVisible(false);
    gameActions.handleRestartGame();
  };

  if (gameState.gameOver) {
    return (
      <GameOver
        score={gameState.score}
        level={gameState.level}
        onRestart={gameActions.handleRestartGame}
        onChooseAvatar={gameActions.handleChooseNewAvatar}
        rescueMission={gameState.level >= 7}
      />
    );
  }

  if (gameState.victory) {
    return (
      <Victory
        score={gameState.score}
        onPlayAgain={gameActions.handleRestartGame}
        onChooseAvatar={gameActions.handleChooseNewAvatar}
      />
    );
  }

  const gameHUDInteractions = {
    isInvincible: gameInteractions.isInvincible,
    magnetActive: gameInteractions.magnetActive,
    challenge: gameInteractions.challenge,
    showCoinFeedback: gameInteractions.showCoinFeedback,
    errorMessage: gameInteractions.errorMessage,
  };
  
  const gameHUDActions = {
    handleUseShield: gameActions.handleUseShield,
    handleUseSword: gameActions.handleUseSword,
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-800">
      <GameRenderer
        playerX={playerX}
        playerY={gameState.playerY}
        avatar={avatar}
        currentGear={currentGear}
        obstacles={gameState.obstacles}
        collectibles={gameState.collectibles}
        bossActive={bossActive}
        gameAreaRef={gameAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <GameHUD
        gameState={gameState}
        wrcSystem={wrcSystem}
        itemEffects={itemEffects}
        gameInteractions={gameHUDInteractions}
        gameActions={gameHUDActions}
        showShopButton={showShopButton}
        onOpenShop={() => setLocalShowShop(true)}
        canAffordShop={canAffordShop}
        isMobile={isMobile}
        currentGear={currentGear}
        followMode={followMode}
        dolphinsUsed={dolphinsUsed}
        setDolphinsUsed={setDolphinsUsed}
        activateSpeedBoost={gameControls.activateSpeedBoost}
      />
      <GamePopups
        gameState={gameState}
        wrcSystem={wrcSystem}
        localShowShop={localShowShop}
        setLocalShowShop={setLocalShowShop}
        replayOverlayVisible={replayOverlayVisible}
        onReplay={handleReplayRequest}
      />
    </div>
  );
};

