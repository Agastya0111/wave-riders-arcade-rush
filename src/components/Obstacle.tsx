import { ObstacleType } from "./Game";

interface ObstacleProps {
  obstacle: ObstacleType;
}

const obstacleEmojis = {
  shark: "🦈",
  whale: "🐋", 
  octopus: "🐙",
  rock: "🪨",
  jellyfish: "🪼",
  whirlpool: "🌀",
  crate: "📦",
  seaweed: "🌿",
};

const obstacleColors = {
  shark: "bg-gradient-to-r from-red-600 to-red-800",
  whale: "bg-gradient-to-r from-blue-700 to-blue-900",
  octopus: "bg-gradient-to-r from-purple-600 to-purple-800",
  rock: "bg-gradient-to-r from-gray-600 to-gray-800",
  jellyfish: "bg-gradient-to-r from-pink-400 to-pink-600",
  whirlpool: "bg-gradient-to-r from-cyan-500 to-blue-600",
  crate: "bg-gradient-to-r from-amber-600 to-amber-800",
  seaweed: "bg-gradient-to-r from-green-500 to-green-700",
};

const obstacleShadows = {
  shark: "shadow-lg shadow-red-500/50",
  whale: "shadow-lg shadow-blue-500/50",
  octopus: "shadow-lg shadow-purple-500/50", 
  rock: "shadow-lg shadow-gray-500/50",
  jellyfish: "shadow-lg shadow-pink-500/50",
  whirlpool: "shadow-lg shadow-cyan-500/50",
  crate: "shadow-lg shadow-amber-500/50",
  seaweed: "shadow-lg shadow-green-500/50",
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  // Enhanced: “real” rock look
  const isRock = obstacle.type === "rock";
  let rotationAngle = isRock
    ? Math.sin(Date.now() * 0.003) * 6
    : Math.sin(Date.now() * 0.005) * 10;

  let scaleTransform = "scale(1)";
  if (obstacle.type === "whale" && obstacle.jumping) {
    scaleTransform = "scale(1.2)";
    rotationAngle += Math.sin(Date.now() * 0.01) * 20;
  }

  if (obstacle.type === "whirlpool") {
    rotationAngle = (Date.now() * 0.01) % 360;
  }

  const showWarning = obstacle.warning && obstacle.x > 800;

  if (isRock) {
    // Rock with more realistic style: shadow, texture, speckles
    return (
      <div
        className="absolute rounded-xl border-2 border-neutral-800/30 flex items-center justify-center"
        style={{
          left: obstacle.x,
          top: obstacle.y,
          width: 84,
          height: 62,
          transform: `rotate(${rotationAngle}deg) scale(1.06)`,
        }}
      >
        {/* Rock shape with gradient and little crags */}
        <span
          className="absolute left-0 top-0 w-full h-full rounded-[30%] shadow-2xl border border-gray-600/30"
          style={{
            background:
              "radial-gradient(ellipse farthest-corner at 55% 40%, #c2c2bd 60%, #989287 100%)",
            boxShadow:
              "0 6px 24px #756d5c66, 0 1px 0 #ede6d799",
          }}
        ></span>
        {/* Texture speckles */}
        <span className="absolute left-8 top-6 w-2 h-2 bg-gray-400/70 rounded-full opacity-60"></span>
        <span className="absolute left-12 top-12 w-1.5 h-1.5 bg-gray-600/70 rounded-full opacity-55"></span>
        <span className="absolute left-7 top-17 w-2.5 h-1.5 bg-gray-500/50 rounded-full rotate-12"></span>
        {/* Rock emoji overlay for fallback */}
        <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-80 pointer-events-none">🪨</span>
        {/* Underwater shadow */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/30 opacity-50 rounded-full blur-sm z-0" />
        {showWarning && (
          <>
            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-yellow-400/60 rounded-full animate-ping" />
            <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-yellow-300/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 w-8 h-8 border-2 border-yellow-200/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          </>
        )}
      </div>
    );
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
      {obstacle.type !== "rock" && obstacle.type !== "crate" && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-1 bg-white/30 rounded-full animate-pulse" />
      )}
      
      {/* Warning ripples for levels 1-4 */}
      {showWarning && (
        <>
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-yellow-400/60 rounded-full animate-ping" />
          <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-yellow-300/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 w-8 h-8 border-2 border-yellow-200/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
        </>
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
