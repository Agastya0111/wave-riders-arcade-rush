
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWRCSystem } from "@/hooks/useWRCSystem";

interface ShopDialogProps {
  wrcBalance: number;
  onBuyShield: () => Promise<boolean>;
  onBuySword: () => Promise<boolean>;
  onClose: () => void;
}

export const ShopDialog = ({ wrcBalance, onBuyShield, onBuySword, onClose }: ShopDialogProps) => {
  const [message, setMessage] = useState("");

  const handleBuyShield = async () => {
    if (wrcBalance < 50) {
      setMessage("Not enough WRC. Earn more to buy.");
      return;
    }
    const success = await onBuyShield();
    if (success) {
      setMessage("Shield purchased!");
      setTimeout(onClose, 1000);
    }
  };

  const handleBuySword = async () => {
    if (wrcBalance < 100) {
      setMessage("Not enough WRC. Earn more to buy.");
      return;
    }
    const success = await onBuySword();
    if (success) {
      setMessage("Sword purchased!");
      setTimeout(onClose, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">🛒 Shop</h2>
        
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
              >
                Buy
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
              >
                Buy
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg text-center text-blue-800">
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
