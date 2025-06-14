
import { StoryPopup } from "./StoryPopup";
import { MilestonePopup } from "./MilestonePopup";
import { ShopDialog } from "./ShopDialog";
import { SignupPrompt } from "./SignupPrompt";
import { ReplayOverlay } from "./ReplayOverlay";
// Removed WCRPopup import
import type { GameStateHook } from "@/hooks/useGameState";
import type { WRCSystemHook } from "@/hooks/useWRCSystem";

interface GamePopupsProps {
  gameState: GameStateHook;
  wrcSystem: WRCSystemHook;
  localShowShop: boolean;
  setLocalShowShop: (value: boolean) => void;
  replayOverlayVisible: boolean;
  onReplay: () => void;
}

export const GamePopups = ({
  gameState,
  wrcSystem,
  localShowShop,
  setLocalShowShop,
  replayOverlayVisible,
  onReplay,
}: GamePopupsProps) => {
  return (
    <>
      {gameState.showStoryPopup && (
        <StoryPopup
          onContinue={() => { // Changed from onClose to onContinue
            gameState.setShowStoryPopup(false);
            gameState.setStoryShown(true);
          }}
        />
      )}
      {gameState.showMilestonePopup && (
        <MilestonePopup
          score={gameState.score}
          onResume={() => gameState.setShowMilestonePopup(false)}
          onOpenShop={() => {
            gameState.setShowMilestonePopup(false);
            gameState.setShowShop(true); // Show main shop dialog
          }}
          onContinueAfterReward={() => {
            // Logic for item grant would go here, then close
            gameState.setShowMilestonePopup(false);
          }}
        />
      )}
      {/* Removed WCRPopup rendering */}
      {(localShowShop || gameState.showShop) && (
        <ShopDialog
          wrc={wrcSystem.wrc}
          onClose={() => {
            setLocalShowShop(false);
            gameState.setShowShop(false);
          }}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          shieldAvailable={wrcSystem.shieldAvailable}
          swordUses={wrcSystem.swordUses}
        />
      )}
      {gameState.showSignupPrompt && (
        <SignupPrompt
          onSignup={() => {
            // Placeholder for actual signup logic if needed, e.g., redirect or open modal
            console.log("Signup initiated from GamePopups");
            gameState.setShowSignupPrompt(false);
          }}
          onContinue={() => {
            gameState.setShowSignupPrompt(false);
          }}
        />
      )}
      {replayOverlayVisible && <ReplayOverlay visible={replayOverlayVisible} onReplay={onReplay} />}
    </>
  );
};

