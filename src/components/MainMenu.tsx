
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard } from "./Leaderboard";
import { GameStats } from "./GameStats";
import { UserStats } from "./UserStats";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Play, Trophy, BarChart3, User } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
  isGuest?: boolean;
}

export const MainMenu = ({ onStartGame, isGuest = false }: MainMenuProps) => {
  const [currentView, setCurrentView] = useState<'menu' | 'leaderboard' | 'stats' | 'userStats'>('menu');
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

  if (currentView === 'userStats') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <UserStats />
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
          {isGuest && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-2">
              <p className="text-yellow-800 text-sm flex items-center gap-1">
                <User className="w-4 h-4" />
                Playing as Guest (Level 3 max)
              </p>
            </div>
          )}
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
            onClick={() => setCurrentView('userStats')}
            variant="outline"
            className="w-full"
          >
            <User className="w-5 h-5 mr-2" />
            My Stats
          </Button>
          
          {!isGuest && (
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
