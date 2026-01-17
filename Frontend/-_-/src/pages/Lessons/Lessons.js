import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, CheckCircle, Lock, Star, Play, Award } from 'lucide-react';
import LessonContent from '../../components/Lessons/LessonContent';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getLessons } from '../../services/api';

const LessonsContainer = styled.div`
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

const LearningPath = styled.div`
  position: relative;
  margin: 50px 0;
`;

const PathLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  transform: translateX(-50%);
  z-index: 1;
  
  @media (max-width: 768px) {
    left: 30px;
  }
`;

const LessonCard = styled(motion.div)`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  margin: 30px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.locked ? 0.6 : 1};
  
  ${props => props.side === 'left' ? `
    margin-left: 0;
    margin-right: 60%;
    
    @media (max-width: 768px) {
      margin-left: 60px;
      margin-right: 0;
    }
  ` : `
    margin-left: 60%;
    margin-right: 0;
    
    @media (max-width: 768px) {
      margin-left: 60px;
      margin-right: 0;
    }
  `}
  
  &:hover {
    transform: ${props => props.locked ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.locked ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 12px 40px rgba(0, 0, 0, 0.15)'};
  }
`;

const LessonIcon = styled.div`
  position: absolute;
  left: ${props => props.side === 'left' ? 'calc(100% + 20px)' : '-60px'};
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return 'linear-gradient(45deg, #56ab2f, #a8e6cf)';
    if (props.locked) return 'linear-gradient(45deg, #999, #ccc)';
    return 'linear-gradient(45deg, #667eea, #764ba2)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    left: -30px;
  }
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const LessonTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 5px;
`;

const LessonSubtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const LessonStats = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StatBadge = styled.div`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const LessonDetails = styled.div`
  margin-bottom: 20px;
`;

const TopicsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0;
`;

