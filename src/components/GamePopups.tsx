
import { StoryPopup } from "./StoryPopup";
import { MilestonePopup } from "./MilestonePopup";
import { ShopDialog } from "./ShopDialog";
import { SignupPrompt } from "./SignupPrompt";
import { ReplayOverlay } from "./ReplayOverlay";
import { WCRPopup } from "./WCRPopup"; // Import the new WCRPopup
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
          onClose={() => {
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
      {gameState.showWCRPopup && ( // Add WCRPopup rendering
        <WCRPopup onClose={() => gameState.setShowWCRPopup(false)} />
      )}
      {(localShowShop || gameState.showShop) && (
        <ShopDialog
          wrcBalance={wrcSystem.wrc}
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
        <SignupPrompt onClose={() => gameState.setShowSignupPrompt(false)} />
      )}
      {replayOverlayVisible && <ReplayOverlay onReplay={onReplay} />}
    </>
  );
};

