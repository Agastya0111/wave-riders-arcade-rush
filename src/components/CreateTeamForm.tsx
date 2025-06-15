
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
  const [formError, setFormError] = useState<string | null>(null);
  const { createTeam, isLoading, error } = useTeam();

  // Add custom error parse for duplicate team name
  const getFriendlyError = (rawError: string | null): string | null => {
    if (!rawError) return null;
    if (rawError.includes("duplicate key value violates unique constraint") && rawError.includes("teams_name_key")) {
      return "A team with this name already exists. Please choose a different name.";
    }
    if (rawError.includes("Could not embed because more than one relationship was found")) {
      return "A technical error occurred. Please report this to support.";
    }
    return rawError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!teamName.trim()) {
      setFormError("Team name is required.");
      return;
    }
    if (teamName.length > 50) {
      setFormError("Team name cannot exceed 50 characters.");
      return;
    }
    if (description.length > 200) {
      setFormError("Description cannot exceed 200 characters.");
      return;
    }

    const newTeam = await createTeam(teamName, description || null);
    if (newTeam) {
      setTeamName('');
      setDescription('');
      setFormError(null);
      onTeamCreated(); // Notify parent component
    } else {
      // Show friendly error if available
      setFormError(getFriendlyError(error?.message || null) || "Failed to create team.");
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
            <Label htmlFor="teamName">Team Name <span className="text-xs text-gray-500">(max 50 characters)</span></Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="The Wave Warriors"
              required
              maxLength={50}
            />
            <div className="text-xs text-gray-400 text-right">{teamName.length}/50</div>
          </div>
          <div>
            <Label htmlFor="description">Team Description <span className="text-xs text-gray-500">(optional, max 200 characters)</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Riding the gnarliest waves together!"
              maxLength={200}
            />
            <div className="text-xs text-gray-400 text-right">{description.length}/200</div>
          </div>
          {(formError || error) && (
            <p className="text-red-500 text-sm">
              Error: {getFriendlyError(formError) || getFriendlyError(error?.message) || 'Failed to create team.'}
            </p>
          )}
          <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
