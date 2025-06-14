import { useState } from "react";
import { AvatarSelection } from "@/components/AvatarSelection";
import { Game } from "@/components/Game";
import { AuthPage } from "@/components/AuthPage";
import { MainMenu } from "@/components/MainMenu";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { InstructionPopup } from "@/components/InstructionPopup"; // Import InstructionPopup

export type Avatar = "boy" | "girl" | "robot" | "shark" | "alien";

const AppContent = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'avatarSelection' | 'playing'>('menu');
  const [guestMode, setGuestMode] = useState(false);
  const { user, loading } = useAuth();

  const [showInstructionPopupState, setShowInstructionPopupState] = useState(false);
  const [actionAfterInstructions, setActionAfterInstructions] = useState<(() => void) | null>(null);

  const handleInitiateGameStart = () => {
    const instructionsSeen = localStorage.getItem("surferadventure_instruct_seen_v2") === "yes";
    
    const gameAction = () => {
      setSelectedAvatar(null); // Reset avatar before selection
      setGameState('avatarSelection');
    };

    if (!instructionsSeen) {
      // Store a function that will execute gameAction
      setActionAfterInstructions(() => () => gameAction());
      setShowInstructionPopupState(true);
    } else {
      gameAction(); // Execute directly
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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

  // Instruction Popup takes precedence if active
  if (showInstructionPopupState) {
    return (
      <InstructionPopup 
        onClose={() => {
          setShowInstructionPopupState(false);
          localStorage.setItem("surferadventure_instruct_seen_v2", "yes");
          if (actionAfterInstructions) {
            const actionToRun = actionAfterInstructions;
            setActionAfterInstructions(null); // Clear before running
            actionToRun(); // Execute the stored action
          }
        }} 
      />
    );
  }

  if (gameState === 'menu') {
    return (
      <MainMenu 
        onStartGame={handleInitiateGameStart} // Use the new handler
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
          setGameState('menu'); // On restart, go to menu. Clicking "Start Game" will trigger handleInitiateGameStart.
        }} 
      />
    );
  }

  // Fallback to MainMenu if no other state matches, though ideally all paths are covered.
  // This could happen if gameState is invalid or selectedAvatar is null when 'playing'.
  return <MainMenu onStartGame={handleInitiateGameStart} isGuest={!user} />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
