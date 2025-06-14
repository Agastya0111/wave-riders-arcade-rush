
import React from "react";

// Add Tailwind/utility keyframes for custom sea/wave animation
const wave1Anim = {
  animation: 'moveWave1 13s linear infinite alternate',
};
const wave2Anim = {
  animation: 'moveWave2 21s linear infinite alternate',
};

export const GameBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Deep ocean gradient */}
      <div className="absolute w-full h-full bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-900" />

      {/* Animated Sunlight rays */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(105deg, rgba(255,255,210,0.10) 0px, rgba(255,255,230,0.09) 18px, transparent 32px, transparent 57px)',
          animation: 'raysMove 7s ease-in-out infinite alternate'
        }}
      />

      {/* Caustic water lights */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div
          className="absolute w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 53%, rgba(61, 201, 255, 0.18) 0%, transparent 38%),
                              radial-gradient(circle at 65% 33%, rgba(69, 219, 255, 0.12) 0%, transparent 41%),
                              radial-gradient(circle at 83% 84%, rgba(159, 237, 253, 0.16) 0%, transparent 36%)`,
            animation: 'caustics 10s ease-in-out infinite alternate'
          }}
        />
      </div>

      {/* Animated wave layers */}
      <div
        className="absolute w-[200vw] h-48 rounded-b-full z-10"
        style={{
          top: '17%',
          left: '-50vw',
          background: 'linear-gradient(to bottom, #bee9eb 70%, rgba(190,233,235,0.0) 96%)',
          boxShadow: '0 70px 130px 25px #83c5eaff',
          opacity: 0.26,
          ...wave1Anim,
        }}
      />
      <div
        className="absolute w-[140vw] h-40 left-[-20vw] bottom-[7%] rounded-b-full z-10"
        style={{
          background: 'linear-gradient(110deg, #b6e0fe 42%, #97c6e3a8 100%)',
          boxShadow: '0 16px 52px 6px #74c0eb88',
          opacity: 0.28,
          ...wave2Anim,
        }}
      />

      {/* Shimmering surface layer */}
      <div className="absolute w-full h-16 top-[13%] left-0 bg-gradient-to-b from-cyan-100/60 to-blue-300/0 z-30 pointer-events-none"
        style={{
          filter: 'blur(2.5px)',
          opacity: 0.7,
          animation: "surfaceShimmer 9s linear infinite",
        }}
      />

      {/* Foam and rising bubbles */}
      <div className="absolute inset-0 opacity-23 pointer-events-none z-20">
        {Array.from({ length: 21 }, (_, i) => (
          <div
            key={i}
            className={`absolute bg-white/80 rounded-full animate-pulse`}
            style={{
              width: i % 3 === 0 ? 15 : i % 3 === 1 ? 9 : 6,
              height: i % 3 === 0 ? 15 : i % 3 === 1 ? 9 : 6,
              left: `${9 + Math.random() * 81}%`,
              top: `${Math.random() * 92}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3.5}s`,
              opacity: 0.28 + Math.random() * 0.25
            }}
          />
        ))}
      </div>
      {/* Floating sea particles */}
      <div className="absolute inset-0 opacity-17 pointer-events-none z-20">
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-200 rounded-full"
            style={{
              width: 6 + Math.random() * 7,
              height: 6 + Math.random() * 7,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float${(i % 3) + 1} ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3.5}s`
            }}
          />
        ))}
      </div>
      {/* Water ripples */}
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

      {/* Keyframes for wave movement & shimmer (Tailwind limitation workaround) */}
      <style>
        {`
          @keyframes moveWave1 {
            0% { transform: translateX(0) scaleY(1);}
            100% { transform: translateX(70px) scaleY(1.04);}
          }
          @keyframes moveWave2 {
            0% { transform: translateX(0) scaleY(1);}
            100% { transform: translateX(-38px) scaleY(1.02);}
          }
          @keyframes surfaceShimmer {
            0% { filter: blur(2.5px) brightness(1);}
            60% { filter: blur(3.2px) brightness(1.10);}
            100% { filter: blur(2.2px) brightness(1);}
          }
          @keyframes raysMove {
            0% { background-position: 0 0;}
            100% { background-position: 35px 9px;}
          }
          @keyframes caustics {
            0% { opacity: 0.24;}
            50% { opacity: 0.44;}
            100% { opacity: 0.28;}
          }
        `}
      </style>
    </div>
  );
};
