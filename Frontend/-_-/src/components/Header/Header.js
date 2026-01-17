import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import UserProfileCard from './UserProfileCard';
import { Globe, LogIn } from 'lucide-react';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  height: 60px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  
  .logo-icon {
    width: 35px;
    height: 35px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: white;
    font-size: 18px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px; /* Fixed height for consistent layout */
  
  /* Language-specific font sizing */
  font-size: ${props => props.isEnglish ? '14px' : '16px'};
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  
  &.active {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
  }
`;

const GameStats = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
  height: 28px;
  font-size: 13px;
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const LanguageToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: 28px;
  min-width: 75px;
  font-size: 12px;
  
  &:hover {
    background: #667eea;
    color: white;
  }
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const LoginButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: 40px;
  font-size: 14px;
  
  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const Header = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const { gameState } = useGame();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <div className="logo-icon">ने</div>
          <span className="nepali-text">नेपाली सिकाइ</span>
        </Logo>
        
        {isAuthenticated && (
          <Navigation>
          </Navigation>
        )}
        
        <GameStats>
          {isAuthenticated ? (
            <>
              <StatItem>
                <span>🔥</span>
                <span>{gameState.currentStreak}</span>
              </StatItem>
              <StatItem>
                <span>📚</span>
                <span>{gameState.completedLessons?.length || 0}</span>
              </StatItem>
              <StatItem>
                <span>⭐</span>
                <span>{gameState.points}</span>
              </StatItem>
              <LanguageToggle onClick={toggleLanguage}>
                <Globe />
                <span key={language}>{language === 'ne' ? 'EN' : 'नेपाली'}</span>
              </LanguageToggle>
              <UserProfileCard />
            </>
          ) : (
            <>
              <LanguageToggle onClick={toggleLanguage}>
                <Globe />
                <span key={language}>{language === 'ne' ? 'EN' : 'नेपाली'}</span>
              </LanguageToggle>
              <LoginButton to="/login">
                <LogIn />
                <span>{t('login')}</span>
              </LoginButton>
            </>
          )}
        </GameStats>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;