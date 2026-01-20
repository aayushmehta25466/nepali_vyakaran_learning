import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser, registerUser, getCurrentUser } from '../services/api';

/**
 * AUTH CONTEXT
 * 
 * This context manages authentication state globally across the app.
 * 
 * What it provides:
 * - user: Current logged-in user data
 * - loading: Whether auth check is in progress
 * - isAuthenticated: Boolean - is user logged in?
 * - login(): Function to log in
 * - logout(): Function to log out
 * - register(): Function to create new account
 */

// Create Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * This wraps your entire app and provides auth state to all children
 * Place this in App.js: <AuthProvider><App /></AuthProvider>
 * 
 * @param {Object} props - { children }
 */
export const AuthProvider = ({ children }) => {
  // State to hold user data
  const [user, setUser] = useState(null);
  
  // State to hold game state from backend
  const [gameState, setGameState] = useState(null);
  
  // State to track if we're checking authentication
  const [loading, setLoading] = useState(true);
  
  // Computed state: user is authenticated if user object exists
  const isAuthenticated = !!user;

  /**
   * useEffect Hook
   * 
   * Runs when component mounts (app loads)
   * Purpose: Check if user is already logged in
   * 
   * How:
   * - Check if access_token exists in localStorage
   * - If yes, fetch user profile from backend
   * - If successful, set user state
   * - If failed, clear tokens (expired)
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          console.log('🔍 Checking authentication...');
          const userData = await getCurrentUser();
          
          if (userData) {
            setUser(userData);
            console.log('✅ User authenticated:', userData.email);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []); // Empty array = run only once on mount

  /**
   * Login Function
   * 
   * Called from Login page
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - User data
   */
  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in...');
      const data = await loginUser(credentials);
      
      // Set user state (triggers re-render of all components using this context)
      setUser(data.user);
      
      // Set game state from backend
      if (data.gameState) {
        setGameState(data.gameState);
        console.log('📊 Game state loaded:', data.gameState.completedLessons);
      }
      
      console.log('✅ Login successful:', data.user.email);
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  /**
   * Register Function
   * 
   * Called from Register page
   * @param {Object} userData - { email, password, username, first_name, last_name }
   * @returns {Promise<Object>} - User data
   */
  const register = async (userData) => {
    try {
      console.log('📝 Registering user...');
      const data = await registerUser(userData);
      
      // After registration, user is automatically logged in
      setUser(data.user);
      
      // Set game state from backend
      if (data.gameState) {
        setGameState(data.gameState);
        console.log('📊 Game state loaded:', data.gameState.completedLessons);
      }
      
      console.log('✅ Registration successful:', data.user.email);
      
      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout Function
   * 
   * Called from Header, Settings, etc.
   * Clears user state and tokens
   */
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await logoutUser();
      
      // Clear user state
      setUser(null);
      setGameState(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear user state anyway
      setUser(null);
      setGameState(null);
    }
  };

  /**
   * Context Value
   * 
   * This object is what components get when they use useAuth()
   */
  const value = {
    user,           // Current user object
    gameState,      // Current game state from backend
    loading,        // Is auth check in progress?
    isAuthenticated, // Boolean: is logged in?
    login,          // Login function
    logout,         // Logout function
    register,       // Register function
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        <div>
          <div style={{ marginBottom: '20px', fontSize: '48px' }}>🔄</div>
          Loading...
        </div>
      </div>
    );
  }

  // Provide context to all children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to easily access auth context in any component
 * 
 * Usage in components:
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;
