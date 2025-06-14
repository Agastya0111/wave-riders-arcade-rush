
import { useEffect } from "react";
import type { GameStateHook } from "@/hooks/useGameState";
import type { useGameActions } from "@/hooks/useGameActions";

interface UseGameLifecycleEffectsProps {
  gameState: GameStateHook;
  gameActions: ReturnType<typeof useGameActions>;
  localShowShop: boolean;
  setReplayOverlayVisible: (value: boolean) => void;
  setIsMobile: (value: boolean) => void;
  setLivesUsed: (fn: (prev: number) => number) => void; // Changed to accept a function
  initialLives?: number; // Optional, defaults to 3
}

export const useGameLifecycleEffects = ({
  gameState,
  gameActions,
  localShowShop,
  setReplayOverlayVisible,
  setIsMobile,
  setLivesUsed,
  initialLives = 3,
}: UseGameLifecycleEffectsProps) => {
  // Effect for mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Effect for tracking lives used
  useEffect(() => {
    setLivesUsed(() => initialLives - gameState.lives);
  }, [gameState.lives, setLivesUsed, initialLives]);

  // Effect for keyboard shortcuts (shield/sword)
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
  }, [
    gameActions.handleUseShield,
    gameActions.handleUseSword,
    gameState.gameOver,
    gameState.victory,
    gameState.gamePaused,
  ]);

  // Effect for pausing the game based on popups
  useEffect(() => {
    if (
      localShowShop ||
      gameState.showShop ||
      gameState.showStoryPopup ||
      gameState.showMilestonePopup ||
      gameState.showSignupPrompt
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
    gameState.setGamePaused,
  ]);

  // Effect for showing replay overlay
  useEffect(() => {
    if (gameState.gameOver) {
      setTimeout(() => setReplayOverlayVisible(true), 1000);
    } else {
      setReplayOverlayVisible(false);
    }
  }, [gameState.gameOver, setReplayOverlayVisible]);
};

