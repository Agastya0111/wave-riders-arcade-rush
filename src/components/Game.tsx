import { useState, useEffect, useRef, useCallback } from "react";
import { GameOver } from "./GameOver";
import { Victory } from "./Victory";
import { useGameState, GameStateHook } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameSession } from "@/hooks/useGameSession";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useWRCSystem, WRCSystemHook } from "@/hooks/useWRCSystem";
import { useItemEffects } from "@/hooks/useItemEffects";
import type { Avatar } from "@/pages/Index";

import { useGameInteractions } from "@/hooks/useGameInteractions";
import { useGameActions } from "@/hooks/useGameActions";
import { GameRenderer } from "./GameRenderer";
import { GameHUD } from "./GameHUD";
import { GamePopups } from "./GamePopups";
import { Challenge } from "./ChallengeBanner";

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
    setLivesUsed,
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initialLives = 3;
    setLivesUsed(initialLives - gameState.lives);
  }, [gameState.lives]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver || gameState.victory || gameState.gamePaused) return;
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        gameActions.handleUseSword();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        gameActions.handleUseShield();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActions.handleUseShield, gameActions.handleUseSword, gameState.gameOver, gameState.victory, gameState.gamePaused]);
  
  useEffect(() => {
    if (
      localShowShop ||
      gameState.showShop ||
      gameState.showStoryPopup ||
      gameState.showMilestonePopup ||
      gameState.showSignupPrompt ||
      gameState.showWCRPopup
    ) {
      gameState.setGamePaused(true);
    } else {
      gameState.setGamePaused(false);
    }
  }, [
    localShowShop,
    gameState.showShop,
    gameState.showStoryPopup,
    gameState.showMilestonePopup,
    gameState.showSignupPrompt,
    gameState.showWCRPopup,
    gameState.setGamePaused,
  ]);


  useEffect(() => {
    if (gameState.gameOver) {
      setTimeout(() => setReplayOverlayVisible(true), 1000);
    } else {
      setReplayOverlayVisible(false);
    }
  }, [gameState.gameOver]);

  const handleReplayRequest = () => {
    setReplayOverlayVisible(false);
    gameActions.handleRestartGame();
  };


  const currentGear: Gear = gameState.level >= 8 ? "ship" : gameState.level >= 5 ? "bike" : "surfboard";
  const followMode = gameState.level >= 5;
  const bossActive = gameState.level === 10 && !gameState.gameOver && !gameState.victory;
  const canAffordShop = wrcSystem.wrc >= 50;

  const showShopButton = !gameState.gameOver &&
                         !gameState.victory &&
                         !gameState.showStoryPopup &&
                         !gameState.showMilestonePopup &&
                         !gameState.showWCRPopup &&
                         !gameState.showShop &&
                         !gameState.showSignupPrompt &&
                         !localShowShop;

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
