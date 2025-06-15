
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const TeamInstructions = () => (
  <Card className="mb-4 bg-blue-50 border-blue-200">
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
    </CardContent>
  </Card>
);
