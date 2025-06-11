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
  const playerX = 100; // Fixed X position for the player

  // Follow mode (danger mode) is now based on level instead of time
  const followMode = level >= 5;

  // Game is paused when story popup is shown
  const gamePaused = showStoryPopup;

  // Determine current gear based on level
  const getCurrentGear = (): Gear => {
    if (level >= 8) return "ship";
    if (level >= 5) return "bike";
    return "surfboard";
  };

  const currentGear = getCurrentGear();

  // Check if obstacles are too close to each other
  const isObstacleTooClose = (newY: number, newX: number) => {
    return obstacles.some(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
      );
      return distance < 120; // Minimum distance between obstacles
    });
  };

  // Movement functions
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
      setTimeout(() => setSpeedBoost(false), 3000); // 3 second boost
    }
  };

  const handleDolphinSave = () => {
    if (lives > 0) {
      setLives(prev => Math.min(3, prev + 1)); // Add a life, max 3
    }
  };

  // Use custom hooks for game logic and touch controls
  const { generateObstacle } = useGameLogic({ 
    level, 
    gameSpeed, 
    speedBoost 
  });

  const { 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd 
  } = useTouchControls({
    moveUp,
    moveDown,
    activateSpeedBoost
  });

  // Show story popup at level 7
  useEffect(() => {
    if (level === 7 && !storyShown && !showStoryPopup) {
      setShowStoryPopup(true);
    }
  }, [level, storyShown, showStoryPopup]);

  // Check victory condition at level 10
  useEffect(() => {
    if (level >= 10 && lives >= 3 && score >= 50000) {
      setVictory(true);
    }
  }, [level, lives, score]);

  // Handle player movement with keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || victory || gamePaused) return;
      
      if (e.key === "ArrowUp") {
        moveUp();
      } else if (e.key === "ArrowDown") {
        moveDown();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activateSpeedBoost();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [speedBoostCount, speedBoost, gamePaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || victory || gamePaused) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();
      
      // Move obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obstacle => {
            let newX = obstacle.x - obstacle.speed;
            let newY = obstacle.y;
            
            // Handle whale jumping animation
            if (obstacle.type === "whale" && obstacle.jumping && obstacle.jumpStart) {
              const jumpDuration = Date.now() - obstacle.jumpStart;
              if (jumpDuration < 3000) { // 3 second jump
                const jumpProgress = jumpDuration / 3000;
                const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100;
                newY = obstacle.y + (obstacle.jumpDirection || 1) * jumpHeight;
              } else {
                // End jump
                obstacle.jumping = false;
                obstacle.jumpStart = undefined;
                obstacle.jumpDirection = undefined;
              }
            }
            
            // If follow mode is active (level 5+), make obstacles move towards player
            if (followMode && !obstacle.jumping) {
              const deltaY = playerY - obstacle.y;
              const followSpeed = 1.5;
              newY += Math.sign(deltaY) * Math.min(Math.abs(deltaY), followSpeed);
            }
            
            return {
              ...obstacle,
              x: newX,
              y: newY,
            };
          })
          .filter(obstacle => obstacle.x > -100);

        // Spawn new obstacles with minimum timing for levels 1-4
        let shouldSpawn = false;
        
        if (level <= 4) {
          // Minimum spawn every 4-6 seconds for levels 1-4
          const timeSinceLastSpawn = currentTime - lastObstacleSpawn;
          const minSpawnInterval = 4000 + Math.random() * 2000; // 4-6 seconds
          
          if (timeSinceLastSpawn > minSpawnInterval) {
            shouldSpawn = true;
            setLastObstacleSpawn(currentTime);
          }
        } else {
          // Original spawn rate for levels 5+
          if (Math.random() < 0.02) {
            shouldSpawn = true;
          }
        }

        if (shouldSpawn) {
          let attempts = 0;
          let newObstacle;
          
          // Try to generate obstacle that's not too close to others
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

      // Increase score
      setScore(prev => prev + 10);
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameOver, victory, gamePaused, generateObstacle, followMode, playerY, level, lastObstacleSpawn]);

  // Level progression
  useEffect(() => {
    const newLevel = Math.floor(score / 5000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setGameSpeed(prev => prev + 0.5);
    }
  }, [score, level]);

  // Collision detection
  useEffect(() => {
    if (gamePaused) return;
    
    obstacles.forEach(obstacle => {
      if (checkCollision(
        { x: playerX, y: playerY, width: 60, height: 60 },
        { x: obstacle.x, y: obstacle.y, width: 80, height: 60 }
      )) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        // Remove the obstacle that caused collision
        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));
      }
    });
  }, [obstacles, playerX, playerY, gamePaused]);

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
      {/* Show story popup - this pauses the game */}
      {showStoryPopup && <StoryPopup onContinue={handleStoryClose} />}

      {/* Game Background */}
      <GameBackground />

      {/* UI Elements */}
      <Lives lives={lives} />
      <Score score={score} level={level} />

      {/* Dolphin Helper System */}
      <DolphinHelper 
        lives={lives}
        onSave={handleDolphinSave}
        gameOver={gameOver}
        gamePaused={gamePaused}
      />

      {/* Game UI indicators */}
      <GameUI 
        level={level}
        followMode={followMode}
        currentGear={currentGear}
        speedBoost={speedBoost}
      />

      {/* Touch Controls */}
      <TouchControls 
        speedBoostCount={speedBoostCount}
        speedBoost={speedBoost}
        onSpeedBoost={activateSpeedBoost}
      />

      {/* Player */}
      <Player avatar={avatar} x={playerX} y={playerY} gear={currentGear} />

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}

      {/* Instructions */}
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
