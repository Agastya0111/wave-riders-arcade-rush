
import React from "react";

interface ShopButtonProps {
  onClick: () => void;
  show: boolean;
}
export const ShopButton = ({ onClick, show }: ShopButtonProps) => {
  if (!show) return null;
  return (
    <button
      className="fixed top-7 right-16 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-5 py-2 rounded-full shadow-xl z-[70] border-2 border-yellow-300 transition-all animate-enter"
      style={{ fontSize: 22, letterSpacing: 2 }}
      onClick={onClick}
    >
      🛒 Shop
    </button>
  );
};
