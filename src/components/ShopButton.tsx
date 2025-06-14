
import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ShopButtonProps {
  onClick: () => void;
  show: boolean;
  userCanAfford?: boolean; // if user can afford anything in shop, pulse/animate
}
export const ShopButton = ({ onClick, show, userCanAfford = false }: ShopButtonProps) => {
  if (!show) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`
            fixed 
            top-28
            right-6 
            md:top-32 
            md:right-16
            bg-yellow-400 
            hover:bg-yellow-500 
            text-yellow-900 
            font-bold 
            px-5 
            py-2 
            rounded-full 
            shadow-xl 
            z-[60] 
            border-2 
            border-yellow-300 
            transition-all 
            animate-enter
            md:w-auto
            w-14
            min-w-[48px]
            min-h-[48px]
            flex
            items-center
            justify-center
            ${userCanAfford ? "animate-bounce hover:animate-none" : ""}
          `}
          style={{ fontSize: 22, letterSpacing: 2 }}
          onClick={onClick}
          aria-label="Open shop"
        >
          <span className="hidden md:inline">🛒 Shop</span>
          <span className="md:hidden" aria-hidden="true">🛒</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8} className="text-base">
        Spend your WRC for powerups!
      </TooltipContent>
    </Tooltip>
  );
};
