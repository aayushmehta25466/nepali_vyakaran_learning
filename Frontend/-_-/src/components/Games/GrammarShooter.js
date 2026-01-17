import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Target, Heart, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { getGrammarShooterQuestions } from '../../services/api';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const GameStats = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const GameArea = styled.div`
  position: relative;
  height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const Question = styled(motion.div)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const TargetsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 400px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 20px;
`;

const TargetOption = styled(motion.div)`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 15px 25px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  min-width: 150px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background: linear-gradient(45deg, #7c8ef0, #8a5cb8);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const Crosshair = styled(motion.div)`
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid #ff6b6b;
  border-radius: 50%;
  pointer-events: none;
  z-index: 20;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: #ff6b6b;
  }
  
  &::before {
    width: 20px;
    height: 2px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  &::after {
    width: 2px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const ScorePopup = styled(motion.div)`
  position: absolute;
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1.2rem;
  z-index: 30;
  box-shadow: 0 4px 15px rgba(86, 171, 47, 0.3);
`;

const GameOverModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const ModalTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 2rem;
`;

const ModalStats = styled.div`
  margin: 20px 0;
  
  div {
    margin: 10px 0;
    font-size: 1.1rem;
    color: #666;
  }
`;

const PlayButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

// No fallback questions - fetch from backend only

const GrammarShooter = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScorePopup, setShowScorePopup] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [grammarQuestions, setGrammarQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addPoints, addCoins } = useGame();
  const { t } = useLanguage();

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await getGrammarShooterQuestions();
        
        // Response IS the data object directly (not wrapped in .data)
        // API returns: { success, timestamp, data: { questions: [...] } }
        // But our API wrapper returns the data directly: { questions: [...] }
        const questions = response?.questions || [];
        
        if (questions.length > 0) {
          const transformedQuestions = questions.map(q => ({
            question: q.question_text_nepali || q.question_text,
            options: q.options?.map(opt => opt.text || opt) || [],
            correct: q.correct_answer?.answer === 'A' ? 0 : 
                     q.correct_answer?.answer === 'B' ? 1 :
                     q.correct_answer?.answer === 'C' ? 2 : 3
          }));
          
          setGrammarQuestions(transformedQuestions);
        } else {
          setGrammarQuestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setGrammarQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleTargetClick = (optionIndex, e) => {
    const isCorrect = optionIndex === grammarQuestions[currentQuestion].correct;
    const rect = e.currentTarget.getBoundingClientRect();
    const popupX = rect.left + rect.width / 2;
    const popupY = rect.top;
    
    if (isCorrect) {
      const points = 10;
      setScore(prev => prev + points);
      addPoints(points);
      addCoins(5);
      
      setShowScorePopup({ x: popupX, y: popupY, points, type: 'correct' });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setLives(prev => prev - 1);
      setShowScorePopup({ x: popupX, y: popupY, points: 0, type: 'incorrect' });
    }
    
    setTimeout(() => setShowScorePopup(null), 1500);
    
    setTimeout(() => {
      if (currentQuestion < grammarQuestions.length - 1 && lives > 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setGameState('gameOver');
      }
    }, 1500);
  };

  const startGame = () => {
    if (grammarQuestions.length === 0) {
      alert('कृपया प्रतीक्षा गर्नुहोस्, प्रश्नहरू लोड हुँदैछन्...');
      return;
    }
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setShowScorePopup(null);
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setShowScorePopup(null);
  };

  return (
    <GameContainer>
      {showConfetti && <Confetti />}
      
      {loading ? (
        <GameOverModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="nepali-text">प्रश्नहरू लोड गर्दै...</h2>
        </GameOverModal>
      ) : gameState === 'menu' ? (
        <GameOverModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ModalContent>
            <ModalTitle className="nepali-text">व्याकरण शूटर</ModalTitle>
            <p className="nepali-text">सही उत्तरमा निशाना लगाउनुहोस्!</p>
            <PlayButton onClick={startGame}>
              {t('start')}
            </PlayButton>
          </ModalContent>
        </GameOverModal>
      ) : gameState === 'playing' ? (
        <>
          <GameHeader>
            <GameStats>
              <StatItem>
                <Target />
                <span>स्कोर: {score}</span>
              </StatItem>
              <StatItem>
                <Heart />
                <span>जीवन: {lives}</span>
              </StatItem>
              <StatItem>
                <Star />
                <span>प्रश्न: {currentQuestion + 1}/{grammarQuestions.length}</span>
              </StatItem>
            </GameStats>
          </GameHeader>

          <GameArea onMouseMove={handleMouseMove}>
            <Crosshair
              style={{
                left: mousePosition.x - 20,
                top: mousePosition.y - 20
              }}
            />
            
            <Question
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentQuestion}
              className="nepali-text"
            >
              {grammarQuestions[currentQuestion].question}
            </Question>

            <TargetsContainer>
              {grammarQuestions[currentQuestion].options.map((option, index) => (
                <TargetOption
                  key={index}
                  onClick={(e) => handleTargetClick(index, e)}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="nepali-text"
                >
                  {option}
                </TargetOption>
              ))}
            </TargetsContainer>
          </GameArea>
        </>
      ) : gameState === 'gameOver' ? (
        <GameOverModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ModalContent>
            <ModalTitle className="nepali-text">खेल समाप्त!</ModalTitle>
            <ModalStats>
              <div>अन्तिम स्कोर: {score}</div>
              <div>सही उत्तर: {Math.floor(score / 10)}</div>
              <div>कमाएको सिक्का: {Math.floor(score / 2)}</div>
            </ModalStats>
            <PlayButton onClick={startGame}>
              फेरि खेल्नुहोस्
            </PlayButton>
            <PlayButton onClick={resetGame}>
              मुख्य मेनु
            </PlayButton>
          </ModalContent>
        </GameOverModal>
      ) : null}

      <AnimatePresence>
        {showScorePopup && (
          <ScorePopup
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0, y: -100 }}
            style={{
              left: showScorePopup.x - 50,
              top: showScorePopup.y - 100,
              background: showScorePopup.type === 'correct' ? 
                'linear-gradient(45deg, #56ab2f, #a8e6cf)' : 
                'linear-gradient(45deg, #ff6b6b, #ffa726)'
            }}
          >
            {showScorePopup.type === 'correct' ? 
              `+${showScorePopup.points} अंक!` : 
              'गलत!'
            }
          </ScorePopup>
        )}
      </AnimatePresence>
    </GameContainer>
  );
};

export default GrammarShooter;