
-- Table for team join invites
CREATE TABLE public.team_join_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE, -- Unique join token
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE public.team_join_links ENABLE ROW LEVEL SECURITY;

-- Only team leader can create/select links for their team
CREATE POLICY "Leader can issue join links"
  ON public.team_join_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_join_links.team_id
      AND teams.leader_id = auth.uid()
    )
  );

CREATE POLICY "Leader can view links they generated"
  ON public.team_join_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_join_links.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- For join, anyone with the link/token can attempt to use it, so we allow select by all.
CREATE POLICY "Anyone can read join links by token"
  ON public.team_join_links
  FOR SELECT
  USING (true);

-- Only mark as used from within backend logic (will use edge function) so no direct update/delete policy for now.

