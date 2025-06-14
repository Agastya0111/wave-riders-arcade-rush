
import React from "react";
import { Button } from "@/components/ui/button";

interface ReplayOverlayProps {
  onReplay: () => void;
  visible: boolean;
}

export const ReplayOverlay = ({ onReplay, visible }: ReplayOverlayProps) => {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-[200] bg-black/60 flex flex-col items-center justify-center">
      <div className="bg-white/80 p-8 rounded-2xl shadow-lg mb-6">
        <span className="text-2xl font-bold block mb-2">Relive the Action!</span>
        <span className="text-md block mb-4">Watch your last awesome moment.</span>
        <Button onClick={onReplay}>Play Replay</Button>
      </div>
    </div>
  );
};
