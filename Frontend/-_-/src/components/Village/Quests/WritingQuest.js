import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, PenTool } from 'lucide-react';

const QuestContainer = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 700px;
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

const PromptCard = styled.div`
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
`;

const PromptTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PromptText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.95;
`;

const WritingArea = styled.div`
  margin-bottom: 25px;
`;

const TextArea = styled.textarea`
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
    border-color: #4CAF50;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const WordCount = styled.div`
  text-align: right;
  color: #666;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const SubmitButton = styled(motion.button)`
  background: ${props => props.disabled ? 
    'linear-gradient(45deg, #ccc, #999)' : 
    'linear-gradient(45deg, #4CAF50, #8BC34A)'};
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  width: 100%;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 20px rgba(76, 175, 80, 0.4)'};
  }
`;

const ResultContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const ResultTitle = styled.h3`
  color: #4CAF50;
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const FeedbackCard = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
`;

const FeedbackTitle = styled.h4`
  color: #333;
  margin-bottom: 10px;
`;

const FeedbackList = styled.ul`
  color: #666;
  line-height: 1.6;
  
  li {
    margin-bottom: 8px;
  }
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

const writingPrompts = [
  {
    title: "मेरो प्रिय जनावर",
    prompt: "तपाईंको मनपर्ने जनावरको बारेमा एउटा छोटो कथा लेख्नुहोस्। त्यो जनावर कस्तो देखिन्छ? यो के गर्छ? तपाईं किन यसलाई मन पराउनुहुन्छ?"
  },
  {
    title: "मेरो सपनाको घर",
    prompt: "तपाईंको सपनाको घर कस्तो हुनेछ? त्यहाँ के के छ? तपाईं त्यहाँ के गर्नुहुनेछ? विस्तारमा वर्णन गर्नुहोस्।"
  },
  {
    title: "एक दिनको साहसिक यात्रा",
    prompt: "तपाईं एक जादुई ठाउँमा पुग्नुभयो। त्यहाँ के देख्नुभयो? के भयो? यो साहसिक यात्राको कथा लेख्नुहोस्।"
  }
];

const WritingQuest = ({ quest, onComplete, onBack }) => {
  const [writingText, setWritingText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedPrompt] = useState(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);

  const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0;
  const minWords = 50;
  const canSubmit = wordCount >= minWords;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitted(true);
  };

  const handleComplete = () => {
    onComplete(quest.id, quest.reward);
  };

  const generateFeedback = () => {
    const feedback = [];
    
    if (wordCount >= 100) {
      feedback.push("उत्कृष्ट! तपाईंले विस्तृत लेखन गर्नुभयो।");
    } else if (wordCount >= 75) {
      feedback.push("राम्रो! तपाईंको लेखन पर्याप्त छ।");
    } else {
      feedback.push("राम्रो सुरुवात! अर्को पटक अझ विस्तारमा लेख्ने प्रयास गर्नुहोस्।");
    }
    
    if (writingText.includes('।')) {
      feedback.push("राम्रो! तपाईंले सही विराम चिह्न प्रयोग गर्नुभयो।");
    }
    
    feedback.push("तपाईंको कल्पनाशक्ति राम्रो छ।");
    feedback.push("लेखनमा सुधार गर्न निरन्तर अभ्यास गर्नुहोस्।");
    
    return feedback;
  };

  if (isSubmitted) {
    return (
      <QuestContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <ResultContainer>
          <ResultTitle className="nepali-text">
            बधाई छ! तपाईंले लेखन पूरा गर्नुभयो!
          </ResultTitle>
          
          <FeedbackCard>
            <FeedbackTitle className="nepali-text">तपाईंको लेखनको मूल्यांकन:</FeedbackTitle>
            <FeedbackList>
              {generateFeedback().map((feedback, index) => (
                <li key={index} className="nepali-text">{feedback}</li>
              ))}
            </FeedbackList>
          </FeedbackCard>
          
          <p style={{ color: '#666', margin: '15px 0' }} className="nepali-text">
            शब्द संख्या: {wordCount}
          </p>
          
          <RewardDisplay>
            {Object.entries(quest.reward).map(([resource, amount]) => (
              <RewardItem key={resource}>
                <Star size={16} color="#FFD700" />
                <span>+{amount}</span>
              </RewardItem>
            ))}
          </RewardDisplay>
          
          <CompleteButton onClick={handleComplete}>
            पुरस्कार लिनुहोस्
          </CompleteButton>
        </ResultContainer>
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

      <PromptCard>
        <PromptTitle className="nepali-text">
          <PenTool />
          {selectedPrompt.title}
        </PromptTitle>
        <PromptText className="nepali-text">
          {selectedPrompt.prompt}
        </PromptText>
      </PromptCard>

      <WritingArea>
        <TextArea
          value={writingText}
          onChange={(e) => setWritingText(e.target.value)}
          placeholder="यहाँ आफ्नो कथा लेख्नुहोस्..."
          className="nepali-text"
        />
        <WordCount className="nepali-text">
          शब्द संख्या: {wordCount} (न्यूनतम {minWords} शब्द चाहिन्छ)
        </WordCount>
      </WritingArea>

      <SubmitButton
        disabled={!canSubmit}
        onClick={handleSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {canSubmit ? 'पेश गर्नुहोस्' : `अझै ${minWords - wordCount} शब्द चाहिन्छ`}
      </SubmitButton>
    </QuestContainer>
  );
};

export default WritingQuest;