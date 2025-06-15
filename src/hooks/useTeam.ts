import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Team, TeamMember, TeamJoinLink } from './useTeamTypes';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTeam = () => {
  const { user } = useAuth();
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [userTeamMembers, setUserTeamMembers] = useState<TeamMember[]>([]);
  const [joinLink, setJoinLink] = useState<TeamJoinLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  // Helper to check limits for this user
  const canCreateAnotherTeam = async (userId: string) => {
    const { count, error } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('leader_id', userId);
    if (error) return false; // Fail-safe: prevent excessive creation
    return (count ?? 0) < 5;
  };

  const canJoinAnotherTeam = async (userId: string) => {
    const { count, error } = await supabase
      .from('team_members')
      .select('team_id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) return false;
    return (count ?? 0) < 10;
  };

  // Only fetch team
  const fetchUserTeam = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUserTeam(null);
      setUserTeamMembers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', currentUser.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (memberData) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', memberData.team_id)
          .single();
        if (teamError) throw teamError;

        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            *,
            profiles ( username )
          `)
          .eq('team_id', memberData.team_id);
        if (membersError) throw membersError;

        setUserTeam(teamData as Team);
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
    // CHECK LIMIT
    const canCreate = await canCreateAnotherTeam(user.id);
    if (!canCreate) {
      const msg = "You have reached your maximum of 5 created teams.";
      setError({ message: msg });
      toast({ variant: "destructive", title: "Team Create Limit", description: msg });
      return null;
    }
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
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({ team_id: teamData.id, user_id: user.id });
      if (memberError) {
        await supabase.from('teams').delete().eq('id', teamData.id);
        throw memberError;
      }

      await fetchUserTeam(user);
      return teamData;
    } catch (e) {
      setError(e);
      console.error("Error creating team:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new join link for the leader (expires in 1 hr, unique, one-time use)
  const generateJoinLink = async () => {
    if (!user || !userTeam || userTeam.leader_id !== user.id) return null;
    setIsLoading(true);
    setError(null);
    try {
      // Generate random token
      const token = Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      const { data, error } = await supabase
        .from('team_join_links')
        .insert({
          team_id: userTeam.id,
          token,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      setJoinLink(data as TeamJoinLink);
      return data as TeamJoinLink;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get most recent unused join link for the leader (within 1 hour)
  const fetchActiveJoinLink = useCallback(async () => {
    if (!user || !userTeam || userTeam.leader_id !== user.id) {
      setJoinLink(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const nowISO = new Date().toISOString();
      const { data, error } = await supabase
        .from('team_join_links')
        .select('*')
        .eq('team_id', userTeam.id)
        .eq('used', false)
        .gte('expires_at', nowISO)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setJoinLink(data as TeamJoinLink || null);
    } catch (err) {
      setError(err);
      setJoinLink(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, userTeam]);

  // Use edge function to join via join link token
  const joinViaToken = async (token: string) => {
    if (!user) throw new Error("You must be logged in.");
    // CHECK LIMIT
    const canJoin = await canJoinAnotherTeam(user.id);
    if (!canJoin) {
      const msg = "You have reached your maximum of 10 joined teams.";
      setError({ message: msg });
      toast({ variant: "destructive", title: "Team Join Limit", description: msg });
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/functions/v1/team-join-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          join_token: token,
          user_id: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.error || "Could not join team." });
        toast({ variant: "destructive", title: "Failed to join team", description: data.error });
        return false;
      }
      await fetchUserTeam(user);
      return true;
    } catch (err) {
      setError(err);
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
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', userTeam.id);

        if (membersError) throw membersError;
        if (members && members.length > 1) {
          throw new Error("Leaders cannot leave a team with other members. Please transfer leadership or remove members first.");
        }
      }

      const { error: leaveError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', userTeam.id);
      if (leaveError) throw leaveError;

      if (userTeam.leader_id === user.id) {
        const { error: deleteTeamError } = await supabase
          .from('teams')
          .delete()
          .eq('id', userTeam.id);
        if (deleteTeamError) console.error("Error deleting team after leader left:", deleteTeamError);
      }

      setUserTeam(null);
      setUserTeamMembers([]);
      setJoinLink(null);

      await fetchUserTeam(user);
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTeam(user);
    } else {
      setUserTeam(null);
      setUserTeamMembers([]);
    }
  }, [user, fetchUserTeam]);

  // Fetch or clear join link on team/user change
  useEffect(() => {
    if (userTeam && user && userTeam.leader_id === user.id) {
      fetchActiveJoinLink();
    } else {
      setJoinLink(null);
    }
  }, [userTeam, user, fetchActiveJoinLink]);

  // Add utility hook to get login streak
  const useLoginStreak = (userId: string | null) => {
    const [streak, setStreak] = useState(0);
    useEffect(() => {
      if (!userId) return setStreak(0);
      (async () => {
        const { data, error } = await supabase
          .from('user_logins')
          .select('login_date')
          .eq('user_id', userId)
          .order('login_date', { ascending: false });
        if (error) return setStreak(0);
        // Compute streak
        let expected = new Date();
        let count = 0;
        for (const row of data) {
          const dateStr = row.login_date;
          if (!dateStr) break;
          const d = new Date(dateStr + "T00:00:00");
          if (d.toDateString() === expected.toDateString()) {
            count += 1;
            expected.setDate(expected.getDate() - 1);
          } else if (count === 0 && d < expected && d > expected) {
            continue;
          } else {
            break; // streak broken
          }
        }
        setStreak(count);
      })();
    }, [userId]);
    return streak;
  };

  // Util to mark today as a login
  const useRecordLogin = (userId: string | null) => {
    useEffect(() => {
      if (!userId) return;
      (async () => {
        const today = new Date().toISOString().slice(0, 10);
        // Only insert if today's login not present
        const { data } = await supabase
          .from('user_logins')
          .select('id')
          .eq('user_id', userId)
          .eq('login_date', today);

        if (!data || !data.length) {
          await supabase
            .from('user_logins')
            .insert({ user_id: userId, login_date: today });
        }
      })();
    }, [userId]);
  };

  // Add team leaderboard (top teams by member count then quest completions)
  const useTeamLeaderboard = () => {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      setLoading(true);
      (async () => {
        // Get top 10 teams by member count and quest completions
        const { data, error } = await supabase.rpc('get_team_leaderboard');
        if (data) setTeams(data);
        setLoading(false);
      })();
    }, []);
    return { teams, loading };
  };

  return {
    userTeam,
    userTeamMembers,
    joinLink,
    isLoading,
    error,
    fetchUserTeam,
    createTeam,
    leaveTeam,
    generateJoinLink,
    fetchActiveJoinLink,
    joinViaToken,
    useLoginStreak,
    useRecordLogin,
    useTeamLeaderboard,
  };
};
