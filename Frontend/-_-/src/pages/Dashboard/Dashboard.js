import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Gamepad2, PenTool, TrendingUp, Trophy, Zap, Award, Settings, Menu, X, Home, User } from 'lucide-react';

const DashboardWrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
  margin-top: 60px;
`;

const Sidebar = styled(motion.aside)`
  width: 220px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  position: fixed;
  height: calc(100vh - 60px);
  left: 0;
  top: 60px;
  z-index: 100;
  
  @media (max-width: 768px) {
    width: 0;
    transform: translateX(-100%);
    transition: all 0.3s ease;
    
    ${props => props.isOpen && `
      width: 220px;
      transform: translateX(0);
    `}
  }
`;

const SidebarHeader = styled.div`
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 10px;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-size: 0.95rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-left-color: white;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-left-color: white;
    font-weight: 600;
  }
`;

const SidebarDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 20px 0;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 220px;
  padding: 40px 30px;
  background: white;
  min-height: calc(100vh - 60px);
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

const MenuToggle = styled.button`
  display: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ContentSection = styled.section`
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 25px;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, white 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
    transform: translateY(-8px) scale(1.03);
    border-color: #667eea;
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

const StatIcon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  ${StatCard}:hover & {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  
  ${StatCard}:hover & {
    color: #667eea;
    transform: scale(1.1);
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-weight: 500;
  font-size: 0.95rem;
`;

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
`;

const ActivityCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 16px 40px rgba(102, 126, 234, 0.3);
    border-color: #667eea;
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  &:active {
    transform: translateY(-8px) scale(1);
  }
`;

const ActivityIcon = styled.div`
  font-size: 55px;
  margin-bottom: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${ActivityCard}:hover & {
    transform: scale(1.2) rotate(-5deg);
  }
`;

const ActivityTitle = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 12px;
  font-weight: 700;
  transition: color 0.3s ease;
  
  ${ActivityCard}:hover & {
    color: #667eea;
  }
`;

const ActivityDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ActivityButton = styled.span`
  color: #667eea;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 1.05rem;
  
  ${ActivityCard}:hover & {
    gap: 15px;
    color: #764ba2;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  
  @media (max-width: 768px) {
    ${props => props.isOpen && `
      display: block;
    `}
  }
`;

const Dashboard = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      icon: <TrendingUp size={20} />,
      label: t('dashboard'),
      path: '/dashboard'
    },
    {
      icon: <Home size={20} />,
      label: t('village'),
      path: '/village'
    },
    {
      icon: <BookOpen size={20} />,
      label: t('lessons'),
      path: '/lessons'
    },
    {
      icon: <Gamepad2 size={20} />,
      label: t('games'),
      path: '/games'
    },
    {
      icon: <PenTool size={20} />,
      label: t('writing'),
      path: '/writing'
    },
    {
      icon: <Award size={20} />,
      label: t('progress'),
      path: '/progress'
    }
  ];

  const activities = [
    {
      icon: '📚',
      title: t('lessons'),
      description: t('lessons_desc'),
      link: '/lessons'
    },
    {
      icon: '🎮',
      title: t('games'),
      description: t('games_desc'),
      link: '/games'
    },
    {
      icon: '✍️',
      title: t('writing'),
      description: t('writing_desc'),
      link: '/writing'
    },
    {
      icon: '📊',
      title: t('progress'),
      description: t('progress_desc'),
      link: '/progress'
    }
  ];

  return (
    <DashboardWrapper>
      <Overlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      
      <Sidebar
        isOpen={sidebarOpen}
      >
        <SidebarHeader />

        <SidebarNav>
          {navItems.map((item, index) => (
            <SidebarLink
              key={index}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarLink>
          ))}
        </SidebarNav>

        <SidebarDivider />

        <SidebarNav>
          <SidebarLink to="/profile">
            <User size={20} />
            <span>{t('profile')}</span>
          </SidebarLink>
          <SidebarLink to="/settings">
            <Settings size={20} />
            <span>{t('settings')}</span>
          </SidebarLink>
        </SidebarNav>
      </Sidebar>

      <MainContent>
        <TopBar>
          <div>
            <PageTitle>{t('dashboard_title')}</PageTitle>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>{t('welcome_subtitle')}</p>
          </div>
          <MenuToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </MenuToggle>
        </TopBar>

        <ContentSection>
          <SectionTitle>{t('my_progress')}</SectionTitle>
          <StatsGrid>
            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <StatIcon>
                <Trophy />
              </StatIcon>
              <StatValue>{gameState.level}</StatValue>
              <StatLabel>{t('level')}</StatLabel>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatIcon>
                <TrendingUp />
              </StatIcon>
              <StatValue>{gameState.points}</StatValue>
              <StatLabel>{t('points')}</StatLabel>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatIcon>
                <Award />
              </StatIcon>
              <StatValue>{gameState.coins}</StatValue>
              <StatLabel>{t('coins')}</StatLabel>
            </StatCard>

            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatIcon>
                <Zap />
              </StatIcon>
              <StatValue>{gameState.currentStreak}</StatValue>
              <StatLabel>{t('current_streak')}</StatLabel>
            </StatCard>
          </StatsGrid>
        </ContentSection>

        <ContentSection>
          <SectionTitle>{t('continue_learning')}</SectionTitle>
          <ActivitiesGrid>
            {activities.map((activity, index) => (
              <Link key={index} to={activity.link} style={{ textDecoration: 'none' }}>
                <ActivityCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ActivityIcon>{activity.icon}</ActivityIcon>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                  <ActivityButton>
                    {t('continue')} →
                  </ActivityButton>
                </ActivityCard>
              </Link>
            ))}
          </ActivitiesGrid>
        </ContentSection>
      </MainContent>
    </DashboardWrapper>
  );
};

export default Dashboard;
