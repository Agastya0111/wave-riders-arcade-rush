
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/pages/Index";

interface UseSecureGameSessionProps {
  gameOver: boolean;
  victory: boolean;
  score: number;
  level: number;
  avatar: Avatar;
  startTime: number;
  livesUsed: number;
  dolphinsUsed: number;
}

export const useSecureGameSession = ({
  gameOver,
  victory,
  score,
  level,
  avatar,
  startTime,
  livesUsed,
  dolphinsUsed,
}: UseSecureGameSessionProps) => {
  const { user } = useAuth();

  useEffect(() => {
    const saveGameSession = async () => {
      // Only save for authenticated users to prevent data pollution
      if (!user) {
        console.log("Game session not saved - user not authenticated");
        return;
      }
      
      // Validate inputs to prevent malicious data
      if (startTime <= 0 || score < 0 || level < 1 || level > 50) {
        console.warn("Invalid game session data, not saving");
        return;
      }
      
      if (livesUsed < 0 || livesUsed > 10 || dolphinsUsed < 0 || dolphinsUsed > 100) {
        console.warn("Invalid game session metrics, not saving");
        return;
      }
      
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      // Validate duration (reasonable game session length)
      if (durationSeconds < 0 || durationSeconds > 86400) { // Max 24 hours
        console.warn("Invalid game duration, not saving");
        return;
      }
      
      try {
        const { error } = await supabase.from("game_sessions").insert({
          user_id: user.id,
          score: Math.min(score, 1000000), // Cap score to prevent overflow
          level_reached: Math.min(level, 50), // Cap level
          duration_seconds: durationSeconds,
          lives_used: Math.min(livesUsed, 10), // Cap lives used
          dolphins_used: Math.min(dolphinsUsed, 100), // Cap dolphins used
          completed: victory
        });
        
        if (error) {
          console.error("Error saving game session:", error);
        } else {
          console.log("Game session saved successfully");
        }
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    };

    if ((gameOver || victory) && user && startTime > 0) {
      saveGameSession();
    }
  }, [gameOver, victory, user, score, level, avatar, startTime, livesUsed, dolphinsUsed]);
};
