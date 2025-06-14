
import { useCallback } from "react";
import { useWRCSystem } from "@/hooks/useWRCSystem"; // Assuming this is the WRC hook
import { useItemEffects } from "@/hooks/useItemEffects";
import { GameStateHook } from "@/hooks/useGameState"; // Assuming type for gameState

interface UseGameActionsProps {
  gameState: GameStateHook; // Pass the entire gameState hook or relevant parts
  wrcSystem: ReturnType<typeof useWRCSystem>;
  itemEffects: ReturnType<typeof useItemEffects>;
  onRestart: () => void;
  setLivesUsed: React.Dispatch<React.SetStateAction<number>>;
  setDolphinsUsed: React.Dispatch<React.SetStateAction<number>>;
  showError: (message: string) => void; // From useGameInteractions
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
    const result = wrcSystem.useShield();
    if (result.success) {
      activateShield();
      // Assuming setObstacles is part of gameState
      gameState.setObstacles((prev) => prev.slice(1)); 
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateShield, gameState, showError]);

  const handleUseSword = useCallback(() => {
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

  // This function in Game.tsx doesn't navigate. 
  // The navigation to avatar selection is handled by onRestart via Index.tsx.
  const handleChooseNewAvatar = useCallback(() => {
    gameState.resetGame();
    setLivesUsed(0);
    setDolphinsUsed(0);
    // If onRestart always leads to menu, then to avatar selection, this is sufficient.
    onRestart(); 
  }, [gameState, onRestart, setLivesUsed, setDolphinsUsed]);

  return {
    handleUseShield,
    handleUseSword,
    handleRestartGame,
    handleChooseNewAvatar,
  };
};

