
import React, { useEffect, useRef, useState } from "react";

interface WRCDisplayProps {
  balance: number;
}

export const WRCDisplay = ({ balance }: WRCDisplayProps) => {
  const [animate, setAnimate] = useState(false);
  const prevBalance = useRef(balance);

  useEffect(() => {
    if (balance > prevBalance.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);
    }
    prevBalance.current = balance;
  }, [balance]);

  return (
    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 z-[55]">
      <div className="flex items-center gap-2 text-white font-bold">
        <span
          className={`text-2xl transition-all ${
            animate ? "animate-pulse" : ""
          }`}
        >
          🪙
        </span>
        <span className={`text-lg ${animate ? "font-extrabold text-yellow-200" : ""}`}>{balance} WRC</span>
      </div>
    </div>
  );
};
