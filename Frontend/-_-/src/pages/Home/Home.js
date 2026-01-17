import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Gamepad2, PenTool, TrendingUp, Star, Award } from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();

  const activities = [
    {
      icon: BookOpen,
      title: t('lessons'),
      description: t('lessons_desc'),
      link: '/lessons',
      gradient: 'from-red-400 to-orange-400'
    },
    {
      icon: Gamepad2,
      title: t('games'),
      description: t('games_desc'),
      link: '/games',
      gradient: 'from-teal-400 to-green-600'
    },
    {
      icon: PenTool,
      title: t('writing'),
      description: t('writing_desc'),
      link: '/writing',
      gradient: 'from-green-300 to-green-600'
    },
    {
      icon: TrendingUp,
      title: t('progress'),
      description: t('progress_desc'),
      link: '/progress',
      gradient: 'from-pink-400 to-red-500'
    }
  ];

  const badges = [
    { id: 'first_lesson', icon: '📚', earned: gameState.completedLessons.length > 0 },
    { id: 'grammar_master', icon: '✏️', earned: gameState.points > 500 },
    { id: 'streak_keeper', icon: '🔥', earned: gameState.currentStreak > 5 },
    { id: 'coin_collector', icon: '🪙', earned: gameState.coins > 200 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 drop-shadow-lg font-nepali">
          {t('welcome_title')}
        </h1>
        <p className="text-xl text-white/90 font-nepali">
          {t('welcome_subtitle')}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{gameState.points}</div>
          <div className="text-gray-600 font-medium font-nepali">{t('points')}</div>
        </motion.div>

        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{gameState.level}</div>
          <div className="text-gray-600 font-medium font-nepali">{t('level')}</div>
        </motion.div>

        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{gameState.completedLessons.length}</div>
          <div className="text-gray-600 font-medium font-nepali">{t('lessons_completed')}</div>
        </motion.div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <Link
              to={activity.link}
              className="block bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl
                hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${activity.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                <activity.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 font-nepali">{activity.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed font-nepali">
                {activity.description}
              </p>
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2 rounded-full text-center font-semibold text-sm hover:scale-105 transition-transform font-nepali">
                {t('start')}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 text-center font-nepali">
          {t('your_achievements')}
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl
                ${badge.earned 
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg' 
                  : 'bg-gray-200'
                }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {badge.icon}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

const Home = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();

  const activities = [
    {
      icon: BookOpen,
      title: t('lessons'),
      description: t('lessons_desc'),
      link: '/lessons',
      gradient: 'linear-gradient(45deg, #ff6b6b, #ffa726)'
    },
    {
      icon: Gamepad2,
      title: t('games'),
      description: t('games_desc'),
      link: '/games',
      gradient: 'linear-gradient(45deg, #4ecdc4, #44a08d)'
    },
    {
      icon: PenTool,
      title: t('writing'),
      description: t('writing_desc'),
      link: '/writing',
      gradient: 'linear-gradient(45deg, #a8e6cf, #56ab2f)'
    },
    {
      icon: TrendingUp,
      title: t('progress'),
      description: t('progress_desc'),
      link: '/progress',
      gradient: 'linear-gradient(45deg, #f093fb, #f5576c)'
    }
  ];

export default Home;