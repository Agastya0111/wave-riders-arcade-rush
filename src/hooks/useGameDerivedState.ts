
import type { GameStateHook } from "@/hooks/useGameState";
import type { WRCSystemHook } from "@/hooks/useWRCSystem";
import type { Gear } from "@/components/Game.d"; // Gear is exported from Game.d.ts

interface UseGameDerivedStateProps {
  gameState: GameStateHook;
  wrcSystem: WRCSystemHook;
  localShowShop: boolean;
}

export const useGameDerivedState = ({
  gameState,
  wrcSystem,
  localShowShop,
}: UseGameDerivedStateProps) => {
  const currentGear: Gear =
    gameState.level >= 8 ? "ship" : gameState.level >= 5 ? "bike" : "surfboard";

  const followMode = gameState.level >= 5;

  const bossActive =
    gameState.level === 10 && !gameState.gameOver && !gameState.victory;

  const canAffordShop = wrcSystem.wrc >= 50;

  const showShopButton =
    !gameState.gameOver &&
    !gameState.victory &&
    !gameState.showStoryPopup &&
    !gameState.showMilestonePopup &&
    !gameState.showShop &&
    !gameState.showSignupPrompt &&
    !localShowShop;

  return {
    currentGear,
    followMode,
    bossActive,
    canAffordShop,
    showShopButton,
  };
};

