# नेपाली व्याकरण सिकाइ - Class 4 Interactive Learning Platform

A modern, gamified educational website for Class 4 Nepali and Vyakaran (Grammar) learning, built with React.js and designed specifically for young learners.

## 🌟 Features

### 🎮 Gamification System
- **Clash of Clans-inspired progression** with levels, points, coins, and badges
- **Achievement system** with unlockable rewards and learning zones
- **Progress tracking** with visual indicators and streaks
- **Leaderboard-ready** architecture for future multiplayer features

### 🎯 Interactive Learning
- **Grammar Shooter Game** - Fast-paced shooting-style mini-game for grammar practice
- **Village Building System** - Educational village with building mechanics
- **Quest System** - Grammar, vocabulary, and writing challenges
- **Lesson System** - Structured learning path with unlockable content
- **Writing Tools** - Free-writing for stories, essays, applications, and creative writing
- **Auto-triggered Learning Videos** - Contextual help and examples after writing

### 🌐 Bilingual Support
- **Nepali-first approach** - Primary learning content in Nepali
- **English interface option** - Menus and settings support both languages
- **Easy language switching** - Toggle between Nepali and English

### 🎨 Child-Friendly Design
- **Colorful, intuitive UI** designed for Class 4 students
- **Animated progress indicators** and character avatars
- **Accessibility-focused** design with clear navigation
- **Responsive design** for various screen sizes

### 🔧 API-Ready Architecture
- **Modular component structure** for easy backend integration
- **Context-based state management** ready for API connections
- **Prepared for Django/FastAPI backend** integration
- **Local storage** for offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nepali-vyakaran-learning
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header/          # Navigation and game stats
│   ├── Games/           # Game components
│   └── Village/         # Village building system
├── contexts/            # React Context providers
│   ├── LanguageContext.js  # Bilingual support
│   └── GameContext.js      # Game state management
├── pages/               # Main application pages
│   ├── Home/           # Dashboard and overview
│   ├── Lessons/        # Learning content
│   ├── Games/          # Game selection
│   ├── Village/        # Village building page
│   ├── Writing/        # Writing tools
│   ├── Progress/       # Progress tracking
│   └── Settings/       # User preferences
└── App.js              # Main application component
```

## 🎯 Learning Content

### Grammar Topics (Class 4 Nepali Curriculum)
- **आधारभूत व्याकरण** - Basic grammar fundamentals
- **संज्ञा र सर्वनाम** - Nouns and pronouns
- **विशेषण** - Adjectives
- **क्रिया** - Verbs
- **वाक्य संरचना** - Sentence structure

### Writing Modules
- **कथा लेखन** - Story writing with creative prompts
- **निबन्ध लेखन** - Essay writing with structured guidance
- **आवेदन लेखन** - Formal application writing
- **रचनात्मक लेखन** - Creative writing and poetry

### Games
- **व्याकरण शूटर** - Grammar shooting game (implemented)
- **गाउँ निर्माण** - Village building system (implemented)
- **शब्द पजल** - Word puzzle game (coming soon)
- **कथा निर्माता** - Story builder game (coming soon)
- **द्रुत प्रश्नोत्तर** - Quick quiz game (coming soon)

## 🔧 Technical Features

### State Management
- **React Context API** for global state
- **Local Storage** for persistence
- **Game state tracking** with automatic saves

### Animations & UI
- **Framer Motion** for smooth animations
- **Styled Components** for dynamic styling
- **Responsive design** with CSS Grid and Flexbox
- **Custom animations** for engagement

### Accessibility
- **Semantic HTML** structure
- **Keyboard navigation** support
- **Screen reader** friendly
- **High contrast** color schemes

## 🌐 Backend Integration Ready

The application is architected to easily connect with:

### Python Backend Options
- **Django REST Framework** - For robust API development
- **FastAPI** - For high-performance async APIs
- **Content Management** - Lesson content and user progress
- **AI Integration** - For writing feedback and personalized learning

### API Endpoints (Prepared)
- `/api/lessons/` - Lesson content and progress
- `/api/games/` - Game data and scores
- `/api/writing/` - Writing submissions and feedback
- `/api/progress/` - User progress and achievements
- `/api/auth/` - User authentication

## 🎨 Customization

### Themes
The application supports multiple color themes:
- **मूल (Default)** - Blue gradient theme
- **प्रकृति (Nature)** - Green nature theme
- **सूर्यास्त (Sunset)** - Orange sunset theme
- **समुद्र (Ocean)** - Teal ocean theme

### Language Support
Easy to extend with additional languages by updating the translation files in `src/contexts/LanguageContext.js`.

## 🚀 Future Enhancements

### Planned Features
- **Voice Recognition** - Speaking practice and pronunciation
- **AI Writing Assistant** - Automated feedback and suggestions
- **Multiplayer Games** - Collaborative learning experiences
- **Parent Dashboard** - Progress monitoring for parents/teachers
- **Offline Mode** - Full offline functionality
- **Mobile App** - React Native version

### Backend Integration
- **User Authentication** - Secure login and profiles
- **Cloud Sync** - Cross-device progress synchronization
- **Analytics** - Learning analytics and insights
- **Content Management** - Dynamic lesson content updates

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Nepali National Curriculum** - Content alignment
- **Class 4 Teachers** - Educational guidance
- **Young Learners** - User experience insights
- **Open Source Community** - React and related libraries

---

**Built with ❤️ for Nepali students learning their beautiful language!**

स्वागत छ नेपाली सिकाइमा! 🇳🇵