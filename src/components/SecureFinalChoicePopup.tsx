
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SecureFinalChoicePopupProps {
  onChoiceMade: (choice: string, message: string) => void;
}

export const SecureFinalChoicePopup = ({ onChoiceMade }: SecureFinalChoicePopupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { user } = useAuth();

  const handleChoice = async (choice: "revenge" | "forgive") => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");
    
    // Validate choice input
    if (!["revenge", "forgive"].includes(choice)) {
      setError("Invalid choice");
      setIsLoading(false);
      return;
    }
    
    const message = choice === "forgive" 
      ? "You chose forgiveness. Peace prevails."
      : "You chose revenge. Victory is yours... but at what cost?";

    try {
      // Only save to database if user is authenticated
      if (user) {
        // Get username securely from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        const playerName = profile?.username || 'Anonymous Player';
        
        const { error: insertError } = await supabase
          .from('endings')
          .insert({
            player: playerName.substring(0, 50), // Limit length for security
            choice: choice
          });
        
        if (insertError) {
          console.error('Error saving choice:', insertError);
          // Don't block the game flow for database errors
        }
      }
      
      onChoiceMade(choice, message);
    } catch (error) {
      console.error('Error in choice handling:', error);
      // Still allow game to continue even if saving fails
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
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={() => handleChoice("forgive")}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-4 disabled:opacity-50"
            >
              💚 FORGIVE
              <br />
              <span className="text-sm">Show mercy and rebuild trust</span>
            </Button>
            
            <Button 
              onClick={() => handleChoice("revenge")}
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-4 disabled:opacity-50"
            >
              ⚔️ REVENGE
              <br />
              <span className="text-sm">Take back what's yours</span>
            </Button>
          </div>
          
          {isLoading && (
            <p className="text-sm text-gray-600 mt-4">
              Making your choice...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
