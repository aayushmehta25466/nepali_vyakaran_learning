import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Settings, LogOut, Trophy, Star, Zap } from 'lucide-react';

const UserIconWrapper = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const ProfileCardOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
`;

const ProfileCard = styled.div`
  position: absolute;
  top: 70px;
  right: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 320px;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 20px 20px 0 0;
  text-align: center;
`;

const ProfileAvatar = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 35px;
`;

const ProfileName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1.2rem;
`;

const ProfileEmail = styled.p`
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  padding: 20px 25px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatValue = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 1rem;
`;

const MenuSection = styled.div`
  padding: 10px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 10px;
  
  &:hover {
    background: #f0f0f0;
    color: #667eea;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LogoutButton = styled(MenuItem)`
  color: #e74c3c;
  border-top: 1px solid #e9ecef;
  
  &:hover {
    background: rgba(231, 76, 60, 0.1);
  }
`;

const UserProfileCard = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const { user, logout } = useAuth();
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowCard(false);
      }
    };

    if (showCard) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCard]);

  const handleLogout = async () => {
    await logout();
    setShowCard(false);
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowCard(false);
  };

  const handleProfile = () => {
    // Navigate to profile page or open edit modal
    navigate('/profile');
    setShowCard(false);
  };

  return (
    <div ref={cardRef} style={{ position: 'relative' }}>
      <UserIconWrapper
        onClick={() => setShowCard(!showCard)}
        title={user?.username}
      >
        <User size={24} />
      </UserIconWrapper>

      {showCard && (
        <>
          <ProfileCardOverlay onClick={() => setShowCard(false)} />
          <ProfileCard>
            <ProfileHeader>
              <ProfileAvatar>👤</ProfileAvatar>
              <ProfileName>{user?.username || 'User'}</ProfileName>
              <ProfileEmail>{user?.email}</ProfileEmail>
            </ProfileHeader>

            <StatsContainer>
              <StatRow>
                <StatLabel>
                  <Trophy size={16} />
                  {t('level')}
                </StatLabel>
                <StatValue>{gameState.level}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>
                  <Star size={16} />
                  {t('points')}
                </StatLabel>
                <StatValue>{gameState.points}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>
                  <Zap size={16} />
                  {t('current_streak')}
                </StatLabel>
                <StatValue>{gameState.currentStreak}</StatValue>
              </StatRow>
            </StatsContainer>

            <MenuSection>
              <MenuItem onClick={handleProfile}>
                <User size={18} />
                {t('profile')}
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <Settings size={18} />
                {t('settings')}
              </MenuItem>
              <LogoutButton onClick={handleLogout}>
                <LogOut size={18} />
                {t('logout')}
              </LogoutButton>
            </MenuSection>
          </ProfileCard>
        </>
      )}
    </div>
  );
};

export default UserProfileCard;
