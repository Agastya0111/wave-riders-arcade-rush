
import { Avatar } from "@/pages/Index";
import type { Gear } from "./Game.d";

interface PlayerProps {
  avatar: Avatar;
  x: number;
  y: number;
  gear: Gear;
}

const avatarEmojis: Record<Avatar, string> = {
  boy: "🏄‍♂️",
  girl: "🏄‍♀️", 
  robot: "🤖",
  shark: "🦈",
  alien: "👽",
};

const avatarColors: Record<Avatar, string> = {
  boy: "bg-blue-500",
  girl: "bg-pink-500",
  robot: "bg-purple-500", 
  shark: "bg-gray-500",
  alien: "bg-green-500",
};

const gearEmojis: Record<Gear, string> = {
  surfboard: "🏄",
  bike: "🚴",
  ship: "🚢",
};

const gearColors: Record<Gear, string> = {
  surfboard: "bg-gradient-to-r from-yellow-400 to-orange-500",
  bike: "bg-gradient-to-r from-green-400 to-blue-500", 
  ship: "bg-gradient-to-r from-gray-600 to-gray-800",
};

const gearSizes: Record<Gear, { width: number; height: number }> = {
  surfboard: { width: 60, height: 60 },
  bike: { width: 70, height: 65 },
  ship: { width: 80, height: 70 },
};

export const Player = ({ avatar, x, y, gear }: PlayerProps) => {
  const gearSize = gearSizes[gear];
  
  return (
    <div 
      className={`absolute transition-all duration-300 ${gearColors[gear]} rounded-lg shadow-2xl flex items-center justify-center ${gear === 'surfboard' ? 'animate-bounce' : gear === 'bike' ? 'animate-pulse' : ''}`}
      style={{ 
        left: x, 
        top: y, 
        width: gearSize.width, 
        height: gearSize.height,
        transform: gear === 'surfboard' ? 'rotate(10deg)' : gear === 'ship' ? 'rotate(-5deg)' : 'rotate(5deg)'
      }}
    >
      {/* Gear background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl opacity-80">{gearEmojis[gear]}</span>
      </div>
      
      {/* Avatar on top */}
      <div className={`relative z-10 w-8 h-8 ${avatarColors[avatar]} rounded-full flex items-center justify-center shadow-lg`}>
        <span className="text-lg">{avatarEmojis[avatar]}</span>
      </div>
      
      {/* Wake/trail effect */}
      <div className="absolute -bottom-2 -right-2 w-8 h-2 bg-white rounded-full opacity-70" />
      
      {/* Gear-specific effects */}
      {gear === 'ship' && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-red-500 rounded-sm opacity-80" />
      )}
      
      {gear === 'bike' && (
        <div className="absolute -bottom-1 left-2 w-3 h-3 bg-black rounded-full opacity-60" />
      )}
      
      {gear === 'bike' && (
        <div className="absolute -bottom-1 right-2 w-3 h-3 bg-black rounded-full opacity-60" />
      )}
    </div>
  );
};
