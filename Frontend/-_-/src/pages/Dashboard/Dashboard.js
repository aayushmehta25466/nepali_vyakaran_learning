import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Gamepad2, PenTool, TrendingUp, Trophy, Zap, Award, Settings, Menu, X, Home, User } from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: <TrendingUp size={20} />, label: t('dashboard'), path: '/dashboard' },
    { icon: <Home size={20} />, label: t('village'), path: '/village' },
    { icon: <BookOpen size={20} />, label: t('lessons'), path: '/lessons' },
    { icon: <Gamepad2 size={20} />, label: t('games'), path: '/games' },
    { icon: <PenTool size={20} />, label: t('writing'), path: '/writing' },
    { icon: <Award size={20} />, label: t('progress'), path: '/progress' }
  ];

  const activities = [
    { icon: '📚', title: t('lessons'), description: t('lessons_desc'), link: '/lessons' },
    { icon: '🎮', title: t('games'), description: t('games_desc'), link: '/games' },
    { icon: '✍️', title: t('writing'), description: t('writing_desc'), link: '/writing' },
    { icon: '📊', title: t('progress'), description: t('progress_desc'), link: '/progress' }
  ];

  const stats = [
    { icon: <Trophy />, value: gameState.level, label: t('level'), delay: 0 },
    { icon: <TrendingUp />, value: gameState.points, label: t('points'), delay: 0.1 },
    { icon: <Award />, value: gameState.coins, label: t('coins'), delay: 0.2 },
    { icon: <Zap />, value: gameState.currentStreak, label: t('current_streak'), delay: 0.3 }
  ];

  return (
    <div className="flex min-h-[calc(100vh-60px)] bg-gray-100 mt-[60px]">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-[60px] bg-black/50 z-[99] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`
          w-[220px] bg-gradient-to-b from-primary to-primary-dark text-white
          py-5 shadow-lg overflow-y-auto fixed h-[calc(100vh-60px)] left-0 top-[60px] z-[100]
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="border-b border-white/20 mb-2.5" />

        <nav className="flex flex-col">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 text-white/85 no-underline
                transition-all duration-300 border-l-4 border-transparent text-[0.95rem]
                hover:bg-white/10 hover:text-white hover:border-l-white
                ${isActive(item.path) ? 'bg-white/15 text-white border-l-white font-semibold' : ''}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="h-px bg-white/20 my-5" />

        <nav className="flex flex-col">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 text-white/85 no-underline
              transition-all duration-300 border-l-4 border-transparent text-[0.95rem]
              hover:bg-white/10 hover:text-white hover:border-l-white"
          >
            <User size={20} />
            <span>{t('profile')}</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 text-white/85 no-underline
              transition-all duration-300 border-l-4 border-transparent text-[0.95rem]
              hover:bg-white/10 hover:text-white hover:border-l-white"
          >
            <Settings size={20} />
            <span>{t('settings')}</span>
          </Link>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-[220px] p-6 md:p-8 bg-white min-h-[calc(100vh-60px)]">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-800 m-0 font-bold font-nepali">
              {t('dashboard_title')}
            </h1>
            <p className="text-gray-500 mt-1 font-nepali">{t('welcome_subtitle')}</p>
          </div>
          <button
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg
              bg-gradient-to-r from-primary to-primary-dark text-white border-none cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Stats Section */}
        <section className="mb-10">
          <h2 className="text-xl text-gray-800 mb-5 font-semibold font-nepali">
            {t('my_progress')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: stat.delay }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 text-center
                  shadow-md hover:shadow-xl hover:-translate-y-2 hover:scale-[1.03]
                  hover:border-primary transition-all duration-400 cursor-pointer
                  border-2 border-transparent relative overflow-hidden group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full
                  flex items-center justify-center mx-auto mb-3 text-white
                  shadow-md group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-400">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-1
                  group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-500 font-medium text-sm font-nepali">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section className="mb-10">
          <h2 className="text-xl text-gray-800 mb-5 font-semibold font-nepali">
            {t('continue_learning')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activities.map((activity, index) => (
              <Link key={index} to={activity.link} className="no-underline text-inherit">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6
                    shadow-md hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02]
                    hover:border-primary transition-all duration-400 cursor-pointer
                    border-3 border-transparent relative overflow-hidden group
                    before:content-[''] before:absolute before:top-0 before:left-0 before:right-0
                    before:h-1 before:bg-gradient-to-r before:from-primary before:to-primary-dark
                    before:scale-x-0 before:transition-transform before:duration-400
                    hover:before:scale-x-100"
                >
                  <div className="text-4xl mb-4 group-hover:scale-120 group-hover:-rotate-[5deg] transition-all duration-400">
                    {activity.icon}
                  </div>
                  <h3 className="text-lg text-gray-800 mb-2 font-bold group-hover:text-primary transition-colors duration-300 font-nepali">
                    {activity.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 leading-relaxed font-nepali">
                    {activity.description}
                  </p>
                  <span className="text-primary font-bold inline-flex items-center gap-2
                    group-hover:gap-4 group-hover:text-primary-dark transition-all duration-300">
                    {t('continue')} →
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
