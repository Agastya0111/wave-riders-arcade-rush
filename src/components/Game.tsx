
import { GameProvider, useGame } from "@/contexts/GameContext";
import { GameOver } from "./GameOver";
import { Victory } from "./Victory";
import { GameRenderer } from "./GameRenderer";
import { GameHUD } from "./GameHUD";
import { GamePopups } from "./GamePopups";
import type { Avatar } from "@/pages/Index";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
  onSignup: () => void;
}

const GameContent = () => {
  const {
    gameState,
    gameActions,
    derivedState,
    playerX,
    gameAreaRef,
    touchControls,
    avatar,
    wrcSystem,
    itemEffects,
    gameInteractions,
    isMobile,
    dolphinsUsed,
    setDolphinsUsed,
    gameControls,
    localShowShop,
    setLocalShowShop,
    replayOverlayVisible,
    handleReplayRequest,
    onSignup,
  } = useGame();

  if (gameState.gameOver) {
    return (
      <GameOver
        score={gameState.score}
        level={gameState.level}
        onRestart={gameActions.handleRestartGame}
        onChooseAvatar={gameActions.handleChooseNewAvatar}
        rescueMission={gameState.level >= 7}
      />
    );
  }

  if (gameState.victory) {
    return (
      <Victory
        score={gameState.score}
        onPlayAgain={gameActions.handleRestartGame}
        onChooseAvatar={gameActions.handleChooseNewAvatar}
      />
    );
  }

  const gameHUDInteractions = {
    isInvincible: gameInteractions.isInvincible,
    magnetActive: gameInteractions.magnetActive,
    challenge: gameInteractions.challenge,
    showCoinFeedback: gameInteractions.showCoinFeedback,
    errorMessage: gameInteractions.errorMessage,
  };
  
  const gameHUDActions = {
    handleUseShield: gameActions.handleUseShield,
    handleUseSword: gameActions.handleUseSword,
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-800">
      <GameRenderer
        playerX={playerX}
        playerY={gameState.playerY}
        avatar={avatar}
        currentGear={derivedState.currentGear}
        obstacles={gameState.obstacles}
        collectibles={gameState.collectibles}
        bossActive={derivedState.bossActive}
        gameAreaRef={gameAreaRef}
        onTouchStart={touchControls.handleTouchStart}
        onTouchMove={touchControls.handleTouchMove}
        onTouchEnd={touchControls.handleTouchEnd}
      />
      <GameHUD
        gameState={gameState}
        wrcSystem={wrcSystem}
        itemEffects={itemEffects}
        gameInteractions={gameHUDInteractions}
        gameActions={gameHUDActions}
        showShopButton={derivedState.showShopButton}
        onOpenShop={() => setLocalShowShop(true)}
        canAffordShop={derivedState.canAffordShop}
        isMobile={isMobile}
        currentGear={derivedState.currentGear}
        followMode={derivedState.followMode}
        dolphinsUsed={dolphinsUsed}
        setDolphinsUsed={setDolphinsUsed}
        activateSpeedBoost={gameControls.activateSpeedBoost}
      />
      <GamePopups
        gameState={gameState}
        wrcSystem={wrcSystem}
        localShowShop={localShowShop}
        setLocalShowShop={setLocalShowShop}
        replayOverlayVisible={replayOverlayVisible}
        onReplay={handleReplayRequest}
        onSignup={onSignup}
      />
    </div>
  );
};

export const Game = (props: GameProps) => {
  return (
    <GameProvider {...props}>
      <GameContent />
    </GameProvider>
  );
};
