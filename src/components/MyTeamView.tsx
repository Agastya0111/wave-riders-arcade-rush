
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Crown, LogOut, ShieldAlert, Link as LinkIcon, Check, RefreshCcw } from 'lucide-react';
import type { Team, TeamMember, TeamJoinLink } from '@/hooks/useTeamTypes';
import { useTeam } from '@/hooks/useTeam';
import { useToast } from "@/hooks/use-toast";

interface MyTeamViewProps {
  team: Team;
  members: TeamMember[];
  currentUserId: string | null;
  onLeaveTeam: () => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({
  team,
  members,
  currentUserId,
  onLeaveTeam
}) => {
  const { isLoading, error, joinLink, generateJoinLink, fetchActiveJoinLink } = useTeam();
  const isLeader = team.leader_id === currentUserId;
  const [hasCopied, setHasCopied] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const { toast } = useToast();

  // The invite link (full URL for user to copy)
  const joinUrl = joinLink
    ? `${window.location.origin}/?join_team=${joinLink.token}`
    : null;

  const handleCopyLink = async () => {
    if (joinUrl) {
      try {
        await navigator.clipboard.writeText(joinUrl);
        setHasCopied(true);
        toast({
          title: "Join link copied!",
          description: "Share this link with a friend—expires in 1 hour or on first use.",
        });
        setTimeout(() => setHasCopied(false), 1500);
      } catch (e) {
        toast({
          title: "Failed to copy join link.",
          description: "Your browser may not support clipboard copying."
        });
      }
    }
  };

  const handleGenerateLink = async () => {
    setGenerating(true);
    await generateJoinLink();
    setTimeout(fetchActiveJoinLink, 150); // Refresh after creation for safety
    setGenerating(false);
  };

  return (
    <Card className="w-full max-w-lg bg-white/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {team.name}{" "}
          {isLeader && <Crown className="w-6 h-6 text-yellow-500"><title>You are the leader</title></Crown>}
        </CardTitle>
        <CardDescription>{team.description || "No description provided."}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLeader && (
          <div className="flex flex-col items-stretch gap-2 mb-6">
            <div className="flex flex-row gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleGenerateLink}
                disabled={generating || isLoading}
              >
                <RefreshCcw className="w-4 h-4" /> {generating ? "Generating..." : "Generate New Join Link"}
              </Button>
              {joinUrl && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleCopyLink}
                >
                  <LinkIcon className="w-4 h-4" />
                  {hasCopied ? (
                    <>Link Copied <Check className="w-4 h-4 text-green-500" /></>
                  ) : <>Copy Join Link</>}
                </Button>
              )}
            </div>
            {joinLink && (
              <span className="text-xs text-gray-400 break-all block">
                Valid (1hr): {joinUrl}
              </span>
            )}
            <span className="text-xs text-gray-500">
              Only share with a friend, expires in 1 hour or after use.
            </span>
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2">Team Members ({members.length})</h3>
        <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto bg-slate-50 p-3 rounded-md">
          {members.map(member => (
            <li key={member.user_id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                {member.profile?.username || member.user_id.substring(0, 8)}
              </span>
              {team.leader_id === member.user_id && <Crown className="w-4 h-4 text-yellow-500"><title>Leader</title></Crown>}
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
