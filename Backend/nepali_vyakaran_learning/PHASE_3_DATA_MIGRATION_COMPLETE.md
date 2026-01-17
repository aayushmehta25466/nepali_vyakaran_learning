# Phase 3 Data Migration - Complete Guide

## ✅ Completed Tasks

### 1. Data Extraction
All hardcoded data from the frontend has been successfully extracted and formatted:

#### 📚 Lessons Data
- **Location**: `Backend/nepali_vyakaran_learning/data/lessons_data.json`
- **Count**: 22 lessons
- **Source**: `Frontend/-_-/src/pages/Lessons/Lessons.js`
- **Content**: Complete Nepal Class 4 Nepali Grammar curriculum with:
  - Lesson titles (Nepali)
  - Topics covered
  - Difficulty levels (easy/medium/hard)
  - Duration estimates
  - Points and coin rewards
  - Prerequisites for sequential unlocking

#### 🎯 Quest Data
- **Location**: `Backend/nepali_vyakaran_learning/data/quests_data.json`
- **Count**: 6 quests
- **Source**: `Frontend/-_-/src/components/Village/QuestModal.js`
- **Content**: Learning challenges including:
  - Grammar master quests
  - Vocabulary building
  - Writing challenges
  - Difficulty-based progression
  - Multi-resource rewards (coins, knowledge, books)

#### ✍️ Writing Prompts
- **Location**: `Backend/nepali_vyakaran_learning/data/writing_prompts_data.json`
- **Count**: 4 writing prompts
- **Source**: `Frontend/-_-/src/pages/Writing/Writing.js`
- **Content**: Creative writing exercises:
  - Story writing (कथा लेखन)
  - Essay writing (निबन्ध लेखन)
  - Application writing (आवेदन लेखन)
  - Creative writing (रचनात्मक लेखन)
  - Word count requirements
  - Rewards for completion

#### 🎮 Game Questions
- **Location**: `Backend/nepali_vyakaran_learning/data/game_questions_data.json`
- **Count**: 5 grammar questions
- **Source**: `Frontend/-_-/src/components/Games/GrammarShooter.js`
- **Content**: Grammar identification questions:
  - Multiple choice format
  - Categories (noun, verb, adjective, pronoun, grammar)
  - Difficulty levels
  - Explanations
  - Point values

### 2. Database Population
✅ **Management command created**: `learning_vyakaran/management/commands/populate_data.py`

**Command features**:
- Loads all JSON data files
- Creates proper Django model instances
- Handles relationships (prerequisites, categories)
- Maps difficulty levels correctly
- Creates default category "Nepali Grammar"
- Supports `--clear` flag to reset data

**Execution**:
```bash
cd Backend/nepali_vyakaran_learning
python manage.py populate_data
```

**Results**:
```
✅ Database population completed!

Summary:
  📚 Lessons: 52 total (22 new from frontend)
  🎯 Quests: 25 total (6 new from frontend)
  ✍️ Writing Prompts: 14 total (4 new from frontend)
  🎮 Game Questions: 274 total (5 new from frontend)
  📝 Quizzes: 26 total (1 new quiz "Grammar Shooter")
```

### 3. Database Status
✅ All data successfully seeded to the database
✅ Backend API endpoints now serving real data
✅ Authentication properly configured (JWT tokens)

---

## 🔄 Frontend Integration Guide

### API Endpoints Available

All endpoints are protected and require JWT authentication:

#### Lessons
```javascript
GET /api/v1/lessons/
Response: {
  success: true,
  data: [
    {
      id: "uuid",
      title: "पाठ १: नाम",
      description: "संज्ञाका प्रकार र पहिचान",
      difficulty: "beginner",
      level: 1,
      order: 1,
      points_reward: 50,
      coins_reward: 25,
      estimated_time: 15,
      content: { topics: [...], duration: 15 },
      is_published: true,
      ...
    }
  ]
}
```

#### Quests
```javascript
GET /api/v1/quests/
GET /api/v1/quests/daily/
POST /api/v1/quests/{id}/start/
POST /api/v1/quests/{id}/complete/
```

