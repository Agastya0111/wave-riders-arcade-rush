
import React, { useState, useEffect } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { TeamCard } from './TeamCard';
import { CreateTeamForm } from './CreateTeamForm';
import { MyTeamView } from './MyTeamView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, Users, PlusCircle, Info } from 'lucide-react';

export const TeamsPage = () => {
  const { user } = useAuth();
  const { 
    allTeams, 
    userTeam, 
    userTeamMembers,
    isLoading: teamsLoading, 
    error: teamsError, 
    fetchAllTeams,
    fetchUserTeam,
    joinTeam,
    leaveTeam,
  } = useTeam();
  
  const [view, setView] = useState<'list' | 'create' | 'my_team'>('list');

  useEffect(() => {
    fetchAllTeams();
    if (user) {
      fetchUserTeam(user);
    }
  }, [fetchAllTeams, fetchUserTeam, user]);
  
  useEffect(() => {
    // If user has a team, default to 'my_team' view
    // Otherwise, if they were on 'my_team' view and left, switch to 'list'
    if (userTeam) {
      setView('my_team');
    } else {
      if (view === 'my_team') {
        setView('list'); // Switch to list if they were viewing their team and it disappeared (e.g., left team)
      }
    }
  }, [userTeam, view]);

  const handleJoinTeam = async (teamId: string) => {
    const success = await joinTeam(teamId);
    if (success) {
      // fetchUserTeam will be called by the hook, which should update userTeam and trigger view change
      alert("Successfully joined team!"); // Replace with toast
    } else {
      alert("Failed to join team. You might already be in a team or an error occurred."); // Replace with toast
    }
  };
  
  const handleLeaveTeam = async () => {
    const success = await leaveTeam();
     if (success) {
      alert("Successfully left the team."); // Replace with toast
      setView('list'); // Switch view to list of teams
    } else {
      alert("Failed to leave team."); // Replace with toast
    }
  }

  const handleTeamCreated = () => {
    // fetchUserTeam and fetchAllTeams are called within createTeam in the hook
    // userTeam should update, leading to view changing to 'my_team'
    alert("Team created successfully!"); // Replace with toast
  };

  // Teams instructions card (shown at top, on any view)
  const TeamInstructions = () => (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
        <Info className="text-blue-700" />
        <CardTitle className="text-base text-blue-700">How Teams Work</CardTitle>
      </CardHeader>
      <CardContent className="py-1 px-4 text-blue-900 text-sm space-y-2">
        <div>
          <strong>•</strong> <span>Create a team</span> if you want to lead your own group.<br />
          <strong>•</strong> <span>Join an existing team</span> to play together (one team at a time).<br />
          <strong>•</strong> Only <b>team leaders</b> can delete teams or remove others.<br />
          <strong>•</strong> To <span>leave</span>, use the <b>Leave Team</b> button. If you’re the last member, the team will be deleted.<br />
          <strong>•</strong> <span>Team up to compete for leaderboard spots and rewards!</span>
        </div>
      </CardContent>
    </Card>
  );

  if (teamsLoading && !allTeams.length && !userTeam) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-600">Loading Teams...</p>
      </div>
    );
  }

  if (view === 'my_team' && userTeam) {
    return (
      <div className="space-y-6">
        <TeamInstructions />
        <MyTeamView 
          team={userTeam} 
          members={userTeamMembers} 
          currentUserId={user?.id || null}
          onLeaveTeam={handleLeaveTeam}
        />
        <Button variant="outline" onClick={() => setView('list')} className="w-full">
          View All Teams
        </Button>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="space-y-6">
        <TeamInstructions />
        <CreateTeamForm onTeamCreated={handleTeamCreated} />
        <Button variant="outline" onClick={() => setView('list')} className="w-full">
          Back to Teams List
        </Button>
      </div>
    );
  }

  // Default to 'list' view
  return (
    <div className="space-y-6">
      <TeamInstructions />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-blue-700">Available Teams</h2>
        {!userTeam && (
          <Button onClick={() => setView('create')}>
            <PlusCircle className="w-4 h-4 mr-2" /> Create Team
          </Button>
        )}
        {userTeam && (
           <Button onClick={() => setView('my_team')} variant="outline">
            View My Team
          </Button>
        )}
      </div>

      {teamsError && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Error loading teams: {teamsError.message || "Unknown error"}
        </div>
      )}

      {allTeams.length === 0 && !teamsLoading && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No teams found.</p>
          <p className="text-gray-400">Be the first to create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTeams.map(team => (
          <TeamCard 
            key={team.id} 
            team={team} 
            onJoinTeam={handleJoinTeam}
            isUserInTeam={!!userTeam}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </div>
  );
};

