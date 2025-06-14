
import React from "react";

interface ErrorMessageProps {
  message: string;
}
export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  return (
    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <div className="bg-red-500 text-white font-bold text-lg px-6 py-3 rounded-lg shadow-lg animate-bounce">
        {message}
      </div>
    </div>
  );
};
