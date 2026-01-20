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
    dashboard_title: 'तपाईंको डैशबोर्ड',
    my_progress: 'मेरो प्रगति',
    continue_learning: 'सिक्न जारी राख्नुहोस्',
    total_time: 'कुल समय',
    accuracy: 'सटीकता',
    current_streak: 'वर्तमान धारा',

    // Settings
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
    reset_confirm: 'के तपाईं आफ्नो सबै प्रगति रिसेट गर्न चाहनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।',
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
    letter: 'पत्र',
    writing_placeholder_prefix: 'आफ्नो',

    // Writing tips
    story_tips_title: 'कथा लेखनका सुझावहरू',
    story_tip_1: 'कथाको सुरुवात रोचक बनाउनुहोस्',
    story_tip_2: 'पात्रहरूको चरित्र स्पष्ट पार्नुहोस्',
    story_tip_3: 'घटनाक्रम क्रमबद्ध राख्नुहोस्',
    story_tip_4: 'संवादहरू प्राकृतिक बनाउनुहोस्',
    story_tip_5: 'अन्त्य सन्तोषजनक होस्',
    essay_tips_title: 'निबन्ध लेखनका सुझावहरू',
    essay_tip_1: 'विषयलाई राम्ररी बुझ्नुहोस्',
    essay_tip_2: 'मुख्य बुँदाहरू पहिले सोच्नुहोस्',
    essay_tip_3: 'परिचय, मुख्य भाग र निष्कर्ष राख्नुहोस्',
    essay_tip_4: 'उदाहरणहरू प्रयोग गर्नुहोस्',
    essay_tip_5: 'भाषा सरल र स्पष्ट राख्नुहोस्',
    application_tips_title: 'आवेदन लेखनका सुझावहरू',
    application_tip_1: 'मिति र ठेगाना सही लेख्नुहोस्',
    application_tip_2: 'सम्बोधन उपयुक्त गर्नुहोस्',
    application_tip_3: 'विषय स्पष्ट उल्लेख गर्नुहोस्',
    application_tip_4: 'विनम्र भाषा प्रयोग गर्नुहोस्',
    application_tip_5: 'हस्ताक्षर नबिर्सनुहोस्',
    creative_tips_title: 'रचनात्मक लेखनका सुझावहरू',
    creative_tip_1: 'आफ्ना भावनाहरू व्यक्त गर्नुहोस्',
    creative_tip_2: 'कल्पनाशक्ति प्रयोग गर्नुहोस्',
    creative_tip_3: 'सुन्दर शब्दहरू छान्नुहोस्',
    creative_tip_4: 'लयबद्धता राख्नुहोस्',
    creative_tip_5: 'मौलिकता ल्याउनुहोस्',

    // Lessons
    learning_lessons: 'सिकाइ पाठहरू',
    loading_lessons: 'पाठहरू लोड गर्दै...',
    locked: 'बन्द छ',
    study_again: 'पुनः अध्ययन',
    more: 'थप',
    minutes: 'मिनेट',

    // Progress page
    your_progress: 'तपाईंको प्रगति',
    points_from_learning: 'सिकाइबाट प्राप्त',
    current_level: 'हालको स्तर',
    total_correct: 'कुल सही जवाफ',
    current_series: 'हालको श्रृंखला',
    lesson_progress: 'पाठ प्रगति',
    next_level: 'अर्को तहसम्म',
    daily_activity: 'दैनिक गतिविधि',
    activities: 'गतिविधि',
    last_7_weeks_activity: 'पछिल्लो ७ हप्ताको सिकाइ गतिविधि',

    // Achievement badges
    first_lesson_badge: 'पहिलो पाठ',
    first_lesson_desc: 'पहिलो पाठ पूरा',
    point_collector_badge: 'अंक संकलक',
    points_100_desc: '100+ अंक',
    grammar_master_badge: 'व्याकरण गुरु',
    points_500_desc: '500+ अंक',
    streak_keeper_badge: 'निरन्तरता',
    streak_5_desc: '5+ लगातार सही',
    coin_collector_badge: 'सिक्का संकलक',
    coins_200_desc: '200+ सिक्का',
    dedicated_learner_badge: 'समर्पित सिकारु',
    lessons_3_desc: '3+ पाठ पूरा',

    // Games page
    fun_games: 'रमाइलो खेलहरू',
    games_subtitle: 'खेल्दै सिक्नुहोस्, सिक्दै रमाइलो गर्नुहोस्!',
    grammar_shooter: 'व्याकरण शूटर',
    grammar_shooter_desc: 'सही व्याकरणका उत्तरहरूमा निशाना लगाउनुहोस्। तीव्र गतिको खेलमा आफ्ना कौशल परीक्षण गर्नुहोस्।',
    word_puzzle: 'शब्द पजल',
    word_puzzle_desc: 'अक्षरहरू मिलाएर सही शब्दहरू बनाउनुहोस्। शब्दकोश बढाउने रमाइलो तरिका।',
    story_builder: 'कथा निर्माता',
    story_builder_desc: 'दिइएका शब्दहरू प्रयोग गरेर रचनात्मक कथाहरू बनाउनुहोस्।',
    quick_quiz: 'द्रुत प्रश्नोत्तर',
    quick_quiz_desc: 'व्याकरणका छिटो प्रश्नहरूको जवाफ दिनुहोस्। समयसीमामा आफ्नो ज्ञान जाँच्नुहोस्।',
    coming_soon: 'छिट्टै आउँदैछ',
    medium: 'मध्यम',

    // Village Buildings
    select_building: 'भवन छान्नुहोस्',
    category_main_buildings: 'मुख्य भवनहरू',
    category_resource_buildings: 'संसाधन भवनहरू',
    category_military_buildings: 'सैन्य भवनहरू',
    category_defense_buildings: 'रक्षा भवनहरू',
    category_special_buildings: 'विशेष भवनहरू',
    building_townhall: 'टाउन हल',
    building_townhall_desc: 'मुख्य भवन - सबै कुरा अनलक गर्छ',
    building_house: 'घर',
    building_house_desc: 'जनसंख्या बढाउँछ र सिक्का उत्पादन गर्छ',
    building_library: 'पुस्तकालय',
    building_library_desc: 'ज्ञान उत्पादन गर्छ र नयाँ पाठहरू अनलक गर्छ',
    building_farm: 'खेत',
    building_farm_desc: 'खाना उत्पादन गर्छ र शक्ति पुनर्स्थापना गर्छ',
    building_goldmine: 'सुन खानी',
    building_goldmine_desc: 'सुन उत्पादन गर्छ',
    building_elixircollector: 'अमृत संग्राहक',
    building_elixircollector_desc: 'अमृत उत्पादन गर्छ',
    building_school: 'विद्यालय',
    building_school_desc: 'उन्नत सिकाइ र विशेष चुनौतीहरू प्रदान गर्छ',
    building_barracks: 'सेना शिविर',
    building_barracks_desc: 'भूमि सेना तालिम दिन्छ',
    building_spellfactory: 'जादू कारखाना',
    building_spellfactory_desc: 'जादुई मन्त्र बनाउँछ',
    building_cannon: 'तोप',
    building_cannon_desc: 'भूमि आक्रमणकारीहरूलाई रक्षा गर्छ',
    building_archertower: 'धनुर्धारी मीनार',
    building_archertower_desc: 'भूमि र हवाई आक्रमणकारीहरूलाई रक्षा गर्छ',
    building_mortar: 'मोर्टार',
    building_mortar_desc: 'क्षेत्र क्षति गर्छ',
    building_temple: 'मन्दिर',
    building_temple_desc: 'आशीर्वाद र बोनस प्रदान गर्छ',
    building_clancastle: 'कुल किल्ला',
    building_clancastle_desc: 'कुल सेना र सहायता प्रदान गर्छ',
    loading_village: 'Village लोड गर्दै...'
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
    reset_confirm: 'Are you sure you want to reset all your progress? This action cannot be undone.',
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

    // User menu
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
    letter: 'Letter',
    writing_placeholder_prefix: 'Write your',

    // Writing tips
    story_tips_title: 'Story Writing Tips',
    story_tip_1: 'Start with an interesting opening',
    story_tip_2: 'Develop clear characters',
    story_tip_3: 'Keep events in sequence',
    story_tip_4: 'Make dialogues natural',
    story_tip_5: 'End satisfactorily',
    essay_tips_title: 'Essay Writing Tips',
    essay_tip_1: 'Understand the topic well',
    essay_tip_2: 'Think of main points first',
    essay_tip_3: 'Include introduction, body, and conclusion',
    essay_tip_4: 'Use examples',
    essay_tip_5: 'Keep language simple and clear',
    application_tips_title: 'Application Writing Tips',
    application_tip_1: 'Write date and address correctly',
    application_tip_2: 'Use appropriate salutation',
    application_tip_3: 'Clearly mention the subject',
    application_tip_4: 'Use polite language',
    application_tip_5: 'Don\'t forget the signature',
    creative_tips_title: 'Creative Writing Tips',
    creative_tip_1: 'Express your feelings',
    creative_tip_2: 'Use imagination',
    creative_tip_3: 'Choose beautiful words',
    creative_tip_4: 'Maintain rhythm',
    creative_tip_5: 'Be original',

    // Lessons
    learning_lessons: 'Learning Lessons',
    loading_lessons: 'Loading lessons...',
    locked: 'Locked',
    study_again: 'Study Again',
    more: 'more',
    minutes: 'minutes',

    // Progress page
    your_progress: 'Your Progress',
    points_from_learning: 'From learning',
    current_level: 'Current level',
    total_correct: 'Total correct answers',
    current_series: 'Current series',
    lesson_progress: 'Lesson Progress',
    next_level: 'To Next Level',
    daily_activity: 'Daily Activity',
    activities: 'activities',
    last_7_weeks_activity: 'Learning activity for the last 7 weeks',

    // Achievement badges
    first_lesson_badge: 'First Lesson',
    first_lesson_desc: 'Completed first lesson',
    point_collector_badge: 'Point Collector',
    points_100_desc: '100+ points',
    grammar_master_badge: 'Grammar Master',
    points_500_desc: '500+ points',
    streak_keeper_badge: 'Streak Keeper',
    streak_5_desc: '5+ streak',
    coin_collector_badge: 'Coin Collector',
    coins_200_desc: '200+ coins',
    dedicated_learner_badge: 'Dedicated Learner',
    lessons_3_desc: '3+ lessons completed',

    // Games page
    fun_games: 'Fun Games',
    games_subtitle: 'Learn while playing, have fun while learning!',
    grammar_shooter: 'Grammar Shooter',
    grammar_shooter_desc: 'Aim at the correct grammar answers. Test your skills in a fast-paced game.',
    word_puzzle: 'Word Puzzle',
    word_puzzle_desc: 'Combine letters to form correct words. A fun way to build vocabulary.',
    story_builder: 'Story Builder',
    story_builder_desc: 'Create creative stories using given words.',
    quick_quiz: 'Quick Quiz',
    quick_quiz_desc: 'Answer quick grammar questions. Test your knowledge within time limits.',
    coming_soon: 'Coming Soon',
    medium: 'Medium',

    // Village Buildings
    select_building: 'Select Building',
    category_main_buildings: 'Main Buildings',
    category_resource_buildings: 'Resource Buildings',
    category_military_buildings: 'Military Buildings',
    category_defense_buildings: 'Defense Buildings',
    category_special_buildings: 'Special Buildings',
    building_townhall: 'Town Hall',
    building_townhall_desc: 'Main building - unlocks everything',
    building_house: 'House',
    building_house_desc: 'Increases population and produces coins',
    building_library: 'Library',
    building_library_desc: 'Produces knowledge and unlocks new lessons',
    building_farm: 'Farm',
    building_farm_desc: 'Produces food and restores energy',
    building_goldmine: 'Gold Mine',
    building_goldmine_desc: 'Produces gold',
    building_elixircollector: 'Elixir Collector',
    building_elixircollector_desc: 'Produces elixir',
    building_school: 'School',
    building_school_desc: 'Provides advanced learning and special challenges',
    building_barracks: 'Barracks',
    building_barracks_desc: 'Trains ground troops',
    building_spellfactory: 'Spell Factory',
    building_spellfactory_desc: 'Creates magical spells',
    building_cannon: 'Cannon',
    building_cannon_desc: 'Defends against ground attackers',
    building_archertower: 'Archer Tower',
    building_archertower_desc: 'Defends against ground and air attackers',
    building_mortar: 'Mortar',
    building_mortar_desc: 'Deals area damage',
    building_temple: 'Temple',
    building_temple_desc: 'Provides blessings and bonuses',
    building_clancastle: 'Clan Castle',
    building_clancastle_desc: 'Provides clan troops and support',
    loading_village: 'Loading village...'
  }
};

export const LanguageProvider = ({ children }) => {
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
  };

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