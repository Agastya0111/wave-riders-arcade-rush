import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ChoiceResultPopupProps {
  choice: string;
  message: string;
  onContinue: () => void;
}

export const ChoiceResultPopup = ({ choice, message, onContinue }: ChoiceResultPopupProps) => {
  const isForgivenessPath = choice === "forgive";
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl max-w-md">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">
            {isForgivenessPath ? "🕊️" : "⚔️"}
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${isForgivenessPath ? "text-green-600" : "text-red-600"}`}>
            {isForgivenessPath ? "PEACE" : "VICTORY"}
          </h2>
          <p className="text-lg mb-6 text-gray-800">
            {message}
          </p>
          <Button 
            onClick={onContinue}
            className={`w-full text-white text-lg py-3 ${
              isForgivenessPath 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Continue to Victory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};