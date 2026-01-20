import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Target, Heart, Star, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { getGrammarShooterQuestions, endGame, getGames } from '../../services/api';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 22px;
    height: 22px;
    color: #333;
  }
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
  const [gameId, setGameId] = useState(null);
  const [error, setError] = useState(null);
  
  const { addPoints, addCoins } = useGame();
  const { t } = useLanguage();

  // Fetch game ID and questions
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch Game ID
        console.log('🎮 Fetching games...');
        const gamesRes = await getGames();
        console.log('📦 Games response:', gamesRes);
        console.log('📦 Games response type:', typeof gamesRes);
        console.log('📦 Games response keys:', gamesRes ? Object.keys(gamesRes) : 'null');
        
        // Safely extract games array from response
        let gamesList = [];
        if (Array.isArray(gamesRes?.games)) {
          gamesList = gamesRes.games;
          console.log('✅ Got games from gamesRes.games');
        } else if (Array.isArray(gamesRes)) {
          gamesList = gamesRes;
          console.log('✅ gamesRes is already an array');
        } else if (gamesRes?.data && Array.isArray(gamesRes.data)) {
          gamesList = gamesRes.data;
          console.log('✅ Got games from gamesRes.data');
        } else {
          console.warn('⚠️ Could not extract games array. gamesRes:', gamesRes);
        }
        console.log('📋 Games list:', gamesList, 'Type:', typeof gamesList, 'IsArray:', Array.isArray(gamesList));
        
        if (!Array.isArray(gamesList)) {
          throw new Error(`gamesList is not an array, got ${typeof gamesList}`);
        }
        
        const shooterGame = gamesList.find(g => 
            g.slug === 'grammar-shooter' || 
            (g.title && g.title.toLowerCase().includes('grammar shooter'))
        );
        if (shooterGame) {
            setGameId(shooterGame.id);
            console.log('✅ Found game:', shooterGame);
        }

        // 2. Fetch Questions
        console.log('🎯 Fetching questions...');
        const response = await getGrammarShooterQuestions();
        console.log('📥 Grammar Shooter Questions Response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        if (!response) {
          throw new Error('API returned null/undefined response');
        }
        
        // Response IS the data object directly (not wrapped in .data)
        // API returns: { success, timestamp, data: { questions: [...] } }
        // But our API wrapper returns the data directly: { questions: [...] }
        const questions = response?.questions || [];
        console.log('❓ Extracted questions:', questions);
        console.log('Questions count:', questions?.length || 0);
        
        if (questions && questions.length > 0) {
          console.log(`✅ Processing ${questions.length} questions...`);
          try {
            const transformedQuestions = questions.map((q, idx) => {
              try {
                console.log(`Question ${idx}:`, q);
                // Robust correct answer finding
                let correctIdx = 0;
                if (q.correct_answer !== undefined && q.correct_answer !== null) {
                    const ca = q.correct_answer;
                    const list = q.options?.map(o => o.text || o) || [];
                    
                    // Case 0: Direct number
                    if (typeof ca === 'number') {
                       correctIdx = ca;
                    }
                    // Case 1: String number
                    else if (typeof ca === 'string' && !isNaN(ca)) {
                       correctIdx = parseInt(ca, 10);
                    }
                    // Case 2: Object with 'answer' key
                    else if (typeof ca === 'object') {
                       const ansKey = ca.answer || ca.value;
                       if (typeof ansKey === 'number') correctIdx = ansKey;
                       else if (typeof ansKey === 'string' && !isNaN(ansKey)) correctIdx = parseInt(ansKey, 10);
                       else if (ansKey === 'A') correctIdx = 0;
                       else if (ansKey === 'B') correctIdx = 1;
                       else if (ansKey === 'C') correctIdx = 2;
                       else if (ansKey === 'D') correctIdx = 3;
                    }
                    // Case 3: String like 'A', 'B', 'C', 'D'
                    else if (typeof ca === 'string') {
                       if (ca === 'A') correctIdx = 0;
                       else if (ca === 'B') correctIdx = 1;
                       else if (ca === 'C') correctIdx = 2;
                       else if (ca === 'D') correctIdx = 3;
                       // Try to match with option text
                       else {
                          const matchIdx = list.findIndex(opt => String(opt).toLowerCase() === String(ca).toLowerCase());
                          if (matchIdx !== -1) correctIdx = matchIdx;
                       }
                    }
                }
                console.log(`  ➜ Question ${idx} correct answer index: ${correctIdx}`);

                const transformed = {
                   question: q.question_text_nepali || q.question_text || 'N/A',
                   options: (q.options?.map(opt => opt.text || opt) || []).filter(o => o),
                   correct: Math.max(0, Math.min(correctIdx, (q.options?.length || 0) - 1))
                };
                
                if (idx === 0) console.log('🔍 First question transformed:', transformed);
                return transformed;
              } catch (mapError) {
                console.error(`Error processing question ${idx}:`, mapError);
                return {
                  question: 'Error loading question',
                  options: ['Error'],
                  correct: 0
                };
              }
            });
            
            console.log('✨ All questions transformed:', transformedQuestions);
            setGrammarQuestions(transformedQuestions);
          } catch (transformError) {
            console.error('Error transforming questions:', transformError);
            setError('Questions could not be processed: ' + transformError.message);
            setGrammarQuestions([]);
          }
        } else {
          console.warn('⚠️ No questions found in response');
          setError('No questions available. Response: ' + JSON.stringify(response).substring(0, 200));
          setGrammarQuestions([]);
        }
      } catch (error) {
        console.error('❌ Failed to init game:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        setError('Failed to load game: ' + error.message);
        setGrammarQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    initGame();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleTargetClick = (optionIndex, e) => {
    const correct = optionIndex === grammarQuestions[currentQuestion].correct;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const popupX = rect.left + rect.width / 2;
    const popupY = rect.top;
    
    if (correct) {
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
          <ModalContent>
            <h2 className="nepali-text">प्रश्नहरू लोड गर्दै...</h2>
            {error && (
              <div style={{ color: 'red', marginTop: '20px', fontSize: '14px', textAlign: 'left' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </ModalContent>
        </GameOverModal>
      ) : error ? (
        <GameOverModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ModalContent>
            <ModalTitle className="nepali-text">त्रुटि!</ModalTitle>
            <div style={{ color: 'red', marginTop: '20px', marginBottom: '20px', textAlign: 'left' }}>
              <strong>समस्या:</strong> {error}
            </div>
            <PlayButton onClick={() => window.location.reload()}>
              पुनः प्रयास गर्नुहोस्
            </PlayButton>
          </ModalContent>
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
            <CloseButton onClick={() => window.history.back()} aria-label="Close game">
              <X />
            </CloseButton>
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