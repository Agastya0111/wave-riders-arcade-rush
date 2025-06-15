
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Shows top 10 teams by member count and quest completions
export const TeamLeaderboard = () => {
  const [teams, setTeams] = useState<any[]>([]);
  useEffect(() => {
    // Query teams, join members count and quest completion
    (async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, description, leader_id, team_members(count), team_quests(count)")
        .order("team_members.count", { ascending: false })
        .limit(10);

      if (data) setTeams(data);
    })();
  }, []);
  return (
    <Card className="bg-purple-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {teams.map((t: any, idx) => (
            <li key={t.id} className="flex items-center justify-between px-2 py-1 bg-white rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{idx + 1}.</span>
                <span>{t.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span title="Members"><Users className="w-4 h-4 inline" /> {t.team_members?.length || 0}</span>
                <span title="Quests">🏆 {t.team_quests?.length || 0}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
