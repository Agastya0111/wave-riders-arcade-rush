
import type { ObstacleType } from "./Game.d";

interface ObstacleProps {
  obstacle: ObstacleType;
}

const getObstacleStyle = (type: string) => {
  // Custom color/gradient for each obstacle for "real" effect
  switch (type) {
    case "shark":
      return {
        background: "linear-gradient(135deg, #323c49 65%, #586173 100%)",
        border: "2px solid #22303a",
        shadow: "0 8px 28px #1b243333, 0 1px 0 #cbcfd799",
      };
    case "whale":
      return {
        background: "linear-gradient(135deg, #405c7c 60%, #86a6ba 100%)",
        border: "2.5px solid #273852",
        shadow: "0 6px 22px #5373b26a, 0 1px 0 #abbbcd74",
      };
    case "octopus":
      return {
        background: "radial-gradient(ellipse at 60% 50%, #a66bc5 60%, #723c9b 100%)",
        border: "2.5px solid #78499b",
        shadow: "0 6px 22px #984ca565",
      };
    case "rock":
      return {
        background: "radial-gradient(ellipse farthest-corner at 55% 40%, #c2c2bd 60%, #989287 100%)",
        border: "2px solid #817a71",
        shadow: "0 6px 24px #756d5c66, 0 1px 0 #ede6d799",
      };
    case "jellyfish":
      return {
        background: "linear-gradient(180deg, #ffd3ec 40%, #ad80ff 100%)",
        border: "2px solid #ae74ad",
        shadow: "0 4px 14px #fbb6ea6d",
      };
    case "whirlpool":
      return {
        background: "conic-gradient(from 90deg at 55% 50%, #70d5ff 0deg, #0a51d8 360deg)",
        border: "2.5px solid #459cc9",
        shadow: "0 6px 26px #41c6f633, 0 1px 0 #38a8c974",
      };
    case "crate":
      return {
        background: "repeating-linear-gradient(135deg, #996633 0px, #c69c6d 18px, #a67c52 24px, #996633 40px)",
        border: "2.5px solid #7d5b2a",
        shadow: "0 4px 14px #ae864a66",
      };
    case "seaweed":
      return {
        background: "linear-gradient(90deg, #169a4b 60%, #7acc79 100%)",
        border: "2.5px solid #0e5c24",
        shadow: "0 6px 16px #3df78b2b",
      };
    default:
      return {
        background: "#eee",
        border: "2px solid #bbb",
        shadow: "0 2px 10px #aaa4",
      };
  }
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  let { background, border, shadow } = getObstacleStyle(obstacle.type);
  let rotationAngle = 0;
  let scaleTransform = "scale(1)";

  // Animate rotation for whirlpool, octopus; jump whales, wiggle shark
  if (obstacle.type === "whale" && obstacle.jumping) {
    scaleTransform = "scale(1.2)";
    rotationAngle = Math.sin(Date.now() * 0.01) * 20;
  } else if (obstacle.type === "shark") {
    rotationAngle = Math.sin(Date.now() * 0.002) * 6;
  } else if (obstacle.type === "octopus") {
    rotationAngle = Math.sin(Date.now() * 0.004) * 8;
  } else if (obstacle.type === "whirlpool") {
    rotationAngle = (Date.now() * 0.01) % 360;
  } else {
    rotationAngle = Math.sin(Date.now() * 0.003) * 4;
  }

  const showWarning = obstacle.warning && obstacle.x > 800;

  // "Real" drawings per obstacle type
  return (
    <div
      className="absolute rounded-xl flex items-center justify-center"
      style={{
        left: obstacle.x,
        top: obstacle.y,
        width: 84,
        height: 62,
        background,
        border,
        boxShadow: shadow,
        transform: `rotate(${rotationAngle}deg) ${scaleTransform}`,
      }}
    >
      {/* --- Obstacle shape details per type --- */}
      {obstacle.type === "shark" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Shark body */}
          <div className="absolute left-2 top-6 w-12 h-7 bg-gradient-to-b from-[#54667e] to-[#30475d] rounded-full rotate-12"></div>
          {/* Shark fin */}
          <div className="absolute left-9 top-1 w-8 h-5 bg-[#3e556b] rounded-b-full -rotate-[30deg]"></div>
          {/* Shark tail */}
          <div className="absolute right-0 top-11 w-5 h-4 bg-[#354657] rounded-tr-[100%] rounded-bl-[100%] rotate-12"></div>
          {/* Eye */}
          <div className="absolute left-6 top-10 w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
      )}

      {obstacle.type === "whale" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Whale body */}
          <div className="absolute left-1 top-9 w-14 h-10 bg-gradient-to-r from-blue-400 to-blue-900 rounded-full"></div>
          {/* Whale belly */}
          <div className="absolute left-3 top-15 w-8 h-4 bg-gray-50/70 rounded-full"></div>
          {/* Whale tail */}
          <div className="absolute right-2 top-25 w-3 h-8 bg-blue-700 rounded-full rotate-12"></div>
          {/* Eye */}
          <div className="absolute left-7 top-15 w-1 h-1 bg-black rounded-full"></div>
        </div>
      )}

      {obstacle.type === "octopus" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Head */}
          <div className="absolute top-7 left-8 w-10 h-9 bg-gradient-to-b from-fuchsia-400 to-purple-800 rounded-full"></div>
          {/* Tentacles */}
          <div className="absolute left-14 top-14 w-2 h-8 bg-fuchsia-700 rounded-full"></div>
          <div className="absolute left-12 top-17 w-2 h-7 bg-purple-900 rounded-full -rotate-12"></div>
          <div className="absolute left-10 top-18 w-2 h-7 bg-purple-700 rounded-full -rotate-3"></div>
          {/* Eyes */}
          <div className="absolute left-13 top-12 w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute left-16 top-12 w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      )}

      {obstacle.type === "rock" && (
        <div className="relative w-full h-full">
          <span
            className="absolute left-0 top-0 w-full h-full rounded-[30%]"
            style={{
              background: "radial-gradient(ellipse farthest-corner at 55% 40%, #c2c2bd 60%, #989287 100%)",
              boxShadow: "0 6px 24px #756d5c66, 0 1px 0 #ede6d799",
            }}
          ></span>
          {/* Texture speckles */}
          <span className="absolute left-8 top-6 w-2 h-2 bg-gray-400/70 rounded-full opacity-60"></span>
          <span className="absolute left-12 top-12 w-1.5 h-1.5 bg-gray-600/70 rounded-full opacity-55"></span>
          <span className="absolute left-7 top-17 w-2.5 h-1.5 bg-gray-500/50 rounded-full rotate-12"></span>
        </div>
      )}

      {obstacle.type === "jellyfish" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Jellyfish head */}
          <div className="absolute left-10 top-9 w-10 h-7 bg-gradient-to-b from-pink-200 to-pink-500 rounded-full"></div>
          {/* Tentacles */}
          <div className="absolute left-11 top-14 w-1 h-5 bg-fuchsia-300 rounded-b-full"></div>
          <div className="absolute left-14 top-15 w-1 h-5 bg-pink-400 rounded-b-full"></div>
          <div className="absolute left-17 top-14 w-1 h-5 bg-pink-300 rounded-b-full"></div>
        </div>
      )}

      {obstacle.type === "whirlpool" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Whirlpool spiral */}
          <div className="absolute left-8 top-9 w-10 h-10 rounded-full border-4 border-cyan-400/90 animate-spin"></div>
          {/* Whirlpool center */}
          <div className="absolute left-13 top-14 w-2 h-2 bg-cyan-600 rounded-full"></div>
        </div>
      )}

      {obstacle.type === "crate" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Crate face */}
          <div className="absolute left-7 top-13 w-10 h-8 bg-gradient-to-b from-amber-700 to-yellow-300 rounded-[12%] border-2 border-amber-700"></div>
          {/* Crate lines */}
          <div className="absolute left-14 top-13 w-0.5 h-8 bg-amber-900"></div>
          <div className="absolute left-10 top-16 w-6 h-0.5 bg-amber-900"></div>
        </div>
      )}

      {obstacle.type === "seaweed" && (
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {/* Seaweed leaves */}
          <div className="absolute left-12 top-10 w-2 h-9 bg-gradient-to-b from-green-400 to-green-700 rounded-full rotate-9"></div>
          <div className="absolute left-14 top-13 w-2 h-6 bg-green-700 rounded-full -rotate-6"></div>
          <div className="absolute left-16 top-16 w-2 h-4 bg-green-800 rounded-full rotate-3"></div>
        </div>
      )}

      {/* Fallback: faded emoji for extra decoration, not main visual */}
      <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-30 pointer-events-none select-none">
        {(() => {
          const e = {
            shark: "🦈",
            whale: "🐋",
            octopus: "🐙",
            rock: "🪨",
            jellyfish: "🪼",
            whirlpool: "🌀",
            crate: "📦",
            seaweed: "🌿",
          } as { [k: string]: string };
          return e[obstacle.type];
        })()}
      </span>

      {/* Underwater shadow for depth */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/25 rounded-full blur-sm z-0" />

      {/* Particle trail for moving obstacles except rock/crate */}
      {obstacle.type !== "rock" && obstacle.type !== "crate" && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-1 bg-white/30 rounded-full animate-pulse" />
      )}

      {/* Danger zone warning ripples */}
      {showWarning && (
        <>
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-yellow-400/60 rounded-full animate-ping" />
          <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-yellow-300/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 w-8 h-8 border-2 border-yellow-200/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
        </>
      )}

      {/* Special effect for jumping whale */}
      {obstacle.type === "whale" && obstacle.jumping && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl animate-bounce z-20">
          ✨
        </div>
      )}
    </div>
  );
};
