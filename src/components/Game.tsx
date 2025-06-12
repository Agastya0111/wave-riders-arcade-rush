import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar } from "@/pages/Index";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Lives } from "./Lives";
import { Score } from "./Score";
import { GameOver } from "./GameOver";
import { StoryPopup } from "./StoryPopup";
import { Victory } from "./Victory";
import { GameBackground } from "./GameBackground";
import { GameUI } from "./GameUI";
import { TouchControls } from "./TouchControls";
import { DolphinHelper } from "./DolphinHelper";
import { checkCollision } from "@/utils/gameUtils";
import { useGameLogic } from "@/hooks/useGameLogic";
import { useTouchControls } from "@/hooks/useTouchControls";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GameProps {
  avatar: Avatar;
  onRestart: () => void;
}

export interface ObstacleType {
  id: string;
  type: "shark" | "whale" | "octopus" | "rock";
  x: number;
  y: number;
  speed: number;
  jumping?: boolean;
  jumpStart?: number;
  jumpDirection?: number;
  warning?: boolean;
}

export type Gear = "surfboard" | "bike" | "ship";

export const Game = ({ avatar, onRestart }: GameProps) => {
  const [playerY, setPlayerY] = useState(300);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [storyShown, setStoryShown] = useState(false);
  const [victory, setVictory] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [speedBoostCount, setSpeedBoostCount] = useState(3);
  const [lastObstacleSpawn, setLastObstacleSpawn] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerX = 100;

  const { user } = useAuth(); // ✅ Get the logged-in user

  const followMode = level >= 5;
  const gamePaused = showStoryPopup;

  const getCurrentGear = (): Gear => {
    if (level >= 8) return "ship";
    if (level >= 5) return "bike";
    return "surfboard";
  };
  const currentGear = getCurrentGear();

  const isObstacleTooClose = (newY: number, newX: number) => {
    return obstacles.some(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
      );
      return distance < 120;
    });
  };

  const moveUp = () => {
    if (gameOver || victory || gamePaused) return;
    setPlayerY(prev => Math.max(50, prev - 60));
  };

  const moveDown = () => {
    if (gameOver || victory || gamePaused) return;
    setPlayerY(prev => Math.min(550, prev + 60));
  };

  const activateSpeedBoost = () => {
    if (speedBoostCount > 0 && !speedBoost && !gamePaused) {
      setSpeedBoost(true);
      setSpeedBoostCount(prev => prev - 1);
      setTimeout(() => setSpeedBoost(false), 3000);
    }
  };

  const handleDolphinSave = () => {
    if (lives > 0) {
      setLives(prev => Math.min(3, prev + 1));
    }
  };

  const { generateObstacle } = useGameLogic({ level, gameSpeed, speedBoost });
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    moveUp,
    moveDown,
    activateSpeedBoost
  });

  useEffect(() => {
    if (level === 7 && !storyShown && !showStoryPopup) {
      setShowStoryPopup(true);
    }
  }, [level, storyShown, showStoryPopup]);

  useEffect(() => {
    if (level >= 10 && lives >= 3 && score >= 50000) {
      setVictory(true);
    }
  }, [level, lives, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || victory || gamePaused) return;
      if (e.key === "ArrowUp") moveUp();
      else if (e.key === "ArrowDown") moveDown();
      else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activateSpeedBoost();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [speedBoostCount, speedBoost, gamePaused]);

  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      setObstacles(prev => {
        const updated = prev
          .map(obstacle => {
            let newX = obstacle.x - obstacle.speed;
            let newY = obstacle.y;

            if (obstacle.type === "whale" && obstacle.jumping && obstacle.jumpStart) {
              const jumpDuration = Date.now() - obstacle.jumpStart;
              if (jumpDuration < 3000) {
                const jumpProgress = jumpDuration / 3000;
                const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100;
                newY = obstacle.y + (obstacle.jumpDirection || 1) * jumpHeight;
              } else {
                obstacle.jumping = false;
                obstacle.jumpStart = undefined;
                obstacle.jumpDirection = undefined;
              }
            }

            if (followMode && !obstacle.jumping) {
              const deltaY = playerY - obstacle.y;
              const followSpeed = 1.5;
              newY += Math.sign(deltaY) * Math.min(Math.abs(deltaY), followSpeed);
            }

            return { ...obstacle, x: newX, y: newY };
          })
          .filter(obstacle => obstacle.x > -100);

        let shouldSpawn = false;

        if (level <= 4) {
          const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
          const minSpawnInterval = 4000 + Math.random() * 2000;
          if (timeSinceLastSpawn > minSpawnInterval) {
            shouldSpawn = true;
            setLastObstacleSpawn(currentTime);
          }
        } else {
          if (Math.random() < 0.02) {
            shouldSpawn = true;
          }
        }

        if (shouldSpawn) {
          let attempts = 0;
          let newObstacle;
          do {
            newObstacle = generateObstacle();
            attempts++;
          } while (
            attempts < 5 &&
            level <= 4 &&
            isObstacleTooClose(newObstacle.y, newObstacle.x)
          );

          if (attempts < 5 || level > 4) {
            updated.push(newObstacle);
          }
        }

        return updated;
      });

      setScore(prev => prev + 10);
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameOver, victory, gamePaused, generateObstacle, followMode, playerY, level, lastObstacleSpawn]);

  useEffect(() => {
    const newLevel = Math.floor(score / 5000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setGameSpeed(prev => prev + 0.5);
    }
  }, [score, level]);

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
  }, [obstacles, playerX, playerY, gamePaused]);

  // ✅ Save score to Supabase on Game Over or Victory
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

  const handleStoryClose = () => {
    setShowStoryPopup(false);
    setStoryShown(true);
  };

  const handleRestart = () => {
    setPlayerY(300);
    setObstacles([]);
    setLives(3);
    setScore(0);
    setLevel(1);
    setGameSpeed(3);
    setGameOver(false);
    setShowStoryPopup(false);
    setStoryShown(false);
    setVictory(false);
    setSpeedBoost(false);
    setSpeedBoostCount(3);
    setLastObstacleSpawn(0);
  };

  if (victory) {
    return (
      <Victory
        score={score}
        onPlayAgain={handleRestart}
        onChooseAvatar={onRestart}
      />
    );
  }

  if (gameOver) {
    const rescueMission = level >= 7;
    return (
      <GameOver
        score={score}
        level={level}
        onRestart={handleRestart}
        onChooseAvatar={onRestart}
        rescueMission={rescueMission}
      />
    );
  }

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showStoryPopup && <StoryPopup onContinue={handleStoryClose} />}
      <GameBackground />
      <Lives lives={lives} />
      <Score score={score} level={level} />
      <DolphinHelper
        lives={lives}
        onSave={handleDolphinSave}
        gameOver={gameOver}
        gamePaused={gamePaused}
      />
      <GameUI
        level={level}
        followMode={followMode}
        currentGear={currentGear}
        speedBoost={speedBoost}
      />
      <TouchControls
        speedBoostCount={speedBoostCount}
        speedBoost={speedBoost}
        onSpeedBoost={activateSpeedBoost}
      />
      <Player avatar={avatar} x={playerX} y={playerY} gear={currentGear} />
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm md:text-lg font-bold drop-shadow-lg text-center">
        <div className="hidden md:block">
          Use ↑↓ Arrow Keys to Move, Space for Speed Boost, Ctrl+D for Dolphin - Level {level} ({currentGear.toUpperCase()})
        </div>
        <div className="md:hidden text-xs">
          Level {level} ({currentGear.toUpperCase()}) - Swipe to move, tap to jump
        </div>
      </div>
    </div>
  );
};
