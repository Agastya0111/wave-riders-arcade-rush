
import { createContext, useContext, useState, useRef, ReactNode } from "react";
import { GameOver } from "@/components/GameOver";
import { Victory } from "@/components/Victory";
import { useGameState, GameStateHook } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGameSession } from "@/hooks/useGameSession";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useWRCSystem, WRCSystemHook } from "@/hooks/useWRCSystem";
import { useItemEffects } from "@/hooks/useItemEffects";
import type { Avatar } from "@/pages/Index";

import { useGameInteractions } from "@/hooks/useGameInteractions";
import { useGameActions } from "@/hooks/useGameActions";
import { GameRenderer } from "@/components/GameRenderer";
import { GameHUD } from "@/components/GameHUD";
import { GamePopups } from "@/components/GamePopups";
import { Challenge } from "@/components/ChallengeBanner";
import { useGameDerivedState } from "@/hooks/useGameDerivedState";
import { useGameLifecycleEffects } from "@/hooks/useGameLifecycleEffects";

interface GameProviderProps {
  avatar: Avatar;
  onRestart: () => void;
  onSignup: () => void;
  children: ReactNode;
}

interface GameContextValue {
  gameState: GameStateHook;
  wrcSystem: WRCSystemHook;
  itemEffects: ReturnType<typeof useItemEffects>;
  gameInteractions: ReturnType<typeof useGameInteractions>;
  gameActions: ReturnType<typeof useGameActions>;
  gameControls: ReturnType<typeof useGameControls>;
  touchControls: ReturnType<typeof useTouchControls>;
  derivedState: ReturnType<typeof useGameDerivedState>;
  playerX: number;
  gameAreaRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
  dolphinsUsed: number;
  setDolphinsUsed: React.Dispatch<React.SetStateAction<number>>;
  localShowShop: boolean;
  setLocalShowShop: React.Dispatch<React.SetStateAction<boolean>>;
  replayOverlayVisible: boolean;
  handleReplayRequest: () => void;
  avatar: Avatar;
  onSignup: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ avatar, onRestart, onSignup, children }: GameProviderProps) => {
  const gameState = useGameState();
  const playerX = 100;
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [livesUsed, setLivesUsed] = useState(0);
  const [dolphinsUsed, setDolphinsUsed] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const wrcSystem = useWRCSystem();
  const itemEffects = useItemEffects();

  const [challenge, setChallenge] = useState<Challenge>({
    text: "Collect 7 coins in a round!",
    completed: false
  });

  const gameInteractions = useGameInteractions({
    coinsCollected: gameState.coinsCollected,
    challenge,
    setChallenge,
    wrcSystemEarnWRC: wrcSystem.earnWRC,
  });

  const gameActions = useGameActions({
    gameState,
    wrcSystem,
    itemEffects,
    onRestart,
    setLivesUsed,
    setDolphinsUsed,
    showError: gameInteractions.showError,
  });

  const gameControls = useGameControls({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    gamePaused: gameState.gamePaused,
    speedBoostCount: gameState.speedBoostCount,
    speedBoost: gameState.speedBoost,
    setPlayerY: gameState.setPlayerY,
    setSpeedBoost: gameState.setSpeedBoost,
    setSpeedBoostCount: gameState.setSpeedBoostCount,
  });

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    moveUp: gameControls.moveUp,
    moveDown: gameControls.moveDown,
    activateSpeedBoost: gameControls.activateSpeedBoost,
  });
  
  useGameLoop({
    ...gameState,
    playerX,
    onCoinCollected: gameInteractions.handleCoinCollected,
  });

  useGameEvents({
    ...gameState,
    playerX,
    isInvincible: gameInteractions.isInvincible,
  });

  useGameSession({
    gameOver: gameState.gameOver,
    victory: gameState.victory,
    score: gameState.score,
    level: gameState.level,
    avatar,
    startTime,
    livesUsed,
    dolphinsUsed,
  });

  const [localShowShop, setLocalShowShop] = useState(false);
  const [replayOverlayVisible, setReplayOverlayVisible] = useState(false);

  useGameLifecycleEffects({
    gameState,
    gameActions,
    localShowShop,
    setReplayOverlayVisible,
    setIsMobile,
    setLivesUsed,
    initialLives: 3,
  });

  const derivedState = useGameDerivedState({
    gameState,
    wrcSystem,
    localShowShop,
  });

  const handleReplayRequest = () => {
    setReplayOverlayVisible(false);
    gameActions.handleRestartGame();
  };

  const value = {
    gameState,
    wrcSystem,
    itemEffects,
    gameInteractions,
    gameActions,
    gameControls,
    touchControls: { handleTouchStart, handleTouchMove, handleTouchEnd },
    derivedState,
    playerX,
    gameAreaRef,
    isMobile,
    dolphinsUsed,
    setDolphinsUsed,
    localShowShop,
    setLocalShowShop,
    replayOverlayVisible,
    handleReplayRequest,
    avatar,
    onSignup,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
