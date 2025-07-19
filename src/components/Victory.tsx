
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaderboard } from "./Leaderboard";
import { useAuth } from "@/hooks/useAuth";

interface VictoryProps {
  score: number;
  onPlayAgain: () => void;
  onChooseAvatar: () => void;
  finalChoice?: string;
  choiceMessage?: string;
}

export const Victory = ({ score, onPlayAgain, onChooseAvatar, finalChoice, choiceMessage }: VictoryProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { user } = useAuth();

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Leaderboard />
          <Button 
            onClick={() => setShowLeaderboard(false)}
            variant="outline"
            className="w-full bg-white/90"
          >
            Back to Victory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl">
        <CardContent className="p-8 text-center">
          <h1 className="text-6xl font-bold text-yellow-600 mb-4">VICTORY!</h1>
          <div className="text-6xl mb-6">🏆⚔️👑</div>
          
          <div className="mb-6 space-y-2">
            {finalChoice ? (
              <>
                <p className={`text-3xl font-bold ${finalChoice === 'forgive' ? 'text-green-600' : 'text-red-600'}`}>
                  {finalChoice === 'forgive' ? 'You chose Peace!' : 'You chose Victory!'}
                </p>
                <p className="text-xl text-gray-800">{choiceMessage}</p>
                <p className="text-lg">Your journey is complete!</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600">You saved your friend!</p>
                <p className="text-2xl text-gray-800">You are a hero!</p>
              </>
            )}
            <p className="text-xl">Final Score: {score.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onPlayAgain}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
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
