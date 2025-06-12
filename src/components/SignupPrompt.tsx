
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignupPromptProps {
  onSignup: () => void;
  onContinue: () => void;
}

export const SignupPrompt = ({ onSignup, onContinue }: SignupPromptProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌊</div>
          <CardTitle className="text-2xl text-blue-600">Level Up!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            🌊 Sign up to continue surfing beyond Level 3 and unlock upgrades!
          </p>
          <div className="space-y-3">
            <Button 
              onClick={onSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              🏄‍♂️ Sign Up & Continue
            </Button>
            <Button 
              onClick={onContinue}
              variant="outline"
              className="w-full text-sm"
            >
              Continue as Guest (Level 3 max)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
