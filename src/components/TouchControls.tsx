
interface TouchControlsProps {
  speedBoostCount: number;
  speedBoost: boolean;
  onSpeedBoost: () => void;
}

export const TouchControls = ({ speedBoostCount, speedBoost, onSpeedBoost }: TouchControlsProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center md:hidden">
      {/* Left side controls */}
      <div className="flex flex-col space-y-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-xs text-center">
          Swipe ↕ to move<br />
          Tap to jump
        </div>
      </div>
      
      {/* Speed boost button */}
      <button
        className={`w-16 h-16 rounded-full text-2xl font-bold transition-all ${
          speedBoostCount > 0 && !speedBoost 
            ? 'bg-yellow-500 hover:bg-yellow-600 active:scale-95' 
            : 'bg-gray-400 cursor-not-allowed'
        } text-white shadow-lg`}
        onTouchStart={(e) => {
          e.stopPropagation();
          onSpeedBoost();
        }}
        disabled={speedBoostCount === 0 || speedBoost}
      >
        ⚡
        <div className="text-xs mt-1">{speedBoostCount}</div>
      </button>
    </div>
  );
};
