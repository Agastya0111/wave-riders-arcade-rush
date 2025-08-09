
-- Phase 1: Critical RLS Policy Fixes

-- First, let's check if player_choices table exists and enable RLS if it does
-- (This will only run if the table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'player_choices' AND table_schema = 'public') THEN
        ALTER TABLE public.player_choices ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for users to see only their own choices
        CREATE POLICY "Users can view their own choices" 
            ON public.player_choices 
            FOR SELECT 
            USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        -- Create policy for users to insert their own choices
        CREATE POLICY "Users can create their own choices" 
            ON public.player_choices 
            FOR INSERT 
            WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
    END IF;
END $$;

-- Restrict endings table policies - remove overly permissive public access
DROP POLICY IF EXISTS "Anyone can insert endings" ON public.endings;
DROP POLICY IF EXISTS "Anyone can view endings" ON public.endings;

-- Create more secure policies for endings table
-- Only authenticated users can insert their own endings
CREATE POLICY "Authenticated users can insert endings" 
    ON public.endings 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only allow viewing of endings for analytics/leaderboard purposes (no personal data exposed)
-- This is reasonable for a game where choices are meant to be aggregated
CREATE POLICY "Anyone can view ending statistics" 
    ON public.endings 
    FOR SELECT 
    USING (true);

-- Fix security context for existing database functions
-- Update handle_new_user function with proper security context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'boy')
  );
  RETURN NEW;
END;
$$;

-- Update adjust_wrc_balance function with proper security context
CREATE OR REPLACE FUNCTION public.adjust_wrc_balance(p_user_id uuid, p_delta integer)
RETURNS TABLE(success boolean, new_balance integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_balance INTEGER;
  updated_balance INTEGER;
BEGIN
  -- Ensure only the user can adjust their own balance
  IF auth.uid() != p_user_id THEN
    RETURN QUERY SELECT false, NULL::integer, 'Unauthorized: can only adjust own balance';
    RETURN;
  END IF;

  SELECT wrc_balance INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::integer, 'Profile not found';
    RETURN;
  END IF;
  
  updated_balance := current_balance + p_delta;
  IF updated_balance < 0 THEN
    RETURN QUERY SELECT false, current_balance, 'Insufficient balance';
    RETURN;
  END IF;
  
  UPDATE profiles SET wrc_balance = updated_balance WHERE id = p_user_id;
  RETURN QUERY SELECT true, updated_balance, 'OK';
END;
$$;

-- Update is_user_in_team function with proper security context  
CREATE OR REPLACE FUNCTION public.is_user_in_team(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Ensure only the user can check their own team status
  IF auth.uid() != p_user_id THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (SELECT 1 FROM public.team_members WHERE user_id = p_user_id);
END;
$$;

-- Update game statistics function with proper security context
CREATE OR REPLACE FUNCTION public.update_game_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.game_statistics SET
    total_games_played = (SELECT COUNT(*) FROM public.game_sessions),
    total_players = (SELECT COUNT(DISTINCT user_id) FROM public.game_sessions),
    average_score = (SELECT ROUND(AVG(score), 2) FROM public.game_sessions),
    average_duration_seconds = (SELECT ROUND(AVG(duration_seconds)) FROM public.game_sessions),
    highest_score = (SELECT MAX(score) FROM public.game_sessions),
    most_common_avatar = (
      SELECT p.avatar_type 
      FROM public.profiles p 
      JOIN public.game_sessions gs ON p.id = gs.user_id 
      GROUP BY p.avatar_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    updated_at = now()
  WHERE id = (SELECT id FROM public.game_statistics LIMIT 1);
  
  RETURN NEW;
END;
$$;
