
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  uses?: number;
  maxUses?: number;
  description: string;
}

export const useWRCSystem = () => {
  const [wrc, setWrc] = useState(0);
  const [shieldAvailable, setShieldAvailable] = useState(false);
  const [swordUses, setSwordUses] = useState(0);
  const { user } = useAuth();

  // Load WRC balance from localStorage or Supabase
  useEffect(() => {
    const loadWRCBalance = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('wrc_balance')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setWrc(data.wrc_balance || 0);
          }
        } catch (error) {
          console.warn('Error loading WRC balance:', error);
        }
      } else {
        // Guest mode - use localStorage
        const savedBalance = localStorage.getItem('wrc_balance');
        if (savedBalance) {
          setWrc(parseInt(savedBalance, 10));
        }
      }
    };

    loadWRCBalance();
  }, [user]);

  // Use secure, atomic WRC update for authenticated users
  const adjustWRC = async (delta: number): Promise<{ success: boolean; new_balance: number; message?: string }> => {
    if (user) {
      const { data, error } = await supabase.rpc('adjust_wrc_balance', { p_user_id: user.id, p_delta: delta });
      if (error) {
        // Only log server errors — user error will be returned from function
        console.error('adjust_wrc_balance RPC failed:', error);
        return { success: false, new_balance: wrc, message: "WRC operation failed. Try again later." };
      }
      const result = data?.[0];
      if (!result) {
        return { success: false, new_balance: wrc, message: "Unknown error adjusting balance." };
      }
      if (!result.success) {
        return { success: false, new_balance: result.new_balance ?? wrc, message: result.message };
      }
      setWrc(result.new_balance);
      return { success: true, new_balance: result.new_balance, message: result.message };
    } else {
      // Guest fallback
      const newBalance = wrc + delta;
      if (newBalance < 0) {
        return { success: false, new_balance: wrc, message: "Insufficient WRC." };
      }
      setWrc(newBalance);
      localStorage.setItem('wrc_balance', String(newBalance));
      return { success: true, new_balance: newBalance, message: "OK" };
    }
  };

  const earnWRC = async (amount: number) => {
    const res = await adjustWRC(amount);
    return res;
  };

  const buyShield = async () => {
    if (shieldAvailable) {
      return { success: false, message: "You already own a Shield." };
    }
    const result = await adjustWRC(-50);
    if (result.success) {
      setShieldAvailable(true);
      return { success: true, message: "Shield purchased!" };
    } else {
      return { success: false, message: result.message || "Not enough WRC." };
    }
  };

  const buySword = async () => {
    if (swordUses > 0) {
      return { success: false, message: "You already own a Sword." };
    }
    const result = await adjustWRC(-100);
    if (result.success) {
      setSwordUses(3);
      return { success: true, message: "Sword purchased!" };
    } else {
      return { success: false, message: result.message || "Not enough WRC." };
    }
  };

  const useShield = () => {
    if (!shieldAvailable) {
      return { success: false, message: "You don't own this yet!" };
    }
    setShieldAvailable(false);
    return { success: true, message: "Shield activated!" };
  };

  const useSword = () => {
    if (swordUses <= 0) {
      return { success: false, message: "You don't own this yet!" };
    }
    setSwordUses(prev => prev - 1);
    return { success: true, message: "Sword activated!" };
  };

  return {
    wrc,
    shieldAvailable,
    swordUses,
    earnWRC,
    buyShield,
    buySword,
    useShield,
    useSword,
  };
};

export type WRCSystemHook = ReturnType<typeof useWRCSystem>;
