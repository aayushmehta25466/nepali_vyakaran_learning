import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHome from '../PublicHome/PublicHome';
import Dashboard from '../Dashboard/Dashboard';
import { useLanguage } from '../../contexts/LanguageContext';

const HomeRouter = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  // If user is authenticated, show Dashboard
  // Otherwise, show PublicHome (landing page)
  if (isAuthenticated) {
    return <Dashboard key={language} />;
  }

  return <PublicHome key={language} />;
};

export default HomeRouter;
