import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from './contexts/LanguageContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Header from './components/Header/Header';
import HomeRouter from './pages/Home/HomeRouter';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Lessons from './pages/Lessons/Lessons';
import Games from './pages/Games/Games';
import Writing from './pages/Writing/Writing';
import Progress from './pages/Progress/Progress';
import Settings from './pages/Settings/Settings';
import Village from './pages/Village/Village';
import Profile from './pages/Profile/Profile';
import GrammarShooter from './components/Games/GrammarShooter';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

function App() {
  const { language } = useLanguage();
  
  return (
    <Router>
      <AppContainer key={language}>
        <Header />
        <MainContent>
          <Routes>
            {/* Home Route - Shows PublicHome or Dashboard based on auth */}
            <Route path="/" element={<HomeRouter />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Routes - Dashboard and Learning */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard key={language} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lessons" 
              element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/games" 
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/games/grammar-shooter" 
              element={
                <ProtectedRoute>
                  <GrammarShooter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/writing" 
              element={
                <ProtectedRoute>
                  <Writing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/village" 
              element={
                <ProtectedRoute>
                  <Village />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;