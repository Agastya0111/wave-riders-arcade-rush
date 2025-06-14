
import React from "react";

export const CoinCollectionFeedback = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <div className="animate-bounce text-yellow-400 font-bold text-2xl bg-black/50 px-4 py-2 rounded-lg shadow-2xl border-4 border-yellow-300 relative">
        +1 WRC 🪙
        {/* Confetti Effects */}
        <div className="pointer-events-none absolute left-1/2 top-full flex flex-col items-center space-y-1" style={{ width: 0 }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className="block animate-confetti" style={{
              left: Math.random()*20 - 10, 
              color: ['#FFD700', '#FF6F00', '#FFDE03', '#E1BEE7', '#40C4FF', '#76FF03'][i],
              fontSize: 20,
              position: "relative"
            }}>🎉</span>
          ))}
        </div>
      </div>
    </div>
  );
};
