
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Avatar } from "@/pages/Index";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestMode: () => void;
}

export const AuthPage = ({ onAuthSuccess, onGuestMode }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("boy");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const avatars: { type: Avatar; emoji: string; label: string }[] = [
    { type: "boy", emoji: "🧒", label: "Boy" },
    { type: "girl", emoji: "👧", label: "Girl" },
    { type: "robot", emoji: "🤖", label: "Robot" },
    { type: "shark", emoji: "🦈", label: "Shark" },
    { type: "alien", emoji: "👽", label: "Alien" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        onAuthSuccess();
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username,
              avatar: selectedAvatar,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌊</div>
          <CardTitle className="text-2xl text-blue-600">
            {isLogin ? "Welcome Back!" : "Join the Adventure!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Your display name"
                    maxLength={20}
                  />
                </div>

                <div>
                  <Label>Choose Your Avatar</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.type}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.type)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAvatar === avatar.type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl">{avatar.emoji}</div>
                        <div className="text-xs mt-1">{avatar.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
            
            <div className="mt-4">
              <Button
                onClick={onGuestMode}
                variant="outline"
                className="w-full"
              >
                Play as Guest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
