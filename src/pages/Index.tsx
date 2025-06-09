
import { useState } from "react";
import { AvatarSelection } from "@/components/AvatarSelection";
import { Game } from "@/components/Game";

export type Avatar = "boy" | "girl" | "robot" | "shark" | "alien";

const Index = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  if (!selectedAvatar) {
    return <AvatarSelection onSelect={setSelectedAvatar} />;
  }

  return <Game avatar={selectedAvatar} onRestart={() => setSelectedAvatar(null)} />;
};

export default Index;
