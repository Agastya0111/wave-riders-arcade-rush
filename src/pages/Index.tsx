
import { useState } from "react";
import { AvatarSelection } from "@/components/AvatarSelection";
import { Game } from "@/components/Game";
import { AuthPage } from "@/components/AuthPage";
import { MainMenu } from "@/components/MainMenu";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

export type Avatar = "boy" | "girl" | "robot" | "shark" | "alien";

const AppContent = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'avatarSelection' | 'playing'>('menu');
  const [guestMode, setGuestMode] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Allow guest mode or authenticated users
  if (!user && !guestMode) {
    return (
      <AuthPage 
        onAuthSuccess={() => setGameState('menu')}
        onGuestMode={() => {
          setGuestMode(true);
          setGameState('menu');
        }}
      />
    );
  }

  if (gameState === 'menu') {
    return (
      <MainMenu 
        onStartGame={() => setGameState('avatarSelection')}
        isGuest={!user}
      />
    );
  }

  if (gameState === 'avatarSelection') {
    return (
      <AvatarSelection 
        onSelect={(avatar) => {
          setSelectedAvatar(avatar);
          setGameState('playing');
        }} 
      />
    );
  }

  if (gameState === 'playing' && selectedAvatar) {
    return (
      <Game 
        avatar={selectedAvatar} 
        onRestart={() => {
          setSelectedAvatar(null);
          setGameState('menu');
        }} 
      />
    );
  }

  return <MainMenu onStartGame={() => setGameState('avatarSelection')} isGuest={!user} />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
