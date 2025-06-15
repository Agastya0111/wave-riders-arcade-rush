
import React from "react";
import { Flame } from "lucide-react";

export const UserStreakBadge = ({ streak }: { streak: number }) => {
  if (!streak) return null;
  return (
    <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-lg mb-2">
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="font-semibold text-orange-700">{streak}-day streak</span>
    </div>
  );
};
