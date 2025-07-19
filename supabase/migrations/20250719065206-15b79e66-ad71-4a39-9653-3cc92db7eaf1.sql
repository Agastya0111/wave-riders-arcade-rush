
-- Create the endings table to store player final choices
CREATE TABLE public.endings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player TEXT NOT NULL,
  choice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.endings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert endings (since it's a game choice)
CREATE POLICY "Anyone can insert endings" 
  ON public.endings 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow anyone to view endings
CREATE POLICY "Anyone can view endings" 
  ON public.endings 
  FOR SELECT 
  USING (true);