const TopicItem = styled.li`
  padding: 8px 0;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &::before {
    content: '•';
    color: #667eea;
    font-weight: bold;
    margin-right: 10px;
  }
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.completed) return 'linear-gradient(45deg, #56ab2f, #a8e6cf)';
    if (props.locked) return 'linear-gradient(45deg, #999, #ccc)';
    return 'linear-gradient(45deg, #667eea, #764ba2)';
  }};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.locked ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.locked ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.4)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Lessons = () => {
  const { t } = useLanguage();
  const { gameState, completeLesson, addPoints, addCoins } = useGame();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map difficulty from backend to Nepali
  const mapDifficulty = (difficulty) => {
    const map = {
      'beginner': 'सजिलो',
      'easy': 'सजिलो',
      'intermediate': 'मध्यम',
      'medium': 'मध्यम',
      'advanced': 'कठिन',
      'hard': 'कठिन'
    };
    return map[difficulty] || difficulty;
  };

  // Fetch lessons from backend
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await getLessons();
        
        if (response && response.data) {
          // Transform backend data to frontend format
          const transformedLessons = response.data.map(lesson => ({
            id: lesson.slug || lesson.id,
            title: lesson.title_nepali || lesson.title,
            subtitle: lesson.description_nepali || lesson.description,
            topics: lesson.content?.topics || [],
            points: lesson.points_reward || 50,
            duration: `${lesson.estimated_time || 10} मिनेट`,
            difficulty: mapDifficulty(lesson.difficulty),
            locked: false // Will be updated based on prerequisites
          }));

          // Check prerequisites and set locked status
          const lessonsWithLock = transformedLessons.map(lesson => {
            // First lesson is always unlocked
            if (lesson.id === transformedLessons[0].id) {
              return { ...lesson, locked: false };
            }
            
            // Check if previous lesson is completed
            const currentIndex = transformedLessons.findIndex(l => l.id === lesson.id);
            if (currentIndex > 0) {
              const prevLesson = transformedLessons[currentIndex - 1];
              const isLocked = !gameState.completedLessons.includes(prevLesson.id);
              return { ...lesson, locked: isLocked };
            }
            
            return lesson;
          });

          setLessons(lessonsWithLock);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        // Fallback: keep empty array or show error
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [gameState.completedLessons]); // Re-fetch when completed lessons change

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout pageTitle={t('lessons')}>
        <LessonsContainer>
          <PageTitle className="nepali-text">सिकाइ पाठहरू</PageTitle>
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            पाठहरू लोड गर्दै...
          </div>
        </LessonsContainer>
      </DashboardLayout>
    );
  }

  // Fallback for hardcoded lessons (in case backend fails)
  const fallbackLessons = [
    {
      id: 'lesson_1_naam',
      title: 'पाठ १: नाम',
      subtitle: 'संज्ञाका प्रकार र पहिचान',
      topics: ['व्यक्तिवाचक संज्ञा', 'जातिवाचक संज्ञा', 'समूहवाचक संज्ञा', 'भाववाचक संज्ञा'],
      points: 50,
      duration: '15 मिनेट',
      difficulty: 'सजिलो',
      locked: false
    },
    {
      id: 'lesson_2_sarbanaam',
      title: 'पाठ २: सर्वनाम',
      subtitle: 'संज्ञाको सट्टामा प्रयोग हुने शब्दहरू',
      topics: ['पुरुषवाचक सर्वनाम', 'निश्चयवाचक सर्वनाम', 'अनिश्चयवाचक सर्वनाम', 'प्रश्नवाचक सर्वनाम', 'सम्बन्धवाचक सर्वनाम'],
      points: 60,
      duration: '16 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_1_naam')
    },
    {
      id: 'lesson_3_visheshan',
      title: 'पाठ ३: विशेषण',
      subtitle: 'गुण बताउने शब्दहरू',
      topics: ['गुणवाचक विशेषण', 'संख्यावाचक विशेषण', 'परिमाणवाचक विशेषण', 'संकेतवाचक विशेषण'],
      points: 70,
      duration: '15 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_2_sarbanaam')
    },
    {
      id: 'lesson_4_kriya',
      title: 'पाठ ४: क्रिया',
      subtitle: 'काम बताउने शब्दहरू',
      topics: ['सकर्मक क्रिया', 'अकर्मक क्रिया', 'सहायक क्रिया'],
      points: 80,
      duration: '9 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_3_visheshan')
    },
    {
      id: 'lesson_5_kriya_prakar',
      title: 'पाठ ५: क्रियाका प्रकार',
      subtitle: 'क्रियाका विभिन्न भेदहरू',
      topics: ['मुख्य क्रिया', 'सहायक क्रिया', 'संयुक्त क्रिया'],
      points: 90,
      duration: '14 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_4_kriya')
    },
    {
      id: 'lesson_6_naamyogi',
      title: 'पाठ ६: नामयोगी',
      subtitle: 'संज्ञासँग जोडिने शब्दहरू',
      topics: ['सम्बन्धबोधक अव्यय', 'स्थान बोधक शब्दहरू'],
      points: 50,
      duration: '5 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_5_kriya_prakar')
    },
    {
      id: 'lesson_7_kriya_visheshan',
      title: 'पाठ ७: क्रिया विशेषण',
      subtitle: 'क्रियाको विशेषता बताउने शब्दहरू',
      topics: ['कालवाचक क्रिया विशेषण', 'स्थानवाचक क्रिया विशेषण'],
      points: 60,
      duration: '6 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_6_naamyogi')
    },
    {
      id: 'lesson_8_sanyojak',
      title: 'पाठ ८: संयोजक',
      subtitle: 'शब्द र वाक्य जोड्ने शब्दहरू',
      topics: ['समानाधिकरण संयोजक', 'व्याधिकरण संयोजक'],
      points: 70,
      duration: '7 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_7_kriya_visheshan')
    },
    {
      id: 'lesson_9_bismayadi_bodhak',
      title: 'पाठ ९: विस्मयादि बोधक',
      subtitle: 'भावना प्रकट गर्ने शब्दहरू',
      topics: ['हर्षबोधक', 'शोकबोधक'],
      points: 60,
      duration: '6 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_8_sanyojak')
    },
    {
      id: 'lesson_10_nipaat',
      title: 'पाठ १०: निपात',
      subtitle: 'वाक्यमा जोड दिने शब्दहरू',
      topics: ['स्वीकारार्थक निपात', 'नकारार्थक निपात'],
      points: 80,
      duration: '8 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_9_bismayadi_bodhak')
    },
    {
      id: 'lesson_11_karan_akaran',
      title: 'पाठ ११: करण अकरण',
      subtitle: 'क्रियाको साधन र असाधन',
      topics: ['करण कारक', 'अकरण', 'साधन बोधक शब्दहरू'],
      points: 80,
      duration: '8 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_10_nipaat')
    },
    {
      id: 'lesson_12_linga',
      title: 'पाठ १२: लिङ्ग',
      subtitle: 'पुल्लिङ्ग र स्त्रीलिङ्ग',
      topics: ['पुल्लिङ्ग शब्दहरू', 'स्त्रीलिङ्ग शब्दहरू', 'लिङ्ग परिवर्तन', 'उभयलिङ्गी शब्दहरू'],
      points: 100,
      duration: '13 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_11_karan_akaran')
    },
    {
      id: 'lesson_13_bachan',
      title: 'पाठ १३: वचन',
      subtitle: 'एकवचन र बहुवचन',
      topics: ['एकवचन शब्दहरू', 'बहुवचन शब्दहरू', 'वचन परिवर्तन', 'अपवादहरू'],
      points: 90,
      duration: '12 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_12_linga')
    },
    {
      id: 'lesson_14_purush',
      title: 'पाठ १४: पुरुष',
      subtitle: 'उत्तम, मध्यम र अन्य पुरुष',
      topics: ['उत्तम पुरुष', 'मध्यम पुरुष', 'अन्य पुरुष'],
      points: 90,
      duration: '9 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_13_bachan')
    },
    {
      id: 'lesson_15_kaal',
      title: 'पाठ १५: काल र कालका पक्ष',
      subtitle: 'भूत, वर्तमान र भविष्य काल',
      topics: ['भूतकाल', 'वर्तमान काल', 'भविष्य काल', 'पूर्ण पक्ष', 'अपूर्ण पक्ष', 'संदिग्ध पक्ष', 'सम्भाव्य पक्ष', 'हेतुहेतुमद् पक्ष', 'आज्ञार्थ पक्ष', 'इच्छार्थ पक्ष'],
      points: 150,
      duration: '35 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_14_purush')
    },
    {
      id: 'lesson_16_bibhakti',
      title: 'पाठ १६: विभक्ति',
      subtitle: 'संज्ञा र सर्वनामका रूप परिवर्तन',
      topics: ['प्रथमा विभक्ति', 'द्वितीया विभक्ति', 'तृतीया विभक्ति'],
      points: 80,
      duration: '8 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_15_kaal')
    },
    {
      id: 'lesson_17_pada_sangati',
      title: 'पाठ १७: पद सङ्गति',
      subtitle: 'वाक्यमा शब्दहरूको मेल',
      topics: ['लिङ्ग अनुसार मेल', 'वचन अनुसार मेल', 'पुरुष अनुसार मेल', 'काल अनुसार मेल'],
      points: 100,
      duration: '11 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_16_bibhakti')
    },
    {
      id: 'lesson_18_barna_binyas',
      title: 'पाठ १८: वर्ण विन्यास र चिन्न परिचय',
      subtitle: 'अक्षरहरूको क्रम र विराम चिह्नहरू',
      topics: ['स्वर र व्यञ्जनको क्रम', 'दाँया (।)', 'अल्प विराम (,)', 'प्रश्न चिह्न (?)', 'विस्मयादिबोधक चिह्न (!)', 'उद्धरण चिह्न (" ")'],
      points: 120,
      duration: '19 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_17_pada_sangati')
    },
    {
      id: 'lesson_19_shabda_bhandar',
      title: 'पाठ १९: शब्द भण्डार',
      subtitle: 'शब्दहरूको संग्रह र प्रयोग',
      topics: ['तत्सम शब्द', 'तद्भव शब्द', 'देशज शब्द', 'विदेशी शब्द', 'पर्यायवाची शब्द', 'विपरीतार्थी शब्द', 'एकार्थी शब्द', 'अनेकार्थी शब्द', 'युग्म शब्द', 'संक्षिप्त शब्द'],
      points: 140,
      duration: '25 मिनेट',
      difficulty: 'कठिन',
      locked: !gameState.completedLessons.includes('lesson_18_barna_binyas')
    },
    {
      id: 'lesson_20_ukhan_tukka',
      title: 'पाठ २०: उखान र टुक्का',
      subtitle: 'लोक बुद्धिका भनाइहरू',
      topics: ['प्रसिद्ध उखानहरू'],
      points: 30,
      duration: '2 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_19_shabda_bhandar')
    },
    {
      id: 'lesson_21_bodh',
      title: 'पाठ २१: बोध',
      subtitle: 'समझ र अनुभव',
      topics: ['पठन बोध'],
      points: 50,
      duration: '5 मिनेट',
      difficulty: 'सजिलो',
      locked: !gameState.completedLessons.includes('lesson_20_ukhan_tukka')
    },
    {
      id: 'lesson_22_nibedan',
      title: 'पाठ २२: निवेदन',
      subtitle: 'औपचारिक लेखन',
      topics: ['निवेदन लेख्ने तरिका'],
      points: 40,
      duration: '4 मिनेट',
      difficulty: 'मध्यम',
      locked: !gameState.completedLessons.includes('lesson_21_bodh')
    }
  ];

  // Use fetched lessons if available, otherwise fallback to hardcoded
  const displayLessons = lessons.length > 0 ? lessons : fallbackLessons;

  const handleLessonClick = (lesson) => {
    if (lesson.locked) return;
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = (lesson) => {
    if (!gameState.completedLessons.includes(lesson.id)) {
      completeLesson(lesson.id);
      addPoints(lesson.points);
      addCoins(Math.floor(lesson.points / 2));
    }
    setSelectedLesson(null);
  };

  const handleCloseLessson = () => {
    setSelectedLesson(null);
  };

  return (
    <DashboardLayout pageTitle={t('lessons')}>
      <LessonsContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle className="nepali-text">
            सिकाइ पाठहरू
          </PageTitle>
        </motion.div>

        <LearningPath>
          <PathLine />
        
        {displayLessons.map((lesson, index) => {
          const isCompleted = gameState.completedLessons.includes(lesson.id);
          const side = index % 2 === 0 ? 'left' : 'right';
          
          return (
            <LessonCard
              key={lesson.id}
              side={side}
              locked={lesson.locked}
              onClick={() => handleLessonClick(lesson)}
              initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: lesson.locked ? 1 : 1.02 }}
            >
              <LessonIcon 
                side={side} 
                completed={isCompleted}
                locked={lesson.locked}
              >
                {lesson.locked ? (
                  <Lock size={24} />
                ) : isCompleted ? (
                  <CheckCircle size={24} />
                ) : (
                  <BookOpen size={24} />
                )}
              </LessonIcon>
              
              <LessonHeader>
                <div>
                  <LessonTitle className="nepali-text">{lesson.title}</LessonTitle>
                  <LessonSubtitle className="nepali-text">{lesson.subtitle}</LessonSubtitle>
                </div>
                
                <LessonStats>
                  <StatBadge>
                    <Star />
                    {lesson.points}
                  </StatBadge>
                </LessonStats>
              </LessonHeader>
              
              <LessonDetails>
                <TopicsList>
                  {lesson.topics.map((topic, topicIndex) => (
                    <TopicItem key={topicIndex} className="nepali-text">
                      {topic}
                    </TopicItem>
                  ))}
                </TopicsList>
                
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                  <span>⏱️ {lesson.duration}</span>
                  <span>📊 {lesson.difficulty}</span>
                </div>
              </LessonDetails>
              
              <ActionButton
                completed={isCompleted}
                locked={lesson.locked}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLessonClick(lesson);
                }}
              >
                {lesson.locked ? (
                  <>
                    <Lock />
                    बन्द छ
                  </>
                ) : isCompleted ? (
                  <>
                    <Award />
                    पुनः अध्ययन
                  </>
                ) : (
                  <>
                    <Play />
                    सुरु गर्नुहोस्
                  </>
                )}
              </ActionButton>
            </LessonCard>
          );
        })}
      </LearningPath>

      {/* Interactive Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonContent
            lesson={selectedLesson}
            onClose={handleCloseLessson}
            onComplete={handleLessonComplete}
          />
        )}
      </AnimatePresence>
      </LessonsContainer>
    </DashboardLayout>
  );
};

export default Lessons;