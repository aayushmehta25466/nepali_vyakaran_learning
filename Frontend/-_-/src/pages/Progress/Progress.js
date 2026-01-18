import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { TrendingUp, Star, Trophy, Target, Calendar, Award, Zap, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const Progress = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();

  const stats = [
    { icon: Star, value: gameState.points, labelKey: 'points', descKey: 'points_from_learning', gradient: 'from-primary to-primary-dark' },
    { icon: Trophy, value: gameState.level, labelKey: 'level', descKey: 'current_level', gradient: 'from-yellow-400 to-yellow-500' },
    { icon: Target, value: gameState.totalCorrectAnswers, labelKey: 'correct_answers', descKey: 'total_correct', gradient: 'from-secondary to-secondary-light' },
    { icon: Zap, value: gameState.currentStreak, labelKey: 'current_streak', descKey: 'current_series', gradient: 'from-red-400 to-orange-400' }
  ];

  const achievements = [
    { id: 'first_lesson', icon: '📚', titleKey: 'first_lesson_badge', descKey: 'first_lesson_desc', earned: gameState.completedLessons.length > 0 },
    { id: 'point_collector', icon: '⭐', titleKey: 'point_collector_badge', descKey: 'points_100_desc', earned: gameState.points >= 100 },
    { id: 'grammar_master', icon: '✏️', titleKey: 'grammar_master_badge', descKey: 'points_500_desc', earned: gameState.points >= 500 },
    { id: 'streak_keeper', icon: '🔥', titleKey: 'streak_keeper_badge', descKey: 'streak_5_desc', earned: gameState.currentStreak >= 5 },
    { id: 'coin_collector', icon: '🪙', titleKey: 'coin_collector_badge', descKey: 'coins_200_desc', earned: gameState.coins >= 200 },
    { id: 'dedicated_learner', icon: '🎯', titleKey: 'dedicated_learner_badge', descKey: 'lessons_3_desc', earned: gameState.completedLessons.length >= 3 }
  ];

  const generateActivityData = () => {
    const data = [];
    for (let i = 48; i >= 0; i--) {
      data.push(Math.floor(Math.random() * 15));
    }
    return data;
  };

  const activityData = generateActivityData();
  const completionPercentage = (gameState.completedLessons.length / 5) * 100;
  const nextLevelProgress = ((gameState.points % 100) / 100) * 100;

  const getActivityColor = (activity) => {
    if (activity === 0) return 'bg-gray-200';
    if (activity <= 2) return 'bg-green-200';
    if (activity <= 5) return 'bg-green-400';
    if (activity <= 10) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <DashboardLayout pageTitle={t('progress')}>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-5 font-nepali">
            {t('your_progress')}
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg
                  border border-white/20 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.gradient} 
                  flex items-center justify-center mx-auto mb-3 text-white`}>
                  <IconComp size={20} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-gray-500 font-medium text-sm font-nepali">{t(stat.labelKey)}</div>
                <div className="text-gray-400 text-xs mt-1 font-nepali">{t(stat.descKey)}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bars Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 font-semibold font-nepali">
            <BookOpen size={20} />
            {t('lesson_progress')}
          </h2>
          <div className="w-full h-5 bg-primary/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full relative
                after:content-[''] after:absolute after:inset-0 
                after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent
                after:animate-pulse"
            />
          </div>
          <div className="flex justify-between text-gray-500 text-sm mb-6">
            <span className="font-nepali">{t('lessons_completed')}: {gameState.completedLessons.length}/5</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>

          <h2 className="text-gray-800 mb-4 flex items-center gap-2 font-semibold font-nepali mt-6">
            <TrendingUp size={20} />
            {t('next_level')}
          </h2>
          <div className="w-full h-5 bg-primary/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nextLevelProgress}%` }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
            />
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span className="font-nepali">{t('level')} {gameState.level} → {t('level')} {gameState.level + 1}</span>
            <span>{Math.round(nextLevelProgress)}%</span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 font-semibold font-nepali">
            <Award size={20} />
            {t('achievements')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: achievement.earned ? 1.05 : 1 }}
                className={`flex flex-col items-center p-3 rounded-xl text-center transition-all duration-300
                  ${achievement.earned
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-yellow-800'
                    : 'bg-gray-100 text-gray-400'}`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className="text-xs font-semibold font-nepali">{t(achievement.titleKey)}</div>
                <div className="text-[10px] opacity-80 font-nepali">{t(achievement.descKey)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Chart Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-lg">
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 font-semibold font-nepali">
            <Calendar size={20} />
            {t('daily_activity')}
          </h2>
          <div className="grid grid-cols-7 gap-1">
            {activityData.map((activity, index) => (
              <div
                key={index}
                className={`aspect-square rounded-sm cursor-pointer ${getActivityColor(activity)}`}
                title={`${activity} ${t('activities')}`}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4 font-nepali">
            {t('last_7_weeks_activity')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Progress;