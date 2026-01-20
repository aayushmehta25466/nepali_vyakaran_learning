import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, CheckCircle, Lock, Star, Play, Award } from 'lucide-react';
import LessonContent from '../../components/Lessons/LessonContent';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getLessons, getLessonById } from '../../services/api';

const Lessons = () => {
  const { t } = useLanguage();
  const { gameState, completeLesson, addPoints, addCoins } = useGame();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingLesson, setOpeningLesson] = useState(false);

  const mapDifficulty = (difficulty) => {
    const map = {
      'beginner': t('easy'),
      'easy': t('easy'),
      'intermediate': t('medium_label'),
      'medium': t('medium_label'),
      'advanced': t('hard'),
      'hard': t('hard')
    };
    return map[difficulty] || difficulty;
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await getLessons();

        if (response && response.data) {
          const transformedLessons = response.data.map(lesson => ({
            id: lesson.slug || lesson.id,
            title: lesson.title_nepali || lesson.title,
            subtitle: lesson.description_nepali || lesson.description,
            topics: lesson.content?.topics || [],
            points: lesson.points_reward || 50,
            duration: `${lesson.estimated_time || 10} ${t('minutes')}`,
            difficulty: mapDifficulty(lesson.difficulty),
            locked: false
          }));

          const lessonsWithLock = transformedLessons.map(lesson => {
            if (lesson.id === transformedLessons[0].id) {
              return { ...lesson, locked: false };
            }

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
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [gameState.completedLessons]);

  // Fallback lessons
  const fallbackLessons = [
    { id: 'lesson_1_naam', title: t('lesson_1_title') || 'पाठ १: नाम', subtitle: t('lesson_1_subtitle') || 'संज्ञाका प्रकार र पहिचान', topics: ['व्यक्तिवाचक संज्ञा', 'जातिवाचक संज्ञा', 'समूहवाचक संज्ञा', 'भाववाचक संज्ञा'], points: 50, duration: `15 ${t('minutes')}`, difficulty: t('easy'), locked: false },
    { id: 'lesson_2_sarbanaam', title: t('lesson_2_title') || 'पाठ २: सर्वनाम', subtitle: t('lesson_2_subtitle') || 'संज्ञाको सट्टामा प्रयोग हुने शब्दहरू', topics: ['पुरुषवाचक सर्वनाम', 'निश्चयवाचक सर्वनाम'], points: 60, duration: `16 ${t('minutes')}`, difficulty: t('easy'), locked: !gameState.completedLessons.includes('lesson_1_naam') },
    { id: 'lesson_3_visheshan', title: t('lesson_3_title') || 'पाठ ३: विशेषण', subtitle: t('lesson_3_subtitle') || 'गुण बताउने शब्दहरू', topics: ['गुणवाचक विशेषण', 'संख्यावाचक विशेषण'], points: 70, duration: `15 ${t('minutes')}`, difficulty: t('easy'), locked: !gameState.completedLessons.includes('lesson_2_sarbanaam') },
    { id: 'lesson_4_kriya', title: t('lesson_4_title') || 'पाठ ४: क्रिया', subtitle: t('lesson_4_subtitle') || 'काम बताउने शब्दहरू', topics: ['सकर्मक क्रिया', 'अकर्मक क्रिया'], points: 80, duration: `9 ${t('minutes')}`, difficulty: t('medium_label'), locked: !gameState.completedLessons.includes('lesson_3_visheshan') }
  ];

  const displayLessons = lessons.length > 0 ? lessons : fallbackLessons;

  const handleLessonClick = async (lesson) => {
    if (lesson.locked) return;
    
    try {
      setOpeningLesson(true);
      const fullLessonData = await getLessonById(lesson.id);
      if (fullLessonData) {
        // Merge list data with detail data if needed, or just use detail data
        // Detail data should have content, examples, exercises
        setSelectedLesson(fullLessonData);
      } else {
        // Fallback if API fails but we have basic info
        setSelectedLesson(lesson);
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      setSelectedLesson(lesson);
    } finally {
      setOpeningLesson(false);
    }
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

  if (loading) {
    return (
      <DashboardLayout pageTitle={t('lessons')}>
        <div className="px-4 py-8 max-w-5xl mx-auto">
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-5 font-nepali">
            {t('learning_lessons')}
          </h1>
          <div className="text-center py-12 text-gray-500 font-nepali">
            {t('loading_lessons')}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={t('lessons')}>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-5 font-nepali">
            {t('learning_lessons')}
          </h1>
        </motion.div>

        {/* Learning Path */}
        <div className="relative my-8 md:my-12">
          {/* Path Line */}
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-dark md:-translate-x-1/2 z-[1]" />

          {displayLessons.map((lesson, index) => {
            const isCompleted = gameState.completedLessons.includes(lesson.id);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: lesson.locked ? 1 : 1.02 }}
                onClick={() => !openingLesson && handleLessonClick(lesson)}
                className={`
                  relative bg-white/95 backdrop-blur-sm rounded-2xl p-5 my-6
                  shadow-lg border border-white/20 transition-all duration-300
                  ${lesson.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'}
                  ${openingLesson ? 'cursor-wait' : ''}
                  ml-[60px] md:ml-0
                  ${isLeft ? 'md:mr-[55%]' : 'md:ml-[55%]'}
                `}
              >
                {/* Lesson Icon */}
                <div
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                    flex items-center justify-center text-white z-[2] shadow-lg
                    -left-[42px] md:-left-[60px]
                    ${isLeft ? '' : 'md:left-auto md:-left-[60px]'}
                    ${isCompleted ? 'bg-gradient-to-br from-secondary to-secondary-light' :
                      lesson.locked ? 'bg-gradient-to-br from-gray-400 to-gray-300' :
                        'bg-gradient-to-br from-primary to-primary-dark'}
                  `}
                >
                  {lesson.locked ? (
                    <Lock size={20} />
                  ) : isCompleted ? (
                    <CheckCircle size={20} />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>

                {/* Lesson Header */}
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-1 font-nepali">{lesson.title}</h3>
                    <p className="text-gray-500 text-sm font-nepali">{lesson.subtitle}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1">
                      <Star size={12} />
                      {lesson.points}
                    </span>
                  </div>
                </div>

                {/* Topics List */}
                <ul className="list-none p-0 my-3">
                  {lesson.topics.slice(0, 3).map((topic, topicIndex) => (
                    <li
                      key={topicIndex}
                      className="py-2 text-gray-500 border-b border-gray-100 last:border-b-0 font-nepali
                        before:content-['•'] before:text-primary before:font-bold before:mr-2"
                    >
                      {topic}
                    </li>
                  ))}
                  {lesson.topics.length > 3 && (
                    <li className="py-2 text-gray-400 text-sm font-nepali">
                      +{lesson.topics.length - 3} {t('more')}
                    </li>
                  )}
                </ul>

                {/* Lesson Meta */}
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>⏱️ {lesson.duration}</span>
                  <span>📊 {lesson.difficulty}</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLessonClick(lesson);
                  }}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold
                    text-white transition-all duration-300
                    ${lesson.locked ? 'cursor-not-allowed bg-gradient-to-r from-gray-400 to-gray-300' :
                      isCompleted ? 'bg-gradient-to-r from-secondary to-secondary-light hover:-translate-y-0.5 hover:shadow-lg' :
                        'bg-gradient-to-r from-primary to-primary-dark hover:-translate-y-0.5 hover:shadow-lg'}
                  `}
                >
                  {lesson.locked ? (
                    <>
                      <Lock size={16} />
                      <span className="font-nepali">{t('locked')}</span>
                    </>
                  ) : isCompleted ? (
                    <>
                      <Award size={16} />
                      <span className="font-nepali">{t('study_again')}</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span className="font-nepali">{t('start')}</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Lesson Modal */}
        <AnimatePresence>
          {selectedLesson && (
            <LessonContent
              lesson={selectedLesson}
              onClose={handleCloseLessson}
              onComplete={handleLessonComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Lessons;