
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { GamepadIcon, Trophy, Clock, Users } from "lucide-react";

interface UserStatsData {
  games_played: number;
  highest_score: number;
  max_level_reached: number;
  total_time_played: number;
  total_dolphins_used: number;
}

export const UserStats = () => {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (data) {
          const gamesPlayed = data.length;
          const highestScore = Math.max(...data.map(session => session.score), 0);
          const maxLevelReached = Math.max(...data.map(session => session.level_reached), 1);
          const totalTimePlayedSeconds = data.reduce((sum, session) => sum + session.duration_seconds, 0);
          const totalDolphinsUsed = data.reduce((sum, session) => sum + session.dolphins_used, 0);

          setStats({
            games_played: gamesPlayed,
            highest_score: highestScore,
            max_level_reached: maxLevelReached,
            total_time_played: totalTimePlayedSeconds,
            total_dolphins_used: totalDolphinsUsed,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="text-blue-600 mb-4">
            <Users className="w-12 h-12 mx-auto mb-2" />
            <p>Sign in to view your personal stats!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md bg-white/95 backdrop-blur">
        <CardContent className="p-6 text-center">
          <div className="text-blue-600">Loading your stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.games_played === 0) {
    return (
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-xl text-blue-600">My Stats</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <div className="text-4xl mb-2">🎮</div>
          <p className="text-gray-600">No games played yet!</p>
          <p className="text-sm text-gray-500">Start playing to see your statistics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl text-blue-600">My Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <GamepadIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{stats.games_played}</div>
            <div className="text-xs text-gray-600">Games Played</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{stats.highest_score.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Highest Score</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">🏄‍♂️</div>
            <div className="font-bold text-lg">Level {stats.max_level_reached}</div>
            <div className="text-xs text-gray-600">Max Level</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-lg">{formatDuration(stats.total_time_played)}</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>
        
        <div className="mt-4 text-center p-3 bg-cyan-50 rounded-lg">
          <div className="text-3xl mb-1">🐬</div>
          <div className="font-bold text-lg">{stats.total_dolphins_used}</div>
          <div className="text-xs text-gray-600">Dolphins Used</div>
        </div>
      </CardContent>
    </Card>
  );
};
