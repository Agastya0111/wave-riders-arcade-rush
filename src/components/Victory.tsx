
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VictoryProps {
  score: number;
  onPlayAgain: () => void;
  onChooseAvatar: () => void;
}

export const Victory = ({ score, onPlayAgain, onChooseAvatar }: VictoryProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl">
        <CardContent className="p-8 text-center">
          <h1 className="text-6xl font-bold text-yellow-600 mb-4">VICTORY!</h1>
          <div className="text-6xl mb-6">🏆⚔️👑</div>
          
          <div className="mb-6 space-y-2">
            <p className="text-3xl font-bold text-green-600">You saved your friend!</p>
            <p className="text-2xl text-gray-800">You are a hero!</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
