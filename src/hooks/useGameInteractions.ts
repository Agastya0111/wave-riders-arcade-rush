import { useState, useEffect, useCallback } from "react";
import { Challenge } from "@/components/ChallengeBanner"; // Assuming Challenge type is here or define locally

interface UseGameInteractionsProps {
  coinsCollected: number;
  challenge: Challenge;
  setChallenge: React.Dispatch<React.SetStateAction<Challenge>>;
  wrcSystemEarnWRC: (amount: number) => void; // Abstracted WRC earning
}

export const useGameInteractions = ({
  coinsCollected,
  challenge,
  setChallenge,
  wrcSystemEarnWRC,
}: UseGameInteractionsProps) => {
  const [isInvincible, setIsInvincible] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [showCoinFeedback, setShowCoinFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activateInvincibility = useCallback(() => {
    setIsInvincible(true);
    setTimeout(() => setIsInvincible(false), 5000);
  }, []);

  const activateMagnet = useCallback(() => {
    setMagnetActive(true);
    setTimeout(() => setMagnetActive(false), 4000);
  }, []);

  const handleCoinCollected = useCallback(() => {
    wrcSystemEarnWRC(1); // Call the abstracted WRC earning function
    setShowCoinFeedback(true);
    setTimeout(() => setShowCoinFeedback(false), 1000);
    
    try {
      // It's better to manage audio globally or via a service if possible
      const audio = new Audio('data:audio/wav;base64,UklGRu4CAABXQVZFZm10IBAAAAABAAEASB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio not supported for coin collection');
    }
  }, [wrcSystemEarnWRC, setShowCoinFeedback]);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
    
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio not supported for error');
    }
  }, [setErrorMessage]);

  useEffect(() => {
    if (!challenge.completed && coinsCollected >= 7) {
      setChallenge((prevChallenge) => ({ ...prevChallenge, completed: true }));
    }
  }, [coinsCollected, challenge.completed, setChallenge]);

  return {
    isInvincible,
    magnetActive,
    showCoinFeedback,
    errorMessage,
    handleCoinCollected, // This will be passed to useGameLoop
    showError,         // This will be used by useGameActions
    challenge, // Added challenge to the return object
    activateInvincibility,
    activateMagnet,
  };
};
