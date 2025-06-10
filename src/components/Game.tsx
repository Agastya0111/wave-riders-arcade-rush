
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

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerX = 100; // Fixed X position for the player

  // Follow mode (danger mode) is now based on level instead of time
  const followMode = level >= 5;

  // Determine current gear based on level
  const getCurrentGear = (): Gear => {
    if (level >= 8) return "ship";
    if (level >= 5) return "bike";
    return "surfboard";
  };

  const currentGear = getCurrentGear();

  // Movement functions
  const moveUp = () => {
    if (gameOver || victory || showStoryPopup) return;
    setPlayerY(prev => Math.max(50, prev - 60));
  };

  const moveDown = () => {
    if (gameOver || victory || showStoryPopup) return;
    setPlayerY(prev => Math.min(550, prev + 60));
  };

  const activateSpeedBoost = () => {
    if (speedBoostCount > 0 && !speedBoost) {
      setSpeedBoost(true);
      setSpeedBoostCount(prev => prev - 1);
      setTimeout(() => setSpeedBoost(false), 3000); // 3 second boost
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
      if (gameOver || victory || showStoryPopup) return;
      
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
  }, [speedBoostCount, speedBoost]);

  // Game loop
  useEffect(() => {
    if (gameOver || victory || showStoryPopup) return;

    const gameLoop = setInterval(() => {
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

        // Add new obstacles with level-based frequency
        let spawnRate = 0.02; // Default spawn rate
        if (level <= 4) {
          spawnRate = 0.005; // Much less frequent obstacles for easy levels
        }
        
        if (Math.random() < spawnRate) {
          updated.push(generateObstacle());
        }

        return updated;
      });

      // Increase score
      setScore(prev => prev + 10);
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameOver, victory, showStoryPopup, generateObstacle, followMode, playerY, level]);

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
  }, [obstacles, playerX, playerY]);

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
      {/* Show story popup */}
      {showStoryPopup && <StoryPopup onContinue={handleStoryClose} />}

      {/* Game Background */}
      <GameBackground />

      {/* UI Elements */}
      <Lives lives={lives} />
      <Score score={score} level={level} />

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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold drop-shadow-lg text-center">
        <div className="hidden md:block">
          Use ↑↓ Arrow Keys to Move, Space for Speed Boost - Level {level} ({currentGear.toUpperCase()})
        </div>
        <div className="md:hidden">
          Level {level} ({currentGear.toUpperCase()}) - Long tap ⚡ for speed boost
        </div>
      </div>
    </div>
  );
};
