
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TouchControlGuideProps {
  onClose: () => void;
}

export const TouchControlGuide = ({ onClose }: TouchControlGuideProps) => (
  <div className="fixed inset-0 z-[101] bg-black/70 flex items-center justify-center p-4">
    <Card className="w-full max-w-sm bg-white/95 shadow-2xl backdrop-blur text-blue-900 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-blue-700 text-xl">How to Move</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-4">
          <li className="flex items-center gap-3">
            <span className="text-3xl">⬆️⬇️</span>
            <span>
              <b>Swipe up/down:</b> Move your surfer up or down
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-3xl">✋</span>
            <span>
              <b>Tap:</b> Jump over obstacles
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <span>
              <b>Long press:</b> Use Speed Boost <span className="text-xs">(if available)</span>
            </span>
          </li>
        </ul>
        <div className="text-xs text-gray-500 mb-3 text-center">
          For the best experience, play with your device in portrait mode.
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>
          Got it!
        </Button>
      </CardContent>
    </Card>
  </div>
);

