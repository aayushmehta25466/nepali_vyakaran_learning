import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { Star, Trophy, Flame, BookOpen, Zap, User } from 'lucide-react';
import { getUserStats } from '../../services/api';

const Profile = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const { user } = useAuth();
  const [backendStats, setBackendStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const stats = await getUserStats();
        if (stats) setBackendStats(stats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  const displayStats = backendStats || gameState;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const stats = [
    { icon: <Star size={24} />, value: displayStats?.level || gameState.level, label: t('level') },
    { icon: <Zap size={24} />, value: displayStats?.points || gameState.points, label: t('points') },
    { icon: '💰', value: displayStats?.coins || gameState.coins, label: t('coins') },
    { icon: <Flame size={24} />, value: displayStats?.currentStreak || gameState.currentStreak, label: t('current_streak') },
    { icon: <BookOpen size={24} />, value: displayStats?.completedLessons?.length || gameState.completedLessons?.length || 0, label: t('lessons_completed') },
    { icon: '✓', value: displayStats?.totalCorrectAnswers || gameState.totalCorrectAnswers, label: t('correct_answers') }
  ];

  return (
    <DashboardLayout pageTitle={t('profile')}>
      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6 bg-gradient-to-br from-primary to-primary-dark
            text-white p-6 md:p-8 rounded-2xl mb-8 shadow-xl"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/30 flex items-center justify-center text-4xl md:text-5xl flex-shrink-0">
            <User className="text-white" size={48} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">{user?.username || 'User'}</h2>
            <p className="text-white/90 text-sm md:text-base">{user?.email || 'user@example.com'}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl p-5 text-center shadow-md
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold
                text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-dark mb-2">
                {typeof stat.icon === 'string' ? (
                  <span className="text-2xl">{stat.icon}</span>
                ) : (
                  <span className="text-primary">{stat.icon}</span>
                )}
                <span>{stat.value}</span>
              </div>
              <div className="text-gray-500 text-sm font-medium font-nepali">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 font-nepali">
            <Trophy size={20} className="text-primary" />
            {t('badges')}
          </h3>

          {(displayStats?.badges?.length || gameState.badges?.length) > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {(displayStats?.badges || gameState.badges)?.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary to-primary-dark p-4 rounded-xl text-white text-center shadow-md"
                >
                  <div className="text-2xl mb-2">{badge.icon || '🏆'}</div>
                  <div className="text-xs font-semibold">{badge.name}</div>
                  <div className="text-[10px] opacity-80">{formatDate(badge.earnedAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 font-nepali">
              {t('no_badges_yet')}
            </div>
          )}
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 font-nepali">
            <Zap size={20} className="text-primary" />
            {t('achievements')}
          </h3>

          {(displayStats?.achievements?.length || gameState.achievements?.length) > 0 ? (
            <div className="flex flex-col gap-3">
              {(displayStats?.achievements || gameState.achievements)?.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark
                    flex items-center justify-center text-white text-lg">
                    ⭐
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{achievement.name}</div>
                    <div className="text-sm text-gray-400">{formatDate(achievement.earnedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 font-nepali">
              {t('no_achievements_yet')}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
