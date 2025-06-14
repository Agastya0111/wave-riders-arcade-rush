
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShopDialogProps {
  wrcBalance: number;
  onBuyShield: () => Promise<{ success: boolean; message: string }>;
  onBuySword: () => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const ShopDialog = ({ wrcBalance, onBuyShield, onBuySword, onClose }: ShopDialogProps) => {
  const [message, setMessage] = useState("");

  const handleBuyShield = async () => {
    const result = await onBuyShield();
    setMessage(result.message);
    if (result.success) {
      setTimeout(onClose, 1500);
    }
  };

  const handleBuySword = async () => {
    const result = await onBuySword();
    setMessage(result.message);
    if (result.success) {
      setTimeout(onClose, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">🛒 Shop</h2>
        
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-bold">
            <span className="text-2xl">💰</span>
            <span>{wrcBalance} WRC</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <div className="font-bold">Shield</div>
                <div className="text-sm text-gray-600">Blocks one obstacle</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">50 WRC</div>
              <Button 
                onClick={handleBuyShield}
                disabled={wrcBalance < 50}
                size="sm"
                className={wrcBalance < 50 ? "bg-gray-400 cursor-not-allowed" : ""}
              >
                {wrcBalance < 50 ? "Not enough WRC" : "Buy"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <div>
                <div className="font-bold">Sword</div>
                <div className="text-sm text-gray-600">Destroys 3 obstacles</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">100 WRC</div>
              <Button 
                onClick={handleBuySword}
                disabled={wrcBalance < 100}
                size="sm"
                className={wrcBalance < 100 ? "bg-gray-400 cursor-not-allowed" : ""}
              >
                {wrcBalance < 100 ? "Not enough WRC" : "Buy"}
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes("Not enough") || message.includes("failed") 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
