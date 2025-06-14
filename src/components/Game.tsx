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
import { ChallengeBanner } from "./ChallengeBanner";
import { BossObstacle } from "./BossObstacle";
import { ReplayOverlay } from "./ReplayOverlay";
import { InstructionPopup } from "./InstructionPopup";

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
  const [showShop, setShowShop] = useState(false); // This showShop state seems to be duplicated from gameState.showShop. Consider consolidating.
  const [challenge, setChallenge] = useState({
    text: "Collect 7 coins in a round!",
    completed: false
  });
  const [isInvincible, setIsInvincible] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [replayOverlay, setReplayOverlay] = useState(false);
  // const [showInstruction, setShowInstruction] = useState(false); // REMOVED

  // useEffect(() => { // REMOVED this useEffect block
  //   const flag = localStorage.getItem("surferadventure_instruct_seen_v2");
  //   if (!flag) {
  //     setShowInstruction(true);
  //     localStorage.setItem("surferadventure_instruct_seen_v2", "yes");
  //   }
  // }, []);

  // ... keep existing code (canAffordShop, mobile check, handleCoinCollected, showError, livesUsed tracking, currentGear, item handlers, keyboard controls for items, touch controls, game controls, game loop, game events, game session, handleRestart, handleChooseAvatar)
  const canAffordShop = wrcSystem.wrc >= 50;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCoinCollected = useCallback(() => {
    wrcSystem.earnWRC(1);
    setShowCoinFeedback(true);
    setTimeout(() => setShowCoinFeedback(false), 1000);
    
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRu4CAABXQVZFZm10IBAAAAABAAEASB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [wrcSystem]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
    
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio not supported');
    }
  };
  
  useEffect(() => {
    const initialLives = 3;
    setLivesUsed(initialLives - gameState.lives);
  }, [gameState.lives]);

  const currentGear: Gear = gameState.level >= 8 ? "ship" : gameState.level >= 5 ? "bike" : "surfboard";
  const followMode = gameState.level >= 5;

  const handleUseShield = useCallback(() => {
    const result = wrcSystem.useShield();
    if (result.success) {
      activateShield();
      gameState.setObstacles(prev => prev.slice(1));
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateShield, gameState]);

  const handleUseSword = useCallback(() => {
    const result = wrcSystem.useSword();
    if (result.success) {
      activateSword();
      gameState.setObstacles(prev => prev.slice(3));
    } else {
      showError(result.message);
    }
  }, [wrcSystem, activateSword, gameState]);

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

  useGameLoop({
    ...gameState,
    playerX,
    onCoinCollected: handleCoinCollected,
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
    // This function in Game.tsx doesn't navigate. The navigation to avatar selection is handled by onRestart via Index.tsx.
    // It might be intended to call onRestart here as well, or it's for a flow not fully active.
    // For now, its direct effect is just resetting game state parts.
  }, [gameState]);


  useEffect(() => {
    if (showShop) { // This is the local showShop state
      gameState.setGamePaused(true);
    } else if (!gameState.showShop) { // This refers to gameState.showShop
      // This condition needs review: it unpauses if gameState.showShop is false,
      // even if local showShop was true and then set to false.
      // The intention is probably: if local showShop is closed, and no OTHER popup (like gameState.showShop) is open, unpause.
      // A safer way: gameState.setGamePaused(false) should only happen when local showShop transitions from true to false.
      // And even then, only if other conditions for pause are not met.
      // For now, will keep as is, but this logic is a bit complex.
      // A better approach might be to use gameState.setGamePaused(true) when local showShop opens,
      // and gameState.setGamePaused(false) when local showShop closes, IF no other pausing condition is met.
      // The current `else if (!gameState.showShop)` implies gameState.showShop is the primary driver for pausing from shop.
      // Let's ensure local showShop closing sets gamePaused(false) if appropriate.
       if (!gameState.showStoryPopup && !gameState.showMilestonePopup && !gameState.showSignupPrompt) {
         gameState.setGamePaused(false);
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShop, gameState.showShop, gameState.showStoryPopup, gameState.showMilestonePopup, gameState.showSignupPrompt]); // Added dependencies based on logic

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

  useEffect(() => {
    if (!challenge.completed && gameState.coinsCollected >= 7) {
      setChallenge({ ...challenge, completed: true });
    }
  }, [gameState.coinsCollected, challenge]);

  const bossActive = gameState.level === 10 && !gameState.gameOver && !gameState.victory;

  useEffect(() => {
    if (gameState.gameOver) {
      setTimeout(() => setReplayOverlay(true), 1000);
    } else if (gameState.victory) {
      setReplayOverlay(false);
    }
  }, [gameState.gameOver, gameState.victory]);

  const handleReplay = () => {
    setReplayOverlay(false);
    setTimeout(() => setReplayOverlay(false), 4000);
  };


  if (gameState.gameOver) {
    return (
      <GameOver
        score={gameState.score}
        level={gameState.level}
        onRestart={handleRestart}
        onChooseAvatar={handleChooseAvatar} // This calls local reset, restart goes to menu
        rescueMission={gameState.level >= 7}
      />
    );
  }

  if (gameState.victory) {
    return (
      <Victory
        score={gameState.score}
        onPlayAgain={handleRestart}
        onChooseAvatar={handleChooseAvatar} // Same as above
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-800">
      <ChallengeBanner challenge={challenge} />
      <WRCDisplay balance={wrcSystem.wrc} />
      <ShopButton
        show={
          !gameState.gameOver &&
          !gameState.victory &&
          !gameState.showStoryPopup &&
          !gameState.showMilestonePopup &&
          !gameState.showShop && // This is gameState.showShop
          !gameState.showSignupPrompt &&
          !showShop // This is local showShop
        }
        onClick={() => setShowShop(true)} // Sets local showShop
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
        <Player 
          x={playerX} 
          y={gameState.playerY} 
          avatar={avatar}
          gear={currentGear}
        />
        <BossObstacle x={700} y={320} active={bossActive} />
        {gameState.obstacles.map((obstacle) => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        {gameState.collectibles.map((collectible, i) => {
          // ... keep existing code (collectible rendering logic)
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
            onSignup={() => gameState.setShowSignupPrompt(false)} // These should probably lead to auth flow
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
              // Prefer using the local setShowShop if that's the intended control for the ShopDialog instance here
              // gameState.setShowShop(true); 
              setShowShop(true); // Control local shop dialog
            }}
            onContinueAfterReward={() => {
              gameState.setShowMilestonePopup(false);
              gameState.setGamePaused(false);
            }}
          />
        )}

        {/* This is gameState.showShop, controlling a ShopDialog. 
            There's another ShopDialog below controlled by local `showShop`.
            This suggests potential redundancy or a misunderstanding of which shop state controls which dialog.
            For now, I'll assume gameState.showShop is for a shop opened via game events/milestones
            and local `showShop` is for the manual shop button.
        */}
        {gameState.showShop && ( 
          <ShopDialog
            wrc={wrcSystem.wrc}
            onBuyShield={wrcSystem.buyShield}
            onBuySword={wrcSystem.buySword}
            onClose={() => {
              gameState.setShowShop(false);
              // gameState.setGamePaused(false); // Handled by useEffect for showShop/gameState.showShop
            }}
          />
        )}
        <ReplayOverlay visible={replayOverlay} onReplay={handleReplay} />
        {/* REMOVED: {showInstruction && <InstructionPopup onClose={() => setShowInstruction(false)} />} */}
      </div>
      {/* This ShopDialog is controlled by the local `showShop` state, triggered by ShopButton */}
      {showShop && (
        <ShopDialog
          wrc={wrcSystem.wrc}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          onClose={() => setShowShop(false)} // This will trigger the useEffect to potentially unpause
        />
      )}
    </div>
  );
};
