import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Home, Book, Wheat, School, Church, Crown, Hammer } from 'lucide-react';

const BuildingContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${props => props.gradient};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const BuildingIcon = styled.div`
  color: white;
  font-size: 24px;
  margin-bottom: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const BuildingLevel = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 12px;
  text-align: center;
`;

const BuildingProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s ease;
  }
`;

const ConstructionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 165, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  border-radius: 8px;
`;

const Building = ({ building }) => {
  const getBuildingIcon = (type) => {
    const icons = {
      townhall: Crown,
      house: Home,
      library: Book,
      farm: Wheat,
      school: School,
      temple: Church
    };
    return icons[type] || Home;
  };

  const getBuildingGradient = (type, level) => {
    const baseGradients = {
      townhall: 'linear-gradient(45deg, #FFD700, #FFA500)',
      house: 'linear-gradient(45deg, #8B4513, #D2691E)',
      library: 'linear-gradient(45deg, #4169E1, #6495ED)',
      farm: 'linear-gradient(45deg, #228B22, #32CD32)',
      school: 'linear-gradient(45deg, #DC143C, #FF6347)',
      temple: 'linear-gradient(45deg, #9370DB, #BA55D3)'
    };
    
    const baseGradient = baseGradients[type] || baseGradients.house;
    
    // Enhance gradient based on level
    if (level >= 5) {
      return baseGradient.replace('45deg', '45deg, rgba(255, 215, 0, 0.3) 0%,');
    }
    return baseGradient;
  };

  const getBuildingName = (type) => {
    const names = {
      townhall: 'नगर भवन',
      house: 'घर',
      library: 'पुस्तकालय',
      farm: 'खेत',
      school: 'विद्यालय',
      temple: 'मन्दिर'
    };
    return names[type] || 'भवन';
  };

  const IconComponent = getBuildingIcon(building.type);
  const gradient = getBuildingGradient(building.type, building.level);
  const isUnderConstruction = !building.isBuilt;

  return (
    <BuildingContainer
      gradient={gradient}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: Math.random() * 0.5
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 6px 25px rgba(0, 0, 0, 0.3)"
      }}
      title={`${getBuildingName(building.type)} - स्तर ${building.level}`}
    >
      <BuildingIcon>
        <IconComponent />
      </BuildingIcon>
      
      <BuildingLevel>
        {building.level}
      </BuildingLevel>
      
      {isUnderConstruction && (
        <ConstructionOverlay>
          <Hammer />
        </ConstructionOverlay>
      )}
      
      {building.upgrading && (
        <BuildingProgress progress={building.upgradeProgress || 0} />
      )}
    </BuildingContainer>
  );
};

export default Building;