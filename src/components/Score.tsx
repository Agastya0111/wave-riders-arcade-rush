
interface ScoreProps {
  score: number;
  level: number;
}

export const Score = ({ score, level }: ScoreProps) => {
  const nextLevelScore = level * 5000;
  const progress = ((score % 5000) / 5000) * 100;

  return (
    <div className="absolute top-4 right-4 text-white text-right">
      <div className="bg-black/30 backdrop-blur rounded-lg p-3 shadow-lg">
        <div className="text-2xl font-bold mb-1">Score: {score.toLocaleString()}</div>
        <div className="text-lg font-semibold mb-2">Level: {level}</div>
        <div className="text-sm mb-1">Next Level: {nextLevelScore.toLocaleString()}</div>
        <div className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
