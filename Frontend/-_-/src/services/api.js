import apiClient from './apiClient';

// Normalize varying backend response shapes (plain data vs. success_response wrapper)
// Also handles paginated responses where data.results contains the actual array
const unwrapResponse = (response) => {
  // Try to extract data from common response patterns
  const data = response?.data?.data ?? response?.data ?? response;
  
  // If data is an object with 'results' (paginated), return results array
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }
  
  return data;
};

/**
 * API Helper Functions
 * 
 * This file contains reusable API call functions for different modules
 * Each function wraps an axios call with error handling
 * 
 * Pattern:
 * - Try to make the API call
 * - Catch and log errors
 * - Return data or null
 */

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register a new user
 * @param {Object} userData - { email, password, username, first_name, last_name }
 * @returns {Promise} - User data and tokens
 */
export const registerUser = async (userData) => {
  try {
    // Transform the data to match dj-rest-auth registration format
    const registrationData = {
      username: userData.username,
      email: userData.email,
      password1: userData.password,
      password2: userData.password,
      first_name: userData.first_name || '',
      last_name: userData.last_name || ''
    };
    
    const response = await apiClient.post('/auth/register/', registrationData);
    
    // Backend returns 'access' and 'refresh' (not 'access_token'/'refresh_token')
    const { access, refresh, user } = response.data;
    
    // Store tokens in localStorage
    if (access) {
      localStorage.setItem('access_token', access);
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
    
    // Return normalized data structure
    return {
      access_token: access,
      refresh_token: refresh,
      user: user
    };
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise} - { access_token, refresh_token, user }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    
    // Backend may return 'access'/'refresh' or 'access_token'/'refresh_token'
    const accessToken = response.data.access || response.data.access_token;
    const refreshToken = response.data.refresh || response.data.refresh_token;
    
    // Store tokens in localStorage
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
    // Return normalized data structure
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: response.data.user,
      gameState: response.data.gameState
    };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise}
 */
export const logoutUser = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
    
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    return true;
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    // Still clear tokens even if logout fails
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return true;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me/');
    // Backend returns { success: true, data: {...} }
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Request password reset (sends OTP to email)
 * @param {string} email - User's email address
 * @returns {Promise} - Success message
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password/', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password request failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Reset password using OTP
 * @param {Object} data - { email, otp_code, new_password }
 * @returns {Promise} - Success message
 */
