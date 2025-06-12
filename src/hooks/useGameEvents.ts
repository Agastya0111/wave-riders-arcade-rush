
import { useEffect } from "react";
import { checkCollision } from "@/utils/gameUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/pages/Index";
import { ObstacleType } from "@/components/Game";

interface UseGameEventsProps {
  // State
  level: number;
  lives: number;
  score: number;
  gameOver: boolean;
  victory: boolean;
  gamePaused: boolean;
  storyShown: boolean;
  showStoryPopup: boolean;
  obstacles: ObstacleType[];
  playerX: number;
  playerY: number;
  avatar: Avatar;
  
  // Setters
  setShowStoryPopup: (value: boolean) => void;
  setVictory: (value: boolean) => void;
  setLevel: (value: number) => void;
  setGameSpeed: (fn: (prev: number) => number) => void;
  setLives: (fn: (prev: number) => number) => void;
  setObstacles: (fn: (prev: ObstacleType[]) => ObstacleType[]) => void;
  setGameOver: (value: boolean) => void;
}

export const useGameEvents = ({
  level,
  lives,
  score,
  gameOver,
  victory,
  gamePaused,
  storyShown,
  showStoryPopup,
  obstacles,
  playerX,
  playerY,
  avatar,
  setShowStoryPopup,
  setVictory,
  setLevel,
  setGameSpeed,
  setLives,
  setObstacles,
  setGameOver,
}: UseGameEventsProps) => {
  const { user } = useAuth();

  // Story popup trigger
  useEffect(() => {
    if (level === 7 && !storyShown && !showStoryPopup) {
      setShowStoryPopup(true);
    }
  }, [level, storyShown, showStoryPopup, setShowStoryPopup]);

  // Victory condition
  useEffect(() => {
    if (level >= 10 && lives >= 3 && score >= 50000) {
      setVictory(true);
    }
  }, [level, lives, score, setVictory]);

  // Level progression
  useEffect(() => {
    const newLevel = Math.floor(score / 5000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setGameSpeed(prev => prev + 0.5);
    }
  }, [score, level, setLevel, setGameSpeed]);

  // Collision detection
  useEffect(() => {
    if (gamePaused) return;
    obstacles.forEach(obstacle => {
      if (
        checkCollision(
          { x: playerX, y: playerY, width: 60, height: 60 },
          { x: obstacle.x, y: obstacle.y, width: 80, height: 60 }
        )
      ) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));
      }
    });
  }, [obstacles, playerX, playerY, gamePaused, setLives, setObstacles, setGameOver]);

  // Save score to Supabase
  useEffect(() => {
    const saveGameSession = async () => {
      if (!user) return;
      const { error } = await supabase.from("game_sessions").insert({
        user_id: user.id,
        score,
        level_reached: level,
        avatar
      });
      if (error) {
        console.error("Error saving game session:", error);
      } else {
        console.log("Game session saved.");
      }
    };

    if ((gameOver || victory) && user) {
      saveGameSession();
    }
  }, [gameOver, victory, user, score, level, avatar]);
};
