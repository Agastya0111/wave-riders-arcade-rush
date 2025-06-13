
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaderboard } from "./Leaderboard";
import { useAuth } from "@/hooks/useAuth";

interface GameOverProps {
  score: number;
  level: number;
  onRestart: () => void;
  onChooseAvatar: () => void;
  rescueMission?: boolean;
}

export const GameOver = ({ score, level, onRestart, onChooseAvatar, rescueMission }: GameOverProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { user } = useAuth();
  const isRescueMissionFailed = rescueMission && level >= 7;

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Leaderboard />
          <Button 
            onClick={() => setShowLeaderboard(false)}
            variant="outline"
            className="w-full bg-white/90"
          >
            Back to Game Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl">
        <CardContent className="p-8 text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">GAME OVER!</h1>
          <div className="text-4xl mb-6">
            {isRescueMissionFailed ? "🏴‍☠️💔🏄‍♂️" : "🦈💥🏄‍♂️"}
          </div>
          
          {isRescueMissionFailed && (
            <div className="mb-4 p-4 bg-red-100 rounded-lg border-2 border-red-300">
              <p className="text-xl font-bold text-red-700">
                You failed to rescue your friend. Try again!
              </p>
            </div>
          )}
          
          <div className="mb-6 space-y-2">
            <p className="text-2xl font-bold">Final Score: {score.toLocaleString()}</p>
            <p className="text-xl">Reached Level: {level}</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onRestart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-3"
            >
              🔄 Play Again
            </Button>
            <Button 
              onClick={onChooseAvatar}
              variant="outline"
              className="w-full text-lg py-3"
            >
              🏄 Choose New Avatar
            </Button>
            
            {user ? (
              <Button 
                onClick={() => setShowLeaderboard(true)}
                variant="outline"
                className="w-full text-lg py-3"
              >
                🏆 View Leaderboard
              </Button>
            ) : (
              <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-yellow-800 text-sm">
                  🏆 Log in to compete on the leaderboard!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
