
import React from "react";

export interface Challenge {
  text: string;
  completed: boolean;
}

interface ChallengeBannerProps {
  challenge: Challenge;
}

export const ChallengeBanner = ({ challenge }: ChallengeBannerProps) => {
  return (
    <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 z-[65] 
      ${challenge.completed ? "bg-green-500" : "bg-blue-600"} 
      text-white px-6 py-2 rounded-full shadow-xl font-bold animate-fade-in`}>
      {challenge.completed ? "Challenge Complete!" : challenge.text}
    </div>
  );
};
