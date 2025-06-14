
import type { Gear } from "./Game.d";
export const GameUI = ({
  level,
  followMode,
  currentGear,
  speedBoost,
  score,
  lives,
  speedBoostCount,
  coinsCollected,
  wrcBalance
}: any) => {
  return (
    <>
      {/* Score Display - Separate from WRC */}
      <div className="absolute top-4 left-4 text-white font-bold drop-shadow-lg">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 space-y-1">
          <div className="text-lg md:text-xl">Score: {score.toLocaleString()}</div>
          <div className="text-sm md:text-base">Level: {level}</div>
          <div className="text-sm md:text-base">Lives: {Array(lives).fill('❤️').join('')}</div>
        </div>
      </div>

      {/* WRC Display was here - now moved out and removed */}

      {/* Debug Display - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
        Score: {score} | WRC: {wrcBalance}
      </div>
      
      {/* Speed boost indicator */}
      {speedBoost && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-pulse">
          ⚡️
        </div>
      )}

      {/* Pirate ship appears from level 7 */}
      {level >= 7 && (
        <div className="absolute top-4 right-20 text-6xl animate-bounce">
          🏴‍☠️
        </div>
      )}

      {/* Rescue mission indicator */}
      {level >= 7 && level < 10 && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
          RESCUE MISSION: Save your friend!
        </div>
      )}

      {/* Final level indicator */}
      {level >= 10 && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold animate-bounce">
          FINAL LEVEL: Reach the pirate ship with 3+ lives!
        </div>
      )}

      {/* Gear upgrade notification */}
      {(level === 5 || level === 8) && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl animate-bounce">
          GEAR UPGRADE! Now using {currentGear.toUpperCase()}!
        </div>
      )}

      {/* Follow mode indicator */}
      {followMode && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
          DANGER MODE: Obstacles are hunting you!
        </div>
      )}
    </>
  );
};