export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post('/auth/reset-password/', data);
    return response.data;
  } catch (error) {
    console.error('Password reset failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send OTP to email
 * @param {string|Object} emailOrData - Email string or { email, purpose }
 * @param {string} purpose - 'verification' | 'password_reset' (if first param is email)
 * @returns {Promise} - Success message with expiry info
 */
export const sendOTP = async (emailOrData, purpose = 'verification') => {
  try {
    // Support both: sendOTP(email, purpose) and sendOTP({ email, purpose })
    const data = typeof emailOrData === 'string' 
      ? { email: emailOrData, purpose }
      : emailOrData;
    
    const response = await apiClient.post('/auth/send-otp/', data);
    return response.data;
  } catch (error) {
    console.error('Send OTP failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify OTP code
 * @param {string|Object} emailOrData - Email string or { email, otp_code, purpose }
 * @param {string} otp_code - 6-digit OTP code (if first param is email)
 * @param {string} purpose - 'verification' | 'password_reset' (if first param is email)
 * @returns {Promise} - Success message
 */
export const verifyOTP = async (emailOrData, otp_code, purpose = 'verification') => {
  try {
    // Support both: verifyOTP(email, otp, purpose) and verifyOTP({ email, otp_code, purpose })
    const data = typeof emailOrData === 'string'
      ? { email: emailOrData, otp_code, purpose }
      : emailOrData;
    
    const response = await apiClient.post('/auth/verify-otp/', data);
    return response.data;
  } catch (error) {
    console.error('OTP verification failed:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// LESSONS ENDPOINTS
// ============================================

/**
 * Get all lessons
 * @param {Object} params - { page, limit, difficulty, etc }
 * @returns {Promise} - Array of lessons
 */
export const getLessons = async (params = {}) => {
  try {
    const response = await apiClient.get('/lessons/', { params });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Failed to fetch lessons:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get single lesson details
 * @param {Number|String} lessonId - Lesson ID (UUID)
 * @returns {Promise} - Lesson details with questions
 */
export const getLessonById = async (lessonId) => {
  try {
    const response = await apiClient.get(`/lessons/${lessonId}/`);
    return unwrapResponse(response);
  } catch (error) {
    console.error(`Failed to fetch lesson ${lessonId}:`, error.response?.data || error.message);
    return null;
  }
};

// ============================================
// QUESTIONS ENDPOINTS
// ============================================

/**
 * Get questions (for games or lessons)
 * @param {Object} params - { lesson, difficulty, limit, etc }
 * @returns {Promise} - Array of questions
 */
export const getQuestions = async (params = {}) => {
  try {
    // If querying by lesson, use lesson-specific endpoint
    if (params.lesson) {
      const response = await apiClient.get(
        `/lessons/${params.lesson}/questions/`
      );
      return unwrapResponse(response);
    }
    
    // Otherwise use general questions endpoint (for quizzes)
    const response = await apiClient.get('/questions/', { params });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Failed to fetch questions:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Submit answer to a question
 * @param {Number} questionId - Question ID
 * @param {Number} answerId - Selected answer ID
 * @returns {Promise} - { is_correct, correct_answer, explanation }
 */
export const submitAnswer = async (questionId, answerId) => {
  try {
    const response = await apiClient.post(
      `/questions/${questionId}/submit/`,
      { answer_id: answerId }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to submit answer:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// GAMES ENDPOINTS
// ============================================

/**
 * Get all games
 * @returns {Promise} - List of available games
 */
export const getGames = async () => {
  try {
    console.log('🎮 Fetching games from API...');
    const response = await apiClient.get('/games/');
    console.log('📦 Raw API response:', response);
    console.log('📦 response.data:', response.data);
    const result = response.data?.data || response.data;
    console.log('📦 Unwrapped result:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch games:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get grammar shooter questions
 * @param {Object} params - { difficulty, count, etc }
 * @returns {Promise} - Array of questions for grammar shooter game
 */
export const getGrammarShooterQuestions = async (params = {}) => {
  try {
    console.log('🚀 Fetching grammar shooter questions with params:', params);
    const response = await apiClient.get('/games/grammar-shooter/questions/', { params });
    console.log('✅ API Response received:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    const result = response.data?.data || response.data;
    console.log('🎯 Unwrapped result:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch grammar shooter questions');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
};

/**
 * Validate grammar shooter answer
 * @param {Object} data - { question_id, answer }
 * @returns {Promise} - { is_correct, correct_answer, explanation }
 */
export const validateGrammarShooterAnswer = async (data) => {
  try {
    const response = await apiClient.post('/games/grammar-shooter/validate/', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to validate answer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Start a game session
 * @param {String} gameId - Game UUID
 * @returns {Promise} - Game session data
 */
export const startGame = async (gameId) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/start/`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to start game:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * End game and save score
 * @param {String} gameId - Game UUID
 * @param {Object} gameData - { score, duration, questions_attempted, correct_answers }
 * @returns {Promise} - Game result with rewards
 */
export const endGame = async (gameId, gameData) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/end/`, gameData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to save game score:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get game leaderboard
 * @param {String} gameId - Game UUID
 * @param {Number} limit - Number of top players to fetch
 * @returns {Promise} - Leaderboard data
 */
export const getGameLeaderboard = async (gameId, limit = 10) => {
  try {
    const response = await apiClient.get(`/games/${gameId}/leaderboard/`, {
      params: { limit }
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error.response?.data || error.message);
    return null;
  }
};

// ============================================
// PROGRESS ENDPOINTS
// ============================================

/**
 * Get user progress/statistics
 * @returns {Promise} - User progress data
 */
export const getUserProgress = async () => {
  try {
    const response = await apiClient.get('/stats/progress/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch progress:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get all lessons progress
 * @returns {Promise} - Lessons completion status
 */
export const getLessonsProgress = async () => {
  try {
    const response = await apiClient.get('/lessons/progress/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch lessons progress:', error);
    return null;
  }
};

/**
 * Start a lesson
 * @param {String} lessonId - Lesson UUID
 * @returns {Promise}
 */
export const startLesson = async (lessonId) => {
  try {
    const response = await apiClient.post(`/lessons/${lessonId}/start/`);
    return unwrapResponse(response);
  } catch (error) {
    console.error(`Failed to start lesson ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Mark lesson as complete
 * @param {String} lessonId - Lesson UUID
 * @param {Object} data - { session_id, score, time_spent, answers }
 * @returns {Promise}
 */
export const completeLesson = async (lessonId, data = {}) => {
  try {
    const response = await apiClient.post(`/lessons/${lessonId}/complete/`, data);
    return unwrapResponse(response);
  } catch (error) {
    console.error(`Failed to mark lesson ${lessonId} complete:`, error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// ACHIEVEMENTS/BADGES ENDPOINTS
// ============================================

/**
 * Get user achievements
 * @returns {Promise} - Array of achievements
 */
export const getAchievements = async () => {
  try {
    const response = await apiClient.get('/achievements/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch achievements:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get user badges
 * @returns {Promise} - Array of badges
 */
export const getBadges = async () => {
  try {
    const response = await apiClient.get('/badges/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch badges:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Claim an achievement reward
 * @param {String} achievementId - Achievement UUID
 * @returns {Promise}
 */
export const claimAchievement = async (achievementId) => {
  try {
    const response = await apiClient.post(`/achievements/${achievementId}/claim/`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to claim achievement:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user statistics (points, level, etc.)
 * @returns {Promise} - User stats
 */
export const getUserStats = async () => {
  try {
    const response = await apiClient.get('/users/me/game-state/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error.response?.data || error.message);
    return null;
  }
};
// ============================================
// QUEST ENDPOINTS
// ============================================

/**
 * Get all quests
 * @param {Object} params - Optional filters
 * @returns {Promise} - Array of quests
 */
export const getQuests = async (params = {}) => {
  try {
    const response = await apiClient.get('/quests/', { params });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch quests:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get daily quests
 * @returns {Promise} - Array of daily quests
 */
export const getDailyQuests = async () => {
  try {
    const response = await apiClient.get('/quests/daily/');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch daily quests:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Start a quest
 * @param {String} questId - Quest UUID
 * @returns {Promise} - Quest started confirmation
 */
export const startQuest = async (questId) => {
  try {
    const response = await apiClient.post(`/quests/${questId}/start/`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to start quest:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Complete a quest
 * @param {String} questId - Quest UUID
 * @param {Object} data - { progress: 100 }
 * @returns {Promise} - Quest completion with rewards
 */
export const completeQuest = async (questId, data = {}) => {
  try {
    const response = await apiClient.post(`/quests/${questId}/complete/`, data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to complete quest:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// WRITING ENDPOINTS
// ============================================

/**
 * Get writing prompts
 * @param {Object} params - { type, difficulty }
 * @returns {Promise} - Array of writing prompts
 */
export const getWritingPrompts = async (params = {}) => {
  try {
    const response = await apiClient.get('/writing/prompts/', { params });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to fetch writing prompts:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Submit writing
 * @param {Object} data - { prompt_id, content, word_count }
 * @returns {Promise} - Submission result with score
 */
export const submitWriting = async (data) => {
  try {
    const response = await apiClient.post('/writing/submit/', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to submit writing:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save writing draft
 * @param {Object} data - { prompt_id, content }
 * @returns {Promise} - Draft saved confirmation
 */
export const saveWritingDraft = async (data) => {
  try {
    const response = await apiClient.post('/writing/save-draft/', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to save draft:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check grammar in writing
 * @param {Object} data - { content }
 * @returns {Promise} - Grammar check results
 */
export const checkGrammar = async (data) => {
  try {
    const response = await apiClient.post('/writing/grammar-check/', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to check grammar:', error.response?.data || error.message);
    throw error;
  }
};