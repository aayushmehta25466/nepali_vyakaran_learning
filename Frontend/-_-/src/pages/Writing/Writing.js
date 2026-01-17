import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { PenTool, BookOpen, FileText, Lightbulb, Save, Play, Award } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getWritingPrompts, submitWriting } from '../../services/api';

const WritingContainer = styled.div`
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

const WritingTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const WritingTypeCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  &.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const TypeIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
`;

const TypeTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const TypeDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const WritingArea = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const WritingPrompt = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  
  h4 {
    margin-bottom: 10px;
    font-size: 1.2rem;
  }
  
  p {
    line-height: 1.6;
  }
`;

const TextEditor = styled.textarea`
  width: 100%;
  min-height: 300px;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: 1.1rem;
  line-height: 1.8;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const WritingTools = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const WordCount = styled.div`
  color: #666;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.secondary {
    background: linear-gradient(45deg, #56ab2f, #a8e6cf);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(86, 171, 47, 0.4);
    }
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LearningVideo = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-top: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const VideoTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const VideoContent = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    color: #666;
    
    &:last-child {
      border-bottom: none;
    }
    
    &::before {
      content: '✓';
      color: #56ab2f;
      font-weight: bold;
      margin-right: 10px;
    }
  }
`;

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
        const response = await getWritingPrompts();
        
        if (response && response.data) {
          // Group prompts by type
          const groupedPrompts = {};
          response.data.forEach(prompt => {
            groupedPrompts[prompt.prompt_type] = {
              id: prompt.id,
              title: prompt.title_nepali || prompt.title,
              prompt: prompt.description_nepali || prompt.description,
              placeholder: `आफ्नो ${prompt.prompt_type} यहाँ लेख्नुहोस्...`
            };
          });
          setWritingPrompts(groupedPrompts);
          // Set current prompt ID based on selected type
          if (groupedPrompts[selectedType]) {
            setCurrentPromptId(groupedPrompts[selectedType].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch writing prompts:', error);
        // Fallback to hardcoded prompts
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
      title: 'कथा लेखन',
      description: 'रचनात्मक कथाहरू लेख्नुहोस्',
      icon: BookOpen,
      gradient: 'linear-gradient(45deg, #ff6b6b, #ffa726)'
    },
    {
      id: 'essay',
      title: 'निबन्ध लेखन',
      description: 'विषयमा आधारित निबन्ध',
      icon: FileText,
      gradient: 'linear-gradient(45deg, #4ecdc4, #44a08d)'
    },
    {
      id: 'application',
      title: 'आवेदन लेखन',
      description: 'औपचारिक आवेदनहरू',
      icon: PenTool,
      gradient: 'linear-gradient(45deg, #a8e6cf, #56ab2f)'
    },
    {
      id: 'creative',
      title: 'रचनात्मक लेखन',
      description: 'कविता र रचनाहरू',
      icon: Lightbulb,
      gradient: 'linear-gradient(45deg, #f093fb, #f5576c)'
    }
  ];

  const fallbackWritingPrompts = {
    story: {
      title: 'कथा लेखन अभ्यास',
      prompt: 'एक दिन तपाईं जंगलमा हिँडिरहनुभएको थियो। अचानक तपाईंले एउटा बोल्ने चरा देख्नुभयो। त्यो चराले तपाईंलाई के भन्यो होला? यस घटनाबाट सुरु भएको कथा लेख्नुहोस्।',
      placeholder: 'आफ्नो कथा यहाँ लेख्नुहोस्...'
    },
    essay: {
      title: 'निबन्ध लेखन अभ्यास',
      prompt: '"मेरो प्रिय चाड" विषयमा एउटा छोटो निबन्ध लेख्नुहोस्। तपाईंको मनपर्ने चाड कुन हो र किन? त्यो चाडमा के के गर्नुहुन्छ?',
      placeholder: 'आफ्नो निबन्ध यहाँ लेख्नुहोस्...'
    },
    application: {
      title: 'आवेदन लेखन अभ्यास',
      prompt: 'तपाईंको स्कुलमा खेलकुद प्रतियोगिता छ। त्यसमा भाग लिनको लागि प्रधानाध्यापकलाई आवेदन लेख्नुहोस्।',
      placeholder: 'आवेदन यहाँ लेख्नुहोस्...'
    },
    creative: {
      title: 'रचनात्मक लेखन अभ्यास',
      prompt: '"वर्षा" विषयमा एउटा छोटो कविता वा रचना लेख्नुहोस्। वर्षाले तपाईंलाई कस्तो लाग्छ?',
      placeholder: 'आफ्नो रचना यहाँ लेख्नुहोस्...'
    }
  };

  const learningContent = {
    story: {
      title: 'कथा लेखनका सुझावहरू',
      tips: [
        'कथाको सुरुवात रोचक बनाउनुहोस्',
        'पात्रहरूको चरित्र स्पष्ट पार्नुहोस्',
        'घटनाक्रम क्रमबद्ध राख्नुहोस्',
        'संवादहरू प्राकृतिक बनाउनुहोस्',
        'अन्त्य सन्तोषजनक होस्'
      ]
    },
    essay: {
      title: 'निबन्ध लेखनका सुझावहरू',
      tips: [
        'विषयलाई राम्ररी बुझ्नुहोस्',
        'मुख्य बुँदाहरू पहिले सोच्नुहोस्',
        'परिचय, मुख्य भाग र निष्कर्ष राख्नुहोस्',
        'उदाहरणहरू प्रयोग गर्नुहोस्',
        'भाषा सरल र स्पष्ट राख्नुहोस्'
      ]
    },
    application: {
      title: 'आवेदन लेखनका सुझावहरू',
      tips: [
        'मिति र ठेगाना सही लेख्नुहोस्',
        'सम्बोधन उपयुक्त गर्नुहोस्',
        'विषय स्पष्ट उल्लेख गर्नुहोस्',
        'विनम्र भाषा प्रयोग गर्नुहोस्',
        'हस्ताक्षर नबिर्सनुहोस्'
      ]
    },
    creative: {
      title: 'रचनात्मक लेखनका सुझावहरू',
      tips: [
        'आफ्ना भावनाहरू व्यक्त गर्नुहोस्',
        'कल्पनाशक्ति प्रयोग गर्नुहोस्',
        'सुन्दर शब्दहरू छान्नुहोस्',
        'लयबद्धता राख्नुहोस्',
        'मौलिकता ल्याउनुहोस्'
      ]
    }
  };

  const handleSave = async () => {
    if (!writingText.trim()) return;
    
    try {
      const wordCount = writingText.trim().split(/\s+/).length;
      
      // Submit to backend
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
      
      // Save to localStorage
      const saved = JSON.parse(localStorage.getItem('nepali-writing-works') || '[]');
      localStorage.setItem('nepali-writing-works', JSON.stringify([newWork, ...saved]));
      
      alert('तपाईंको लेखन सुरक्षित भयो! +' + (response?.points_earned || 20) + ' अंक प्राप्त!');
      setWritingText('');
    } catch (error) {
      console.error('Failed to save writing:', error);
      // Still save locally if backend fails
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
      alert('तपाईंको लेखन सुरक्षित भयो! +20 अंक प्राप्त!');
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
      <WritingContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle className="nepali-text">
            लेखन अभ्यास
          </PageTitle>
        </motion.div>

        <WritingTypesGrid>
          {writingTypes.map((type, index) => (
            <WritingTypeCard
              key={type.id}
              className={selectedType === type.id ? 'active' : ''}
            onClick={() => {
              setSelectedType(type.id);
              setWritingText('');
              setShowLearningContent(false);
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <TypeIcon gradient={type.gradient}>
              <type.icon size={24} />
            </TypeIcon>
            <TypeTitle className="nepali-text">{type.title}</TypeTitle>
            <TypeDescription className="nepali-text">{type.description}</TypeDescription>
          </WritingTypeCard>
        ))}
      </WritingTypesGrid>

      <WritingArea>
        <WritingPrompt>
          <h4 className="nepali-text">{(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.title}</h4>
          <p className="nepali-text">{(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.prompt}</p>
        </WritingPrompt>

        <TextEditor
          value={writingText}
          onChange={(e) => setWritingText(e.target.value)}
          placeholder={(writingPrompts[selectedType] || fallbackWritingPrompts[selectedType])?.placeholder}
          className="nepali-text"
        />

        <WritingTools>
          <WordCount>
            शब्द संख्या: {wordCount}
          </WordCount>
          
          <ActionButtons>
            <ActionButton 
              className="secondary"
              onClick={handleShowLearning}
            >
              <Play />
              सिकाइ सामग्री
            </ActionButton>
            <ActionButton 
              className="primary"
              onClick={handleSave}
              disabled={!writingText.trim()}
            >
              <Save />
              सुरक्षित गर्नुहोस्
            </ActionButton>
          </ActionButtons>
        </WritingTools>
      </WritingArea>

      <AnimatePresence>
        {showLearningContent && (
          <LearningVideo
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <VideoTitle className="nepali-text">
              <Award />
              {learningContent[selectedType].title}
            </VideoTitle>
            <VideoContent>
              <TipsList>
                {learningContent[selectedType].tips.map((tip, index) => (
                  <li key={index} className="nepali-text">{tip}</li>
                ))}
              </TipsList>
            </VideoContent>
          </LearningVideo>
        )}
      </AnimatePresence>
      </WritingContainer>
    </DashboardLayout>
  );
};

export default Writing;