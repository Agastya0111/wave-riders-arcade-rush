
import { StoryPopup } from "./StoryPopup";
import { MilestonePopup } from "./MilestonePopup";
import { ShopDialog } from "./ShopDialog";
import { SignupPrompt } from "./SignupPrompt";
import { ReplayOverlay } from "./ReplayOverlay";
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
          onContinue={() => { // Pass onContinue
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
            gameState.setShowShop(true);
          }}
          onContinueAfterReward={() => {
            gameState.setShowMilestonePopup(false);
          }}
        />
      )}
      {(localShowShop || gameState.showShop) && (
        <ShopDialog
          wrc={wrcSystem.wrc}
          onClose={() => {
            setLocalShowShop(false);
            gameState.setShowShop(false);
          }}
          onBuyShield={wrcSystem.buyShield}
          onBuySword={wrcSystem.buySword}
          shieldAvailable={wrcSystem.shieldAvailable} // Pass shieldAvailable
          swordUses={wrcSystem.swordUses}             // Pass swordUses
        />
      )}
      {gameState.showSignupPrompt && (
        <SignupPrompt
          onSignup={() => { // Pass onSignup
            console.log("Signup initiated from GamePopups");
            gameState.setShowSignupPrompt(false);
          }}
          onContinue={() => { // Pass onContinue
            gameState.setShowSignupPrompt(false);
          }}
        />
      )}
      {replayOverlayVisible && <ReplayOverlay visible={replayOverlayVisible} onReplay={onReplay} />}
    </>
  );
};

