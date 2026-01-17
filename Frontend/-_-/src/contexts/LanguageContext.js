import React, { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ne: {
    // Navigation
    home: 'गृहपृष्ठ',
    lessons: 'पाठहरू',
    games: 'खेलहरू',
    writing: 'लेखन',
    progress: 'प्रगति',
    settings: 'सेटिङहरू',
    village: 'गाउँ',
    about: 'हमीबारे',
    dashboard: 'ड्यासबोर्ड',
    
    // Game elements
    level: 'तह',
    points: 'अंक',
    badges: 'बिल्ला',
    coins: 'सिक्का',
    
    // Home page
    welcome_title: 'स्वागत छ, सिकारु!',
    welcome_subtitle: 'नेपाली व्याकरण सिक्न तयार हुनुहोस्',
    lessons_desc: 'कक्षा ४ को नेपाली व्याकरणका पाठहरू सिक्नुहोस्',
    games_desc: 'रमाइलो खेलहरूमार्फत व्याकरण सिक्नुहोस्',
    writing_desc: 'कथा, निबन्ध र रचनात्मक लेखन अभ्यास गर्नुहोस्',
    progress_desc: 'आफ्नो सिकाइको प्रगति हेर्नुहोस्',
    recent_badges: 'हालसालैका बिल्लाहरू',
    get_started: 'सुरु गर्नुहोस्',
    
    // About page
    about_title: 'नेपाली व्याकरण सिकाइ',
    about_subtitle: 'आधुनिक, रमाइलो र प्रभावकारी शिक्षा',
    about_description: 'नेपाली व्याकरण सिकाइ एक उद्देश्य-निर्देशित शिक्षण मञ्च हो जो छात्रहरूलाई रमाइलो, इन्टरएक्टिभ तरिकामा नेपाली भाषा सिक्न मद्दत गर्दछ।',
    
    // Dashboard
    dashboard_title: 'आपको डैशबोर्ड',
    my_progress: 'मेरो प्रगति',
    continue_learning: 'सिक्न जारी राख्नुहोस्',
    total_time: 'कुल समय',
    accuracy: 'सटीकता',
    current_streak: 'वर्तमान धारा',
    settings: 'सेटिङ्स',
    settings_page_title: 'सेटिङहरू',
    language_region: 'भाषा र क्षेत्र',
    interface_language: 'इन्टरफेस भाषा',
    ui_language_desc: 'मेनु र सेटिङहरूको भाषा',
    notification_settings: 'सूचना सेटिङ',
    notifications: 'सूचनाहरू',
    notifications_desc: 'दैनिक रिमाइन्डर र उपलब्धि सूचना',
    appearance: 'देखावट',
    font_size: 'फन्ट साइज',
    font_size_desc: 'पाठ र सामग्रीको आकार',
    small: 'सानो',
    medium_label: 'मध्यम',
    large: 'ठूलो',
    color_theme: 'रंग थिम',
    color_theme_desc: 'एप्लिकेसनको रंग योजना',
    theme_default: 'मूल',
    theme_nature: 'प्रकृति',
    theme_sunset: 'सूर्यास्त',
    theme_ocean: 'समुद्र',
    learning_settings: 'सिकाइ सेटिङ',
    difficulty: 'कठिनाई स्तर',
    difficulty_desc: 'प्रश्न र खेलहरूको कठिनाई',
    easy: 'सजिलो',
    hard: 'कठिन',
    auto_save: 'स्वचालित सेभ',
    auto_save_desc: 'लेखन कार्य स्वचालित रूपमा सुरक्षित गर्नुहोस्',
    data_management: 'डाटा व्यवस्थापन',
    reset_progress: 'प्रगति रिसेट गर्नुहोस्',
    reset_progress_desc: 'सबै सिकाइ प्रगति र डाटा मेटाउनुहोस्',
    reset: 'रिसेट गर्नुहोस्',
    help_support: 'सहायता र समर्थन',
    version: 'संस्करण',
    app_version: 'नेपाली सिकाइ v1.0.0',
    learner: 'सिकारु',
    lessons_completed_label: 'पाठ पूरा',
    profile: 'प्रोफाइल',
    achievements: 'उपलब्धिहरू',
    correct_answers: 'सही उत्तरहरू',
    no_badges_yet: 'अझै कुनै बिल्ला अर्जन गरिएको छैन। सिक्न जारी राख्नुहोस्!',
    no_achievements_yet: 'अझै कुनै उपलब्धि प्राप्त गरिएको छैन। पाठहरू पूरा गर्नुहोस् र उपलब्धिहरू अर्जन गर्नुहोस्!',
    
    // User menu
    logout: 'लग आउट',
    login: 'लॉगिन',
    register: 'साइन अप',
    
    // Learning content
    grammar: 'व्याकरण',
    vocabulary: 'शब्दकोश',
    reading: 'पठन',
    writing_practice: 'लेखन अभ्यास',
    
    // Actions
    start: 'सुरु गर्नुहोस्',
    continue: 'जारी राख्नुहोस्',
    complete: 'पूरा गर्नुहोस्',
    next: 'अर्को',
    previous: 'अघिल्लो',
    submit: 'पेश गर्नुहोस्',
    
    // Messages
    correct: 'सही!',
    incorrect: 'गलत!',
    try_again: 'फेरि प्रयास गर्नुहोस्',
    well_done: 'राम्रो!',
    excellent: 'उत्कृष्ट!',
    
    // Writing tools
    story_writing: 'कथा लेखन',
    essay_writing: 'निबन्ध लेखन',
    application_writing: 'आवेदन लेखन',
    creative_writing: 'रचनात्मक लेखन',
    writing_practice_title: 'लेखन अभ्यास',
    story_writing_desc: 'रचनात्मक कथाहरू लेख्नुहोस्',
    essay_writing_desc: 'विषयमा आधारित निबन्ध',
    application_writing_desc: 'औपचारिक आवेदनहरू',
    creative_writing_desc: 'कविता र रचनाहरू',
    word_count: 'शब्द संख्या',
    save_writing: 'सुरक्षित गर्नुहोस्',
    learning_content: 'सिकाइ सामग्री',
    writing_saved: 'तपाईंको लेखन सुरक्षित भयो!',
    points_earned: 'अंक प्राप्त!',
    lessons_completed: 'पूरा भएका पाठ',
    your_achievements: 'तपाईंका उपलब्धिहरू',
    select_writing_type: 'लेखन प्रकार चयन गर्नुहोस्',
    story: 'कथा',
    essay: 'निबन्ध',
    poem: 'कविता',
    letter: 'पत्र'
  },
  en: {
    // Navigation
    home: 'Home',
    lessons: 'Lessons',
    games: 'Games',
    writing: 'Writing',
    progress: 'Progress',
    settings: 'Settings',
    settings_page_title: 'Settings',
    language_region: 'Language & Region',
    interface_language: 'Interface Language',
    ui_language_desc: 'Language for menus and settings',
    notification_settings: 'Notification Settings',
    notifications: 'Notifications',
    notifications_desc: 'Daily reminders and achievement notifications',
    appearance: 'Appearance',
    font_size: 'Font Size',
    font_size_desc: 'Size of text and content',
    small: 'Small',
    medium_label: 'Medium',
    large: 'Large',
    color_theme: 'Color Theme',
    color_theme_desc: 'Application color scheme',
    theme_default: 'Default',
    theme_nature: 'Nature',
    theme_sunset: 'Sunset',
    theme_ocean: 'Ocean',
    learning_settings: 'Learning Settings',
    difficulty: 'Difficulty Level',
    difficulty_desc: 'Difficulty of questions and games',
    easy: 'Easy',
    hard: 'Hard',
    auto_save: 'Auto Save',
    auto_save_desc: 'Automatically save writing tasks',
    data_management: 'Data Management',
    reset_progress: 'Reset Progress',
    reset_progress_desc: 'Clear all learning progress and data',
    reset: 'Reset',
    help_support: 'Help & Support',
    version: 'Version',
    app_version: 'Nepali Learning v1.0.0',
    learner: 'Learner',
    lessons_completed_label: 'Lessons Completed',
    profile: 'Profile',
    achievements: 'Achievements',
    correct_answers: 'Correct Answers',
    no_badges_yet: 'No badges earned yet. Keep learning!',
    no_achievements_yet: 'No achievements yet. Complete lessons to earn achievements!',
    village: 'Village',
    about: 'About',
    dashboard: 'Dashboard',
    
    // Game elements
    level: 'Level',
    points: 'Points',
    badges: 'Badges',
    coins: 'Coins',
    
    // Home page
    welcome_title: 'Welcome, Learner!',
    welcome_subtitle: 'Ready to learn Nepali Grammar',
    lessons_desc: 'Learn Nepali grammar lessons for Grade 4',
    games_desc: 'Learn grammar through fun games',
    writing_desc: 'Practice story, essay and creative writing',
    progress_desc: 'View your learning progress',
    recent_badges: 'Recent Badges',
    get_started: 'Get Started',
    
    // About page
    about_title: 'Nepali Grammar Learning',
    about_subtitle: 'Modern, Fun & Effective Learning',
    about_description: 'Nepali Grammar Learning is a purpose-driven learning platform that helps students learn Nepali language in a fun, interactive way.',
    
    // Dashboard
    dashboard_title: 'Your Dashboard',
    my_progress: 'My Progress',
    continue_learning: 'Continue Learning',
    total_time: 'Total Time',
    accuracy: 'Accuracy',
    current_streak: 'Current Streak',
    settings: 'Settings',
    
    // User menu
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Sign Up',
    
    // Learning content
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    reading: 'Reading',
    writing_practice: 'Writing Practice',
    
    // Actions
    start: 'Start',
    continue: 'Continue',
    complete: 'Complete',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    
    // Messages
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    try_again: 'Try Again',
    well_done: 'Well Done!',
    excellent: 'Excellent!',
    
    // Writing tools
    story_writing: 'Story Writing',
    essay_writing: 'Essay Writing',
    application_writing: 'Application Writing',
    creative_writing: 'Creative Writing',
    writing_practice_title: 'Writing Practice',
    story_writing_desc: 'Write creative stories',
    essay_writing_desc: 'Topic-based essays',
    application_writing_desc: 'Formal applications',
    creative_writing_desc: 'Poetry and compositions',
    word_count: 'Word Count',
    save_writing: 'Save Writing',
    learning_content: 'Learning Content',
    writing_saved: 'Your writing has been saved!',
    points_earned: 'Points Earned!',
    lessons_completed: 'Lessons Completed',
    your_achievements: 'Your Achievements',
    select_writing_type: 'Select Writing Type',
    story: 'Story',
    essay: 'Essay',
    poem: 'Poem',
    letter: 'Letter'
  }
};

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'ne'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'ne';
  });

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ne' ? 'en' : 'ne';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    console.log('Language switched to:', newLang); // Debug log
  };
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage: (newLang) => {
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
    },
    t,
    toggleLanguage,
    isNepali: language === 'ne'
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};