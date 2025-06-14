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
import type { Gear } from "@/components/Game.d";
import { GameStateHook } from "@/hooks/useGameState";
import { WRCSystemHook } from "@/hooks/useWRCSystem";

interface GameHUDProps {
  gameState: GameStateHook;
  wrcSystem: WRCSystemHook;
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
  showShopButton: boolean;
  onOpenShop: () => void;
  canAffordShop: boolean;
  isMobile: boolean;
  currentGear: Gear;
  followMode: boolean;
  dolphinsUsed: number;
  setDolphinsUsed: React.Dispatch<React.SetStateAction<number>>;
  activateSpeedBoost: () => void;
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
        coinsCollected={gameState.coinsCollected}
        wrcBalance={wrcSystem.wrc}
      />
      <DolphinHelper
        onUse={() => setDolphinsUsed(prev => prev + 1)} 
      />
      <TouchControls
        speedBoostCount={gameState.speedBoostCount}
        speedBoost={gameState.speedBoost}
        onSpeedBoost={activateSpeedBoost}
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
