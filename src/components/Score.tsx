
interface ScoreProps {
  score: number;
  level: number;
  coinsCollected?: number;
}

export const Score = ({ score, level, coinsCollected = 0 }: ScoreProps) => {
  return (
    <div className="absolute top-4 left-4 text-white font-bold drop-shadow-lg">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 space-y-1">
        <div className="text-lg md:text-xl">Score: {score.toLocaleString()}</div>
        <div className="text-sm md:text-base">Level: {level}</div>
        {coinsCollected > 0 && (
          <div className="text-sm md:text-base flex items-center gap-1">
            🪙 {coinsCollected}
          </div>
        )}
      </div>
    </div>
  );
};
