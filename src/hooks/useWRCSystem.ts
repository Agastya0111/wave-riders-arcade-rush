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
          console.error('Error loading WRC balance:', error);
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

  const saveWRCBalance = async (newBalance: number) => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ wrc_balance: newBalance })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving WRC balance:', error);
      }
    } else {
      localStorage.setItem('wrc_balance', newBalance.toString());
    }
  };

  const earnWRC = async (amount: number) => {
    const newBalance = wrc + amount;
    setWrc(newBalance);
    await saveWRCBalance(newBalance);
  };

  const buyShield = async () => {
    if (wrc >= 50) {
      const newBalance = wrc - 50;
      setWrc(newBalance);
      setShieldAvailable(true);
      await saveWRCBalance(newBalance);
      return { success: true, message: "Shield purchased!" };
    }
    return { success: false, message: "Not enough WRC." };
  };

  const buySword = async () => {
    if (wrc >= 100) {
      const newBalance = wrc - 100;
      setWrc(newBalance);
      setSwordUses(3);
      await saveWRCBalance(newBalance);
      return { success: true, message: "Sword purchased!" };
    }
    return { success: false, message: "Not enough WRC." };
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
    useSword
  };
};

export type WRCSystemHook = ReturnType<typeof useWRCSystem>;
