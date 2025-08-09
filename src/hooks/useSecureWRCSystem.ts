
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

export const useSecureWRCSystem = () => {
  const [wrc, setWrc] = useState(0);
  const [shieldAvailable, setShieldAvailable] = useState(false);
  const [swordUses, setSwordUses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load WRC balance securely
  useEffect(() => {
    const loadWRCBalance = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('wrc_balance')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.warn('Error loading WRC balance:', error);
            return;
          }
          
          if (data) {
            setWrc(data.wrc_balance || 0);
          }
        } catch (error) {
          console.error('Failed to load WRC balance:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest mode - use localStorage with validation
        try {
          const savedBalance = localStorage.getItem('wrc_balance');
          const parsedBalance = savedBalance ? parseInt(savedBalance, 10) : 0;
          
          // Validate the stored value
          if (isNaN(parsedBalance) || parsedBalance < 0) {
            localStorage.setItem('wrc_balance', '0');
            setWrc(0);
          } else {
            setWrc(parsedBalance);
          }
        } catch (error) {
          console.warn('Error loading guest WRC balance:', error);
          setWrc(0);
        }
      }
    };

    loadWRCBalance();
  }, [user]);

  // Secure WRC adjustment with proper validation
  const adjustWRC = async (delta: number): Promise<{ success: boolean; new_balance: number; message?: string }> => {
    // Input validation
    if (!Number.isInteger(delta)) {
      return { success: false, new_balance: wrc, message: "Invalid amount" };
    }

    if (user) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('adjust_wrc_balance', { 
          p_user_id: user.id, 
          p_delta: delta 
        });
        
        if (error) {
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
      } catch (error) {
        console.error('WRC adjustment failed:', error);
        return { success: false, new_balance: wrc, message: "Network error. Please try again." };
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest fallback with enhanced validation
      const newBalance = wrc + delta;
      if (newBalance < 0) {
        return { success: false, new_balance: wrc, message: "Insufficient WRC." };
      }
      
      // Prevent excessive accumulation in guest mode
      if (newBalance > 10000) {
        return { success: false, new_balance: wrc, message: "Maximum WRC limit reached. Please create an account." };
      }
      
      try {
        setWrc(newBalance);
        localStorage.setItem('wrc_balance', String(newBalance));
        return { success: true, new_balance: newBalance, message: "OK" };
      } catch (error) {
        console.warn('Failed to save guest WRC balance:', error);
        return { success: false, new_balance: wrc, message: "Failed to save balance." };
      }
    }
  };

  const earnWRC = async (amount: number) => {
    if (amount <= 0 || amount > 100) {
      return { success: false, new_balance: wrc, message: "Invalid earn amount" };
    }
    return await adjustWRC(amount);
  };

  const buyShield = async () => {
    if (shieldAvailable) {
      return { success: false, message: "You already own a Shield." };
    }
    if (isLoading) {
      return { success: false, message: "Please wait..." };
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
    if (isLoading) {
      return { success: false, message: "Please wait..." };
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
    isLoading,
    earnWRC,
    buyShield,
    buySword,
    useShield,
    useSword,
  };
};

export type SecureWRCSystemHook = ReturnType<typeof useSecureWRCSystem>;
