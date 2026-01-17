import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';

const QuestContainer = styled(motion.div)`
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

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const QuestTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
`;

const WordCard = styled(motion.div)`
  background: linear-gradient(45deg, #FF6B6B, #FFA726);
  color: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
`;

const WordText = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const WordHint = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const OptionButton = styled(motion.button)`
  background: ${props => {
    if (props.selected && props.correct) return 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    if (props.selected && !props.correct) return 'linear-gradient(45deg, #F44336, #FF5722)';
    return 'linear-gradient(45deg, #667eea, #764ba2)';
  }};
  color: white;
  border: none;
  padding: 20px;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ProgressInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #666;
`;

const CompleteButton = styled(motion.button)`
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
`;

const vocabularyWords = [
  {
    nepali: "कुकुर",
    english: "Dog",
    options: ["Cat", "Dog", "Bird", "Fish"],
    correct: 1
  },
  {
    nepali: "बिरालो",
    english: "Cat",
    options: ["Dog", "Cat", "Mouse", "Rabbit"],
    correct: 1
  },
  {
    nepali: "चरा",
    english: "Bird",
    options: ["Fish", "Bird", "Snake", "Frog"],
    correct: 1
  },
  {
    nepali: "माछा",
    english: "Fish",
    options: ["Bird", "Dog", "Fish", "Cat"],
    correct: 2
  },
  {
    nepali: "हात्ती",
    english: "Elephant",
    options: ["Lion", "Tiger", "Elephant", "Bear"],
    correct: 2
  }
];

const VocabularyQuest = ({ quest, onComplete, onBack }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === vocabularyWords[currentWord].correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentWord < vocabularyWords.length - 1) {
        setCurrentWord(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsComplete(true);
      }
    }, 1500);
  };

  const handleComplete = () => {
    const success = score >= 3; // Need 3/5 correct to pass
    if (success) {
      onComplete(quest.id, quest.reward);
    } else {
      onBack();
    }
  };

  if (isComplete) {
    return (
      <QuestContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ color: score >= 3 ? '#4CAF50' : '#F44336', marginBottom: '20px' }} className="nepali-text">
            {score >= 3 ? 'बधाई छ!' : 'फेरि प्रयास गर्नुहोस्!'}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#333', marginBottom: '20px' }} className="nepali-text">
            तपाईंको स्कोर: {score}/{vocabularyWords.length}
          </p>
          {score >= 3 && (
            <>
              <p style={{ color: '#666', marginBottom: '20px' }} className="nepali-text">
                तपाईंले शब्दकोश चुनौती पूरा गर्नुभयो!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                {Object.entries(quest.reward).map(([resource, amount]) => (
                  <div key={resource} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    <Star size={16} color="#FFD700" />
                    <span>+{amount}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <CompleteButton onClick={handleComplete}>
            {score >= 3 ? 'पुरस्कार लिनुहोस्' : 'बन्द गर्नुहोस्'}
          </CompleteButton>
        </div>
      </QuestContainer>
    );
  }

  return (
    <QuestContainer
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <QuestHeader>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
          <span>फिर्ता</span>
        </BackButton>
        <QuestTitle className="nepali-text">{quest.name}</QuestTitle>
      </QuestHeader>

      <ProgressInfo className="nepali-text">
        शब्द {currentWord + 1}/{vocabularyWords.length} | स्कोर: {score}
      </ProgressInfo>

      <WordCard
        key={currentWord}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <WordText className="nepali-text">
          {vocabularyWords[currentWord].nepali}
        </WordText>
        <WordHint className="nepali-text">
          यसको अंग्रेजी अर्थ के हो?
        </WordHint>
      </WordCard>

      <OptionsGrid>
        {vocabularyWords[currentWord].options.map((option, index) => (
          <OptionButton
            key={index}
            selected={selectedAnswer === index}
            correct={index === vocabularyWords[currentWord].correct}
            disabled={selectedAnswer !== null}
            onClick={() => handleAnswerSelect(index)}
            whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
            whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
          >
            {option}
          </OptionButton>
        ))}
      </OptionsGrid>
    </QuestContainer>
  );
};

export default VocabularyQuest;