import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Purpose: Protect routes that require authentication
 * 
 * How it works:
 * - Wraps any component that needs authentication
 * - Checks if user is logged in
 * - If yes → show the component
 * - If no → redirect to login page
 * 
 * Usage in App.js:
 * <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
 */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still checking authentication, show loading
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

  // If not authenticated, redirect to login
  // Save current location so we can redirect back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, show the protected component
  return children;
};

export default ProtectedRoute;
