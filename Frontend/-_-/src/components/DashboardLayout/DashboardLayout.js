import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, Gamepad2, TrendingUp, Settings, Menu, X, Home, User } from 'lucide-react';

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
  display: none;
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

const DashboardLayout = ({ children, pageTitle }) => {
  const { t } = useLanguage();
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
      icon: <BookOpen size={20} />,
      label: t('lessons'),
      path: '/lessons'
    },
    {
      icon: <Home size={20} />,
      label: t('village'),
      path: '/village'
    },
    {
      icon: <Gamepad2 size={20} />,
      label: t('games'),
      path: '/games'
    },
    {
      icon: <TrendingUp size={20} />,
      label: t('progress'),
      path: '/progress'
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
            {pageTitle && <PageTitle>{pageTitle}</PageTitle>}
          </div>
          <MenuToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </MenuToggle>
        </TopBar>

        {children}
      </MainContent>
    </DashboardWrapper>
  );
};

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

export default DashboardLayout;
