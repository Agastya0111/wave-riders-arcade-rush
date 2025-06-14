
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InstructionPopupProps {
  onClose: () => void; // Parent component now controls what happens on close
}

export const InstructionPopup = ({ onClose }: InstructionPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"> {/* Increased z-index */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl text-blue-700">
            Welcome to Wave Riders!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg text-gray-700 mb-2">How to Play:</div>
          <ul className="list-disc list-inside text-gray-600 text-base space-y-2 mb-3">
            <li>🏄‍♂️ Move up/down to dodge obstacles and collect coins.</li>
            <li>✨ Collect special items for surprises: shields, swords, starfish, and magnets!</li>
            <li>⚡ Use item buttons (or key shortcuts) to spend WRC and activate powers.</li>
            <li>🚩 Complete daily tasks for bonus rewards.</li>
            <li>🌟 Reach new levels to unlock new vehicles and boss battles.</li>
          </ul>
          <div className="text-gray-500 text-xs">
            This guide helps you get started! For more tips, check the Help section in the main menu.
          </div>
          <div className="mt-6 flex justify-center">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
