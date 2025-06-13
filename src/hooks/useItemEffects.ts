
import { useEffect, useState } from "react";

export const useItemEffects = () => {
  const [shieldActive, setShieldActive] = useState(false);
  const [swordActive, setSwordActive] = useState(false);

  const activateShield = () => {
    setShieldActive(true);
    // Play shield sound effect
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.play().catch(() => {}); // Ignore audio play errors
    } catch (error) {
      console.log('Audio not supported');
    }
    
    setTimeout(() => setShieldActive(false), 1000);
  };

  const activateSword = () => {
    setSwordActive(true);
    // Play sword sound effect
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBjuO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
      audio.play().catch(() => {}); // Ignore audio play errors
    } catch (error) {
      console.log('Audio not supported');
    }
    
    setTimeout(() => setSwordActive(false), 500);
  };

  return {
    shieldActive,
    swordActive,
    activateShield,
    activateSword
  };
};
