import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { Settings as SettingsIcon, Globe, Volume2, Palette, User, Shield, HelpCircle, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const SettingsContainer = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  text-align: center;
  color: #333;
  font-size: 2.2rem;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SettingsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const SettingDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Toggle = styled.div`
  width: 50px;
  height: 26px;
  border-radius: 13px;
  background: ${props => props.active ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#ccc'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' ? 
    'linear-gradient(45deg, #ff6b6b, #ffa726)' : 
    'linear-gradient(45deg, #667eea, #764ba2)'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const ProfileStats = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const ThemeOption = styled.div`
  width: 100px;
  height: 60px;
  border-radius: 10px;
  background: ${props => props.gradient};
  cursor: pointer;
  border: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &::after {
    content: '${props => props.name}';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
  }
`;

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
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelect = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm('के तपाईं आफ्नो सबै प्रगति रिसेट गर्न चाहनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।')) {
      localStorage.removeItem('nepali-learning-game-state');
      localStorage.removeItem('nepali-writing-works');
      window.location.reload();
    }
  };

  const themes = [
    { id: 'default', name: 'मूल', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'nature', name: 'प्रकृति', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
    { id: 'sunset', name: 'सूर्यास्त', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)' },
    { id: 'ocean', name: 'समुद्र', gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' }
  ];

  return (
    <DashboardLayout pageTitle={t('settings')}>
      <SettingsContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle className="nepali-text">
            {t('settings_page_title')}
          </PageTitle>
        </motion.div>

        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionTitle className="nepali-text">
            <User />
            {t('profile')}
          </SectionTitle>
        
        <ProfileSection>
          <Avatar>
            सि
          </Avatar>
          <ProfileInfo>
            <ProfileName className="nepali-text">{t('learner')}</ProfileName>
            <ProfileStats className="nepali-text">
              {t('level')} {gameState.level} • {gameState.points} {t('points')} • {gameState.completedLessons.length} {t('lessons_completed_label')}
            </ProfileStats>
          </ProfileInfo>
        </ProfileSection>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SectionTitle className="nepali-text">
          <Globe />
          {t('language_region')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('interface_language')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('ui_language_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Button onClick={toggleLanguage}>
              <Globe />
              {language === 'ne' ? 'English' : 'नेपाली'}
            </Button>
          </SettingControl>
        </SettingItem>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SectionTitle className="nepali-text">
          <Volume2 />
          {t('notification_settings')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('notifications')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('notifications_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle 
              active={settings.notificationsEnabled}
              onClick={() => handleToggle('notificationsEnabled')}
            />
          </SettingControl>
        </SettingItem>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SectionTitle className="nepali-text">
          <Palette />
          {t('appearance')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('font_size')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('font_size_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Select 
              value={settings.fontSize}
              onChange={(e) => handleSelect('fontSize', e.target.value)}
            >
              <option value="small">{t('small')}</option>
              <option value="medium">{t('medium_label')}</option>
              <option value="large">{t('large')}</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('color_theme')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('color_theme_desc')}
            </SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <ThemeGrid>
          {themes.map(theme => (
            <ThemeOption
              key={theme.id}
              gradient={theme.gradient}
              name={
                theme.id === 'default' ? t('theme_default') :
                theme.id === 'nature' ? t('theme_nature') :
                theme.id === 'sunset' ? t('theme_sunset') :
                t('theme_ocean')
              }
              active={settings.theme === theme.id}
              onClick={() => handleSelect('theme', theme.id)}
            />
          ))}
        </ThemeGrid>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SectionTitle className="nepali-text">
          <SettingsIcon />
          {t('learning_settings')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('difficulty')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('difficulty_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Select 
              value={settings.difficulty}
              onChange={(e) => handleSelect('difficulty', e.target.value)}
            >
              <option value="easy">{t('easy')}</option>
              <option value="medium">{t('medium_label')}</option>
              <option value="hard">{t('hard')}</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('auto_save')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('auto_save_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle 
              active={settings.autoSave}
              onClick={() => handleToggle('autoSave')}
            />
          </SettingControl>
        </SettingItem>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <SectionTitle className="nepali-text">
          <Shield />
          {t('data_management')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('reset_progress')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('reset_progress_desc')}
            </SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Button variant="danger" onClick={handleResetProgress}>
              <RotateCcw />
              {t('reset')}
            </Button>
          </SettingControl>
        </SettingItem>
      </SettingsCard>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <SectionTitle className="nepali-text">
          <HelpCircle />
          {t('help_support')}
        </SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle className="nepali-text">{t('version')}</SettingTitle>
            <SettingDescription className="nepali-text">
              {t('app_version')}
            </SettingDescription>
          </SettingLabel>
        </SettingItem>
      </SettingsCard>
      </SettingsContainer>
    </DashboardLayout>
  );
};

export default Settings;