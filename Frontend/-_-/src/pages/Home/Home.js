import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Gamepad2, PenTool, TrendingUp, Star, Award } from 'lucide-react';

const HomeContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 50px;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-weight: 500;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const ActivityCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ActivityIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
`;

const ActivityTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const ActivityDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ActivityButton = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AchievementSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AchievementTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const BadgeGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const Badge = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.earned ? 'linear-gradient(45deg, #ffd700, #ffed4e)' : 'rgba(200, 200, 200, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.earned ? '#8b7500' : '#999'};
  font-size: 24px;
  box-shadow: ${props => props.earned ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none'};
`;

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

  const badges = [
    { id: 'first_lesson', icon: '📚', earned: gameState.completedLessons.length > 0 },
    { id: 'grammar_master', icon: '✏️', earned: gameState.points > 500 },
    { id: 'streak_keeper', icon: '🔥', earned: gameState.currentStreak > 5 },
    { id: 'coin_collector', icon: '🪙', earned: gameState.coins > 200 }
  ];

  return (
    <HomeContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WelcomeTitle className="nepali-text">
          {t('welcome_title')}
        </WelcomeTitle>
        <WelcomeSubtitle>
          {t('welcome_subtitle')}
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickStatsGrid>
        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>
            <Star />
          </StatIcon>
          <StatValue>{gameState.points}</StatValue>
          <StatLabel>{t('points')}</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>
            <Award />
          </StatIcon>
          <StatValue>{gameState.level}</StatValue>
          <StatLabel>{t('level')}</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>
            <BookOpen />
          </StatIcon>
          <StatValue>{gameState.completedLessons.length}</StatValue>
          <StatLabel>पूरा भएका पाठ</StatLabel>
        </StatCard>
      </QuickStatsGrid>

      <ActivityGrid>
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.title}
            as={Link}
            to={activity.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <ActivityIcon gradient={activity.gradient}>
              <activity.icon size={40} />
            </ActivityIcon>
            <ActivityTitle>{activity.title}</ActivityTitle>
            <ActivityDescription className="nepali-text">
              {activity.description}
            </ActivityDescription>
            <ActivityButton>
              {t('start')}
            </ActivityButton>
          </ActivityCard>
        ))}
      </ActivityGrid>

      <AchievementSection>
        <AchievementTitle>तपाईंका उपलब्धिहरू</AchievementTitle>
        <BadgeGrid>
          {badges.map((badge, index) => (
            <Badge
              key={badge.id}
              earned={badge.earned}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {badge.icon}
            </Badge>
          ))}
        </BadgeGrid>
      </AchievementSection>
    </HomeContainer>
  );
};

export default Home;