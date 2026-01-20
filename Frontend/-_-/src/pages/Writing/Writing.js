import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { PenTool, BookOpen, FileText, Lightbulb, Save, Play, Award } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getWritingPrompts, submitWriting } from '../../services/api';

const Writing = () => {
  const { t } = useLanguage();
  const { addPoints, addCoins } = useGame();
  const [selectedType, setSelectedType] = useState('story');
  const [writingText, setWritingText] = useState('');
  const [showLearningContent, setShowLearningContent] = useState(false);
  const [savedWorks, setSavedWorks] = useState([]);
  const [writingPrompts, setWritingPrompts] = useState({});
  const [currentPromptId, setCurrentPromptId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch writing prompts from backend
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        console.log('📝 Starting to fetch writing prompts...');
        const promptsArray = await getWritingPrompts();
        console.log('📝 Received prompts array:', promptsArray);
        console.log('📝 Is array?', Array.isArray(promptsArray));
        console.log('📝 Length:', promptsArray?.length);

        if (Array.isArray(promptsArray) && promptsArray.length > 0) {
          const groupedPrompts = {};
          promptsArray.forEach(prompt => {
            console.log('📝 Processing prompt:', prompt);
            groupedPrompts[prompt.prompt_type] = {
              id: prompt.id,
              title: prompt.title_nepali || prompt.title,
              prompt: prompt.description_nepali || prompt.description,
              placeholder: `तपाईंको ${prompt.title_nepali || prompt.title} यहाँ लेख्नुहोस्...`
            };
          });
          console.log('✅ Grouped prompts:', groupedPrompts);
          setWritingPrompts(groupedPrompts);
          if (groupedPrompts[selectedType]) {
            setCurrentPromptId(groupedPrompts[selectedType].id);
          }
        } else {
          console.warn('⚠️ No prompts found or invalid response, using fallback');
          setWritingPrompts(fallbackWritingPrompts);
        }
      } catch (error) {
        console.error('❌ Failed to fetch writing prompts:', error);
        setWritingPrompts(fallbackWritingPrompts);
        if (fallbackWritingPrompts[selectedType]) {
          setCurrentPromptId(fallbackWritingPrompts[selectedType].id || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (writingPrompts[selectedType]) {
      setCurrentPromptId(writingPrompts[selectedType].id);
    }
  }, [selectedType, writingPrompts]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nepali-writing-works') || '[]');
    setSavedWorks(saved);
  }, []);

  const writingTypes = [
    {
      id: 'story',
      titleKey: 'story_writing',
      descKey: 'story_writing_desc',
      icon: BookOpen,
      gradient: 'from-red-400 to-orange-400'
    },
    {
      id: 'essay',
      titleKey: 'essay_writing',
      descKey: 'essay_writing_desc',
      icon: FileText,
      gradient: 'from-teal-400 to-emerald-500'
    },
    {
      id: 'application',
      titleKey: 'application_writing',
      descKey: 'application_writing_desc',
      icon: PenTool,
      gradient: 'from-green-300 to-green-600'
    },
    {
      id: 'creative',
      titleKey: 'creative_writing',
      descKey: 'creative_writing_desc',
      icon: Lightbulb,
      gradient: 'from-pink-400 to-rose-500'
    }
  ];

  const fallbackWritingPrompts = {
    story: {
      title: t('story_writing'),
      prompt: t('story_prompt') || 'Write a creative story based on your imagination.',
      placeholder: t('story_placeholder') || 'Write your story here...'
    },
    essay: {
      title: t('essay_writing'),
      prompt: t('essay_prompt') || 'Write an essay on the given topic.',
      placeholder: t('essay_placeholder') || 'Write your essay here...'
    },
    application: {
      title: t('application_writing'),
      prompt: t('application_prompt') || 'Write a formal application.',
      placeholder: t('application_placeholder') || 'Write your application here...'
    },
    creative: {
      title: t('creative_writing'),
      prompt: t('creative_prompt') || 'Write a poem or creative composition.',
      placeholder: t('creative_placeholder') || 'Write your composition here...'
    }
  };

  const learningContent = {
    story: {
      titleKey: 'story_tips_title',
      tips: ['story_tip_1', 'story_tip_2', 'story_tip_3', 'story_tip_4', 'story_tip_5']
    },
    essay: {
      titleKey: 'essay_tips_title',
      tips: ['essay_tip_1', 'essay_tip_2', 'essay_tip_3', 'essay_tip_4', 'essay_tip_5']
    },
    application: {
      titleKey: 'application_tips_title',
      tips: ['application_tip_1', 'application_tip_2', 'application_tip_3', 'application_tip_4', 'application_tip_5']
    },
    creative: {
      titleKey: 'creative_tips_title',
      tips: ['creative_tip_1', 'creative_tip_2', 'creative_tip_3', 'creative_tip_4', 'creative_tip_5']
    }
  };

  const handleSave = async () => {
    if (!writingText.trim()) return;

    try {
      const wordCount = writingText.trim().split(/\s+/).length;

      const response = await submitWriting({
        prompt_id: currentPromptId,
        content: writingText,
        word_count: wordCount
      });

      const newWork = {
        id: Date.now(),
        type: selectedType,
        title: (writingPrompts[selectedType] || fallbackWritingPrompts[selectedType]).title,
        content: writingText,
        wordCount: wordCount,
        createdAt: new Date().toLocaleDateString('ne-NP')
      };

      setSavedWorks(prev => [newWork, ...prev]);
      addPoints(response?.points_earned || 20);
      addCoins(response?.coins_earned || 10);

      const saved = JSON.parse(localStorage.getItem('nepali-writing-works') || '[]');
      localStorage.setItem('nepali-writing-works', JSON.stringify([newWork, ...saved]));

      alert(`${t('writing_saved')} +${response?.points_earned || 20} ${t('points_earned')}`);
      setWritingText('');
    } catch (error) {
      console.error('Failed to save writing:', error);
      const wordCount = writingText.trim().split(/\s+/).length;
      const newWork = {
        id: Date.now(),
        type: selectedType,
        title: (writingPrompts[selectedType] || fallbackWritingPrompts[selectedType]).title,
        content: writingText,
        wordCount: wordCount,
        createdAt: new Date().toLocaleDateString('ne-NP')
      };
      setSavedWorks(prev => [newWork, ...prev]);
      addPoints(20);
      addCoins(10);
      const saved = JSON.parse(localStorage.getItem('nepali-writing-works') || '[]');
      localStorage.setItem('nepali-writing-works', JSON.stringify([newWork, ...saved]));
      alert(`${t('writing_saved')} +20 ${t('points_earned')}`);
      setWritingText('');
    }
  };

  const handleShowLearning = () => {
    setShowLearningContent(true);
    addPoints(5);
  };

  const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0;

  return (
    <DashboardLayout pageTitle={t('writing')}>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-6 font-nepali">
            {t('writing_practice_title')}
          </h1>
        </motion.div>

        {/* Tab Menu for Writing Types */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
          {writingTypes.map((type, index) => {
            const IconComponent = type.icon;
            const isActive = selectedType === type.id;

            return (
              <motion.button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setWritingText('');
                  setShowLearningContent(false);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-300 cursor-pointer
                  ${isActive
                    ? `bg-gradient-to-r ${type.gradient} text-white shadow-md scale-105`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                  }
                `}
              >
                <IconComponent size={18} />
                <span className="font-nepali">{t(type.titleKey)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Writing Area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
          {/* Writing Prompt */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 md:p-5 rounded-xl mb-5">
            <h4 className="mb-2 text-lg font-semibold font-nepali">
              {(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.title}
            </h4>
            <p className="leading-relaxed font-nepali text-white/90">
              {(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.prompt}
            </p>
          </div>

          {/* Text Editor */}
          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder={(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.placeholder}
            className="w-full min-h-[250px] md:min-h-[300px] border-2 border-gray-200 rounded-xl p-4
              font-nepali text-base md:text-lg leading-relaxed resize-y
              focus:outline-none focus:border-primary transition-colors duration-300
              placeholder:text-gray-400"
          />

          {/* Writing Tools */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <div className="text-gray-600 font-medium font-nepali">
              {t('word_count')}: {wordCount}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold
                  bg-gradient-to-r from-secondary to-secondary-light text-white
                  hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                onClick={handleShowLearning}
              >
                <Play size={16} />
                <span className="font-nepali">{t('learning_content')}</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold
                  bg-gradient-to-r from-primary to-primary-dark text-white
                  hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                onClick={handleSave}
                disabled={!writingText.trim()}
              >
                <Save size={16} />
                <span className="font-nepali">{t('save_writing')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Learning Content Section */}
        <AnimatePresence>
          {showLearningContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-lg"
            >
              <h3 className="text-gray-800 mb-4 flex items-center gap-2 text-lg font-semibold font-nepali">
                <Award className="text-primary" size={22} />
                {t(learningContent[selectedType].titleKey)}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                <ul className="space-y-3">
                  {learningContent[selectedType].tips.map((tipKey, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-600 font-nepali pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      <span className="text-secondary font-bold mt-0.5">✓</span>
                      <span>{t(tipKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Writing;