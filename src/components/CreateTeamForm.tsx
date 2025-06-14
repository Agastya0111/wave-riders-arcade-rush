
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTeam } from '@/hooks/useTeam'; // Assuming you have this hook

interface CreateTeamFormProps {
  onTeamCreated: () => void; // Callback after team is created
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const { createTeam, isLoading, error } = useTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      alert("Team name is required."); // Replace with better error handling
      return;
    }
    const newTeam = await createTeam(teamName, description || null);
    if (newTeam) {
      setTeamName('');
      setDescription('');
      onTeamCreated(); // Notify parent component
    } else {
      // Error is handled by the hook, could show a toast here
      console.error("Failed to create team", error);
    }
  };

  return (
    <Card className="w-full max-w-lg bg-white/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Create a New Team</CardTitle>
        <CardDescription>Lead your squad to victory!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="The Wave Warriors"
              required
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="description">Team Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Riding the gnarliest waves together!"
              maxLength={200}
            />
          </div>
          {error && <p className="text-red-500 text-sm">Error: {error.message || 'Failed to create team.'}</p>}
          <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
