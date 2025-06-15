
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fetch and return the top 10 teams by member count (and quest completions as secondary)
export function useTeamLeaderboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`id, name, description, leader_id, team_members(count), team_quests(count)`)
        .order('team_members.count', { ascending: false })
        .limit(10);
      if (error) {
        setTeams([]);
      } else {
        setTeams(data || []);
      }
      setLoading(false);
    })();
  }, []);

  return { teams, loading };
}
