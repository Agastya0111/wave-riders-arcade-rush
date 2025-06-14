import { CollectibleType } from "@/hooks/useGameLogic";

interface CollectibleProps {
  collectible: CollectibleType;
}

export const Collectible = ({ collectible }: CollectibleProps) => {
  // Golden look with ripple animation
  if (collectible.type === "coin") {
    return (
      <div
        className="absolute z-30"
        style={{
          left: `${collectible.x}px`,
          top: `${collectible.y}px`,
          transform: 'translate(-50%, -50%)',
          // For enhanced mobile clarity, size up coins a bit
          width: 48,
          height: 48,
        }}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Golden gradient coin */}
          <span
            className="block rounded-full w-10 h-10 shadow-lg"
            style={{
              background: 'radial-gradient(ellipse at 40% 30%, #ffe066 60%, #ffba08 100%)',
              boxShadow: '0 0 8px 3px #ffd70088',
              border: '2px solid #fac710',
              position: 'absolute',
              top: 4,
              left: 4,
            }}
          ></span>
          {/* Shine effect */}
          <span
            className="absolute block w-4 h-2 left-3 top-4 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #fffbe7 0%, #fffbe770 100%)',
              opacity: 0.8,
              filter: 'blur(1px)',
              transform: 'rotate(-16deg)',
            }}
          ></span>
          {/* “🪙” fallback icon, overlayed */}
          <span className="absolute left-2 top-1 text-yellow-200 text-2xl pointer-events-none select-none">🪙</span>
        </div>
      </div>
    );
  }
  // Bubble collectible is unchanged
  return (
    <div
      className="absolute text-2xl animate-pulse z-10"
      style={{
        left: `${collectible.x}px`,
        top: `${collectible.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      🫧
    </div>
  );
};
