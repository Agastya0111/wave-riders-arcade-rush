
export const GameBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Deep ocean layer */}
      <div className="absolute w-full h-full bg-gradient-to-b from-blue-400 to-blue-800" />
      
      {/* Animated wave layers */}
      <div 
        className="absolute w-[150%] h-32 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-70 animate-pulse wave1" 
        style={{ 
          bottom: '0%', 
          left: '-25%',
          clipPath: 'polygon(0 30px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      <div 
        className="absolute w-[150%] h-24 bg-gradient-to-r from-blue-200 to-cyan-200 opacity-60 wave2" 
        style={{ 
          bottom: '8%', 
          left: '-30%',
          clipPath: 'polygon(0 20px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      <div 
        className="absolute w-[150%] h-20 bg-gradient-to-r from-white to-cyan-100 opacity-50 wave3" 
        style={{ 
          bottom: '15%', 
          left: '-20%',
          clipPath: 'polygon(0 15px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      
      {/* Foam and bubbles */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
