import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar } from "@/pages/Index";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Lives } from "./Lives";
import { Score } from "./Score";
import { GameOver } from "./GameOver";
import { StoryPopup } from "./StoryPopup";
import { Victory } from "./Victory";
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
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [storyShown, setStoryShown] = useState(false);
  const [victory, setVictory] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [speedBoostCount, setSpeedBoostCount] = useState(3);

  // Touch handling refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long tap timer
    longTapTimeoutRef.current = setTimeout(() => {
      activateSpeedBoost();
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 500); // 500ms for long tap
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    // Cancel long tap if finger moves
    if (longTapTimeoutRef.current) {
      clearTimeout(longTapTimeoutRef.current);
      longTapTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Cancel long tap timer
    if (longTapTimeoutRef.current) {
      clearTimeout(longTapTimeoutRef.current);
      longTapTimeoutRef.current = null;
    }

    // Check if it's a quick tap (not a swipe and not a long tap)
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 && deltaTime < 500) {
      // Quick tap - jump (move up)
      moveUp();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right - move down
        moveDown();
      } else {
        // Swipe left - move up
        moveUp();
      }
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else if (Math.abs(deltaY) > 50) {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        moveDown();
      } else {
        // Swipe up
        moveUp();
      }
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }

    touchStartRef.current = null;
  };

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

  // Generate obstacles with level-based logic
  const generateObstacle = useCallback(() => {
    const types: ("shark" | "whale" | "octopus" | "rock")[] = ["shark", "whale", "octopus", "rock"];
    let type = types[Math.floor(Math.random() * types.length)];
    
    // Increase octopus spawn rate after level 5
    if (level >= 5 && Math.random() < 0.4) {
      type = "octopus";
    }
    
    let speed = gameSpeed;
    
    // For levels 1-4, make obstacles very slow and negligible
    if (level <= 4) {
      speed = gameSpeed * 0.3; // Much slower obstacles
    } else {
      speed = gameSpeed + Math.random() * 2;
    }
    
    // Apply speed boost if active
    if (speedBoost) {
      speed *= 0.5; // Slow down obstacles when boost is active
    }
    
    // Level-based speed increases for sharks and whales (only after level 4)
    if (level > 4) {
      if (type === "shark") {
        speed *= (1 + level * 0.3);
      } else if (type === "whale") {
        speed *= (1 + level * 0.25);
      }
    }
    
    const obstacle: ObstacleType = {
      id: Math.random().toString(),
      type,
      x: 1200,
      y: Math.random() * 400 + 100,
      speed,
    };

    // Add jumping behavior for whales (only after level 4)
    if (type === "whale" && level > 4 && Math.random() < 0.3) {
      obstacle.jumping = true;
      obstacle.jumpStart = Date.now();
      obstacle.jumpDirection = Math.random() < 0.5 ? -1 : 1;
    }
    
    return obstacle;
  }, [gameSpeed, level, speedBoost]);

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
    setFollowMode(false);
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

      {/* Mobile Touch Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center md:hidden">
        {/* Left side controls */}
        <div className="flex flex-col space-y-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-xs text-center">
            Swipe ↕ to move<br />
            Tap to jump
          </div>
        </div>
        
        {/* Speed boost button */}
        <button
          className={`w-16 h-16 rounded-full text-2xl font-bold transition-all ${
            speedBoostCount > 0 && !speedBoost 
              ? 'bg-yellow-500 hover:bg-yellow-600 active:scale-95' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white shadow-lg`}
          onTouchStart={(e) => {
            e.stopPropagation();
            activateSpeedBoost();
          }}
          disabled={speedBoostCount === 0 || speedBoost}
        >
          ⚡
          <div className="text-xs mt-1">{speedBoostCount}</div>
        </button>
      </div>

      {/* Speed boost indicator */}
      {speedBoost && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-pulse">
          ⚡️
        </div>
      )}

      {/* Pirate ship appears from level 7 */}
      {level >= 7 && (
        <div className="absolute top-4 right-4 text-6xl animate-bounce">
          🏴‍☠️
        </div>
      )}

      {/* Rescue mission indicator */}
      {level >= 7 && level < 10 && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
          RESCUE MISSION: Save your friend!
        </div>
      )}

      {/* Final level indicator */}
      {level >= 10 && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold animate-bounce">
          FINAL LEVEL: Reach the pirate ship with 3+ lives!
        </div>
      )}

      {/* Gear upgrade notification */}
      {(level === 5 || level === 8) && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl animate-bounce">
          GEAR UPGRADE! Now using {currentGear.toUpperCase()}!
        </div>
      )}

      {/* Follow mode indicator - now shows from level 5 */}
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
