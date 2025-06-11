
interface TouchControlsProps {
  speedBoostCount: number;
  speedBoost: boolean;
  onSpeedBoost: () => void;
}

export const TouchControls = ({ speedBoostCount, speedBoost, onSpeedBoost }: TouchControlsProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end md:hidden">
      {/* Left side controls */}
      <div className="flex flex-col space-y-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-xs text-center max-w-28">
          Swipe ↕ to move<br />
          Tap to jump
        </div>
      </div>
      
      {/* Speed boost button */}
      <button
        className={`w-16 h-16 rounded-full text-xl font-bold transition-all ${
          speedBoostCount > 0 && !speedBoost 
            ? 'bg-yellow-500 hover:bg-yellow-600 active:scale-95' 
            : 'bg-gray-400 cursor-not-allowed'
        } text-white shadow-lg flex flex-col items-center justify-center`}
        onTouchStart={(e) => {
          e.stopPropagation();
          onSpeedBoost();
        }}
        disabled={speedBoostCount === 0 || speedBoost}
      >
        <span>⚡</span>
        <span className="text-xs">{speedBoostCount}</span>
      </button>
    </div>
  );
};
