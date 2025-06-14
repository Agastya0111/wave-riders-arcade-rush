
import { GameProvider } from "@/contexts/GameContext";
import { GameContent } from "./GameContent";
import type { Avatar } from "@/pages/Index";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
  onSignup: () => void;
}

export const Game = (props: GameProps) => {
  return (
    <GameProvider {...props}>
      <GameContent />
    </GameProvider>
  );
};
