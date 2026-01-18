import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Target, Puzzle, BookOpen, Zap, Trophy, Star } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const Games = () => {
  const { t } = useLanguage();

  const availableGames = [
    {
      id: 'grammar-shooter',
      titleKey: 'grammar_shooter',
      descKey: 'grammar_shooter_desc',
      icon: Target,
      gradient: 'from-red-400 to-orange-400',
      difficulty: 'medium',
      points: '10-50',
      time: '5',
      link: '/games/grammar-shooter',
      available: true
    },
    {
      id: 'word-puzzle',
      titleKey: 'word_puzzle',
      descKey: 'word_puzzle_desc',
      icon: Puzzle,
      gradient: 'from-teal-400 to-emerald-500',
      difficulty: 'easy',
      points: '5-25',
      time: '10',
      link: '/games/word-puzzle',
      available: false
    },
    {
      id: 'story-builder',
      titleKey: 'story_builder',
      descKey: 'story_builder_desc',
      icon: BookOpen,
      gradient: 'from-green-300 to-green-600',
      difficulty: 'hard',
      points: '20-100',
      time: '15',
      link: '/games/story-builder',
      available: false
    },
    {
      id: 'quick-quiz',
      titleKey: 'quick_quiz',
      descKey: 'quick_quiz_desc',
      icon: Zap,
      gradient: 'from-pink-400 to-rose-500',
      difficulty: 'medium',
      points: '15-75',
      time: '3',
      link: '/games/quick-quiz',
      available: false
    }
  ];

  const getDifficultyStyle = (level) => {
    switch (level) {
      case 'easy': return 'from-secondary to-secondary-light';
      case 'medium': return 'from-yellow-400 to-yellow-500';
      case 'hard': return 'from-red-400 to-orange-400';
      default: return 'from-primary to-primary-dark';
    }
  };

  return (
    <DashboardLayout pageTitle={t('games')}>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-3 font-nepali">
            {t('fun_games')}
          </h1>
          <p className="text-center text-gray-500 text-base md:text-lg mb-8 font-nepali">
            {t('games_subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {availableGames.map((game, index) => {
            const IconComp = game.icon;

            if (game.available) {
              return (
                <Link key={game.id} to={game.link} className="no-underline">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg
                      border border-white/20 relative overflow-hidden cursor-pointer
                      hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.gradient}`} />

                    <span className={`absolute top-4 right-4 bg-gradient-to-r ${getDifficultyStyle(game.difficulty)}
                      text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {t(game.difficulty)}
                    </span>

                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient}
                      flex items-center justify-center mb-4 text-white`}>
                      <IconComp size={28} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 font-nepali">
                      {t(game.titleKey)}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 font-nepali">
                      {t(game.descKey)}
                    </p>

                    <div className="flex gap-3 mb-4">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star size={12} />
                        {game.points} {t('points')}
                      </span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Trophy size={12} />
                        {game.time} {t('minutes')}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-primary to-primary-dark text-white
                      py-2.5 rounded-full text-center font-semibold text-sm
                      hover:scale-105 transition-transform duration-300">
                      {t('start')}
                    </div>
                  </motion.div>
                </Link>
              );
            } else {
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg
                    border border-white/20 relative overflow-hidden opacity-60 cursor-not-allowed"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.gradient}`} />

                  <span className={`absolute top-4 right-4 bg-gradient-to-r ${getDifficultyStyle(game.difficulty)}
                    text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {t(game.difficulty)}
                  </span>

                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient}
                    flex items-center justify-center mb-4 text-white`}>
                    <IconComp size={28} />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 font-nepali">
                    {t(game.titleKey)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 font-nepali">
                    {t(game.descKey)}
                  </p>

                  <div className="flex gap-3 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star size={12} />
                      {game.points} {t('points')}
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Trophy size={12} />
                      {game.time} {t('minutes')}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-gray-400 to-gray-300 text-white
                    py-2.5 rounded-full text-center font-semibold text-sm">
                    {t('coming_soon')}
                  </div>
                </motion.div>
              );
            }
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Games;