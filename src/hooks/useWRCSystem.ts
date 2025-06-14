
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
  const [wrc, setWrc] = useState(0); // WRC is completely separate from score
  const [shield, setShield] = useState<ShopItem | null>(null);
  const [sword, setSword] = useState<ShopItem | null>(null);
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

  const spendWRC = async (amount: number) => {
    if (wrc >= amount) {
      const newBalance = wrc - amount;
      setWrc(newBalance);
      await saveWRCBalance(newBalance);
      return true;
    }
    return false;
  };

  const buyShield = async () => {
    if (wrc < 50) {
      return { success: false, message: "Not enough WRC." };
    }
    
    if (await spendWRC(50)) {
      setShield({
        id: 'shield',
        name: 'Shield',
        icon: '🛡️',
        price: 50,
        uses: 1,
        maxUses: 1,
        description: 'Blocks one obstacle'
      });
      return { success: true, message: "Shield purchased!" };
    }
    return { success: false, message: "Purchase failed." };
  };

  const buySword = async () => {
    if (wrc < 100) {
      return { success: false, message: "Not enough WRC." };
    }
    
    if (await spendWRC(100)) {
      setSword({
        id: 'sword',
        name: 'Sword',
        icon: '⚔️',
        price: 100,
        uses: 3,
        maxUses: 3,
        description: 'Destroys 3 obstacles'
      });
      return { success: true, message: "Sword purchased!" };
    }
    return { success: false, message: "Purchase failed." };
  };

  const useShield = () => {
    if (!shield || !shield.uses || shield.uses <= 0) {
      return { success: false, message: "You don't own this item yet!" };
    }
    
    const newUses = shield.uses - 1;
    if (newUses <= 0) {
      setShield(null);
    } else {
      setShield({ ...shield, uses: newUses });
    }
    return { success: true, message: "Shield activated!" };
  };

  const useSword = () => {
    if (!sword || !sword.uses || sword.uses <= 0) {
      return { success: false, message: "You don't own this item yet!" };
    }
    
    const newUses = sword.uses - 1;
    if (newUses <= 0) {
      setSword(null);
    } else {
      setSword({ ...sword, uses: newUses });
    }
    return { success: true, message: "Sword activated!" };
  };

  return {
    wrc, // Use 'wrc' instead of 'wrcBalance' for clarity
    shield,
    sword,
    earnWRC,
    spendWRC,
    buyShield,
    buySword,
    useShield,
    useSword
  };
};
