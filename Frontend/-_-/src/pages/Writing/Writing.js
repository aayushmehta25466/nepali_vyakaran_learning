import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { PenTool, BookOpen, FileText, Lightbulb, Save, Play, Award, Tag } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getWritingPrompts, submitWriting } from '../../services/api';

const Writing = () => {
  const { t, language } = useLanguage();
  const { addPoints, addCoins } = useGame();
  const [selectedType, setSelectedType] = useState('story');
  const [selectedTag, setSelectedTag] = useState('story');
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
        const response = await getWritingPrompts();
        
        if (response && response.data) {
          // Group prompts by type
          const groupedPrompts = {};
          response.data.forEach(prompt => {
            groupedPrompts[prompt.prompt_type] = {
              id: prompt.id,
              title: language === 'ne' ? (prompt.title_nepali || prompt.title) : prompt.title,
              prompt: language === 'ne' ? (prompt.description_nepali || prompt.description) : prompt.description,
              placeholder: language === 'ne' ? `आफ्नो ${prompt.prompt_type} यहाँ लेख्नुहोस्...` : `Write your ${prompt.prompt_type} here...`
            };
          });
          setWritingPrompts(groupedPrompts);
          if (groupedPrompts[selectedType]) {
            setCurrentPromptId(groupedPrompts[selectedType].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch writing prompts:', error);
        setWritingPrompts(fallbackWritingPrompts);
        if (fallbackWritingPrompts[selectedType]) {
          setCurrentPromptId(fallbackWritingPrompts[selectedType].id || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [language, selectedType]);

  // Update current prompt ID when type changes
  useEffect(() => {
    if (writingPrompts[selectedType]) {
      setCurrentPromptId(writingPrompts[selectedType].id);
    }
  }, [selectedType, writingPrompts]);

  // Load saved works from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nepali-writing-works') || '[]');
    setSavedWorks(saved);
  }, []);

  const writingTypes = [
    {
      id: 'story',
      title: t('story_writing'),
      description: t('story_writing_desc'),
      icon: BookOpen,
      gradient: 'from-red-400 to-orange-400'
    },
    {
      id: 'essay',
      title: t('essay_writing'),
      description: t('essay_writing_desc'),
      icon: FileText,
      gradient: 'from-teal-400 to-green-600'
    },
    {
      id: 'application',
      title: t('application_writing'),
      description: t('application_writing_desc'),
      icon: PenTool,
      gradient: 'from-green-300 to-green-600'
    },
    {
      id: 'creative',
      title: t('creative_writing'),
      description: t('creative_writing_desc'),
      icon: Lightbulb,
      gradient: 'from-pink-400 to-red-500'
    }
  ];

  const writingTags = [
    { id: 'story', label: t('story'), icon: '📖' },
    { id: 'essay', label: t('essay'), icon: '📝' },
    { id: 'poem', label: t('poem'), icon: '✍️' },
    { id: 'letter', label: t('letter'), icon: '✉️' }
  ];

  const fallbackWritingPrompts = {
    story: {
      title: language === 'ne' ? 'कथा लेखन अभ्यास' : 'Story Writing Practice',
      prompt: language === 'ne' 
        ? 'एक दिन तपाईं जंगलमा हिँडिरहनुभएको थियो। अचानक तपाईंले एउटा बोल्ने चरा देख्नुभयो। त्यो चराले तपाईंलाई के भन्यो होला? यस घटनाबाट सुरु भएको कथा लेख्नुहोस्।'
        : 'One day you were walking in the forest. Suddenly you saw a talking bird. What did that bird tell you? Write a story starting from this event.',
      placeholder: language === 'ne' ? 'आफ्नो कथा यहाँ लेख्नुहोस्...' : 'Write your story here...'
    },
    essay: {
      title: language === 'ne' ? 'निबन्ध लेखन अभ्यास' : 'Essay Writing Practice',
      prompt: language === 'ne'
        ? '"मेरो प्रिय चाड" विषयमा एउटा छोटो निबन्ध लेख्नुहोस्। तपाईंको मनपर्ने चाड कुन हो र किन? त्यो चाडमा के के गर्नुहुन्छ?'
        : 'Write a short essay on "My Favorite Festival". Which is your favorite festival and why? What do you do on that festival?',
      placeholder: language === 'ne' ? 'आफ्नो निबन्ध यहाँ लेख्नुहोस्...' : 'Write your essay here...'
    },
    application: {
      title: language === 'ne' ? 'आवेदन लेखन अभ्यास' : 'Application Writing Practice',
      prompt: language === 'ne'
        ? 'तपाईंको स्कुलमा खेलकुद प्रतियोगिता छ। त्यसमा भाग लिनको लागि प्रधानाध्यापकलाई आवेदन लेख्नुहोस्।'
        : 'There is a sports competition in your school. Write an application to the principal to participate in it.',
      placeholder: language === 'ne' ? 'आवेदन यहाँ लेख्नुहोस्...' : 'Write your application here...'
    },
    creative: {
      title: language === 'ne' ? 'रचनात्मक लेखन अभ्यास' : 'Creative Writing Practice',
      prompt: language === 'ne'
        ? '"वर्षा" विषयमा एउटा छोटो कविता वा रचना लेख्नुहोस्। वर्षाले तपाईंलाई कस्तो लाग्छ?'
        : 'Write a short poem or composition on "Rain". How does rain make you feel?',
      placeholder: language === 'ne' ? 'आफ्नो रचना यहाँ लेख्नुहोस्...' : 'Write your composition here...'
    }
  };

  const learningContent = {
    story: {
      title: language === 'ne' ? 'कथा लेखनका सुझावहरू' : 'Story Writing Tips',
      tips: language === 'ne' 
        ? [
            'कथाको सुरुवात रोचक बनाउनुहोस्',
            'पात्रहरूको चरित्र स्पष्ट पार्नुहोस्',
            'घटनाक्रम क्रमबद्ध राख्नुहोस्',
            'संवादहरू प्राकृतिक बनाउनुहोस्',
            'अन्त्य सन्तोषजनक होस्'
          ]
        : [
            'Make the story beginning interesting',
            'Define characters clearly',
            'Keep events in sequence',
            'Make dialogues natural',
            'Ensure a satisfying ending'
          ]
    },
    essay: {
      title: language === 'ne' ? 'निबन्ध लेखनका सुझावहरू' : 'Essay Writing Tips',
      tips: language === 'ne'
        ? [
            'विषयलाई राम्ररी बुझ्नुहोस्',
            'मुख्य बुँदाहरू पहिले सोच्नुहोस्',
            'परिचय, मुख्य भाग र निष्कर्ष राख्नुहोस्',
            'उदाहरणहरू प्रयोग गर्नुहोस्',
            'भाषा सरल र स्पष्ट राख्नुहोस्'
          ]
        : [
            'Understand the topic well',
            'Think of main points first',
            'Include introduction, body and conclusion',
            'Use examples',
            'Keep language simple and clear'
          ]
    },
    application: {
      title: language === 'ne' ? 'आवेदन लेखनका सुझावहरू' : 'Application Writing Tips',
      tips: language === 'ne'
        ? [
            'मिति र ठेगाना सही लेख्नुहोस्',
            'सम्बोधन उपयुक्त गर्नुहोस्',
            'विषय स्पष्ट उल्लेख गर्नुहोस्',
            'विनम्र भाषा प्रयोग गर्नुहोस्',
            'हस्ताक्षर नबिर्सनुहोस्'
          ]
        : [
            'Write date and address correctly',
            'Use appropriate salutation',
            'Mention subject clearly',
            'Use polite language',
            "Don't forget signature"
          ]
    },
    creative: {
      title: language === 'ne' ? 'रचनात्मक लेखनका सुझावहरू' : 'Creative Writing Tips',
      tips: language === 'ne'
        ? [
            'आफ्ना भावनाहरू व्यक्त गर्नुहोस्',
            'कल्पनाशक्ति प्रयोग गर्नुहोस्',
            'सुन्दर शब्दहरू छान्नुहोस्',
            'लयबद्धता राख्नुहोस्',
            'मौलिकता ल्याउनुहोस्'
          ]
        : [
            'Express your feelings',
            'Use imagination',
            'Choose beautiful words',
            'Maintain rhythm',
            'Bring originality'
          ]
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
        createdAt: new Date().toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US')
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
        createdAt: new Date().toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6 font-nepali">
            {t('writing_practice_title')}
          </h1>
        </motion.div>

        {/* Tags Menu */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-700 font-nepali">
              {t('select_writing_type')}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {writingTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(tag.id);
                  setSelectedType(tag.id);
                  setWritingText('');
                  setShowLearningContent(false);
                }}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  flex items-center gap-2 font-nepali
                  ${selectedTag === tag.id 
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Writing Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {writingTypes.map((type, index) => (
            <motion.div
              key={type.id}
              className={`
                bg-white rounded-2xl p-5 text-center cursor-pointer transition-all duration-300
                border-2 ${selectedType === type.id ? 'border-primary shadow-lg' : 'border-transparent shadow-md'}
                hover:transform hover:-translate-y-1 hover:shadow-xl
              `}
              onClick={() => {
                setSelectedType(type.id);
                setSelectedTag(type.id);
                setWritingText('');
                setShowLearningContent(false);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${type.gradient} flex items-center justify-center mx-auto mb-3`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2 font-nepali">{type.title}</h3>
              <p className="text-xs text-gray-600 font-nepali">{type.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Writing Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5 rounded-xl mb-5">
            <h4 className="text-lg font-semibold mb-2 font-nepali">
              {(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.title}
            </h4>
            <p className="leading-relaxed font-nepali">
              {(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.prompt}
            </p>
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder={(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.placeholder}
            className="w-full min-h-[300px] border-2 border-gray-200 rounded-xl p-5 font-nepali text-base
              leading-relaxed resize-vertical focus:outline-none focus:border-primary transition-colors"
          />

          <div className="flex justify-between items-center mt-5 flex-wrap gap-4">
            <div className="text-gray-600 font-medium font-nepali">
              {t('word_count')}: {wordCount}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleShowLearning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold
                  bg-gradient-to-r from-secondary to-secondary-light text-white
                  hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all font-nepali"
              >
                <Play className="w-4 h-4" />
                {t('learning_content')}
              </button>
              <button 
                onClick={handleSave}
                disabled={!writingText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold
                  bg-gradient-to-r from-primary to-primary-dark text-white
                  hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed font-nepali"
              >
                <Save className="w-4 h-4" />
                {t('save_writing')}
              </button>
            </div>
          </div>
        </div>

        {/* Learning Content */}
        <AnimatePresence>
          {showLearningContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3 font-nepali">
                <Award className="w-6 h-6 text-primary" />
                {learningContent[selectedType].title}
              </h3>
              <div className="bg-gray-50 rounded-xl p-5">
                <ul className="space-y-3">
                  {learningContent[selectedType].tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 font-nepali">
                      <span className="text-secondary font-bold text-lg">✓</span>
                      <span>{tip}</span>
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