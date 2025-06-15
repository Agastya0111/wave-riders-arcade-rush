
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useTeamQuests } from "@/hooks/useTeamQuests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Panel shown on team page for quests
export const TeamQuestPanel = ({ teamId, userId, isLeader }: { teamId: string, userId: string, isLeader: boolean }) => {
  const { activeQuest, questTypes, participants, loading, startQuest, joinQuest } = useTeamQuests(teamId, userId);

  if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  // If no quest running: leader starts, members wait
  if (!activeQuest) {
    if (isLeader) {
      return (
        <Card className="mb-4">
          <CardHeader><CardTitle>🏁 Start a Team Quest</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 mb-2">
              {questTypes.map(q => (
                <Button
                  key={q.id}
                  className="w-full my-1"
                  onClick={() => startQuest(q.id)}
                  variant="default"
                >
                  <span className="font-semibold">{q.name}</span>: <span className="italic text-xs ml-1">{q.description}</span>
                </Button>
              ))}
            </div>
            <span className="text-xs text-gray-500">Pick a quest your team can enjoy together!</span>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="mb-4">
        <CardHeader><CardTitle>No active quest right now</CardTitle></CardHeader>
        <CardContent><span>Wait for your leader to start a quest! Available quests are:</span>
          <ul className="ml-4 list-disc text-sm mt-2">
            {questTypes.map(q => <li key={q.id}><span className="font-semibold">{q.name}:</span> {q.description}</li>)}
          </ul>
        </CardContent>
      </Card>
    );
  }

  // There is an active quest: anyone can join; show quest details, participants
  const joined = participants.some(p => p.user_id === userId);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Current Quest: {activeQuest.quest_types?.name || "Quest"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-700">{activeQuest.quest_types?.description}</p>
        <div className="mb-2">
          <span className="font-semibold">Participants:</span>
          <ul className="ml-2 text-sm">
            {participants.map(p => (
              <li key={p.user_id}>
                {p.profiles?.username || p.user_id.slice(0, 6)}
                {p.completed ? <CheckCircle2 className="inline w-4 h-4 text-green-500 ml-1" /> : null}
              </li>
            ))}
          </ul>
        </div>
        {!joined ? (
          <Button onClick={joinQuest} className="w-full bg-green-600 mt-2">
            Join Quest
          </Button>
        ) : (
          <span className="text-green-700 font-semibold">You joined this quest!</span>
        )}
      </CardContent>
    </Card>
  );
};
