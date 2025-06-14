
import { Button } from "@/components/ui/button";

interface WCRPopupProps {
  onClose: () => void;
}

export const WCRPopup = ({ onClose }: WCRPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl transform transition-all scale-100 opacity-100">
        <h2 className="text-3xl font-bold mb-4 text-center text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          🌊 Wave Rider Challenge! 🏄
        </h2>
        <p className="text-lg mb-6 text-center">
          You've reached 500 points! An exciting challenge awaits. Get ready to ride the waves like never before!
        </p>
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="default"
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold py-3 px-6 rounded-lg text-lg shadow-md transition-transform hover:scale-105"
          >
            Let's Go!
          </Button>
        </div>
      </div>
    </div>
  );
};

