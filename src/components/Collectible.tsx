
import { CollectibleType } from "@/hooks/useGameLogic";

interface CollectibleProps {
  collectible: CollectibleType;
}

export const Collectible = ({ collectible }: CollectibleProps) => {
  const getCollectibleEmoji = () => {
    switch (collectible.type) {
      case "coin":
        return "🪙";
      case "bubble":
        return "🫧";
      default:
        return "✨";
    }
  };

  return (
    <div
      className="absolute text-2xl animate-pulse z-10"
      style={{
        left: `${collectible.x}px`,
        top: `${collectible.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {getCollectibleEmoji()}
    </div>
  );
};
