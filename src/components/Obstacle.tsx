
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
  shark: "bg-red-500",
  whale: "bg-blue-700",
  octopus: "bg-purple-600",
  rock: "bg-gray-600",
};

const obstacleShadows = {
  shark: "shadow-red-300",
  whale: "shadow-blue-300",
  octopus: "shadow-purple-300", 
  rock: "shadow-gray-400",
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  const rotationAngle = obstacle.type === "rock" 
    ? Math.sin(Date.now() * 0.002) * 5 
    : Math.sin(Date.now() * 0.005) * 10;

  return (
    <div
      className={`absolute ${obstacleColors[obstacle.type]} ${obstacleShadows[obstacle.type]} rounded-lg shadow-lg flex items-center justify-center transition-transform hover:scale-110`}
      style={{
        left: obstacle.x,
        top: obstacle.y,
        width: 80,
        height: 60,
        transform: `rotate(${rotationAngle}deg)`,
      }}
    >
      <span className="text-4xl filter drop-shadow-lg">{obstacleEmojis[obstacle.type]}</span>
      {/* Add a subtle glow effect for underwater look */}
      <div className="absolute inset-0 bg-white opacity-10 rounded-lg animate-pulse" />
    </div>
  );
};
