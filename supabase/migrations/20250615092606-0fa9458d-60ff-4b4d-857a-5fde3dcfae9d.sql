
-- Quest types table: stores available quest templates/options
CREATE TABLE public.quest_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- e.g., 'score', 'login', 'wrc', 'level'
  goal_amount INTEGER NOT NULL
);

-- Team quests: stores which team is doing what quest and its state
CREATE TABLE public.team_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  quest_type_id UUID NOT NULL REFERENCES public.quest_types(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true -- only one active quest per team
);

-- Participants in quests: tracks which players joined which quest
CREATE TABLE public.team_quest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_quest_id UUID NOT NULL REFERENCES public.team_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), 
  completed BOOLEAN NOT NULL DEFAULT false
);

-- Policy for quest_types: Anyone authenticated can SELECT quest types (for list of options)
ALTER TABLE public.quest_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Any authenticated can select quests" ON public.quest_types FOR SELECT TO authenticated USING (true);

-- Policy for team_quests: Only members of team can SELECT / INSERT / UPDATE
ALTER TABLE public.team_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view team quests" ON public.team_quests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_members.team_id = team_quests.team_id AND team_members.user_id = auth.uid())
);
CREATE POLICY "Team members can create team quests" ON public.team_quests FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_members.team_id = team_quests.team_id AND team_members.user_id = auth.uid())
);
CREATE POLICY "Team members can update team quests" ON public.team_quests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.team_members WHERE team_members.team_id = team_quests.team_id AND team_members.user_id = auth.uid())
);

-- Policy for team_quest_participants: Only participant or team member can view/insert
ALTER TABLE public.team_quest_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and team members can view quest participants" ON public.team_quest_participants FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.team_quests tq
    JOIN public.team_members tm ON tq.team_id = tm.team_id
    WHERE tq.id = team_quest_participants.team_quest_id AND tm.user_id = auth.uid()
  )
);
CREATE POLICY "Participant can insert" ON public.team_quest_participants FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_quests tq
    JOIN public.team_members tm ON tq.team_id = tm.team_id
    WHERE tq.id = team_quest_participants.team_quest_id AND tm.user_id = auth.uid()
  )
);

-- Track user logins for streaks
CREATE TABLE public.user_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL
);

ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view own login records" ON public.user_logins FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "User can insert own login record" ON public.user_logins FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Add some default quest types
INSERT INTO public.quest_types (name, description, goal_type, goal_amount) VALUES
('Collective Score Challenge', 'Your team must reach a combined score of 3,000 today.', 'score', 3000),
('Perfect Level Run', 'All members clear any level without losing a life.', 'level', 1),
('WRC Hoarder', 'Team collects 100 WRC today.', 'wrc', 100),
('Daily Login Goal', 'Get every team member to log in today!', 'login', 1),
('Beat the Boss', 'Every member beats a boss level today!', 'boss', 1);
