
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
import { SecureWRCSystemHook } from "@/hooks/useSecureWRCSystem";

interface GameHUDProps {
  gameState: GameStateHook;
  wrcSystem: SecureWRCSystemHook;
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
  invincibilityItems: number;
  magnetItems: number;
  onUseInvincibility: () => void;
  onUseMagnet: () => void;
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
  invincibilityItems,
  magnetItems,
  onUseInvincibility,
  onUseMagnet,
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
      {/* New Power-up controls */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-2 z-20">
        {invincibilityItems > 0 && (
          <button
            className="w-14 h-14 rounded-full text-2xl font-bold transition-all bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center relative"
            onClick={onUseInvincibility}
            aria-label={`Use Starfish (${invincibilityItems} left)`}
          >
            <span>⭐</span>
            <span className="text-xs absolute bottom-1">{invincibilityItems}</span>
          </button>
        )}
        {magnetItems > 0 && (
          <button
            className="w-14 h-14 rounded-full text-2xl font-bold transition-all bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center relative"
            onClick={onUseMagnet}
            aria-label={`Use Magnet (${magnetItems} left)`}
          >
            <span>🧲</span>
            <span className="text-xs absolute bottom-1">{magnetItems}</span>
          </button>
        )}
      </div>
      {gameInteractions.showCoinFeedback && <CoinCollectionFeedback />}
      <ErrorMessage message={gameInteractions.errorMessage} />
      <EffectOverlay
        shieldActive={itemEffects.shieldActive || gameInteractions.isInvincible}
        swordActive={itemEffects.swordActive}
      />
    </>
  );
};
