import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  created_at: string;
  member_count?: number; // Optional: to be populated by a join or separate query
  leader_username?: string; // Optional
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  joined_at: string;
  profile?: { username: string }; // For displaying member names
}

export const useTeam = () => {
  const { user } = useAuth();
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [userTeamMembers, setUserTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAllTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all teams and their member counts
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          profiles ( username ),
          team_members ( count )
        `)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;
      
      const formattedTeams = teamsData.map(team => ({
        ...team,
        leader_username: team.profiles?.username || 'Unknown',
        // @ts-ignore
        member_count: team.team_members[0]?.count || 0,
      }));
      setAllTeams(formattedTeams);

    } catch (e) {
      setError(e);
      console.error("Error fetching all teams:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserTeam = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUserTeam(null);
      setUserTeamMembers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Check if user is part of a team
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', currentUser.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') { // PGRST116: single row not found
         throw memberError;
      }

      if (memberData) {
        // User is in a team, fetch team details
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select(`
            *,
            profiles ( username ) 
          `)
          .eq('id', memberData.team_id)
          .single();
        if (teamError) throw teamError;

        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            *,
            profiles ( username )
          `)
          .eq('team_id', memberData.team_id);
        if (membersError) throw membersError;
        
        const formattedTeam = {
          ...teamData,
          leader_username: teamData.profiles?.username || 'Unknown',
        }

        setUserTeam(formattedTeam as Team);
        setUserTeamMembers(membersData as TeamMember[]);
      } else {
        setUserTeam(null);
        setUserTeamMembers([]);
      }
    } catch (e) {
      setError(e);
      console.error("Error fetching user team:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeam = async (name: string, description: string | null) => {
    if (!user) throw new Error("User must be logged in to create a team.");
    // Frontend validation for security and better UX
    if (name.length > 50) {
      setError({ message: "Team name too long (max 50 characters)." });
      return null;
    }
    if (description && description.length > 200) {
      setError({ message: "Description too long (max 200 characters)." });
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ name, description, leader_id: user.id })
        .select()
        .single();
      if (teamError) throw teamError;

      // Automatically add leader as a member (DB trigger might handle this, but explicit is safer)
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({ team_id: teamData.id, user_id: user.id });
      if (memberError) {
        // Attempt to clean up created team if member insert fails
        await supabase.from('teams').delete().eq('id', teamData.id);
        throw memberError;
      }
      
      await fetchAllTeams(); // Refresh all teams list
      await fetchUserTeam(user); // Refresh user's team status
      return teamData;
    } catch (e) {
      setError(e);
      console.error("Error creating team:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) throw new Error("User must be logged in to join a team.");
    setIsLoading(true);
    setError(null);
    try {
      // Check if user is already in a team using the DB function
      const { data: isInTeamData, error: isInTeamError } = await supabase.rpc('is_user_in_team', { p_user_id: user.id });
      if (isInTeamError) throw isInTeamError;
      if (isInTeamData) {
        throw new Error("User is already in a team.");
      }

      const { error: joinError } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: user.id });
      if (joinError) throw joinError;
      
      await fetchAllTeams();
      await fetchUserTeam(user);
      return true;
    } catch (e) {
      setError(e);
      console.error("Error joining team:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!user || !userTeam) throw new Error("User must be in a team to leave.");
    setIsLoading(true);
    setError(null);
    try {
      if (userTeam.leader_id === user.id) {
         // Check if there are other members
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', userTeam.id);
        
        if (membersError) throw membersError;

        if (members && members.length > 1) {
          throw new Error("Leaders cannot leave a team with other members. Please transfer leadership or remove members first.");
        }
        // If leader is the only member, they can leave (which effectively deletes the team due to cascade)
      }

      const { error: leaveError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', userTeam.id);
      if (leaveError) throw leaveError;

      // If the leader leaves and is the last member, the team should be deleted by cascade constraint.
      // Or handle team deletion explicitly if leader leaves.
      if (userTeam.leader_id === user.id) {
          const { error: deleteTeamError } = await supabase
            .from('teams')
            .delete()
            .eq('id', userTeam.id);
          if (deleteTeamError) console.error("Error deleting team after leader left:", deleteTeamError);
      }
      
      await fetchAllTeams();
      await fetchUserTeam(user); // This will set userTeam to null
      return true;
    } catch (e) {
      setError(e);
      console.error("Error leaving team:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch for user's team
  useEffect(() => {
    if (user) {
      fetchUserTeam(user);
    } else {
      // Clear team data if user logs out
      setUserTeam(null);
      setUserTeamMembers([]);
      setAllTeams([]); // Optionally clear all teams or keep them cached
    }
  }, [user, fetchUserTeam]);


  return {
    allTeams,
    userTeam,
    userTeamMembers,
    isLoading,
    error,
    fetchAllTeams,
    fetchUserTeam,
    createTeam,
    joinTeam,
    leaveTeam,
  };
};

