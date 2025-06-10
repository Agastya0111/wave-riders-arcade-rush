
import { useRef } from "react";

interface UseTouchControlsProps {
  moveUp: () => void;
  moveDown: () => void;
  activateSpeedBoost: () => void;
}

export const useTouchControls = ({ moveUp, moveDown, activateSpeedBoost }: UseTouchControlsProps) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long tap timer
    longTapTimeoutRef.current = setTimeout(() => {
      activateSpeedBoost();
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 500); // 500ms for long tap
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    // Cancel long tap if finger moves
    if (longTapTimeoutRef.current) {
      clearTimeout(longTapTimeoutRef.current);
      longTapTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Cancel long tap timer
    if (longTapTimeoutRef.current) {
      clearTimeout(longTapTimeoutRef.current);
      longTapTimeoutRef.current = null;
    }

    // Check if it's a quick tap (not a swipe and not a long tap)
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 && deltaTime < 500) {
      // Quick tap - jump (move up)
      moveUp();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right - move down
        moveDown();
      } else {
        // Swipe left - move up
        moveUp();
      }
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else if (Math.abs(deltaY) > 50) {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        moveDown();
      } else {
        // Swipe up
        moveUp();
      }
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }

    touchStartRef.current = null;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
