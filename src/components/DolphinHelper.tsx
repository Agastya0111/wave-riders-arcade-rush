
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DolphinHelperProps {
  onUse: () => void;
}

export const DolphinHelper = ({ onUse }: DolphinHelperProps) => {
  const [uses, setUses] = useState(3);
  const [isUsed, setIsUsed] = useState(false);

  const handleUse = () => {
    if (uses > 0 && !isUsed) {
      setUses(prev => prev - 1);
      setIsUsed(true);
      onUse();
      
      // Clear obstacles temporarily
      setTimeout(() => {
        setIsUsed(false);
      }, 3000);
    }
  };

  if (uses === 0) return null;

  return (
    <div className="absolute bottom-4 right-4">
      <Button
        onClick={handleUse}
        disabled={isUsed}
        className={`w-16 h-16 rounded-full text-2xl ${
          isUsed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        🐬
        <span className="text-xs block">{uses}</span>
      </Button>
    </div>
  );
};
