
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Returns the current user's login streak (consecutive days with a login)
export function useLoginStreak(userId: string | null) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return setStreak(0);
    (async () => {
      const { data, error } = await supabase
        .from('user_logins')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: false });
      if (error) return setStreak(0);
      // Compute streak
      let expected = new Date();
      let count = 0;
      for (const row of data) {
        const dateStr = row.login_date;
        if (!dateStr) break;
        const d = new Date(dateStr + "T00:00:00");
        if (d.toDateString() === expected.toDateString()) {
          count += 1;
          expected.setDate(expected.getDate() - 1);
        } else if (count === 0 && d < expected && d > expected) {
          continue;
        } else {
          break; // streak broken
        }
      }
      setStreak(count);
    })();
  }, [userId]);
  return streak;
}
