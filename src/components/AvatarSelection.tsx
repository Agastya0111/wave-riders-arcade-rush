
import { Avatar } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AvatarSelectionProps {
  onSelect: (avatar: Avatar) => void;
}

const avatars: { id: Avatar; emoji: string; name: string; color: string }[] = [
  { id: "boy", emoji: "🏄‍♂️", name: "Wave Boy", color: "bg-blue-500" },
  { id: "girl", emoji: "🏄‍♀️", name: "Wave Girl", color: "bg-pink-500" },
  { id: "robot", emoji: "🤖", name: "Robo Rider", color: "bg-purple-500" },
  { id: "shark", emoji: "🦈", name: "Shark Rider", color: "bg-gray-500" },
  { id: "alien", emoji: "👽", name: "Alien Rider", color: "bg-green-500" },
];

export const AvatarSelection = ({ onSelect }: AvatarSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🌊 WAVE RIDERS 🏄
        </h1>
        <p className="text-2xl text-white mb-8 drop-shadow">
          Choose Your Riding Avatar!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl">
          {avatars.map((avatar) => (
            <Card 
              key={avatar.id} 
              className="hover:scale-105 transition-transform cursor-pointer bg-white/90 backdrop-blur"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-20 h-20 ${avatar.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-4xl">{avatar.emoji}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{avatar.name}</h3>
                <Button 
                  onClick={() => onSelect(avatar.id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Choose Me!
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
