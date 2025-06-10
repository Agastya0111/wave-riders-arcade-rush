
import { ObstacleType } from "./Game";

interface ObstacleProps {
  obstacle: ObstacleType;
}

const obstacleEmojis = {
  shark: "🦈",
  whale: "🐋", 
  octopus: "🐙",
  rock: "🪨",
};

const obstacleColors = {
  shark: "bg-gradient-to-r from-red-600 to-red-800",
  whale: "bg-gradient-to-r from-blue-700 to-blue-900",
  octopus: "bg-gradient-to-r from-purple-600 to-purple-800",
  rock: "bg-gradient-to-r from-gray-600 to-gray-800",
};

const obstacleShadows = {
  shark: "shadow-lg shadow-red-500/50",
  whale: "shadow-lg shadow-blue-500/50",
  octopus: "shadow-lg shadow-purple-500/50", 
  rock: "shadow-lg shadow-gray-500/50",
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  let rotationAngle = obstacle.type === "rock" 
    ? Math.sin(Date.now() * 0.002) * 5 
    : Math.sin(Date.now() * 0.005) * 10;

  // Enhanced animation for jumping whales
  let scaleTransform = "scale(1)";
  if (obstacle.type === "whale" && obstacle.jumping) {
    scaleTransform = "scale(1.2)";
    rotationAngle += Math.sin(Date.now() * 0.01) * 20;
  }

  return (
    <div
      className={`absolute ${obstacleColors[obstacle.type]} ${obstacleShadows[obstacle.type]} rounded-xl border-2 border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110`}
      style={{
        left: obstacle.x,
        top: obstacle.y,
        width: 80,
        height: 60,
        transform: `rotate(${rotationAngle}deg) ${scaleTransform}`,
      }}
    >
      <span className="text-4xl filter drop-shadow-lg">{obstacleEmojis[obstacle.type]}</span>
      
      {/* Enhanced underwater glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-xl animate-pulse" />
      
      {/* Particle trail for moving obstacles */}
      {obstacle.type !== "rock" && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-1 bg-white/30 rounded-full animate-pulse" />
      )}
      
      {/* Special effects for jumping whales */}
      {obstacle.type === "whale" && obstacle.jumping && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl animate-bounce">
          ✨
        </div>
      )}
      
      {/* Enhanced shadow for depth */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
    </div>
  );
};
