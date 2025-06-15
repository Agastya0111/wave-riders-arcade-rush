
import React, { useState, useEffect } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { MyTeamView } from './MyTeamView';
import { CreateTeamForm } from './CreateTeamForm';
import { Button } from '@/components/ui/button';
import { TeamInstructions } from './TeamInstructions';

export const TeamsPage = ({ onBackToMainMenu }: { onBackToMainMenu?: () => void }) => {
  const { user } = useAuth();
  const {
    userTeam,
    userTeamMembers,
    isLoading,
    error,
    leaveTeam,
    createTeam,
    fetchUserTeam,
  } = useTeam();

  const [view, setView] = useState<'create' | 'my_team'>('my_team');
  // Show both instruction overlays (dismiss separately)
  const [showHow, setShowHow] = useState(true);
  const [showBenefits, setShowBenefits] = useState(true);

  useEffect(() => {
    fetchUserTeam(user || null);
  }, [fetchUserTeam, user]);

  useEffect(() => {
    if (userTeam) {
      setView('my_team');
    } else {
      setView('create');
    }
  }, [userTeam]);

  // Both overlays must be dismissed before showing rest of UI
  if (showHow || showBenefits) {
    return (
      <div className="flex flex-col items-center w-full">
        <TeamInstructions
          showPlayHow={showHow}
          showBenefits={showBenefits}
          onDismissPlayHow={() => setShowHow(false)}
          onDismissBenefits={() => setShowBenefits(false)}
        />
      </div>
    );
  }

  const handleLeaveTeam = async () => {
    const success = await leaveTeam();
    if (success) {
      setView('create');
    }
  };

  const handleTeamCreated = () => {
    setView('my_team');
  };

  if (isLoading && !userTeam) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-blue-600 font-semibold">Loading...</span>
      </div>
    );
  }

  if (view === 'my_team' && userTeam) {
    return (
      <div className="space-y-6">
        <MyTeamView
          team={userTeam}
          members={userTeamMembers}
          currentUserId={user?.id || null}
          onLeaveTeam={handleLeaveTeam}
        />
        {onBackToMainMenu && (
          <Button variant="outline" onClick={onBackToMainMenu} className="w-full">
            Back to Main Menu
          </Button>
        )}
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="space-y-6">
        <CreateTeamForm onTeamCreated={handleTeamCreated} />
        {onBackToMainMenu && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onBackToMainMenu}
          >
            Back to Main Menu
          </Button>
        )}
      </div>
    );
  }

  return null;
};
