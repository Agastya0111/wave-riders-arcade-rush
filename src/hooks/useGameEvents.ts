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
  wcrTriggered: boolean; // New prop
  
  // Setters
  setShowStoryPopup: (value: boolean) => void;
  setVictory: (value: boolean) => void;
  setLevel: (value: number) => void;
  setGameSpeed: (fn: (prev: number) => number) => void;
  setLives: (fn: (prev: number) => number) => void;
  setObstacles: (fn: (prev: ObstacleType[]) => ObstacleType[]) => void;
  setGameOver: (value: boolean) => void;
  setShowSignupPrompt: (value: boolean) => void;
  setWcrTriggered: (value: boolean) => void; // New prop
  setShowWCRPopup: (value: boolean) => void; // New prop
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
  wcrTriggered, // Destructure new prop
  setShowStoryPopup,
  setVictory,
  setLevel,
  setGameSpeed,
  setLives,
  setObstacles,
  setGameOver,
  setShowSignupPrompt,
  setWcrTriggered, // Destructure new prop
  setShowWCRPopup, // Destructure new prop
}: UseGameEventsProps) => {
  const { user } = useAuth();

  // Guest mode: Show signup prompt when trying to progress beyond level 3
  useEffect(() => {
    const newLevel = Math.floor(score / 5000) + 1;
    if (newLevel > 3 && !user && newLevel > level) {
      setShowSignupPrompt(true);
      return; // Don't progress beyond level 3 for guests
    }
    
    if (newLevel > level) {
      setLevel(newLevel);
      setGameSpeed(prev => prev + 0.5);
    }
  }, [score, level, user, setLevel, setGameSpeed, setShowSignupPrompt]);

  // Story popup trigger
  useEffect(() => {
    if (level === 7 && !storyShown && !showStoryPopup) {
      setShowStoryPopup(true);
    }
  }, [level, storyShown, showStoryPopup, setShowStoryPopup]);

  // WCR Popup Trigger
  useEffect(() => {
    if (!gameOver && !victory && score >= 500 && !wcrTriggered) {
      setWcrTriggered(true);
      setShowWCRPopup(true);
    }
  }, [score, gameOver, victory, wcrTriggered, setWcrTriggered, setShowWCRPopup]);

  // Victory condition
  useEffect(() => {
    if (level >= 10 && lives >= 3 && score >= 50000) {
      setVictory(true);
    }
  }, [level, lives, score, setVictory]);

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
};
