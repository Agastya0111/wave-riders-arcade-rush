
import { useGame } from "@/contexts/GameContext";
import { GameOver } from "./GameOver";
import { Victory } from "./Victory";
import { GameRenderer } from "./GameRenderer";
import { GameHUD } from "./GameHUD";
import { GamePopups } from "./GamePopups";

export const GameContent = () => {
  // Add an explicit debug log for mounting
  console.log("GameContent mounted");

  const ctx = useGame();
  // Add context null check for troubleshooting (should never be null!)
  if (!ctx) {
    console.error("GameContent mounted outside GameProvider (ctx === null)");
    throw new Error("GameContent must be mounted inside a GameProvider.");
  }

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
    handleUseInvincibility,
    handleUseMagnet,
  } = ctx;

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
        finalChoice={gameState.finalChoice}
        choiceMessage={gameState.choiceMessage}
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
        invincibilityItems={gameState.invincibilityItems}
        magnetItems={gameState.magnetItems}
        onUseInvincibility={handleUseInvincibility}
        onUseMagnet={handleUseMagnet}
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

