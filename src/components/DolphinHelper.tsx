
import { useState, useEffect, useCallback } from "react";

interface DolphinHelperProps {
  lives: number;
  onSave: () => void;
  gameOver: boolean;
  gamePaused: boolean;
}

export const DolphinHelper = ({ lives, onSave, gameOver, gamePaused }: DolphinHelperProps) => {
  const [cooldownTime, setCooldownTime] = useState(0);
  const [rescuesUsedAt1Life, setRescuesUsedAt1Life] = useState(0);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const maxRescuesAt1Life = 3;
  const cooldownDuration = 10;

  const canUseDolphin = () => {
    if (gameOver || gamePaused || cooldownTime > 0) return false;
    if (lives === 1 && rescuesUsedAt1Life >= maxRescuesAt1Life) return false;
    return true;
  };

  const activateDolphin = useCallback(() => {
    if (!canUseDolphin()) return;

    onSave();
    setCooldownTime(cooldownDuration);
    setShowSaveAnimation(true);

    if (lives === 1) {
      setRescuesUsedAt1Life(prev => prev + 1);
    }

    setTimeout(() => setShowSaveAnimation(false), 2000);
  }, [lives, onSave, rescuesUsedAt1Life, cooldownTime, gameOver, gamePaused]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        activateDolphin();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activateDolphin]);

  const getRescuesLeft = () => {
    if (lives === 1) {
      return maxRescuesAt1Life - rescuesUsedAt1Life;
    }
    return "∞";
  };

  const isDisabled = !canUseDolphin();
  const showTiredMessage = lives === 1 && rescuesUsedAt1Life >= maxRescuesAt1Life;

  return (
    <>
      {/* Save Animation */}
      {showSaveAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🐬✨</div>
        </div>
      )}

      {/* Dolphin Controls */}
      <div className="absolute top-20 right-4 flex flex-col items-end space-y-2">
        {/* Dolphin Counter */}
        <div className="bg-black/30 backdrop-blur rounded-lg p-2 text-white text-sm">
          <div className="flex items-center space-x-2">
            <span>🐬</span>
            <span>Rescues: {getRescuesLeft()}</span>
          </div>
          {lives === 1 && (
            <div className="text-xs opacity-80">
              At 1 life: {rescuesUsedAt1Life}/{maxRescuesAt1Life}
            </div>
          )}
        </div>

        {/* Tired Message */}
        {showTiredMessage && (
          <div className="bg-red-500/90 backdrop-blur rounded-lg p-2 text-white text-xs text-center max-w-40">
            🐬 Your dolphins are too tired to save you again!
          </div>
        )}

        {/* Desktop Instructions */}
        <div className="hidden md:block bg-black/20 backdrop-blur rounded-lg p-2 text-white text-xs text-center">
          Ctrl + D for Dolphin
        </div>

        {/* Mobile Dolphin Button */}
        <button
          className={`md:hidden w-14 h-14 rounded-full text-2xl font-bold transition-all shadow-lg ${
            isDisabled 
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
          } text-white relative`}
          onTouchStart={(e) => {
            e.stopPropagation();
            activateDolphin();
          }}
          disabled={isDisabled}
        >
          🐬
          {cooldownTime > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cooldownTime}
            </div>
          )}
        </button>
      </div>
    </>
  );
};
