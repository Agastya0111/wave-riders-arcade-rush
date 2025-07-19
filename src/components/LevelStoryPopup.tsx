import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

interface LevelStoryPopupProps {
  level: number;
  onContinue: () => void;
}

const LEVEL_STORIES = {
  7: {
    emoji: "🏴‍☠️",
    title: "URGENT!",
    story: "Your friend has been kidnapped by pirates!\n\nRescue them before level 10 ends!",
    color: "text-red-600"
  },
  16: {
    emoji: "🗺️",
    title: "TREASURE MAP!",
    story: "You and your friend discover an ancient treasure map hidden in a bottle!\n\nThe map shows a path through a mysterious cursed jungle...",
    color: "text-yellow-600"
  },
  17: {
    emoji: "🌿",
    title: "CURSED JUNGLE",
    story: "You enter the dark, cursed jungle together.\n\nBeware of ancient traps and deadly puzzles ahead!",
    color: "text-green-600"
  },
  18: {
    emoji: "😱",
    title: "BETRAYAL!",
    story: "Your friend suddenly grabs the treasure and runs away!\n\nHow could they betray you after everything you've been through?",
    color: "text-red-600"
  },
  19: {
    emoji: "🏃‍♀️",
    title: "THE CHASE",
    story: "You chase your former friend through dangerous terrain.\n\nDodge obstacles and catch up before they escape forever!",
    color: "text-orange-600"
  }
};

export const LevelStoryPopup = ({ level, onContinue }: LevelStoryPopupProps) => {
  const story = LEVEL_STORIES[level as keyof typeof LEVEL_STORIES];
  
  if (!story) return null;

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
          <div className="text-6xl mb-4">{story.emoji}</div>
          <h2 className={`text-3xl font-bold ${story.color} mb-4`}>{story.title}</h2>
          <p className="text-lg mb-6 text-gray-800 whitespace-pre-line">
            {story.story}
          </p>
          <Button 
            onClick={onContinue}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-3"
          >
            Continue
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Press Enter or tap "Continue"
          </p>
        </CardContent>
      </Card>
    </div>
  );
};