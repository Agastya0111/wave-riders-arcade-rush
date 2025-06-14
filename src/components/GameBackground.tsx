
import React from "react";

export const GameBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Realistic deep ocean gradient */}
      <div className="absolute w-full h-full bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-900" />

      {/* Sunlight rays - more concentrated and realistic */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none" style={{
        background: 'repeating-linear-gradient(105deg, rgba(255,255,210,0.10) 0px, rgba(255,255,230,0.09) 18px, transparent 32px, transparent 57px)'
      }} />
      {/* Animated caustic light effect */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div 
          className="absolute w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 53%, rgba(61, 201, 255, 0.20) 0%, transparent 38%),
                              radial-gradient(circle at 65% 33%, rgba(69, 219, 255, 0.15) 0%, transparent 41%),
                              radial-gradient(circle at 83% 84%, rgba(159, 237, 253, 0.20) 0%, transparent 36%)`,
            animation: 'caustics 9s ease-in-out infinite alternate'
          }}
        />
      </div>
      {/* New: More realistic wave layers */}
      <div 
        className="absolute w-[200vw] h-48 rounded-b-full z-10"
        style={{
          top: '17%',
          left: '-50vw',
          background: 'linear-gradient(to bottom, #bee9eb 70%, rgba(190,233,235,0.0) 96%)',
          boxShadow: '0 70px 130px 25px #83c5eaff',
          opacity: 0.22,
          animation: 'wave1 7.8s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute w-[140vw] h-40 left-[-20vw] bottom-[7%] rounded-b-full z-10"
        style={{
          background: 'linear-gradient(110deg, #b6e0fe 42%, #97c6e3a8 100%)',
          boxShadow: '0 16px 52px 6px #74c0eb88',
          opacity: 0.23,
          animation: 'wave2 11s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute w-full h-28 bottom-0 left-0 bg-gradient-to-b from-cyan-100/60 to-blue-300/0 z-20"
        style={{
          filter: 'blur(3px)'
        }}
      />
      {/* Foam and bubbles (random sizes) */}
      <div className="absolute inset-0 opacity-23 pointer-events-none z-20">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute bg-white/80 rounded-full animate-pulse`}
            style={{
              width: i % 3 === 0 ? 14 : i % 3 === 1 ? 8 : 5,
              height: i % 3 === 0 ? 14 : i % 3 === 1 ? 8 : 5,
              left: `${9 + Math.random() * 81}%`,
              top: `${Math.random() * 92}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3.5}s`
            }}
          />
        ))}
      </div>
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-17 pointer-events-none z-20">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-200 rounded-full"
            style={{
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float${(i % 3) + 1} ${4 + Math.random() * 2.5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3.5}s`
            }}
          />
        ))}
      </div>
      {/* Dynamic water ripples */}
      <div className="absolute inset-0 opacity-16 pointer-events-none">
        <div 
          className="absolute top-1/3 left-1/3 w-24 h-24 border-2 border-cyan-200 rounded-full animate-ping"
          style={{ animationDuration: '6s' }}
        />
        <div 
          className="absolute top-4/5 right-2 w-20 h-20 border-2 border-blue-100 rounded-full animate-ping"
          style={{ animationDuration: '7.5s', animationDelay: '1.2s' }}
        />
      </div>
    </div>
  );
};