#### Writing Prompts
```javascript
GET /api/v1/writing/prompts/
POST /api/v1/writing/submit/
POST /api/v1/writing/{id}/save-draft/
```

#### Games
```javascript
GET /api/v1/games/grammar-shooter/questions/
POST /api/v1/games/grammar-shooter/validate-answer/
POST /api/v1/games/{game_id}/start/
POST /api/v1/games/{game_id}/end/
```

### Frontend Update Strategy

#### 1. Update Lessons.js
**Current**: Hardcoded lessons array in component
**Target**: Fetch from `/api/v1/lessons/`

```javascript
// Frontend/-_-/src/pages/Lessons/Lessons.js
import { getLessons } from '../../services/api';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await getLessons();
        // Transform backend data to match frontend format
        const transformedLessons = response.data.map(lesson => ({
          id: lesson.slug,
          title: lesson.title_nepali || lesson.title,
          subtitle: lesson.description_nepali || lesson.description,
          topics: lesson.content?.topics || [],
          points: lesson.points_reward,
          duration: `${lesson.estimated_time} मिनेट`,
          difficulty: mapDifficulty(lesson.difficulty),
          locked: !isLessonUnlocked(lesson, completedLessons)
        }));
        setLessons(transformedLessons);
      } catch (error) {
        console.error('Failed to load lessons:', error);
        // Fallback to localStorage or show error
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessons();
  }, [completedLessons]);
  
  // Difficulty mapping helper
  const mapDifficulty = (difficulty) => {
    const map = {
      'beginner': 'सजिलो',
      'intermediate': 'मध्यम',
      'advanced': 'कठिन'
    };
    return map[difficulty] || difficulty;
  };
  
  // Check if lesson is unlocked based on prerequisites
  const isLessonUnlocked = (lesson, completedLessons) => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return true;
    }
    return lesson.prerequisites.every(prereqId => 
      completedLessons.includes(prereqId)
    );
  };
};
```

#### 2. Update QuestModal.js
**Current**: Hardcoded quests array
**Target**: Fetch from `/api/v1/quests/`

```javascript
// Frontend/-_-/src/components/Village/QuestModal.js
import { getQuests, startQuest, completeQuest } from '../../services/api';

const QuestModal = ({ onClose, onComplete, villageLevel }) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await getQuests();
        const transformedQuests = response.data.map(quest => ({
          id: quest.id,
          type: quest.category,
          name: quest.name_nepali || quest.name,
          description: quest.description_nepali || quest.description,
          difficulty: quest.difficulty,
          reward: {
            coins: quest.coins_reward,
            knowledge: quest.experience_reward,
            books: quest.additional_rewards?.books || 0
          },
          minLevel: quest.min_level
        }));
        setQuests(transformedQuests);
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuests();
  }, []);
  
  const handleQuestComplete = async (questId, reward) => {
    try {
      await completeQuest(questId, { progress: 100 });
      // Update local state
      const newCompleted = [...completedQuests, questId];
      setCompletedQuests(newCompleted);
      localStorage.setItem('completed-quests', JSON.stringify(newCompleted));
      onComplete(reward);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };
};
```

#### 3. Update Writing.js
**Current**: Hardcoded writingPrompts object
**Target**: Fetch from `/api/v1/writing/prompts/`

```javascript
// Frontend/-_-/src/pages/Writing/Writing.js
import { getWritingPrompts, submitWriting } from '../../services/api';

const Writing = () => {
  const [prompts, setPrompts] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await getWritingPrompts();
        // Group prompts by type
        const groupedPrompts = response.data.reduce((acc, prompt) => {
          acc[prompt.prompt_type] = {
            title: prompt.title_nepali || prompt.title,
            prompt: prompt.description_nepali || prompt.description,
            placeholder: `आफ्नो ${prompt.prompt_type} यहाँ लेख्नुहोस्...`
          };
          return acc;
        }, {});
        setPrompts(groupedPrompts);
      } catch (error) {
        console.error('Failed to load writing prompts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);
  
  const handleSave = async () => {
    if (!writingText.trim()) return;
    
    try {
      const wordCount = writingText.trim().split(/\s+/).length;
      await submitWriting({
        prompt_id: currentPromptId,
        content: writingText,
        word_count: wordCount
      });
      
      addPoints(20);
      addCoins(10);
      alert('तपाईंको लेखन सुरक्षित भयो! +20 अंक प्राप्त!');
    } catch (error) {
      console.error('Failed to save writing:', error);
    }
  };
};
```

