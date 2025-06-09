
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
  type: "shark" | "whale" | "octopus";
  x: number;
  y: number;
  speed: number;
}

export const Game = ({ avatar, onRestart }: GameProps) => {
  const [playerY, setPlayerY] = useState(300);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(3);

  const playerX = 100; // Fixed X position for the player

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

  // Generate obstacles
  const generateObstacle = useCallback(() => {
    const types: ("shark" | "whale" | "octopus")[] = ["shark", "whale", "octopus"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: Math.random() * 400 + 100,
      speed: gameSpeed + Math.random() * 2,
    };
  }, [gameSpeed]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // Move obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - obstacle.speed,
          }))
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
  }, [gameOver, generateObstacle]);

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
        }}
        onChooseAvatar={onRestart}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 overflow-hidden">
      {/* Animated waves background */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-32 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-60 animate-pulse" 
             style={{ bottom: '0%', clipPath: 'polygon(0 20px, 100% 0px, 100% 100%, 0% 100%)' }} />
        <div className="absolute w-full h-24 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" 
             style={{ bottom: '10%', clipPath: 'polygon(0 15px, 100% 0px, 100% 100%, 0% 100%)' }} />
        <div className="absolute w-full h-20 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-80" 
             style={{ bottom: '20%', clipPath: 'polygon(0 10px, 100% 0px, 100% 100%, 0% 100%)' }} />
      </div>

      {/* UI Elements */}
      <Lives lives={lives} />
      <Score score={score} level={level} />

      {/* Player */}
      <Player avatar={avatar} x={playerX} y={playerY} />

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold drop-shadow-lg">
        Use ↑↓ Arrow Keys to Move
      </div>
    </div>
  );
};
