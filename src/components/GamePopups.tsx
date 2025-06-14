
import React from "react";
import { StoryPopup } from "./StoryPopup";
import { SignupPrompt } from "./SignupPrompt";
import { MilestonePopup } from "./MilestonePopup";
import { ShopDialog } from "./ShopDialog";
import { ReplayOverlay } from "./ReplayOverlay";
import { GameStateHook } from "@/hooks/useGameState";
import { WRCSystemHook } from "@/hooks/useWRCSystem";

interface GamePopupsProps {
  gameState: GameStateHook; // Relevant parts
  wrcSystem: WRCSystemHook; // Relevant parts
  localShowShop: boolean; // The Game.tsx local state for shop
  setLocalShowShop: (show: boolean) => void; // Setter for local shop
  onReplay: () => void; // For ReplayOverlay
  replayOverlayVisible: boolean;
}

export const GamePopups = ({
  gameState,
  wrcSystem,
  localShowShop,
  setLocalShowShop,
  onReplay,
  replayOverlayVisible,
}: GamePopupsProps) => {
  return (
    <>
      {gameState.showStoryPopup && (
        <StoryPopup onContinue={() => {
          gameState.setShowStoryPopup(false);
          gameState.setStoryShown(true);
          // If pausing was handled by StoryPopup, ensure game unpauses if no other popups
          if (!localShowShop && !gameState.showMilestonePopup && !gameState.showSignupPrompt && !gameState.showShop) {
            gameState.setGamePaused(false);
          }
        }} />
      )}

      {gameState.showSignupPrompt && (
        <SignupPrompt 
          onSignup={() => {
            gameState.setShowSignupPrompt(false);
            // Potentially unpause if this was the only pausing popup
            if (!localShowShop && !gameState.showMilestonePopup && !gameState.showStoryPopup && !gameState.showShop) {
                gameState.setGamePaused(false);
            }
          }}
          onContinue={() => {
            gameState.setShowSignupPrompt(false);
            if (!localShowShop && !gameState.showMilestonePopup && !gameState.showStoryPopup && !gameState.showShop) {
                gameState.setGamePaused(false);
            }
          }}
        />
      )}

      {gameState.showMilestonePopup && (
        <MilestonePopup
          score={gameState.score}
          onResume={() => {
            gameState.setShowMilestonePopup(false);
            // gameState.setGamePaused(false); // Pause logic handled by useEffect in Game.tsx or when popups close
             if (!localShowShop && !gameState.showSignupPrompt && !gameState.showStoryPopup && !gameState.showShop) {
                gameState.setGamePaused(false);
            }
          }}
          onOpenShop={() => {
            gameState.setShowMilestonePopup(false);
            setLocalShowShop(true); // Control local shop dialog
          }}
          onContinueAfterReward={() => {
            gameState.setShowMilestonePopup(false);
            // gameState.setGamePaused(false);
             if (!localShowShop && !gameState.showSignupPrompt && !gameState.showStoryPopup && !gameState.showShop) {
                gameState.setGamePaused(false);
            }
          }}
        />
      )}

      {/* ShopDialog controlled by gameState.showShop (e.g., milestone reward) */}
      {gameState.showShop && ( 
        <ShopDialog
          wrc={wrcSystem.wrc}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          onClose={() => {
            gameState.setShowShop(false);
            // Pause logic handled by useEffect in Game.tsx
          }}
        />
      )}

      {/* ShopDialog controlled by localShowShop (e.g., manual shop button) */}
      {localShowShop && (
        <ShopDialog
          wrc={wrcSystem.wrc}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          onClose={() => setLocalShowShop(false)} // This will trigger useEffect in Game.tsx
        />
      )}
      <ReplayOverlay visible={replayOverlayVisible} onReplay={onReplay} />
    </>
  );
};

