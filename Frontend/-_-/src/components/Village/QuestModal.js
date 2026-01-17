import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Target, PenTool, Award, Star, CheckCircle } from 'lucide-react';
import GrammarQuest from './Quests/GrammarQuest';
import VocabularyQuest from './Quests/VocabularyQuest';
import WritingQuest from './Quests/WritingQuest';
import { getQuests, completeQuest } from '../../services/api';

const QuestOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
`;

const QuestPanel = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const QuestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const QuestTitle = styled.h2`
  color: #333;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const QuestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const QuestCard = styled(motion.div)`
  border: 2px solid ${props => props.completed ? '#4CAF50' : '#667eea'};
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: ${props => props.completed ? 
    'rgba(76, 175, 80, 0.05)' : 
    'rgba(102, 126, 234, 0.05)'};
  position: relative;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }
`;

const QuestIcon = styled.div`
  color: ${props => props.color};
  font-size: 48px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
`;

const QuestName = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const QuestDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const QuestReward = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const RewardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 215, 0, 0.1);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const QuestDifficulty = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => {
    switch(props.level) {
      case 'easy': return 'linear-gradient(45deg, #4CAF50, #8BC34A)';
      case 'medium': return 'linear-gradient(45deg, #FF9800, #FFC107)';
      case 'hard': return 'linear-gradient(45deg, #F44336, #FF5722)';
      default: return 'linear-gradient(45deg, #2196F3, #03A9F4)';
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
`;

// Map icon names to components
const iconMap = {
  'grammar': Book,
  'vocabulary': Target,
  'writing': PenTool,
  'reading': Book
};

// Get color by difficulty level
const getColorByDifficulty = (difficulty) => {
  const colors = {
    'easy': '#4CAF50',
    'medium': '#FF9800',
    'hard': '#F44336'
  };
  return colors[difficulty] || '#4169E1';
};

// No fallback quests - fetch from backend only

const QuestModal = ({ onClose, onComplete, villageLevel }) => {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quests from backend
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true);
        const response = await getQuests();
        
        // Response IS the data object directly (not wrapped in .data)
        // API returns: { results: [...], count, next, previous }
        const questData = response?.results || [];
        
        if (questData.length > 0) {
          const transformedQuests = questData.map(quest => ({
            id: quest.id,
            type: quest.category || 'general',
            name: quest.name_nepali || quest.name,
            description: quest.description_nepali || quest.description,
            icon: iconMap[quest.category] || Book,
            color: getColorByDifficulty(quest.difficulty),
            difficulty: quest.difficulty,
            reward: {
              coins: quest.coins_reward,
              knowledge: quest.experience_reward,
              books: quest.additional_rewards?.books || 0
            },
            minLevel: quest.min_level
          }));
          console.log('✅ Transformed Quests:', transformedQuests);
          setQuests(transformedQuests);
        } else {
          setQuests([]);
        }
      } catch (error) {
        console.error('Failed to fetch quests:', error);
        setQuests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completed-quests') || '[]');
    setCompletedQuests(saved);
  }, []);

  const availableQuests = quests.filter(quest => villageLevel >= quest.minLevel);

  const isQuestCompleted = (questId) => {
    return completedQuests.includes(questId);
  };

  const handleQuestSelect = (quest) => {
    if (isQuestCompleted(quest.id)) return;
    setSelectedQuest(quest);
  };

  const handleQuestComplete = async (questId, reward) => {
    try {
      // Submit to backend
      await completeQuest(questId, { progress: 100 });
      
      // Update local state
      const newCompleted = [...completedQuests, questId];
      setCompletedQuests(newCompleted);
      localStorage.setItem('completed-quests', JSON.stringify(newCompleted));
      
      onComplete(reward);
      setSelectedQuest(null);
    } catch (error) {
      console.error('Failed to complete quest:', error);
      // Still update locally even if backend fails
      const newCompleted = [...completedQuests, questId];
      setCompletedQuests(newCompleted);
      localStorage.setItem('completed-quests', JSON.stringify(newCompleted));
      onComplete(reward);
      setSelectedQuest(null);
    }
  };

  const renderQuestComponent = () => {
    if (!selectedQuest) return null;

    const props = {
      quest: selectedQuest,
      onComplete: handleQuestComplete,
      onBack: () => setSelectedQuest(null)
    };

    switch (selectedQuest.type) {
      case 'grammar':
        return <GrammarQuest {...props} />;
      case 'vocabulary':
        return <VocabularyQuest {...props} />;
      case 'writing':
        return <WritingQuest {...props} />;
      default:
        return null;
    }
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      easy: 'सजिलो',
      medium: 'मध्यम',
      hard: 'कठिन'
    };
    return texts[difficulty] || difficulty;
  };

  if (selectedQuest) {
    return (
      <QuestOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {renderQuestComponent()}
      </QuestOverlay>
    );
  }

  return (
    <AnimatePresence>
      <QuestOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <QuestPanel
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <QuestHeader>
            <QuestTitle className="nepali-text">
              <Award />
              सिकाइ चुनौतीहरू
            </QuestTitle>
            <CloseButton onClick={onClose}>
              <X size={24} />
            </CloseButton>
          </QuestHeader>

          <QuestGrid>
            {availableQuests.map((quest) => {
              const IconComponent = quest.icon;
              const completed = isQuestCompleted(quest.id);

              return (
                <QuestCard
                  key={quest.id}
                  completed={completed}
                  onClick={() => handleQuestSelect(quest)}
                  whileHover={{ scale: completed ? 1 : 1.02 }}
                  whileTap={{ scale: completed ? 1 : 0.98 }}
                >
                  <QuestDifficulty level={quest.difficulty}>
                    {getDifficultyText(quest.difficulty)}
                  </QuestDifficulty>
                  
                  {completed && (
                    <CompletedBadge>
                      <CheckCircle size={16} />
                    </CompletedBadge>
                  )}
                  
                  <QuestIcon color={quest.color}>
                    <IconComponent />
                  </QuestIcon>
                  
                  <QuestName className="nepali-text">
                    {quest.name}
                  </QuestName>
                  
                  <QuestDescription className="nepali-text">
                    {quest.description}
                  </QuestDescription>
                  
                  <QuestReward>
                    {Object.entries(quest.reward).map(([resource, amount]) => (
                      <RewardItem key={resource}>
                        <Star size={12} color="#FFD700" />
                        <span>{amount}</span>
                      </RewardItem>
                    ))}
                  </QuestReward>
                </QuestCard>
              );
            })}
          </QuestGrid>
        </QuestPanel>
      </QuestOverlay>
    </AnimatePresence>
  );
};

export default QuestModal;