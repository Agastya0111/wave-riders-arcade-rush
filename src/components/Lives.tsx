
interface LivesProps {
  lives: number;
}

export const Lives = ({ lives }: LivesProps) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2">
      {Array.from({ length: 3 }, (_, i) => (
        <div 
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            i < lives ? 'bg-red-500' : 'bg-gray-400'
          } shadow-lg`}
        >
          <span className="text-lg">❤️</span>
        </div>
      ))}
    </div>
  );
};
