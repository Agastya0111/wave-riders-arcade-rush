
import { Button } from "@/components/ui/button";

interface ItemControlsProps {
  shieldAvailable: boolean;
  swordUses: number;
  onUseShield: () => void;
  onUseSword: () => void;
  isMobile: boolean;
}

export const ItemControls = ({ shieldAvailable, swordUses, onUseShield, onUseSword, isMobile }: ItemControlsProps) => {
  if (!isMobile) return null; // Only show on mobile

  return (
    <div className="absolute bottom-20 left-4 right-4 flex justify-between pointer-events-none">
      {/* Shield button - only show if available */}
      <div className="pointer-events-auto">
        {shieldAvailable && (
          <Button
            onClick={onUseShield}
            className="w-10 h-10 rounded-full text-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
          >
            🛡️
          </Button>
        )}
      </div>

      {/* Sword button - only show if has uses */}
      <div className="pointer-events-auto">
        {swordUses > 0 && (
          <div className="flex flex-col items-center">
            <Button
              onClick={onUseSword}
              className="w-10 h-10 rounded-full text-lg bg-red-500 hover:bg-red-600 flex items-center justify-center"
            >
              ⚔️
            </Button>
            <span className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
              {swordUses}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
