
import { useCallback } from "react";
import { useSecureWRCSystem } from "@/hooks/useSecureWRCSystem"; // Updated import
import { useItemEffects } from "@/hooks/useItemEffects";
import { GameStateHook } from "@/hooks/useGameState";

interface UseGameActionsProps {
  gameState: GameStateHook;
  wrcSystem: ReturnType<typeof useSecureWRCSystem>; // Updated type
  itemEffects: ReturnType<typeof useItemEffects>;
  onRestart: () => void;
  setLivesUsed: React.Dispatch<React.SetStateAction<number>>;
  setDolphinsUsed: React.Dispatch<React.SetStateAction<number>>;
  showError: (message: string) => void;
}

export const useGameActions = ({
  gameState,
  wrcSystem,
  itemEffects,
  onRestart,
  setLivesUsed,
  setDolphinsUsed,
  showError,
}: UseGameActionsProps) => {
  const { activateShield, activateSword } = itemEffects;

  const handleUseShield = useCallback(() => {
    if (wrcSystem.isLoading) {
      showError("Please wait...");
      return;
    }
    
    const result = wrcSystem.useShield();
    if (result.success) {
      activateShield();
      gameState.setObstacles((prev) => prev.slice(1)); 
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateShield, gameState, showError]);

  const handleUseSword = useCallback(() => {
    if (wrcSystem.isLoading) {
      showError("Please wait...");
      return;
    }
    
    const result = wrcSystem.useSword();
    if (result.success) {
      activateSword();
      gameState.setObstacles((prev) => prev.slice(3));
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateSword, gameState, showError]);

  const handleRestartGame = useCallback(() => {
    gameState.resetGame();
    setLivesUsed(0);
    setDolphinsUsed(0);
    onRestart();
  }, [gameState, onRestart, setLivesUsed, setDolphinsUsed]);

  const handleChooseNewAvatar = useCallback(() => {
    gameState.resetGame();
    setLivesUsed(0);
    setDolphinsUsed(0);
    onRestart(); 
  }, [gameState, onRestart, setLivesUsed, setDolphinsUsed]);

  return {
    handleUseShield,
    handleUseSword,
    handleRestartGame,
    handleChooseNewAvatar,
  };
};
