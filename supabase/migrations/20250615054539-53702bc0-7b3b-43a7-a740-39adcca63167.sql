
-- 1. Drop the leaderboard view so we can alter columns safely
DROP VIEW IF EXISTS public.leaderboard;

-- 2. Prevent negative WRC balances and add character limits
ALTER TABLE public.profiles
  ALTER COLUMN username TYPE VARCHAR(32),
  ADD CONSTRAINT username_maxlen CHECK (char_length(username) <= 32),
  ADD CONSTRAINT wrc_balance_nonnegative CHECK (wrc_balance >= 0);

ALTER TABLE public.teams
  ALTER COLUMN name TYPE VARCHAR(50),
  ADD CONSTRAINT team_name_maxlen CHECK (char_length(name) <= 50),
  ALTER COLUMN description TYPE VARCHAR(200);

-- 3. Fix missing WITH CHECK on INSERT for 'teams'
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

-- 4. Add/standardize WITH CHECK clauses on 'profiles' table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Fix team_members join policy to prevent race conditions
DROP POLICY IF EXISTS "Users can join a team if they are not already in one" ON public.team_members;
CREATE POLICY "Users can join a team if they are not already in one"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid())
  );

-- 6. Add missing WITH CHECK on insert to game_sessions
DROP POLICY IF EXISTS "Users can insert their own game sessions" ON public.game_sessions;
CREATE POLICY "Users can insert their own game sessions"
  ON public.game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Harden remaining update/delete policies with user checks (none to update at this time)

-- 8. Re-create the leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  p.username,
  p.avatar_type,
  gs.score,
  gs.level_reached,
  gs.duration_seconds,
  gs.created_at
FROM public.game_sessions gs
JOIN public.profiles p ON gs.user_id = p.id
ORDER BY gs.score DESC, gs.level_reached DESC
LIMIT 100;
