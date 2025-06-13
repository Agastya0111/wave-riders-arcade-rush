
interface WRCDisplayProps {
  balance: number;
}

export const WRCDisplay = ({ balance }: WRCDisplayProps) => {
  return (
    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3">
      <div className="flex items-center gap-2 text-white font-bold">
        <span className="text-2xl">🪙</span>
        <span className="text-lg">{balance} WRC</span>
      </div>
    </div>
  );
};
