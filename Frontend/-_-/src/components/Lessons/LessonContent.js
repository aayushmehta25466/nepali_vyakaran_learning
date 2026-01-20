import React, { useState } from 'react';
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

const LessonContent = ({ lesson, onClose, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Normalize exercises to handle different data structures
  const exercises = lesson.exercises?.map(ex => ({
    question: ex.question || ex.question_text || ex.question_text_nepali,
    options: ex.options || [],
    correctAnswer: ex.correctAnswer !== undefined ? ex.correctAnswer : ex.correct_answer
  })) || [];

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
    } else {
      const correctCount = exercises.reduce((count, exercise, index) => {
        // Handle both index-based and value-based correct answers
        const userSelection = exercise.options[answers[index]];
        const isCorrectIndex = answers[index] === exercise.correctAnswer;
        const isCorrectValue = String(userSelection) === String(exercise.correctAnswer);
        
        // If correctAnswer is a number and looks like an index
        if (typeof exercise.correctAnswer === 'number' && exercise.correctAnswer < exercise.options.length) {
            return count + (isCorrectIndex ? 1 : 0);
        }

        // Fallback check
        return count + ((isCorrectIndex || isCorrectValue) ? 1 : 0);
      }, 0) || 0;
      
      const score = exercises.length 
        ? Math.round((correctCount / exercises.length) * 100) 
        : 100;
      
      onComplete(lesson.id, score);
    }
  };

  const allQuestionsAnswered = exercises.length > 0
    ? exercises.every((_, index) => answers[index] !== undefined)
    : true;


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

        <LessonTitle>{lesson.title}</LessonTitle>
        <LessonDescription>{lesson.description}</LessonDescription>

        <ContentSection>
          <SectionTitle>व्याकरण नियम (Grammar Rules)</SectionTitle>
          <ContentText className="nepali-text">
            {lesson.content || 'यस पाठमा विभिन्न व्याकरण नियमहरू र उदाहरणहरू समावेश छन्।'}
          </ContentText>
        </ContentSection>

        {lesson.examples && lesson.examples.length > 0 && (
          <ContentSection>
            <SectionTitle>उदाहरणहरू (Examples)</SectionTitle>
            {lesson.examples.map((example, index) => (
              <Example key={index} className="nepali-text">
                {example}
              </Example>
            ))}
          </ContentSection>
        )}

        {exercises.length > 0 && (
          <ExerciseSection>
            <SectionTitle>अभ्यास (Exercises)</SectionTitle>
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
                      {option}
                      {showResults && isCorrect && ' ✓'}
                    </Option>
                    );
                  })}
                </Options>
              </Question>
              );
            })}
          </ExerciseSection>
        )}

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
      </ModalContent>
    </Modal>
  );
};

export default LessonContent;
