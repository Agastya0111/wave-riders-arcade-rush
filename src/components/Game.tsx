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
import { ShopButton } from "./ShopButton";
import { ErrorMessage } from "./ErrorMessage";
import { EffectOverlay } from "./EffectOverlay";
import { Weather } from "./Weather";
import { ChallengeBanner } from "./ChallengeBanner";
import { BossObstacle } from "./BossObstacle";
import { ReplayOverlay } from "./ReplayOverlay";

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
  // 1. Move all hooks to the top before any return
  const gameState = useGameState();
  const [playerX] = useState(100);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [livesUsed, setLivesUsed] = useState(0);
  const [dolphinsUsed, setDolphinsUsed] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showCoinFeedback, setShowCoinFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const wrcSystem = useWRCSystem();
  const { shieldActive, swordActive, activateShield, activateSword } = useItemEffects();
  const [showShop, setShowShop] = useState(false);
  const [weather, setWeather] = useState<"clear" | "rain" | "storm" | "sunset">("clear");
  const [challenge, setChallenge] = useState({
    text: "Collect 7 coins in a round!",
    completed: false
  });
  const [isInvincible, setIsInvincible] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [replayOverlay, setReplayOverlay] = useState(false);

  // Check if the player can afford anything in shop (above 50 WRC)
  const canAffordShop = wrcSystem.wrc >= 50;

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

  // Weather: random on mount and after each restart
  

  // Weather: random on mount and after each restart
  useEffect(() => {
    const types = ["clear", "rain", "storm", "sunset"] as const;
    setWeather(types[Math.floor(Math.random() * types.length)]);
  }, [gameState.score, gameState.level]);

  // Listen for powerup events
  useEffect(() => {
    function handleInvincibility() {
      setIsInvincible(true);
      setTimeout(() => setIsInvincible(false), 5000);
    }
    function handleMagnet() {
      setMagnetActive(true);
      setTimeout(() => setMagnetActive(false), 4000);
    }
    window.addEventListener("powerup-invincibility", handleInvincibility);
    window.addEventListener("powerup-magnet", handleMagnet);
    return () => {
      window.removeEventListener("powerup-invincibility", handleInvincibility);
      window.removeEventListener("powerup-magnet", handleMagnet);
    };
  }, []);

  // Challenge: simple stat tracking
  useEffect(() => {
    if (!challenge.completed && gameState.coinsCollected >= 7) {
      setChallenge({ ...challenge, completed: true });
    }
  }, [gameState.coinsCollected, challenge]);

  // Temporary: "boss" octopus at level 10
  const bossActive = gameState.level === 10 && !gameState.gameOver && !gameState.victory;

  // Replay highlight: show after game over
  useEffect(() => {
    if (gameState.gameOver) {
      setTimeout(() => setReplayOverlay(true), 1000);
    } else if (gameState.victory) {
      setReplayOverlay(false);
    }
  }, [gameState.gameOver, gameState.victory]);

  const handleReplay = () => {
    setReplayOverlay(false);
    // For brevity: just play a confetti overlay, no actual game replay
    setTimeout(() => setReplayOverlay(false), 4000);
  };

  // Conditional return statements come AFTER all hooks
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

  // Refactored: now uses ShopButton, ErrorMessage, and EffectOverlay components
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-800">
      {/* Weather background */}
      <Weather kind={weather} />
      {/* Session/daily challenge */}
      <ChallengeBanner challenge={challenge} />
      {/* WRC Display stays up top (raises z index to not get overlapped) */}
      <WRCDisplay balance={wrcSystem.wrc} />
      {/* Shop Button - now appears below WRC display, pops if affordable */}
      <ShopButton
        show={
          !gameState.gameOver &&
          !gameState.victory &&
          !gameState.showStoryPopup &&
          !gameState.showMilestonePopup &&
          !gameState.showShop &&
          !gameState.showSignupPrompt &&
          !showShop
        }
        onClick={() => setShowShop(true)}
        userCanAfford={canAffordShop}
      />
      <div
        ref={gameAreaRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <GameBackground />
        {/* Player pass-through for invincibility */}
        <Player 
          x={playerX} 
          y={gameState.playerY} 
          avatar={avatar}
          gear={currentGear}
        />
        {/* Boss at level 10 */}
        <BossObstacle x={700} y={320} active={bossActive} />
        {/* Obstacles logic */}
        {gameState.obstacles.map((obstacle) => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        {/* Collectibles + new special collectibles */}
        {gameState.collectibles.map((collectible, i) => {
          // Starfish
          if ((collectible as any).type === "starfish") {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0 pointer-events-none"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 48, height: 48,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[40px] animate-pulse">🌟</span>
              </div>
            )
          }
          // Magnet
          if ((collectible as any).type === "magnet") {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 44, height: 44,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[34px] animate-spin">🧲</span>
              </div>
            );
          }
          // Double coin
          if ((collectible as any).double) {
            return (
              <div key={collectible.id}
                className="absolute left-0 top-0"
                style={{
                  left: `${collectible.x}px`,
                  top: `${collectible.y}px`,
                  width: 52, height: 52,
                  transform: "translate(-50%,-50%)"
                }}>
                <span className="text-[36px] drop-shadow-lg animate-bounce animate-pulse" style={{ color: "#ffd700" }}>🪙✨</span>
              </div>
            );
          }
          // Normal
          return <Collectible key={collectible.id} collectible={collectible} />;
        })}
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
        {showCoinFeedback && <CoinCollectionFeedback />}
        <ErrorMessage message={errorMessage} />
        <EffectOverlay shieldActive={shieldActive || isInvincible} swordActive={swordActive} />

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
        {/* Replay UI after game */}
        <ReplayOverlay visible={replayOverlay} onReplay={handleReplay} />
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
