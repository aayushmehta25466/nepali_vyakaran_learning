import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { Settings as SettingsIcon, Globe, Volume2, Palette, User, Shield, HelpCircle, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const Settings = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { gameState } = useGame();

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    autoSave: true,
    theme: 'default',
    difficulty: 'medium',
    fontSize: 'medium'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSelect = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleResetProgress = () => {
    if (window.confirm(t('reset_confirm'))) {
      localStorage.removeItem('nepali-learning-game-state');
      localStorage.removeItem('nepali-writing-works');
      window.location.reload();
    }
  };

  const themes = [
    { id: 'default', nameKey: 'theme_default', gradient: 'from-primary to-primary-dark' },
    { id: 'nature', nameKey: 'theme_nature', gradient: 'from-secondary to-secondary-light' },
    { id: 'sunset', nameKey: 'theme_sunset', gradient: 'from-red-400 to-orange-400' },
    { id: 'ocean', nameKey: 'theme_ocean', gradient: 'from-teal-400 to-emerald-500' }
  ];

  return (
    <DashboardLayout pageTitle={t('settings')}>
      <div className="px-4 py-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-5 font-nepali">
            {t('settings_page_title')}
          </h1>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <User size={20} />
            {t('profile')}
          </h2>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark
              flex items-center justify-center text-white text-2xl font-bold">
              सि
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800 mb-1 font-nepali">{t('learner')}</div>
              <div className="text-gray-500 text-sm font-nepali">
                {t('level')} {gameState.level} • {gameState.points} {t('points')} • {gameState.completedLessons.length} {t('lessons_completed_label')}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Language Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <Globe size={20} />
            {t('language_region')}
          </h2>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('interface_language')}</div>
              <div className="text-gray-500 text-sm font-nepali">{t('ui_language_desc')}</div>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold
                bg-gradient-to-r from-primary to-primary-dark text-white
                hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              <Globe size={16} />
              {language === 'ne' ? 'English' : 'नेपाली'}
            </button>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <Volume2 size={20} />
            {t('notification_settings')}
          </h2>

          <div className="flex justify-between items-center py-3">
            <div>
              <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('notifications')}</div>
              <div className="text-gray-500 text-sm font-nepali">{t('notifications_desc')}</div>
            </div>
            <div
              onClick={() => handleToggle('notificationsEnabled')}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300
                ${settings.notificationsEnabled ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 shadow transition-all duration-300
                ${settings.notificationsEnabled ? 'left-6' : 'left-0.5'}`} />
            </div>
          </div>
        </motion.div>

        {/* Learning Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <SettingsIcon size={20} />
            {t('learning_settings')}
          </h2>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('difficulty')}</div>
              <div className="text-gray-500 text-sm font-nepali">{t('difficulty_desc')}</div>
            </div>
            <select
              value={settings.difficulty}
              onChange={(e) => handleSelect('difficulty', e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700
                focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="easy">{t('easy')}</option>
              <option value="medium">{t('medium_label')}</option>
              <option value="hard">{t('hard')}</option>
            </select>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('auto_save')}</div>
              <div className="text-gray-500 text-sm font-nepali">{t('auto_save_desc')}</div>
            </div>
            <div
              onClick={() => handleToggle('autoSave')}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300
                ${settings.autoSave ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 shadow transition-all duration-300
                ${settings.autoSave ? 'left-6' : 'left-0.5'}`} />
            </div>
          </div>
        </motion.div>

        {/* Data Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <Shield size={20} />
            {t('data_management')}
          </h2>

          <div className="flex justify-between items-center py-3">
            <div>
              <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('reset_progress')}</div>
              <div className="text-gray-500 text-sm font-nepali">{t('reset_progress_desc')}</div>
            </div>
            <button
              onClick={handleResetProgress}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold
                bg-gradient-to-r from-red-400 to-orange-400 text-white
                hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              <RotateCcw size={16} />
              {t('reset')}
            </button>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20"
        >
          <h2 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
            <HelpCircle size={20} />
            {t('help_support')}
          </h2>

          <div className="py-3">
            <div className="font-semibold text-gray-800 mb-1 font-nepali">{t('version')}</div>
            <div className="text-gray-500 text-sm font-nepali">{t('app_version')}</div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;