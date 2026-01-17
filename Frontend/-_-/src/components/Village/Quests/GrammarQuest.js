import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, X, Star } from 'lucide-react';

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

const QuestionContainer = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

const Question = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 20px;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const OptionButton = styled(motion.button)`
  background: ${props => {
    if (props.selected && props.correct) return 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    if (props.selected && !props.correct) return 'linear-gradient(45deg, #F44336, #FF5722)';
    return 'linear-gradient(45deg, #667eea, #764ba2)';
  }};
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ScoreText = styled.div`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 10px;
`;

const ResultsContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const ResultTitle = styled.h3`
  color: ${props => props.success ? '#4CAF50' : '#F44336'};
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const RewardDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
`;

const RewardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 215, 0, 0.1);
  padding: 10px 15px;
  border-radius: 15px;
  font-weight: 600;
  color: #333;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
`;

const grammarQuestions = [
  {
    question: "कुन शब्द संज्ञा हो?",
    options: ["राम्रो", "किताब", "दौडिरहेको", "चाँडो"],
    correct: 1
  },
  {
    question: "कुन शब्द विशेषण हो?",
    options: ["घर", "सुन्दर", "खेल्नु", "हिँड्नु"],
    correct: 1
  },
  {
    question: "कुन शब्द सर्वनाम हो?",
    options: ["केटा", "उ", "हरियो", "बोल्नु"],
    correct: 1
  },
  {
    question: "कुन वाक्य शुद्ध छ?",
    options: ["म स्कुल जान्छु", "म स्कुल जान्छ", "म स्कुल जाछु", "म स्कुल जाउँछु"],
    correct: 0
  },
  {
    question: "कुन शब्द क्रिया हो?",
    options: ["मान्छे", "ठूलो", "पढ्नु", "रातो"],
    correct: 2
  }
];

const GrammarQuest = ({ quest, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === grammarQuestions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < grammarQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleComplete = () => {
    const success = score >= 3; // Need 3/5 correct to pass
    if (success) {
      onComplete(quest.id, quest.reward);
    }
    setIsComplete(true);
  };

  const progress = ((currentQuestion + 1) / grammarQuestions.length) * 100;

  if (isComplete) {
    return (
      <QuestContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <ResultsContainer>
          <ResultTitle success={score >= 3} className="nepali-text">
            {score >= 3 ? 'बधाई छ!' : 'फेरि प्रयास गर्नुहोस्!'}
          </ResultTitle>
          <ScoreText className="nepali-text">
            तपाईंले {score}/{grammarQuestions.length} सही उत्तर दिनुभयो
          </ScoreText>
          {score >= 3 && (
            <RewardDisplay>
              {Object.entries(quest.reward).map(([resource, amount]) => (
                <RewardItem key={resource}>
                  <Star size={16} color="#FFD700" />
                  <span>+{amount}</span>
                </RewardItem>
              ))}
            </RewardDisplay>
          )}
          <CompleteButton onClick={onBack}>
            फिर्ता जानुहोस्
          </CompleteButton>
        </ResultsContainer>
      </QuestContainer>
    );
  }

  if (showResult) {
    return (
      <QuestContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <ResultsContainer>
          <ResultTitle success={score >= 3} className="nepali-text">
            {score >= 3 ? 'उत्कृष्ट!' : 'अझ अभ्यास चाहिन्छ!'}
          </ResultTitle>
          <ScoreText className="nepali-text">
            तपाईंको स्कोर: {score}/{grammarQuestions.length}
          </ScoreText>
          {score >= 3 && (
            <>
              <p className="nepali-text" style={{ color: '#666', margin: '15px 0' }}>
                तपाईंले यो चुनौती पूरा गर्नुभयो!
              </p>
              <RewardDisplay>
                {Object.entries(quest.reward).map(([resource, amount]) => (
                  <RewardItem key={resource}>
                    <Star size={16} color="#FFD700" />
                    <span>+{amount}</span>
                  </RewardItem>
                ))}
              </RewardDisplay>
            </>
          )}
          <CompleteButton onClick={handleComplete}>
            {score >= 3 ? 'पुरस्कार लिनुहोस्' : 'बन्द गर्नुहोस्'}
          </CompleteButton>
        </ResultsContainer>
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

      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>

      <ScoreDisplay>
        <ScoreText className="nepali-text">
          प्रश्न {currentQuestion + 1}/{grammarQuestions.length} | स्कोर: {score}
        </ScoreText>
      </ScoreDisplay>

      <QuestionContainer>
        <Question className="nepali-text">
          {grammarQuestions[currentQuestion].question}
        </Question>

        <OptionsGrid>
          {grammarQuestions[currentQuestion].options.map((option, index) => (
            <OptionButton
              key={index}
              selected={selectedAnswer === index}
              correct={index === grammarQuestions[currentQuestion].correct}
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswerSelect(index)}
              whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
              className="nepali-text"
            >
              {option}
            </OptionButton>
          ))}
        </OptionsGrid>
      </QuestionContainer>
    </QuestContainer>
  );
};

export default GrammarQuest;