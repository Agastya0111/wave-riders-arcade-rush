
export const GameBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Deep ocean gradient with better colors */}
      <div className="absolute w-full h-full bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-800" />
      
      {/* Animated caustic light patterns */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-cyan-200/40 to-transparent"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34, 211, 238, 0.3) 0%, transparent 30%),
                             radial-gradient(circle at 60% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 40%),
                             radial-gradient(circle at 80% 80%, rgba(147, 197, 253, 0.3) 0%, transparent 35%)`,
            animation: 'caustics 8s ease-in-out infinite alternate'
          }}
        />
      </div>
      
      {/* Animated wave layers with better depth */}
      <div 
        className="absolute w-[150%] h-40 bg-gradient-to-r from-blue-300/80 to-cyan-300/70 wave1" 
        style={{ 
          bottom: '0%', 
          left: '-25%',
          clipPath: 'polygon(0 40px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      <div 
        className="absolute w-[150%] h-32 bg-gradient-to-r from-blue-200/70 to-cyan-200/60 wave2" 
        style={{ 
          bottom: '8%', 
          left: '-30%',
          clipPath: 'polygon(0 30px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      <div 
        className="absolute w-[150%] h-24 bg-gradient-to-r from-white/60 to-cyan-100/50 wave3" 
        style={{ 
          bottom: '15%', 
          left: '-20%',
          clipPath: 'polygon(0 20px, 100% 0px, 100% 100%, 0% 100%)',
        }} 
      />
      
      {/* Enhanced foam and bubbles with varied sizes */}
      <div className="absolute inset-0 opacity-25">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute bg-white rounded-full animate-pulse ${
              i % 3 === 0 ? 'w-3 h-3' : i % 3 === 1 ? 'w-2 h-2' : 'w-1 h-1'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Floating particles for depth */}
      <div className="absolute inset-0 opacity-15">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float${(i % 3) + 1} ${4 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Sunlight rays from above */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-yellow-200/20 via-cyan-200/10 to-transparent opacity-60" />
      
      {/* Dynamic water ripples */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-cyan-300 rounded-full animate-ping"
          style={{ animationDuration: '4s' }}
        />
        <div 
          className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-blue-300 rounded-full animate-ping"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        />
      </div>
    </div>
  );
};
