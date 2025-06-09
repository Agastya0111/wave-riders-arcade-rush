
import { ObstacleType } from "./Game";

interface ObstacleProps {
  obstacle: ObstacleType;
}

const obstacleEmojis = {
  shark: "🦈",
  whale: "🐋", 
  octopus: "🐙",
};

const obstacleColors = {
  shark: "bg-red-500",
  whale: "bg-blue-700",
  octopus: "bg-purple-600",
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  return (
    <div
      className={`absolute ${obstacleColors[obstacle.type]} rounded-lg shadow-lg flex items-center justify-center transition-transform hover:scale-110`}
      style={{
        left: obstacle.x,
        top: obstacle.y,
        width: 80,
        height: 60,
        transform: `rotate(${Math.sin(Date.now() * 0.005) * 10}deg)`,
      }}
    >
      <span className="text-4xl">{obstacleEmojis[obstacle.type]}</span>
    </div>
  );
};