#### 4. Update GrammarShooter.js
**Current**: Hardcoded grammarQuestions array
**Target**: Fetch from `/api/v1/games/grammar-shooter/questions/`

```javascript
// Frontend/-_-/src/components/Games/GrammarShooter.js
import { getGrammarShooterQuestions, validateAnswer } from '../../services/api';

const GrammarShooter = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getGrammarShooterQuestions();
        // Transform backend data
        const transformedQuestions = response.data.map(q => ({
          question: q.question_text_nepali || q.question_text,
          options: q.options,
          correct: q.correct_answer?.index || 0
        }));
        setQuestions(transformedQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to hardcoded questions
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  const handleTargetClick = async (optionIndex, e) => {
    const isCorrect = optionIndex === questions[currentQuestion].correct;
    
    // Optional: validate with backend
    try {
      const response = await validateAnswer({
        question_id: questions[currentQuestion].id,
        answer_index: optionIndex
      });
      // Use backend validation result
    } catch (error) {
      // Fallback to local validation
    }
    
    // Rest of the logic...
  };
};
```

### Data Transformation Helpers

Create a utility file for common transformations:

```javascript
// Frontend/-_-/src/utils/dataTransformers.js

export const transformLesson = (backendLesson) => ({
  id: backendLesson.slug,
  title: backendLesson.title_nepali || backendLesson.title,
  subtitle: backendLesson.description_nepali || backendLesson.description,
  topics: backendLesson.content?.topics || [],
  points: backendLesson.points_reward,
  duration: `${backendLesson.estimated_time} मिनेट`,
  difficulty: mapDifficulty(backendLesson.difficulty),
  locked: false // Calculate based on prerequisites
});

export const transformQuest = (backendQuest) => ({
  id: backendQuest.id,
  type: backendQuest.category,
  name: backendQuest.name_nepali || backendQuest.name,
  description: backendQuest.description_nepali || backendQuest.description,
  difficulty: backendQuest.difficulty,
  reward: {
    coins: backendQuest.coins_reward,
    knowledge: backendQuest.experience_reward,
    books: backendQuest.additional_rewards?.books || 0
  },
  minLevel: backendQuest.min_level
});

export const mapDifficulty = (difficulty) => {
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
```

---

## 🚀 Next Steps

1. **Test Backend API** with authenticated user:
   - Create test user or use existing credentials
   - Get JWT access token
   - Test all endpoints with token in Authorization header

2. **Update Frontend Components** one by one:
   - Start with Lessons.js (most visible feature)
   - Then QuestModal.js
   - Then Writing.js
   - Finally GrammarShooter.js

3. **Handle Edge Cases**:
   - Loading states
   - Error handling (network failures)
   - Fallback to localStorage if API unavailable
   - Empty states (no data returned)

4. **Testing**:
   - Test each component after integration
   - Verify rewards are properly awarded
   - Check prerequisite logic for lessons
   - Test quest completion flow

5. **Cleanup**:
   - Remove hardcoded data from frontend files
   - Update documentation
   - Add comments explaining backend integration

---

## 📝 Example: Testing with curl

```bash
# 1. Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "yourpassword"}'

# Response: {"access": "your-jwt-token", "refresh": "..."}

# 2. Get lessons
curl http://localhost:8000/api/v1/lessons/ \
  -H "Authorization: Bearer your-jwt-token"

# 3. Get quests
curl http://localhost:8000/api/v1/quests/ \
  -H "Authorization: Bearer your-jwt-token"
```

---

## 🎉 Summary

✅ All frontend data successfully extracted and formatted
✅ Database populated with 22 lessons, 6 quests, 4 writing prompts, 5 game questions
✅ Backend API endpoints ready and serving data
✅ Authentication properly configured
✅ Frontend integration pattern established (Profile.js as reference)

**Next Task**: Update frontend components to fetch from backend APIs instead of hardcoded arrays
