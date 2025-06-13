
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
  const [wrcBalance, setWrcBalance] = useState(0);
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
            setWrcBalance(data.wrc_balance || 0);
          }
        } catch (error) {
          console.error('Error loading WRC balance:', error);
        }
      } else {
        // Guest mode - use localStorage
        const savedBalance = localStorage.getItem('wrc_balance');
        if (savedBalance) {
          setWrcBalance(parseInt(savedBalance, 10));
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
    const newBalance = wrcBalance + amount;
    setWrcBalance(newBalance);
    await saveWRCBalance(newBalance);
  };

  const spendWRC = async (amount: number) => {
    if (wrcBalance >= amount) {
      const newBalance = wrcBalance - amount;
      setWrcBalance(newBalance);
      await saveWRCBalance(newBalance);
      return true;
    }
    return false;
  };

  const buyShield = async () => {
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
      return true;
    }
    return false;
  };

  const buySword = async () => {
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
      return true;
    }
    return false;
  };

  const useShield = () => {
    if (shield && shield.uses && shield.uses > 0) {
      const newUses = shield.uses - 1;
      if (newUses <= 0) {
        setShield(null);
      } else {
        setShield({ ...shield, uses: newUses });
      }
      return true;
    }
    return false;
  };

  const useSword = () => {
    if (sword && sword.uses && sword.uses > 0) {
      const newUses = sword.uses - 1;
      if (newUses <= 0) {
        setSword(null);
      } else {
        setSword({ ...sword, uses: newUses });
      }
      return true;
    }
    return false;
  };

  const grantFreeItems = () => {
    setShield({
      id: 'shield',
      name: 'Shield',
      icon: '🛡️',
      price: 0,
      uses: 1,
      maxUses: 1,
      description: 'Blocks one obstacle'
    });
    setSword({
      id: 'sword',
      name: 'Sword',
      icon: '⚔️',
      price: 0,
      uses: 3,
      maxUses: 3,
      description: 'Destroys 3 obstacles'
    });
  };

  return {
    wrcBalance,
    shield,
    sword,
    earnWRC,
    spendWRC,
    buyShield,
    buySword,
    useShield,
    useSword,
    grantFreeItems
  };
};
