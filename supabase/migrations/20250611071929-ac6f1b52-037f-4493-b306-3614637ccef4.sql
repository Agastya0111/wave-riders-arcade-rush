
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_type TEXT DEFAULT 'boy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_sessions table to track every game played
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  level_reached INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  lives_used INTEGER NOT NULL DEFAULT 0,
  dolphins_used INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard view for top scores
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

-- Create game_statistics table for global stats
CREATE TABLE public.game_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_players INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0,
  average_duration_seconds INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  most_common_avatar TEXT DEFAULT 'boy',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial statistics row
INSERT INTO public.game_statistics (total_games_played, total_players) VALUES (0, 0);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for game_sessions
CREATE POLICY "Users can view all game sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own game sessions" ON public.game_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for game_statistics (read-only for all users)
CREATE POLICY "Anyone can view game statistics" ON public.game_statistics FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'boy')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update game statistics
CREATE OR REPLACE FUNCTION public.update_game_statistics()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update statistics when new games are added
CREATE TRIGGER update_stats_on_game_insert
  AFTER INSERT ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_game_statistics();

-- Create indexes for better performance
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX idx_profiles_username ON public.profiles(username);
