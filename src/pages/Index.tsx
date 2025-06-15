
import { useState } from "react";
import { AvatarSelection } from "@/components/AvatarSelection";
import { Game } from "@/components/Game";
import { AuthPage } from "@/components/AuthPage";
import { MainMenu } from "@/components/MainMenu";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { InstructionPopup } from "@/components/InstructionPopup"; // Import InstructionPopup
import { TouchControlGuide } from "@/components/TouchControlGuide";

export type Avatar = "boy" | "girl" | "robot" | "shark" | "alien";

// Utility to detect touch device (simple version)
function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

const AppContent = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'avatarSelection' | 'playing'>('menu');
  const [guestMode, setGuestMode] = useState(false);
  const { user, loading } = useAuth();

  const [showInstructionPopupState, setShowInstructionPopupState] = useState(false);
  const [actionAfterInstructions, setActionAfterInstructions] = useState<(() => void) | null>(null);
  const [showTouchGuide, setShowTouchGuide] = useState(false);

  const handleInitiateGameStart = () => {
    // On phones/tablets: show the TouchControlGuide before game instructions or avatar selection
    if (isTouchDevice()) {
      setShowTouchGuide(true);
    } else {
      // Desktop flow, straight to instructions
      triggerInstructionFlow();
    }
  };

  // Helper to start instruction popup after touch guide
  const triggerInstructionFlow = () => {
    const gameAction = () => {
      setSelectedAvatar(null); // Reset avatar before selection
      setGameState('avatarSelection');
    };
    setActionAfterInstructions(() => () => gameAction());
    setShowInstructionPopupState(true);
  };

  // When TouchControlGuide is closed, show instructions as usual
  const handleCloseTouchGuide = () => {
    setShowTouchGuide(false);
    triggerInstructionFlow();
  };

  const handleSignup = () => {
    setGuestMode(false); // This will show the AuthPage
    setGameState('menu'); // Reset game state
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

  // Show TouchControlGuide for mobile/tablet users, takes priority over everything except loading/auth
  if (showTouchGuide) {
    return (
      <TouchControlGuide onClose={handleCloseTouchGuide} />
    );
  }

  // Instruction Popup takes precedence if active
  if (showInstructionPopupState) {
    return (
      <InstructionPopup 
        onClose={() => {
          setShowInstructionPopupState(false);
          // We still set this so if behavior changes in future, it's tracked.
          localStorage.setItem("surferadventure_instruct_seen_v2", "yes"); 
          if (actionAfterInstructions) {
            const actionToRun = actionAfterInstructions;
            setActionAfterInstructions(null); // Clear before running
            actionToRun(); // Execute the stored action (which is gameAction)
          }
        }} 
      />
    );
  }

  if (gameState === 'menu') {
    return (
      <MainMenu 
        onStartGame={handleInitiateGameStart}
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
        onSignup={handleSignup}
      />
    );
  }

  // Fallback to MainMenu if no other state matches
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

