
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Team, TeamMember, useTeam } from '@/hooks/useTeam';
import { User, Crown, LogOut, ShieldAlert } from 'lucide-react'; // ShieldAlert for potential issues

interface MyTeamViewProps {
  team: Team;
  members: TeamMember[];
  currentUserId: string | null;
  onLeaveTeam: () => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({ team, members, currentUserId, onLeaveTeam }) => {
  const { isLoading, error } = useTeam(); // To show loading/error for actions like leaving team

  const isLeader = team.leader_id === currentUserId;

  return (
    <Card className="w-full max-w-lg bg-white/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {team.name} {isLeader && <Crown className="w-6 h-6 text-yellow-500" title="You are the leader"/>}
        </CardTitle>
        <CardDescription>{team.description || "No description provided."}</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">Team Members ({members.length})</h3>
        <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto bg-slate-50 p-3 rounded-md">
          {members.map(member => (
            <li key={member.user_id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                {member.profile?.username || member.user_id.substring(0,8)}
              </span>
              {team.leader_id === member.user_id && <Crown className="w-4 h-4 text-yellow-500" title="Leader"/>}
            </li>
          ))}
        </ul>
        
        {error && (
          <p className="text-red-500 text-sm my-2 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" /> 
            {error.message || 'An error occurred.'}
          </p>
        )}

        <Button 
          onClick={onLeaveTeam} 
          variant="destructive" 
          className="w-full"
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoading ? "Leaving..." : (isLeader && members.length === 1 ? "Disband Team" : "Leave Team")}
        </Button>
        {isLeader && members.length > 1 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            To leave as leader, you must first remove all other members or transfer leadership (feature coming soon).
          </p>
        )}
         {!isLeader && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            If you leave, you can join another team or create a new one.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
