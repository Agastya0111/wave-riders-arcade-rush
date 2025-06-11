
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GameSessionData {
  score: number;
  level: number;
  duration: number;
  livesUsed: number;
  dolphinsUsed: number;
  completed: boolean;
}

export const useGameSession = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  const startGameSession = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          score: 0,
          level_reached: 1,
          duration_seconds: 0,
          lives_used: 0,
          dolphins_used: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setGameStartTime(Date.now());
      console.log("Game session started:", data.id);
      
      return data.id;
    } catch (error) {
      console.error("Error starting game session:", error);
      return null;
    }
  };

  const updateGameSession = async (sessionData: GameSessionData) => {
    if (!sessionId || !user) return;

    const duration = Math.floor((Date.now() - gameStartTime) / 1000);

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          score: sessionData.score,
          level_reached: sessionData.level,
          duration_seconds: duration,
          lives_used: sessionData.livesUsed,
          dolphins_used: sessionData.dolphinsUsed,
          completed: sessionData.completed,
        })
        .eq("id", sessionId);

      if (error) throw error;
      console.log("Game session updated:", sessionData);
    } catch (error) {
      console.error("Error updating game session:", error);
    }
  };

  const endGameSession = async (finalData: GameSessionData) => {
    if (!sessionId) return;

    await updateGameSession({ ...finalData, completed: true });
    setSessionId(null);
    setGameStartTime(0);
  };

  return {
    startGameSession,
    updateGameSession,
    endGameSession,
    sessionId,
  };
};
