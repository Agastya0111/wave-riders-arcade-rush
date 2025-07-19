import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FinalChoicePopupProps {
  onChoiceMade: (choice: string, message: string) => void;
}

export const FinalChoicePopup = ({ onChoiceMade }: FinalChoicePopupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleChoice = async (choice: "revenge" | "forgive") => {
    setIsLoading(true);
    
    const message = choice === "forgive" 
      ? "You chose forgiveness. Peace prevails."
      : "You chose revenge. Victory is yours... but at what cost?";

    try {
      // Save choice to Supabase
      const playerName = user?.user_metadata?.username || user?.email || 'Anonymous Player';
      
      await supabase
        .from('endings')
        .insert({
          player: playerName,
          choice: choice
        });
      
      onChoiceMade(choice, message);
    } catch (error) {
      console.error('Error saving choice:', error);
      // Still show the message even if saving fails
      onChoiceMade(choice, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="bg-white/95 backdrop-blur shadow-2xl max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h2 className="text-3xl font-bold text-purple-600 mb-4">THE FINAL CHOICE</h2>
          <p className="text-lg mb-8 text-gray-800">
            You've caught your former friend with the treasure.
            <br /><br />
            They look at you with fear and regret in their eyes.
            <br /><br />
            What do you choose?
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => handleChoice("forgive")}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-4"
            >
              💚 FORGIVE
              <br />
              <span className="text-sm">Show mercy and rebuild trust</span>
            </Button>
            
            <Button 
              onClick={() => handleChoice("revenge")}
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-4"
            >
              ⚔️ REVENGE
              <br />
              <span className="text-sm">Take back what's yours</span>
            </Button>
          </div>
          
          {isLoading && (
            <p className="text-sm text-gray-600 mt-4">
              Saving your choice...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};