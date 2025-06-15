
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Marks today as a login for a given user. Only inserts if not already present.
export function useRecordLogin(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('user_logins')
        .select('id')
        .eq('user_id', userId)
        .eq('login_date', today);

      if (!data || !data.length) {
        await supabase
          .from('user_logins')
          .insert({ user_id: userId, login_date: today });
      }
    })();
  }, [userId]);
}
