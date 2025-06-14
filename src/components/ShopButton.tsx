
import React from "react";

interface ShopButtonProps {
  onClick: () => void;
  show: boolean;
}
export const ShopButton = ({ onClick, show }: ShopButtonProps) => {
  if (!show) return null;
  return (
    <button
      className="
        fixed 
        top-6 
        right-6 
        md:top-7 
        md:right-16
        bg-yellow-400 
        hover:bg-yellow-500 
        text-yellow-900 
        font-bold 
        px-5 
        py-2 
        rounded-full 
        shadow-xl 
        z-[50] 
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
      "
      style={{ fontSize: 22, letterSpacing: 2 }}
      onClick={onClick}
      aria-label="Open shop"
    >
      <span className="hidden md:inline">🛒 Shop</span>
      <span className="md:hidden" aria-hidden="true">🛒</span>
    </button>
  );
};
