
import React from "react";
import { WRCDisplay } from "./WRCDisplay";
import { ShopButton } from "./ShopButton";
import { GameUI } from "./GameUI";
import { DolphinHelper } from "./DolphinHelper";
import { TouchControls } from "./TouchControls";
import { ItemControls } from "./ItemControls";
import { CoinCollectionFeedback } from "./CoinCollectionFeedback";
import { ErrorMessage } from "./ErrorMessage";
import { EffectOverlay } from "./EffectOverlay";
import { ChallengeBanner, Challenge } from "./ChallengeBanner";
import type { Gear } from "./Game"; // Assuming Gear type is here
import { GameStateHook } from "@/hooks/useGameState";
import { WRCSystemHook } from "@/hooks/useWRCSystem"; // Define or import this type

interface GameHUDProps {
  gameState: GameStateHook; // Pass relevant parts of gameState
  wrcSystem: WRCSystemHook; // Pass relevant parts of wrcSystem
  itemEffects: { shieldActive: boolean; swordActive: boolean };
  gameInteractions: {
    isInvincible: boolean;
    magnetActive: boolean;
    challenge: Challenge;
    showCoinFeedback: boolean;
    errorMessage: string;
  };
  gameActions: {
    handleUseShield: () => void;
    handleUseSword: () => void;
  };
  showShopButton: boolean; // Derived in Game.tsx
  onOpenShop: () => void; // To set local showShop in Game.tsx
  canAffordShop: boolean;
  isMobile: boolean;
  currentGear: Gear;
  followMode: boolean;
  dolphinsUsed: number; // For DolphinHelper, Game.tsx manages this state
  setDolphinsUsed: React.Dispatch<React.SetStateAction<number>>; // For DolphinHelper
  activateSpeedBoost: () => void; // From gameControls
}

export const GameHUD = ({
  gameState,
  wrcSystem,
  itemEffects,
  gameInteractions,
  gameActions,
  showShopButton,
  onOpenShop,
  canAffordShop,
  isMobile,
  currentGear,
  followMode,
  dolphinsUsed,
  setDolphinsUsed,
  activateSpeedBoost,
}: GameHUDProps) => {
  return (
    <>
      <ChallengeBanner challenge={gameInteractions.challenge} />
      <WRCDisplay balance={wrcSystem.wrc} />
      <ShopButton
        show={showShopButton}
        onClick={onOpenShop}
        userCanAfford={canAffordShop}
      />
      <GameUI
        level={gameState.level}
        followMode={followMode}
        currentGear={currentGear}
        speedBoost={gameState.speedBoost}
        score={gameState.score}
        lives={gameState.lives}
        speedBoostCount={gameState.speedBoostCount}
        coinsCollected={gameState.coinsCollected} // For display, WRC is separate
        wrcBalance={wrcSystem.wrc} // For debug display in GameUI
      />
      <DolphinHelper
        onUse={() => setDolphinsUsed(prev => prev + 1)} 
        // Consider moving dolphinsUsed state management into a hook if it gets complex
      />
      <TouchControls
        speedBoostCount={gameState.speedBoostCount}
        speedBoost={gameState.speedBoost}
        onSpeedBoost={activateSpeedBoost} // Use the unified handler
      />
      <ItemControls
        shieldAvailable={wrcSystem.shieldAvailable}
        swordUses={wrcSystem.swordUses}
        onUseShield={gameActions.handleUseShield}
        onUseSword={gameActions.handleUseSword}
        isMobile={isMobile}
      />
      {gameInteractions.showCoinFeedback && <CoinCollectionFeedback />}
      <ErrorMessage message={gameInteractions.errorMessage} />
      <EffectOverlay
        shieldActive={itemEffects.shieldActive || gameInteractions.isInvincible}
        swordActive={itemEffects.swordActive}
      />
    </>
  );
};

