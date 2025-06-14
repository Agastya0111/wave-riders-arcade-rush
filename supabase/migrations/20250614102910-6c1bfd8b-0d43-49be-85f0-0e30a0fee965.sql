
-- Table to store team information
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to link users (profiles) to teams
CREATE TABLE public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id) -- A user can only be in one team
);

-- Enable Row Level Security for the new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for 'teams' table
CREATE POLICY "Authenticated users can view all teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id); -- The creator is the leader

CREATE POLICY "Team leaders can update their team's description"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can delete their own teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (auth.uid() = leader_id);

-- Policies for 'team_members' table
CREATE POLICY "Authenticated users can view all team memberships"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join a team if they are not already in one"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_members.user_id = auth.uid())
  );

CREATE POLICY "Users can leave their team"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Team leaders can remove members from their team"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id AND teams.leader_id = auth.uid()
    ) AND auth.uid() <> team_members.user_id -- Leader cannot remove themselves via this policy
  );

-- Function to check if a user is part of any team
CREATE OR REPLACE FUNCTION public.is_user_in_team(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.team_members WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

