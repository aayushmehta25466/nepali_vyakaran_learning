import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { TrendingUp, Star, Trophy, Target, Calendar, Award, Zap, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const ProgressContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.gradient};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-weight: 500;
  margin-bottom: 10px;
`;

const StatDescription = styled.div`
  color: #999;
  font-size: 0.9rem;
`;

const ProgressSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AchievementBadge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 15px;
  background: ${props => props.earned ? 
    'linear-gradient(45deg, #ffd700, #ffed4e)' : 
    'rgba(200, 200, 200, 0.2)'};
  color: ${props => props.earned ? '#8b7500' : '#999'};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.earned ? 'scale(1.05)' : 'none'};
  }
`;

const BadgeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const BadgeTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const BadgeDescription = styled.div`
  font-size: 0.7rem;
  opacity: 0.8;
`;

const ActivityChart = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-top: 20px;
`;

const ActivityDay = styled.div`
  aspect-ratio: 1;
  border-radius: 4px;
  background: ${props => {
    if (props.activity === 0) return '#f0f0f0';
    if (props.activity <= 2) return '#c6e48b';
    if (props.activity <= 5) return '#7bc96f';
    if (props.activity <= 10) return '#239a3b';
    return '#196127';
  }};
  position: relative;
  cursor: pointer;
  
  &:hover::after {
    content: '${props => props.activity} गतिविधि';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    z-index: 10;
  }
`;

const Progress = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();

  const stats = [
    {
      icon: Star,
      value: gameState.points,
      label: 'कुल अंक',
      description: 'सिकाइबाट प्राप्त',
      gradient: 'linear-gradient(45deg, #667eea, #764ba2)'
    },
    {
      icon: Trophy,
      value: gameState.level,
      label: 'तह',
      description: 'हालको स्तर',
      gradient: 'linear-gradient(45deg, #ffd700, #ffed4e)'
    },
    {
      icon: Target,
      value: gameState.totalCorrectAnswers,
      label: 'सही उत्तर',
      description: 'कुल सही जवाफ',
      gradient: 'linear-gradient(45deg, #56ab2f, #a8e6cf)'
    },
    {
      icon: Zap,
      value: gameState.currentStreak,
      label: 'लगातार सही',
      description: 'हालको श्रृंखला',
      gradient: 'linear-gradient(45deg, #ff6b6b, #ffa726)'
    }
  ];

  const achievements = [
    {
      id: 'first_lesson',
      icon: '📚',
      title: 'पहिलो पाठ',
      description: 'पहिलो पाठ पूरा',
      earned: gameState.completedLessons.length > 0
    },
    {
      id: 'point_collector',
      icon: '⭐',
      title: 'अंक संकलक',
      description: '100+ अंक',
      earned: gameState.points >= 100
    },
    {
      id: 'grammar_master',
      icon: '✏️',
      title: 'व्याकरण गुरु',
      description: '500+ अंक',
      earned: gameState.points >= 500
    },
    {
      id: 'streak_keeper',
      icon: '🔥',
      title: 'निरन्तरता',
      description: '5+ लगातार सही',
      earned: gameState.currentStreak >= 5
    },
    {
      id: 'coin_collector',
      icon: '🪙',
      title: 'सिक्का संकलक',
      description: '200+ सिक्का',
      earned: gameState.coins >= 200
    },
    {
      id: 'dedicated_learner',
      icon: '🎯',
      title: 'समर्पित सिकारु',
      description: '3+ पाठ पूरा',
      earned: gameState.completedLessons.length >= 3
    }
  ];

  // Generate mock activity data for the last 49 days
  const generateActivityData = () => {
    const data = [];
    for (let i = 48; i >= 0; i--) {
      const activity = Math.floor(Math.random() * 15);
      data.push(activity);
    }
    return data;
  };

  const activityData = generateActivityData();
  const completionPercentage = (gameState.completedLessons.length / 5) * 100;
  const nextLevelProgress = ((gameState.points % 100) / 100) * 100;

  return (
    <DashboardLayout pageTitle={t('progress')}>
      <ProgressContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle className="nepali-text">
            तपाईंको प्रगति
          </PageTitle>
        </motion.div>

        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              gradient={stat.gradient}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatIcon gradient={stat.gradient}>
              <stat.icon size={24} />
            </StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel className="nepali-text">{stat.label}</StatLabel>
            <StatDescription className="nepali-text">{stat.description}</StatDescription>
          </StatCard>
        ))}
      </StatsGrid>

      <ProgressSection>
        <SectionTitle className="nepali-text">
          <BookOpen />
          पाठ प्रगति
        </SectionTitle>
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </ProgressBar>
        <ProgressLabel>
          <span className="nepali-text">पूरा भएका पाठ: {gameState.completedLessons.length}/5</span>
          <span>{Math.round(completionPercentage)}%</span>
        </ProgressLabel>

        <SectionTitle className="nepali-text" style={{ marginTop: '30px' }}>
          <TrendingUp />
          अर्को तहसम्म
        </SectionTitle>
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${nextLevelProgress}%` }}
            transition={{ duration: 1, delay: 0.7 }}
          />
        </ProgressBar>
        <ProgressLabel>
          <span className="nepali-text">तह {gameState.level} → तह {gameState.level + 1}</span>
          <span>{Math.round(nextLevelProgress)}%</span>
        </ProgressLabel>
      </ProgressSection>

      <ProgressSection>
        <SectionTitle className="nepali-text">
          <Award />
          उपलब्धिहरू
        </SectionTitle>
        <AchievementsGrid>
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={achievement.id}
              earned={achievement.earned}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: achievement.earned ? 1.05 : 1 }}
            >
              <BadgeIcon>{achievement.icon}</BadgeIcon>
              <BadgeTitle className="nepali-text">{achievement.title}</BadgeTitle>
              <BadgeDescription className="nepali-text">{achievement.description}</BadgeDescription>
            </AchievementBadge>
          ))}
        </AchievementsGrid>
      </ProgressSection>

      <ProgressSection>
        <SectionTitle className="nepali-text">
          <Calendar />
          दैनिक गतिविधि
        </SectionTitle>
        <ActivityChart>
          {activityData.map((activity, index) => (
            <ActivityDay
              key={index}
              activity={activity}
            />
          ))}
        </ActivityChart>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '15px' }} className="nepali-text">
          पछिल्लो ७ हप्ताको सिकाइ गतिविधि
        </p>
      </ProgressSection>
      </ProgressContainer>
    </DashboardLayout>
  );
};

export default Progress;