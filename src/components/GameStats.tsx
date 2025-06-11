
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GamepadIcon, Clock, TrophyIcon } from "lucide-react";

interface GameStatistics {
  total_games_played: number;
  total_players: number;
  average_score: number;
  average_duration_seconds: number;
  highest_score: number;
  most_common_avatar: string;
}

export const GameStats = () => {
  const [stats, setStats] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const avatarEmojis = {
    boy: "🧒",
    girl: "👧", 
    robot: "🤖",
    shark: "🦈",
    alien: "👽",
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("game_statistics")
          .select("*")
          .single();

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error("Error fetching game statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
          <div className="text-blue-600">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl text-blue-600">Game Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <GamepadIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{stats.total_games_played}</div>
            <div className="text-xs text-gray-600">Games Played</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{stats.total_players}</div>
            <div className="text-xs text-gray-600">Total Players</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <TrophyIcon className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{stats.highest_score.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Highest Score</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{formatDuration(stats.average_duration_seconds)}</div>
            <div className="text-xs text-gray-600">Avg Duration</div>
          </div>
        </div>
        
        <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Most Popular Avatar</div>
          <div className="text-3xl">
            {avatarEmojis[stats.most_common_avatar as keyof typeof avatarEmojis] || "🧒"}
          </div>
          <div className="text-xs text-gray-500 capitalize">{stats.most_common_avatar}</div>
        </div>
      </CardContent>
    </Card>
  );
};
