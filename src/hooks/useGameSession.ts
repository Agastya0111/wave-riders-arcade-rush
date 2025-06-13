
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/pages/Index";

interface UseGameSessionProps {
  gameOver: boolean;
  victory: boolean;
  score: number;
  level: number;
  avatar: Avatar;
  startTime: number;
  livesUsed: number;
  dolphinsUsed: number;
}

export const useGameSession = ({
  gameOver,
  victory,
  score,
  level,
  avatar,
  startTime,
  livesUsed,
  dolphinsUsed,
}: UseGameSessionProps) => {
  const { user } = useAuth();

  useEffect(() => {
    const saveGameSession = async () => {
      if (!user) return;
      
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      try {
        const { error } = await supabase.from("game_sessions").insert({
          user_id: user.id,
          score,
          level_reached: level,
          duration_seconds: durationSeconds,
          lives_used: livesUsed,
          dolphins_used: dolphinsUsed,
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
