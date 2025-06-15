
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Encapsulates all quest handling for a team
export function useTeamQuests(teamId: string | null, userId: string | null) {
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const [questTypes, setQuestTypes] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available quest templates
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('quest_types').select('*');
      setQuestTypes(data || []);
    })();
  }, []);

  // fetch active quest
  useEffect(() => {
    if (!teamId) return setActiveQuest(null);
    (async () => {
      setLoading(true);
      const { data: quest, error } = await supabase
        .from('team_quests')
        .select('*, quest_types(*)')
        .eq('team_id', teamId)
        .eq('active', true)
        .order('started_at', { ascending: false })
        .maybeSingle();
      setActiveQuest(quest);
      setLoading(false);
    })();
  }, [teamId]);

  // fetch quest participants
  useEffect(() => {
    if (!activeQuest) return setParticipants([]);
    (async () => {
      const { data, error } = await supabase
        .from('team_quest_participants')
        .select('*, profiles(username)')
        .eq('team_quest_id', activeQuest.id);
      setParticipants(data || []);
    })();
  }, [activeQuest?.id]);

  // Start new quest (leader only)
  const startQuest = async (questTypeId: string) => {
    if (!teamId) return;
    setLoading(true);
    await supabase.from('team_quests').insert({
      team_id: teamId,
      quest_type_id: questTypeId,
      active: true,
    });
    setLoading(false);
    // Re-fetch quest for live update
    const { data: quest, error } = await supabase
      .from('team_quests')
      .select('*, quest_types(*)')
      .eq('team_id', teamId)
      .eq('active', true)
      .order('started_at', { ascending: false })
      .maybeSingle();
    setActiveQuest(quest);
  };

  // Join quest as participant
  const joinQuest = async () => {
    if (!userId || !activeQuest?.id) return;
    await supabase.from('team_quest_participants').insert({
      team_quest_id: activeQuest.id,
      user_id: userId,
    });
    // Re-fetch participants for live update
    const { data, error } = await supabase
      .from('team_quest_participants')
      .select('*, profiles(username)')
      .eq('team_quest_id', activeQuest.id);
    setParticipants(data || []);
  };

  return { activeQuest, questTypes, participants, loading, startQuest, joinQuest };
}
