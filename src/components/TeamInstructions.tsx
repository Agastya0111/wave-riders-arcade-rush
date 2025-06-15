
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info, Users, Star } from "lucide-react";

export const TeamInstructions = ({
  onDismissPlayHow,
  onDismissBenefits,
  showPlayHow = true,
  showBenefits = false
}: {
  onDismissPlayHow?: () => void,
  onDismissBenefits?: () => void,
  showPlayHow?: boolean,
  showBenefits?: boolean
}) => (
  <div className="space-y-4 w-full">
    {showPlayHow && (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
          <Info className="text-blue-700" />
          <CardTitle className="text-base text-blue-700">How to play as a team</CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-4 text-blue-900 text-sm space-y-2">
          <ul className="list-disc list-inside pl-4 text-blue-900">
            <li>Invite your friends to join your team by sharing your team invite link.</li>
            <li>The link can be copied using the "Copy Join Link" button from your team page.</li>
            <li>Friends can click the link and easily find your team to join (as long as they are not in a team already).</li>
            <li>Play together and compete for the top team spots!</li>
          </ul>
          {onDismissPlayHow && (
            <button
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition"
              onClick={onDismissPlayHow}
              type="button"
            >
              Got it
            </button>
          )}
        </CardContent>
      </Card>
    )}
    {showBenefits && (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
          <Users className="text-green-700" />
          <CardTitle className="text-base text-green-700">Why play in a team? What are the benefits?</CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-4 text-green-900 text-sm space-y-2">
          <ul className="list-disc list-inside pl-4 text-green-900">
            <li>Work together to reach even higher scores as a group.</li>
            <li>Unlock exclusive team milestones and rewards!</li>
            <li>Help and motivate each other to beat tough levels.</li>
            <li>See your friends' progress and compete on the team leaderboard.</li>
            <li>Teams with more members may get bonus rewards in upcoming events.</li>
            <li>Great for school clubs, friend groups, or families!</li>
          </ul>
          {onDismissBenefits && (
            <button
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold transition"
              onClick={onDismissBenefits}
              type="button"
            >
              Got it
            </button>
          )}
        </CardContent>
      </Card>
    )}
  </div>
);
