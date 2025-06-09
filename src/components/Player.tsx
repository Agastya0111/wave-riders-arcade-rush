
import { Avatar } from "@/pages/Index";

interface PlayerProps {
  avatar: Avatar;
  x: number;
  y: number;
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

export const Player = ({ avatar, x, y }: PlayerProps) => {
  return (
    <div 
      className={`absolute transition-all duration-200 ${avatarColors[avatar]} rounded-full shadow-lg flex items-center justify-center animate-bounce`}
      style={{ 
        left: x, 
        top: y, 
        width: 60, 
        height: 60,
        transform: 'rotate(10deg)'
      }}
    >
      <span className="text-3xl">{avatarEmojis[avatar]}</span>
      <div className="absolute -bottom-2 -right-2 w-8 h-2 bg-white rounded-full opacity-70" />
    </div>
  );
};
