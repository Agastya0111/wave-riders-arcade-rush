
-- Add wrc_balance column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN wrc_balance INTEGER NOT NULL DEFAULT 0;
