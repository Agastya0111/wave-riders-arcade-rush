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
import { WRCDisplay } from "./WRCDisplay";
import { ShopDialog } from "./ShopDialog";
import { MilestonePopup } from "./MilestonePopup";
import { ItemControls } from "./ItemControls";
import { CoinCollectionFeedback } from "./CoinCollectionFeedback";
import { useGameState } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameSession } from "@/hooks/useGameSession";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useWRCSystem } from "@/hooks/useWRCSystem";
import { useItemEffects } from "@/hooks/useItemEffects";
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

export type Gear = "surfboard" | "bike" | "ship";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
}

export const Game = ({ avatar, onRestart }: GameProps) => {
  const gameState = useGameState();
  const [playerX] = useState(100);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [livesUsed, setLivesUsed] = useState(0);
  const [dolphinsUsed, setDolphinsUsed] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showCoinFeedback, setShowCoinFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // WRC and shop system - completely separate from score
  const wrcSystem = useWRCSystem();
  const { shieldActive, swordActive, activateShield, activateSword } = useItemEffects();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle coin collection for WRC (separate from score)
  const handleCoinCollected = useCallback(() => {
    wrcSystem.earnWRC(1); // Add 1 WRC per coin
    setShowCoinFeedback(true);
    setTimeout(() => setShowCoinFeedback(false), 1000);
    
    // Play coin sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRu4CAABXQVZFZm10IBAAAAABAAEASB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.play().catch(() => {}); // Ignore audio play errors
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [wrcSystem]);

  // Show error messages
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
    
    // Play error sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore audio play errors
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Remove milestone tracking based on score - this was causing confusion
  // WRC and score are now completely separate

  // Track lives used
  useEffect(() => {
    const initialLives = 3;
    setLivesUsed(initialLives - gameState.lives);
  }, [gameState.lives]);

  // Determine current gear based on level
  const currentGear: Gear = gameState.level >= 8 ? "ship" : gameState.level >= 5 ? "bike" : "surfboard";
  const followMode = gameState.level >= 5;

  // Item usage handlers with proper WRC validation
  const handleUseShield = useCallback(() => {
    const result = wrcSystem.useShield();
    if (result.success) {
      activateShield();
      // Remove the next obstacle that would hit the player
      gameState.setObstacles(prev => prev.slice(1));
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateShield, gameState]);

  const handleUseSword = useCallback(() => {
    const result = wrcSystem.useSword();
    if (result.success) {
      activateSword();
      // Remove up to 3 obstacles
      gameState.setObstacles(prev => prev.slice(3));
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateSword, gameState]);

  // Keyboard controls for items - only work if items are owned
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver || gameState.victory || gameState.gamePaused) return;
      
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleUseSword();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleUseShield();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleUseShield, handleUseSword, gameState.gameOver, gameState.victory, gameState.gamePaused]);

  // Touch controls
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    moveUp: () => {
      if (!gameState.gameOver && !gameState.victory && !gameState.gamePaused) {
        gameState.setPlayerY(prev => Math.max(50, prev - 60));
      }
    },
    moveDown: () => {
      if (!gameState.gameOver && !gameState.victory && !gameState.gamePaused) {
        gameState.setPlayerY(prev => Math.min(550, prev + 60));
      }
    },
    activateSpeedBoost: () => {
      if (gameState.speedBoostCount > 0 && !gameState.speedBoost && !gameState.gamePaused) {
        gameState.setSpeedBoost(true);
        gameState.setSpeedBoostCount(prev => prev - 1);
        setTimeout(() => gameState.setSpeedBoost(false), 3000);
      }
    }
  });

  // Game controls
  useGameControls({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    gamePaused: gameState.gamePaused,
    speedBoostCount: gameState.speedBoostCount,
    speedBoost: gameState.speedBoost,
    setPlayerY: gameState.setPlayerY,
    setSpeedBoost: gameState.setSpeedBoost,
    setSpeedBoostCount: gameState.setSpeedBoostCount,
  });

  // Game loop with coin collection callback
  useGameLoop({
    ...gameState,
    playerX,
    onCoinCollected: handleCoinCollected,
  });

  // Game events
  useGameEvents({
    ...gameState,
    playerX,
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
    setLivesUsed(0);
    setDolphinsUsed(0);
    onRestart();
  }, [gameState, onRestart]);

  const handleChooseAvatar = useCallback(() => {
    gameState.resetGame();
    setLivesUsed(0);
    setDolphinsUsed(0);
  }, [gameState]);

  // New: Game Shop state moved to top of component
  const [showShop, setShowShop] = useState(false);

  // Modified: When shop is open, also pause the game
  useEffect(() => {
    if (showShop) {
      gameState.setGamePaused(true);
    } else if (!gameState.showShop) {
      // Only unpause if there isn't another popup/overlay open
      gameState.setGamePaused(false);
    }
    // Only trigger on showShop open/close
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShop]);

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
      {/* Floating Shop Button at top right, visible except during end-game or existing overlays */}
      {!gameState.gameOver && !gameState.victory && !gameState.showStoryPopup && !gameState.showMilestonePopup && !gameState.showShop && !gameState.showSignupPrompt && !showShop && (
        <button
          className="fixed top-7 right-16 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-5 py-2 rounded-full shadow-xl z-[70] border-2 border-yellow-300 transition-all animate-enter"
          style={{ fontSize: 22, letterSpacing: 2 }}
          onClick={() => setShowShop(true)}
        >
          🛒 Shop
        </button>
      )}
      <div
        ref={gameAreaRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <GameBackground />
        
        <Player 
          x={playerX} 
          y={gameState.playerY} 
          avatar={avatar}
          gear={currentGear}
        />
        
        {gameState.obstacles.map((obstacle) => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        
        {gameState.collectibles.map((collectible) => (
          <Collectible key={collectible.id} collectible={collectible} />
        ))}
        
        <GameUI
          level={gameState.level}
          followMode={followMode}
          currentGear={currentGear}
          speedBoost={gameState.speedBoost}
          score={gameState.score}
          lives={gameState.lives}
          speedBoostCount={gameState.speedBoostCount}
          coinsCollected={gameState.coinsCollected}
          wrcBalance={wrcSystem.wrc}
        />
        
        <DolphinHelper
          onUse={() => setDolphinsUsed(prev => prev + 1)}
        />
        
        <TouchControls 
          speedBoostCount={gameState.speedBoostCount}
          speedBoost={gameState.speedBoost}
          onSpeedBoost={() => {
            if (gameState.speedBoostCount > 0 && !gameState.speedBoost && !gameState.gamePaused) {
              gameState.setSpeedBoost(true);
              gameState.setSpeedBoostCount(prev => prev - 1);
              setTimeout(() => gameState.setSpeedBoost(false), 3000);
            }
          }}
        />
        
        <ItemControls
          shieldAvailable={wrcSystem.shieldAvailable}
          swordUses={wrcSystem.swordUses}
          onUseShield={handleUseShield}
          onUseSword={handleUseSword}
          isMobile={isMobile}
        />
        
        {/* Coin collection feedback - shows +1 WRC */}
        {showCoinFeedback && <CoinCollectionFeedback />}
        
        {/* Error message display */}
        {errorMessage && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <div className="bg-red-500 text-white font-bold text-lg px-6 py-3 rounded-lg shadow-lg animate-bounce">
              {errorMessage}
            </div>
          </div>
        )}
        
        {/* Shield effect */}
        {shieldActive && (
          <div className="absolute inset-0 bg-blue-300/30 animate-pulse pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-spin">
              ✨
            </div>
          </div>
        )}
        
        {/* Sword effect */}
        {swordActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-bounce">
              ⚡
            </div>
          </div>
        )}
        
        {gameState.showStoryPopup && (
          <StoryPopup onContinue={() => {
            gameState.setShowStoryPopup(false);
            gameState.setStoryShown(true);
          }} />
        )}
        
        {gameState.showSignupPrompt && (
          <SignupPrompt 
            onSignup={() => gameState.setShowSignupPrompt(false)}
            onContinue={() => gameState.setShowSignupPrompt(false)}
          />
        )}
        
        {gameState.showMilestonePopup && (
          <MilestonePopup
            score={gameState.score}
            onResume={() => {
              gameState.setShowMilestonePopup(false);
              gameState.setGamePaused(false);
            }}
            onOpenShop={() => {
              gameState.setShowMilestonePopup(false);
              gameState.setShowShop(true);
            }}
            onContinueAfterReward={() => {
              gameState.setShowMilestonePopup(false);
              gameState.setGamePaused(false);
            }}
          />
        )}
        
        {gameState.showShop && (
          <ShopDialog
            wrc={wrcSystem.wrc}
            onBuyShield={wrcSystem.buyShield}
            onBuySword={wrcSystem.buySword}
            onClose={() => {
              gameState.setShowShop(false);
              gameState.setGamePaused(false);
            }}
          />
        )}
      </div>
      {/* In-game shop dialog opens when the shop button is clicked, game is paused while open */}
      {showShop && (
        <ShopDialog
          wrc={wrcSystem.wrc}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  );
};
