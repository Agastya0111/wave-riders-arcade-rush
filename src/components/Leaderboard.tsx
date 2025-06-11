
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  avatar_type: string;
  score: number;
  level_reached: number;
  duration_seconds: number;
  created_at: string;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const avatarEmojis = {
    boy: "🧒",
    girl: "👧", 
    robot: "🤖",
    shark: "🦈",
    alien: "👽",
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</span>;
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from("leaderboard")
          .select("*")
          .limit(5);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md bg-white/95 backdrop-blur">
        <CardContent className="p-6 text-center">
          <div className="text-blue-600">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl text-blue-600 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top 5 Players
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🎮</div>
            <p>No games played yet!</p>
            <p className="text-sm">Be the first to set a high score!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.username}-${entry.score}-${index}`}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  index === 0 ? "bg-yellow-50 border border-yellow-200" :
                  index === 1 ? "bg-gray-50 border border-gray-200" :
                  index === 2 ? "bg-amber-50 border border-amber-200" :
                  "bg-white border border-gray-100"
                }`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="flex-shrink-0 text-2xl">
                  {avatarEmojis[entry.avatar_type as keyof typeof avatarEmojis] || "🧒"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {entry.username}
                  </div>
                  <div className="text-sm text-gray-600">
                    Level {entry.level_reached} • {formatDuration(entry.duration_seconds)}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="font-bold text-blue-600 text-lg">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
