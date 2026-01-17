import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Coins, Book, Zap, Award, Star } from 'lucide-react';

const ResourceContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const ResourceItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  justify-content: center;
`;

const ResourceIcon = styled.div`
  color: ${props => props.color};
  display: flex;
  align-items: center;
`;

const ResourceValue = styled.div`
  font-weight: 700;
  color: #333;
  font-size: 1rem;
`;

const ResourceLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-left: 4px;
`;

const VillageLevel = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
  font-weight: 700;
`;

const ResourceBar = ({ resources, villageLevel }) => {
  const resourceConfig = [
    {
      key: 'coins',
      icon: Coins,
      color: '#FFD700',
      label: 'सिक्का'
    },
    {
      key: 'knowledge',
      icon: Book,
      color: '#4169E1',
      label: 'ज्ञान'
    },
    {
      key: 'books',
      icon: Book,
      color: '#8B4513',
      label: 'पुस्तक'
    },
    {
      key: 'energy',
      icon: Zap,
      color: '#FF6B6B',
      label: 'शक्ति'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <ResourceContainer>
      <VillageLevel
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Star />
        <span>स्तर {villageLevel}</span>
      </VillageLevel>
      
      {resourceConfig.map((config, index) => {
        const IconComponent = config.icon;
        const value = resources[config.key] || 0;
        
        return (
          <ResourceItem
            key={config.key}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <ResourceIcon color={config.color}>
              <IconComponent size={18} />
            </ResourceIcon>
            <ResourceValue>
              {formatNumber(value)}
            </ResourceValue>
            <ResourceLabel className="nepali-text">
              {config.label}
            </ResourceLabel>
          </ResourceItem>
        );
      })}
    </ResourceContainer>
  );
};

export default ResourceBar;