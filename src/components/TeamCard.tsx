import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Team } from '@/hooks/useTeamTypes';
import { Users, Crown } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onJoinTeam: (teamId: string) => void;
  isUserInTeam: boolean;
  currentUserId?: string | null;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onJoinTeam, isUserInTeam, currentUserId }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {team.name}
          {team.leader_id === currentUserId && <Crown className="w-5 h-5 text-yellow-500"><title>You are the leader</title></Crown>}
        </CardTitle>
        <CardDescription>{team.description || "No description."}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p className="flex items-center"><Users className="w-4 h-4 mr-2" /> Members: {team.member_count || 0}</p>
          <p className="flex items-center"><Crown className="w-4 h-4 mr-2" /> Leader: {team.leader_username || 'N/A'}</p>
        </div>
        {!isUserInTeam && (
          <Button onClick={() => onJoinTeam(team.id)} className="w-full mt-4 bg-green-600 hover:bg-green-700">
            Join Team
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
