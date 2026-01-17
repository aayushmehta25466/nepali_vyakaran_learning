import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, Clock, Star, Coins, Book } from 'lucide-react';

const PanelOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const Panel = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PanelTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const BuildingInfo = styled.div`
  text-align: center;
  margin-bottom: 25px;
`;

const BuildingLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const BuildingStats = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  color: #333;
  font-weight: 600;
`;

const UpgradeSection = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const UpgradeTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UpgradeCost = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const CostItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 15px;
  font-weight: 600;
  color: ${props => props.canAfford ? '#333' : '#ff6b6b'};
`;

const UpgradeButton = styled(motion.button)`
  width: 100%;
  background: ${props => props.canAfford ? 
    'linear-gradient(45deg, #4CAF50, #8BC34A)' : 
    'linear-gradient(45deg, #ccc, #999)'};
  color: white;
  border: none;
  padding: 15px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.canAfford ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: ${props => props.canAfford ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.canAfford ? '0 6px 20px rgba(76, 175, 80, 0.4)' : 'none'};
  }
`;

const MaxLevelMessage = styled.div`
  text-align: center;
  color: #FFD700;
  font-weight: 600;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 215, 0, 0.3);
`;

const BuildingPanel = ({ 
  building, 
  onClose, 
  onUpgrade, 
  canAfford, 
  getBuildingCost, 
  spendResources 
}) => {
  if (!building) return null;

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

  const getBuildingProduction = (type, level) => {
    const baseProduction = {
      house: { coins: 10 },
      library: { knowledge: 5, books: 1 },
      farm: { energy: 3 },
      school: { knowledge: 8 },
      temple: { coins: 5, knowledge: 3 }
    };
    
    const base = baseProduction[type] || {};
    return Object.keys(base).reduce((prod, resource) => {
      prod[resource] = base[resource] * level;
      return prod;
    }, {});
  };

  const maxLevel = building.type === 'townhall' ? 10 : 5;
  const isMaxLevel = building.level >= maxLevel;
  const upgradeCost = isMaxLevel ? {} : getBuildingCost(building.type, building.level + 1);
  const canAffordUpgrade = isMaxLevel ? false : canAfford(upgradeCost);
  const production = getBuildingProduction(building.type, building.level);

  const handleUpgrade = () => {
    if (canAffordUpgrade && !isMaxLevel) {
      spendResources(upgradeCost);
      onUpgrade(building.id);
    }
  };

  const renderProduction = () => {
    const resourceIcons = {
      coins: { icon: Coins, color: '#FFD700', label: 'सिक्का' },
      knowledge: { icon: Book, color: '#4169E1', label: 'ज्ञान' },
      books: { icon: Book, color: '#8B4513', label: 'पुस्तक' },
      energy: { icon: Star, color: '#FF6B6B', label: 'शक्ति' }
    };

    return Object.entries(production).map(([resource, amount]) => {
      const config = resourceIcons[resource];
      if (!config) return null;
      
      const IconComponent = config.icon;
      
      return (
        <StatRow key={resource}>
          <StatLabel className="nepali-text">
            <IconComponent size={16} color={config.color} style={{ marginRight: '4px' }} />
            {config.label}/घण्टा
          </StatLabel>
          <StatValue>{amount}</StatValue>
        </StatRow>
      );
    });
  };

  const renderUpgradeCost = () => {
    const resourceIcons = {
      coins: { icon: Coins, color: '#FFD700' },
      knowledge: { icon: Book, color: '#4169E1' },
      books: { icon: Book, color: '#8B4513' }
    };

    return Object.entries(upgradeCost).map(([resource, amount]) => {
      const config = resourceIcons[resource];
      if (!config) return null;
      
      const IconComponent = config.icon;
      const affordable = canAfford({ [resource]: amount });
      
      return (
        <CostItem key={resource} canAfford={affordable}>
          <IconComponent size={16} color={config.color} />
          <span>{amount}</span>
        </CostItem>
      );
    });
  };

  return (
    <AnimatePresence>
      <PanelOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Panel
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <PanelHeader>
            <PanelTitle className="nepali-text">
              {getBuildingName(building.type)}
            </PanelTitle>
            <CloseButton onClick={onClose}>
              <X size={24} />
            </CloseButton>
          </PanelHeader>

          <BuildingInfo>
            <BuildingLevel>
              <Star color="#FFD700" />
              <span className="nepali-text">स्तर {building.level}</span>
            </BuildingLevel>
          </BuildingInfo>

          <BuildingStats>
            <h4 style={{ marginBottom: '10px', color: '#333' }} className="nepali-text">
              उत्पादन
            </h4>
            {renderProduction()}
          </BuildingStats>

          <UpgradeSection>
            {isMaxLevel ? (
              <MaxLevelMessage className="nepali-text">
                <Star color="#FFD700" style={{ marginRight: '8px' }} />
                अधिकतम स्तर पुगेको!
              </MaxLevelMessage>
            ) : (
              <>
                <UpgradeTitle className="nepali-text">
                  <ArrowUp />
                  स्तर {building.level + 1} मा स्तरवृद्धि
                </UpgradeTitle>
                
                <UpgradeCost>
                  {renderUpgradeCost()}
                </UpgradeCost>
                
                <UpgradeButton
                  canAfford={canAffordUpgrade}
                  onClick={handleUpgrade}
                  whileHover={canAffordUpgrade ? { scale: 1.02 } : {}}
                  whileTap={canAffordUpgrade ? { scale: 0.98 } : {}}
                >
                  <ArrowUp />
                  <span className="nepali-text">
                    {canAffordUpgrade ? 'स्तरवृद्धि गर्नुहोस्' : 'पर्याप्त स्रोत छैन'}
                  </span>
                </UpgradeButton>
              </>
            )}
          </UpgradeSection>
        </Panel>
      </PanelOverlay>
    </AnimatePresence>
  );
};

export default BuildingPanel;