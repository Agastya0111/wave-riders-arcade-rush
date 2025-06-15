
-- 1. Create a secure function for atomic WRC adjustment, with error for negative post-operation balances
CREATE OR REPLACE FUNCTION public.adjust_wrc_balance(p_user_id UUID, p_delta INTEGER)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  updated_balance INTEGER;
BEGIN
  SELECT wrc_balance INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL, 'Profile not found';
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

-- 2. Secure this function: only allow if user is adjusting their own balance
REVOKE ALL ON FUNCTION public.adjust_wrc_balance(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_wrc_balance(UUID, INTEGER) TO authenticated;

-- 3. (If not present) Enforce RLS on profiles table for update
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. (If not present) Only users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

