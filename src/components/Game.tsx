
import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/pages/Index";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Lives } from "./Lives";
import { Score } from "./Score";
import { GameOver } from "./GameOver";
import { checkCollision } from "@/utils/gameUtils";

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
  const [gameStartTime] = useState(Date.now());
  const [followMode, setFollowMode] = useState(false);

  const playerX = 100; // Fixed X position for the player

  // Determine current gear based on level
  const getCurrentGear = (): Gear => {
    if (level >= 8) return "ship";
    if (level >= 5) return "bike";
    return "surfboard";
  };

  const currentGear = getCurrentGear();

  // Check if 10 seconds have passed to enable follow mode
  useEffect(() => {
    const checkFollowMode = setInterval(() => {
      const elapsed = Date.now() - gameStartTime;
      if (elapsed >= 10000 && !followMode) {
        setFollowMode(true);
      }
    }, 1000);

    return () => clearInterval(checkFollowMode);
  }, [gameStartTime, followMode]);

  // Handle player movement
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      if (e.key === "ArrowUp" && playerY > 50) {
        setPlayerY(prev => Math.max(50, prev - 60));
      } else if (e.key === "ArrowDown" && playerY < 550) {
        setPlayerY(prev => Math.min(550, prev + 60));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerY, gameOver]);

  // Generate obstacles with level-based logic
  const generateObstacle = useCallback(() => {
    const types: ("shark" | "whale" | "octopus" | "rock")[] = ["shark", "whale", "octopus", "rock"];
    let type = types[Math.floor(Math.random() * types.length)];
    
    // Increase octopus spawn rate after level 5
    if (level >= 5 && Math.random() < 0.4) {
      type = "octopus";
    }
    
    let speed = gameSpeed + Math.random() * 2;
    
    // Level-based speed increases for sharks and whales
    if (type === "shark") {
      speed *= (1 + level * 0.3);
    } else if (type === "whale") {
      speed *= (1 + level * 0.25);
    }
    
    const obstacle: ObstacleType = {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: Math.random() * 400 + 100,
      speed,
    };

    // Add jumping behavior for whales
    if (type === "whale" && Math.random() < 0.3) {
      obstacle.jumping = true;
      obstacle.jumpStart = Date.now();
      obstacle.jumpDirection = Math.random() < 0.5 ? -1 : 1;
    }
    
    return obstacle;
  }, [gameSpeed, level]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

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
            
            // If follow mode is active, make obstacles move towards player
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

        // Add new obstacles randomly
        if (Math.random() < 0.02) {
          updated.push(generateObstacle());
        }

        return updated;
      });

      // Increase score
      setScore(prev => prev + 10);
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameOver, generateObstacle, followMode, playerY]);

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

  if (gameOver) {
    return (
      <GameOver 
        score={score} 
        level={level} 
        onRestart={() => {
          setPlayerY(300);
          setObstacles([]);
          setLives(3);
          setScore(0);
          setLevel(1);
          setGameSpeed(3);
          setGameOver(false);
          setFollowMode(false);
        }}
        onChooseAvatar={onRestart}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600 overflow-hidden">
      {/* Realistic ocean background with multiple wave layers */}
      <div className="absolute inset-0">
        {/* Deep ocean layer */}
        <div className="absolute w-full h-full bg-gradient-to-b from-blue-400 to-blue-800" />
        
        {/* Animated wave layers */}
        <div 
          className="absolute w-[150%] h-32 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-70 animate-pulse wave1" 
          style={{ 
            bottom: '0%', 
            left: '-25%',
            clipPath: 'polygon(0 30px, 100% 0px, 100% 100%, 0% 100%)',
          }} 
        />
        <div 
          className="absolute w-[150%] h-24 bg-gradient-to-r from-blue-200 to-cyan-200 opacity-60 wave2" 
          style={{ 
            bottom: '8%', 
            left: '-30%',
            clipPath: 'polygon(0 20px, 100% 0px, 100% 100%, 0% 100%)',
          }} 
        />
        <div 
          className="absolute w-[150%] h-20 bg-gradient-to-r from-white to-cyan-100 opacity-50 wave3" 
          style={{ 
            bottom: '15%', 
            left: '-20%',
            clipPath: 'polygon(0 15px, 100% 0px, 100% 100%, 0% 100%)',
          }} 
        />
        
        {/* Foam and bubbles */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* UI Elements */}
      <Lives lives={lives} />
      <Score score={score} level={level} />

      {/* Gear upgrade notification */}
      {(level === 5 || level === 8) && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl animate-bounce">
          GEAR UPGRADE! Now using {currentGear.toUpperCase()}!
        </div>
      )}

      {/* Follow mode indicator */}
      {followMode && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
          DANGER MODE: Obstacles are hunting you!
        </div>
      )}

      {/* Player */}
      <Player avatar={avatar} x={playerX} y={playerY} gear={currentGear} />

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold drop-shadow-lg">
        Use ↑↓ Arrow Keys to Move - Level {level} ({currentGear.toUpperCase()})
      </div>
    </div>
  );
};
