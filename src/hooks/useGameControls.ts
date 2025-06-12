
import { useEffect } from "react";

interface UseGameControlsProps {
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  speedBoostCount: number;
  speedBoost: boolean;
  setPlayerY: (fn: (prev: number) => number) => void;
  setSpeedBoost: (value: boolean) => void;
  setSpeedBoostCount: (fn: (prev: number) => number) => void;
}

export const useGameControls = ({
  gameOver,
  victory,
  gamePaused,
  speedBoostCount,
  speedBoost,
  setPlayerY,
  setSpeedBoost,
  setSpeedBoostCount,
}: UseGameControlsProps) => {
  const moveUp = () => {
    if (gameOver || victory || gamePaused) return;
    setPlayerY(prev => Math.max(50, prev - 60));
  };

  const moveDown = () => {
    if (gameOver || victory || gamePaused) return;
    setPlayerY(prev => Math.min(550, prev + 60));
  };

  const activateSpeedBoost = () => {
    if (speedBoostCount > 0 && !speedBoost && !gamePaused) {
      setSpeedBoost(true);
      setSpeedBoostCount(prev => prev - 1);
      setTimeout(() => setSpeedBoost(false), 3000);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || victory || gamePaused) return;
      if (e.key === "ArrowUp") moveUp();
      else if (e.key === "ArrowDown") moveDown();
      else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activateSpeedBoost();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [speedBoostCount, speedBoost, gamePaused, gameOver, victory]);

  return {
    moveUp,
    moveDown,
    activateSpeedBoost,
  };
};
