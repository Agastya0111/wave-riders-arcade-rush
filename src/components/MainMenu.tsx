
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard } from "./Leaderboard";
import { GameStats } from "./GameStats";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Play, Trophy, BarChart3 } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu = ({ onStartGame }: MainMenuProps) => {
  const [currentView, setCurrentView] = useState<'menu' | 'leaderboard' | 'stats'>('menu');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (currentView === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Leaderboard />
          <Button 
            onClick={() => setCurrentView('menu')}
            variant="outline"
            className="w-full bg-white/90"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <GameStats />
          <Button 
            onClick={() => setCurrentView('menu')}
            variant="outline"
            className="w-full bg-white/90"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌊🐠</div>
          <CardTitle className="text-3xl text-blue-600">Ocean Adventure</CardTitle>
          <p className="text-gray-600">Dive deep and rescue your friend!</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
          
          <Button 
            onClick={() => setCurrentView('leaderboard')}
            variant="outline"
            className="w-full"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
          
          <Button 
            onClick={() => setCurrentView('stats')}
            variant="outline"
            className="w-full"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Game Stats
          </Button>
          
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
