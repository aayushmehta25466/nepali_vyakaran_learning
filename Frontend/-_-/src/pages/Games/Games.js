import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Target, Puzzle, BookOpen, Zap, Trophy, Star } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';

const GamesContainer = styled.div`
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

const PageSubtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 40px;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const GameCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
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

const GameIcon = styled.div`
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

const GameTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const GameDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const GameStats = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const StatBadge = styled.div`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PlayButton = styled.div`
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

const DifficultyBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => {
    switch(props.level) {
      case 'easy': return 'linear-gradient(45deg, #56ab2f, #a8e6cf)';
      case 'medium': return 'linear-gradient(45deg, #ffa726, #ffcc02)';
      case 'hard': return 'linear-gradient(45deg, #ff6b6b, #ffa726)';
      default: return 'linear-gradient(45deg, #667eea, #764ba2)';
    }
  }};
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ComingSoonCard = styled(GameCard)`
  opacity: 0.7;
  cursor: not-allowed;
  
  &:hover {
    transform: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const ComingSoonBadge = styled.div`
  background: linear-gradient(45deg, #999, #ccc);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Games = () => {
  const { t } = useLanguage();

  const availableGames = [
    {
      id: 'grammar-shooter',
      title: 'व्याकरण शूटर',
      description: 'सही व्याकरणका उत्तरहरूमा निशाना लगाउनुहोस्। तीव्र गतिको खेलमा आफ्ना कौशल परीक्षण गर्नुहोस्।',
      icon: Target,
      gradient: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
      difficulty: 'medium',
      points: '10-50',
      time: '5 मिनेट',
      link: '/games/grammar-shooter',
      available: true
    },
    {
      id: 'word-puzzle',
      title: 'शब्द पजल',
      description: 'अक्षरहरू मिलाएर सही शब्दहरू बनाउनुहोस्। शब्दकोश बढाउने रमाइलो तरिका।',
      icon: Puzzle,
      gradient: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
      difficulty: 'easy',
      points: '5-25',
      time: '10 मिनेट',
      link: '/games/word-puzzle',
      available: false
    },
    {
      id: 'story-builder',
      title: 'कथा निर्माता',
      description: 'दिइएका शब्दहरू प्रयोग गरेर रचनात्मक कथाहरू बनाउनुहोस्।',
      icon: BookOpen,
      gradient: 'linear-gradient(45deg, #a8e6cf, #56ab2f)',
      difficulty: 'hard',
      points: '20-100',
      time: '15 मिनेट',
      link: '/games/story-builder',
      available: false
    },
    {
      id: 'quick-quiz',
      title: 'द्रुत प्रश्नोत्तर',
      description: 'व्याकरणका छिटो प्रश्नहरूको जवाफ दिनुहोस्। समयसीमामा आफ्नो ज्ञान जाँच्नुहोस्।',
      icon: Zap,
      gradient: 'linear-gradient(45deg, #f093fb, #f5576c)',
      difficulty: 'medium',
      points: '15-75',
      time: '3 मिनेट',
      link: '/games/quick-quiz',
      available: false
    }
  ];

  const difficultyText = {
    easy: 'सजिलो',
    medium: 'मध्यम',
    hard: 'कठिन'
  };

  return (
    <DashboardLayout pageTitle={t('games')}>
      <GamesContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle className="nepali-text">
            रमाइलो खेलहरू
          </PageTitle>
          <PageSubtitle className="nepali-text">
            खेल्दै सिक्नुहोस्, सिक्दै रमाइलो गर्नुहोस्!
          </PageSubtitle>
        </motion.div>

        <GamesGrid>
        {availableGames.map((game, index) => (
          game.available ? (
            <GameCard
              key={game.id}
              as={Link}
              to={game.link}
              gradient={game.gradient}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <DifficultyBadge level={game.difficulty}>
                {difficultyText[game.difficulty]}
              </DifficultyBadge>
              
              <GameIcon gradient={game.gradient}>
                <game.icon size={40} />
              </GameIcon>
              
              <GameTitle className="nepali-text">{game.title}</GameTitle>
              <GameDescription className="nepali-text">
                {game.description}
              </GameDescription>
              
              <GameStats>
                <StatBadge>
                  <Star />
                  <span>{game.points} अंक</span>
                </StatBadge>
                <StatBadge>
                  <Trophy />
                  <span>{game.time}</span>
                </StatBadge>
              </GameStats>
              
              <PlayButton>
                {t('start')}
              </PlayButton>
            </GameCard>
          ) : (
            <ComingSoonCard
              key={game.id}
              gradient={game.gradient}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DifficultyBadge level={game.difficulty}>
                {difficultyText[game.difficulty]}
              </DifficultyBadge>
              
              <GameIcon gradient={game.gradient}>
                <game.icon size={40} />
              </GameIcon>
              
              <GameTitle className="nepali-text">{game.title}</GameTitle>
              <GameDescription className="nepali-text">
                {game.description}
              </GameDescription>
              
              <GameStats>
                <StatBadge>
                  <Star />
                  <span>{game.points} अंक</span>
                </StatBadge>
                <StatBadge>
                  <Trophy />
                  <span>{game.time}</span>
                </StatBadge>
              </GameStats>
              
              <ComingSoonBadge>
                छिट्टै आउँदैछ
              </ComingSoonBadge>
            </ComingSoonCard>
          )
        ))}
      </GamesGrid>
      </GamesContainer>
    </DashboardLayout>
  );
};

export default Games;