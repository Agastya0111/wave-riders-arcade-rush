
import { Button } from "@/components/ui/button";

interface MilestonePopupProps {
  score: number;
  onResume: () => void;
  onOpenShop: () => void;
  onContinueAfterReward?: () => void;
}

export const MilestonePopup = ({ score, onResume, onOpenShop, onContinueAfterReward }: MilestonePopupProps) => {
  const getMilestoneMessage = () => {
    if (score >= 150) {
      return {
        title: "🎉 Congratulations!",
        message: "You've won a free shield and sword!",
        showButtons: false
      };
    } else if (score >= 100) {
      return {
        title: "🔵 100 Points!",
        message: "Buy a sword or save up for both sword and shield.",
        showButtons: true
      };
    } else if (score >= 50) {
      return {
        title: "🟡 50 Points!",
        message: "Buy a shield or save it for a sword.",
        showButtons: true
      };
    }
    return null;
  };

  const milestone = getMilestoneMessage();
  if (!milestone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
        <h2 className="text-2xl font-bold mb-4">{milestone.title}</h2>
        <p className="text-lg mb-6">{milestone.message}</p>
        
        {milestone.showButtons ? (
          <div className="flex gap-4 justify-center">
            <Button onClick={onResume} variant="outline">
              Resume
            </Button>
            <Button onClick={onOpenShop}>
              Open Shop
            </Button>
          </div>
        ) : (
          <Button onClick={onContinueAfterReward}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};
