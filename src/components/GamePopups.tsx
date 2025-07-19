import { StoryPopup } from "./StoryPopup";
import { LevelStoryPopup } from "./LevelStoryPopup";
import { FinalChoicePopup } from "./FinalChoicePopup";
import { ChoiceResultPopup } from "./ChoiceResultPopup";
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
  onSignup: () => void;
}

export const GamePopups = ({
  gameState,
  wrcSystem,
  localShowShop,
  setLocalShowShop,
  replayOverlayVisible,
  onReplay,
  onSignup,
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
      {gameState.showLevelStoryPopup && (
        <LevelStoryPopup
          level={gameState.level}
          onContinue={() => {
            gameState.setShowLevelStoryPopup(false);
            gameState.setLevelStoryShown(prev => [...prev, gameState.level]);
          }}
        />
      )}
      {gameState.showFinalChoicePopup && (
        <FinalChoicePopup
          onChoiceMade={(choice, message) => {
            gameState.setFinalChoice(choice);
            gameState.setChoiceMessage(message);
            gameState.setShowFinalChoicePopup(false);
            gameState.setShowChoiceResultPopup(true);
          }}
        />
      )}
      {gameState.showChoiceResultPopup && (
        <ChoiceResultPopup
          choice={gameState.finalChoice}
          message={gameState.choiceMessage}
          onContinue={() => {
            gameState.setShowChoiceResultPopup(false);
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
          onSignup={onSignup}
          onContinue={() => {
            gameState.setShowSignupPrompt(false);
          }}
        />
      )}
      {replayOverlayVisible && <ReplayOverlay visible={replayOverlayVisible} onReplay={onReplay} />}
    </>
  );
};
