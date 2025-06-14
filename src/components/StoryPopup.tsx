
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

interface StoryPopupProps {
  onContinue: () => void; // Expects onContinue
}

export const StoryPopup = ({ onContinue }: StoryPopupProps) => {
  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onContinue();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl max-w-md">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🏴‍☠️</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">URGENT!</h2>
          <p className="text-lg mb-6 text-gray-800">
            Your friend has been kidnapped by pirates! 
            <br /><br />
            Rescue them before level 10 ends!
          </p>
          <Button 
            onClick={onContinue}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-3"
          >
            Got it!
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Press Enter or tap "Got it!" to continue
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

