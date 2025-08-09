
import type { GameStateHook } from "@/hooks/useGameState";
import type { SecureWRCSystemHook } from "@/hooks/useSecureWRCSystem"; // Updated import
import type { Gear } from "@/components/Game.d";

interface UseGameDerivedStateProps {
  gameState: GameStateHook;
  wrcSystem: SecureWRCSystemHook; // Updated type
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

  const canAffordShop = wrcSystem.wrc >= 50 && !wrcSystem.isLoading;

  const showShopButton =
    !gameState.gameOver &&
    !gameState.victory &&
    !gameState.showStoryPopup &&
    !gameState.showMilestonePopup &&
    !gameState.showShop &&
    !gameState.showSignupPrompt &&
    !localShowShop &&
    !wrcSystem.isLoading;

  return {
    currentGear,
    followMode,
    bossActive,
    canAffordShop,
    showShopButton,
  };
};
