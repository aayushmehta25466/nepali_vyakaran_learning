import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px;

  @media (max-width: 768px) {
    padding: 20px;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const LessonTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
  padding-right: 50px;
`;

const LessonDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const ContentSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #667eea;
  margin-bottom: 15px;
`;

const ContentText = styled.div`
  font-size: 1rem;
  color: #333;
  line-height: 1.8;
  margin-bottom: 20px;

  &.nepali-text {
    font-family: 'Noto Sans Devanagari', sans-serif;
  }
`;

const Example = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 15px 20px;
  margin: 15px 0;
  border-radius: 8px;

  &.nepali-text {
    font-family: 'Noto Sans Devanagari', sans-serif;
    font-size: 1.1rem;
  }
`;

const ExerciseSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
`;

const Question = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 500;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Option = styled.button`
  padding: 12px 20px;
  background: ${props => 
    props.selected ? '#667eea' : 
    props.correct ? '#4CAF50' : 
    props.incorrect ? '#f44336' : 'white'};
  color: ${props => (props.selected || props.correct || props.incorrect) ? 'white' : '#333'};
  border: 2px solid ${props => 
    props.selected ? '#667eea' : 
    props.correct ? '#4CAF50' : 
    props.incorrect ? '#f44336' : '#ddd'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  text-align: left;
  transition: all 0.3s;
  font-size: 1rem;

  &:hover:not(:disabled) {
    background: ${props => props.selected ? '#667eea' : '#f0f0f0'};
    border-color: #667eea;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: ${props => props.active ? '#667eea' : '#999'};
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  transition: all 0.3s;
  position: relative;
  bottom: -2px;

  &:hover {
    color: #667eea;
  }

  border-bottom-color: ${props => props.active ? '#667eea' : 'transparent'};
`;

const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  animation: ${props => props.active ? 'fadeIn' : 'none'} 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CompleteButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StartExercisesButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  }
`;

const ProgressCounter = styled.div`
  background: linear-gradient(135deg, #f0f4ff 0%, #f8f9ff 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;

  h4 {
    color: #667eea;
    font-size: 1rem;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .progress-text {
    color: #333;
    font-size: 1.3rem;
    font-weight: 700;

    .completed {
      color: #4CAF50;
    }

    .total {
      color: #667eea;
    }
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 10px;
    margin-top: 12px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50 0%, #667eea 100%);
      border-radius: 10px;
      transition: width 0.3s ease;
    }
  }
`;

const LessonContent = ({ lesson, onClose, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' or 'exercises'

  useEffect(() => {
    setAnswers({});
    setShowResults(false);
    setActiveTab('lesson');
  }, [lesson?.id]);

  // Normalize exercises to handle different data structures, including questions API fallback
  const exercises = useMemo(() => {
    if (lesson?.exercises?.length) {
      return lesson.exercises.map(ex => ({
        question: ex.question_text_nepali || ex.question_text || ex.question || ex.prompt || 'प्रश्न',
        options: Array.isArray(ex.options) ? ex.options.map(opt => opt.text || opt) : [],
        correctAnswer: ex.correctAnswer !== undefined ? ex.correctAnswer : ex.correct_answer
      }));
    }

    if (lesson?.questions?.length) {
      return lesson.questions.map(q => ({
        id: q.id,
        question: q.question_text_nepali || q.question_text || q.question || 'प्रश्न',
        options: Array.isArray(q.options) ? q.options.map(opt => opt.text || opt) : [],
        correctAnswer: 0  // The first option is typically correct for the questions from the API
      }));
    }

    return [];
  }, [lesson]);

  const handleAnswerSelect = (exerciseIndex, optionIndex) => {
    if (showResults) return;
    
    setAnswers({
      ...answers,
      [exerciseIndex]: optionIndex
    });
  };

  const handleComplete = () => {
    if (!showResults) {
      setShowResults(true);
      return;
    }

    const correctCount = exercises.reduce((count, exercise, index) => {
      if (exercise.correctAnswer === undefined || exercise.correctAnswer === null) {
        return count;
      }

      const userSelection = exercise.options[answers[index]];
      const isCorrectIndex = answers[index] === exercise.correctAnswer;
      const isCorrectValue = String(userSelection) === String(exercise.correctAnswer);
      
      if (typeof exercise.correctAnswer === 'number' && exercise.correctAnswer < exercise.options.length) {
        return count + (isCorrectIndex ? 1 : 0);
      }

      return count + ((isCorrectIndex || isCorrectValue) ? 1 : 0);
    }, 0) || 0;
    
    const score = exercises.length 
      ? Math.round((correctCount / exercises.length) * 100) 
      : 100;
    
    onComplete(lesson, score, answers);
  };

  const allQuestionsAnswered = exercises.length > 0
    ? exercises.every((_, index) => answers[index] !== undefined)
    : true;

  const lessonTitle = lesson.title_nepali || lesson.title || 'पाठ';

  const descriptionText = lesson.description_nepali || lesson.description || lesson.subtitle || '';

  // Handle content structure - can be string or nested object with introduction and sections
  const contentIntroduction = typeof lesson.content === 'object' && lesson.content?.introduction
    ? lesson.content.introduction
    : typeof lesson.content === 'string'
    ? lesson.content
    : lesson.content?.text || lesson.content?.description || lesson.content?.summary || lesson.content?.content_nepali || lesson.description_nepali || lesson.subtitle || 'यस पाठमा विभिन्न व्याकरण नियमहरू र उदाहरणहरू समावेश छन्।';

  // Extract sections if content is nested object
  const contentSections = Array.isArray(lesson.content?.sections) ? lesson.content.sections : [];

  // Extract examples - can be from content.sections[].examples or lesson.examples
  const allExamples = [];
  if (contentSections.length > 0) {
    contentSections.forEach(section => {
      if (Array.isArray(section.examples)) {
        allExamples.push(...section.examples);
      }
    });
  }
  if (Array.isArray(lesson.examples) && lesson.examples.length > 0) {
    allExamples.push(...lesson.examples);
  }

  return (
    <Modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>
          <X />
        </CloseButton>

        <LessonTitle className="nepali-text">{lessonTitle}</LessonTitle>
        <LessonDescription className="nepali-text">{descriptionText}</LessonDescription>

        {/* Tab Navigation */}
        <TabContainer>
          <TabButton
            active={activeTab === 'lesson'}
            onClick={() => setActiveTab('lesson')}
          >
            📖 पाठ (Lesson)
          </TabButton>
          <TabButton
            active={activeTab === 'exercises'}
            onClick={() => setActiveTab('exercises')}
          >
            ✏️ अभ्यास (Exercises)
          </TabButton>
        </TabContainer>

        {/* Lesson Content Tab */}
        <TabContent active={activeTab === 'lesson'}>
          {/* Display Introduction */}
          {contentIntroduction && (
            <ContentSection>
              <SectionTitle>परिचय (Introduction)</SectionTitle>
              <ContentText className="nepali-text">
                {contentIntroduction}
              </ContentText>
            </ContentSection>
          )}

          {/* Display Content Sections */}
          {contentSections.map((section, index) => (
            <ContentSection key={index}>
              <SectionTitle className="nepali-text">{section.title || `खण्ड ${index + 1}`}</SectionTitle>
              <ContentText className="nepali-text">
                {section.description || section.content || ''}
              </ContentText>
              {Array.isArray(section.examples) && section.examples.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  {section.examples.map((example, exIdx) => (
                    <Example key={exIdx} className="nepali-text">
                      {example}
                    </Example>
                  ))}
                </div>
              )}
            </ContentSection>
          ))}

          {/* Display all examples if not already shown in sections */}
          {allExamples.length > 0 && (
            <ContentSection>
              <SectionTitle>उदाहरणहरू (Examples)</SectionTitle>
              {allExamples.map((example, index) => (
                <Example key={index} className="nepali-text">
                  {example}
                </Example>
              ))}
            </ContentSection>
          )}

          {/* Start Exercises Button */}
          {exercises.length > 0 && (
            <StartExercisesButton onClick={() => setActiveTab('exercises')}>
              ✏️ अभ्यास सुरु गर्नुहोस् (Start Exercises)
            </StartExercisesButton>
          )}
        </TabContent>

        {/* Exercises Tab */}
        <TabContent active={activeTab === 'exercises'}>
          <ExerciseSection style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <SectionTitle>अभ्यास (Exercises)</SectionTitle>
            {exercises.length === 0 && (
              <ContentText className="nepali-text">
                अभ्यासहरू अहिले उपलब्ध छैनन्। कृपया पाठ पढ्नुहोस् र पछि प्रयास गर्नुहोस्।
              </ContentText>
            )}
            {exercises.map((exercise, exerciseIndex) => {
              // Helper to determine correctness for display
              const isCorrectDisplay = (optIdx) => {
                  if (typeof exercise.correctAnswer === 'number') {
                      return optIdx === exercise.correctAnswer;
                  }
                  // Text match
                  return String(exercise.options[optIdx]) === String(exercise.correctAnswer);
              };

              return (
              <Question key={exerciseIndex}>
                <QuestionText className="nepali-text">
                  {exerciseIndex + 1}. {exercise.question}
                </QuestionText>
                <Options>
                  {exercise.options.map((option, optionIndex) => {
                    const isCorrect = isCorrectDisplay(optionIndex);
                    const isSelected = answers[exerciseIndex] === optionIndex;
                    // Handle both string options and option objects
                    const optionText = typeof option === 'string' ? option : option?.text || option?.label || String(option);

                    return (
                    <Option
                      key={optionIndex}
                      selected={isSelected && !showResults}
                      correct={showResults && isCorrect}
                      incorrect={showResults && isSelected && !isCorrect}
                      onClick={() => handleAnswerSelect(exerciseIndex, optionIndex)}
                      disabled={showResults}
                      className="nepali-text"
                    >
                      {optionText}
                      {showResults && isCorrect && ' ✓'}
                    </Option>
                    );
                  })}
                </Options>
              </Question>
              );
            })}
          </ExerciseSection>
        </TabContent>

        {/* Show Complete Button only on Exercises tab */}
        {activeTab === 'exercises' && exercises.length > 0 && (
          <>
            {/* Progress Counter */}
            <ProgressCounter>
              <h4>आपको प्रगति (Your Progress)</h4>
              <div className="progress-text">
                <span className="completed">{Object.keys(answers).length}</span>
                {' / '}
                <span className="total">{exercises.length}</span>
                {' प्रश्न सम्पन्न'}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${exercises.length > 0 ? (Object.keys(answers).length / exercises.length) * 100 : 0}%` }}
                />
              </div>
            </ProgressCounter>

            <CompleteButton
              onClick={handleComplete}
              disabled={!showResults && !allQuestionsAnswered}
            >
              {showResults ? (
                <>
                  <CheckCircle size={20} />
                  पाठ पूरा गर्नुहोस् (Complete Lesson)
                </>
              ) : (
                <>
                  उत्तरहरू जाँच गर्नुहोस् (Check Answers)
                  <ArrowRight size={20} />
                </>
              )}
            </CompleteButton>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LessonContent;
