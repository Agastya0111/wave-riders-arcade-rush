import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard } from "./Leaderboard";
import { GameStats } from "./GameStats";
import { UserStats } from "./UserStats";
import { TeamsPage } from "./TeamsPage";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Play, Trophy, BarChart3, User, Users as TeamsIcon } from "lucide-react";
// REMOVE THIS IF PRESENT
// import { TeamInstructions } from "./TeamInstructions";

interface MainMenuProps {
  onStartGame: () => void;
  isGuest?: boolean;
}

export const MainMenu = ({ onStartGame, isGuest = false }: MainMenuProps) => {
  const [currentView, setCurrentView] = useState<'menu' | 'leaderboard' | 'stats' | 'userStats' | 'teams'>('menu');
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('menu');
  };

  // Back to main menu button for reuse
  const BackToMainMenuButton = () => (
    <Button 
      onClick={() => setCurrentView('menu')}
      variant="outline"
      className="w-full bg-white/90 mt-6"
    >
      Back to Main Menu
    </Button>
  );

  if (currentView === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Leaderboard />
          <BackToMainMenuButton />
        </div>
      </div>
    );
  }

  if (currentView === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <GameStats />
          <BackToMainMenuButton />
        </div>
      </div>
    );
  }

  if (currentView === 'userStats') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <UserStats />
          <BackToMainMenuButton />
        </div>
      </div>
    );
  }
  
  if (currentView === 'teams') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-500 to-purple-800 flex flex-col items-center justify-start p-4 pt-10">
        <div className="w-full max-w-2xl space-y-4">
          <TeamsPage onBackToMainMenu={() => setCurrentView('menu')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌊🏄</div>
          <CardTitle className="text-3xl text-blue-600">Wave Riders</CardTitle>
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
        <CardContent className="space-y-3">
          {/* TeamInstructions REMOVED from here */}
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
          
          {!isGuest && user && (
            <>
              <Button 
                onClick={() => setCurrentView('userStats')}
                variant="outline"
                className="w-full"
              >
                <User className="w-5 h-5 mr-2" />
                My Stats
              </Button>
              
              <Button 
                onClick={() => setCurrentView('teams')}
                variant="outline"
                className="w-full"
              >
                <TeamsIcon className="w-5 h-5 mr-2" />
                Teams
              </Button>
            </>
          )}
          
          {!isGuest && user && (
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
