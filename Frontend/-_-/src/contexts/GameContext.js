import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const initialGameState = {
  level: 1,
  points: 0,
  coins: 100,
  badges: [],
  unlockedZones: ['basic_grammar'],
  currentStreak: 0,
  totalCorrectAnswers: 0,
  completedLessons: [],
  achievements: []
};

export const GameProvider = ({ children }) => {
  const { gameState: authGameState, user } = useAuth();
  
  const normalizeGameState = (incoming) => {
    if (!incoming || typeof incoming !== 'object') {
      return initialGameState;
    }

    const completed = Array.isArray(incoming.completedLessons)
      ? incoming.completedLessons
      : Array.isArray(incoming.completed_lessons)
        ? incoming.completed_lessons
        : [];

    return {
      ...initialGameState,
      ...incoming,
      completedLessons: completed
    };
  };

  // Initialize game state from localStorage or use initial state
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('nepali-learning-game-state');
    const parsed = saved ? JSON.parse(saved) : null;
    return normalizeGameState(parsed);
  });

  // When user logs in and authGameState is available, sync it with local state
  useEffect(() => {
    if (user && authGameState) {
      console.log('🔄 Syncing game state from backend:', authGameState);
      const normalized = normalizeGameState(authGameState);
      setGameState(normalized);
      // Save to localStorage
      localStorage.setItem('nepali-learning-game-state', JSON.stringify(normalized));
    }
  }, [user, authGameState]);

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    localStorage.setItem('nepali-learning-game-state', JSON.stringify(gameState));
  }, [gameState]);

  const addPoints = (points) => {
    setGameState(prev => ({
      ...prev,
      points: prev.points + points,
      totalCorrectAnswers: prev.totalCorrectAnswers + 1,
      currentStreak: prev.currentStreak + 1
    }));
  };

  const addCoins = (coins) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + coins
    }));
  };

  const spendCoins = (amount) => {
    setGameState(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount)
    }));
  };

  const levelUp = () => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      coins: prev.coins + 50 // Bonus coins for leveling up
    }));
  };

  const addBadge = (badge) => {
    setGameState(prev => ({
      ...prev,
      badges: [...prev.badges, { ...badge, earnedAt: new Date().toISOString() }]
    }));
  };

  const unlockZone = (zoneId) => {
    setGameState(prev => ({
      ...prev,
      unlockedZones: [...new Set([...prev.unlockedZones, zoneId])]
    }));
  };

  const completeLesson = (lessonId) => {
    setGameState(prev => ({
      ...prev,
      completedLessons: [...new Set([...prev.completedLessons, lessonId])]
    }));
  };

  const resetStreak = () => {
    setGameState(prev => ({
      ...prev,
      currentStreak: 0
    }));
  };

  const addAchievement = (achievement) => {
    setGameState(prev => ({
      ...prev,
      achievements: [...prev.achievements, { ...achievement, earnedAt: new Date().toISOString() }]
    }));
  };

  // Calculate level based on points
  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1;
  };

  // Check if level up is needed
  useEffect(() => {
    const newLevel = calculateLevel(gameState.points);
    if (newLevel > gameState.level) {
      levelUp();
    }
  }, [gameState.points]);

  return (
    <GameContext.Provider value={{
      gameState,
      addPoints,
      addCoins,
      spendCoins,
      levelUp,
      addBadge,
      unlockZone,
      completeLesson,
      resetStreak,
      addAchievement,
      calculateLevel
    }}>
      {children}
    </GameContext.Provider>
  );
};