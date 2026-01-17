import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import VillageGrid from '../../components/Village/VillageGrid';
import BuildingPanel from '../../components/Village/BuildingPanel';
import ResourceBar from '../../components/Village/ResourceBar';
import QuestModal from '../../components/Village/QuestModal';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { Home, Book, Coins, Zap, Award, Plus } from 'lucide-react';

const VillageContainer = styled.div`
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #F0E68C 100%);
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 60px);
`;

const VillageHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const VillageTitle = styled.h1`
  text-align: center;
  color: #2c5530;
  font-size: 2rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const VillageContent = styled.div`
  position: relative;
`;

const FloatingClouds = styled(motion.div)`
  position: absolute;
  width: 100px;
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  z-index: 1;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
  }
  
  &::before {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 10px;
  }
  
  &::after {
    width: 60px;
    height: 60px;
    top: -30px;
    right: 10px;
  }
`;

const QuestButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #ffa726);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
  z-index: 50;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const Village = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const [villageData, setVillageData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showBuildPanel, setShowBuildPanel] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [resources, setResources] = useState({
    coins: 1000,
    knowledge: 500,
    books: 100,
    energy: 50
  });

  // Initialize village data
  useEffect(() => {
    const savedVillage = localStorage.getItem('nepali-village-data');
    const savedResources = localStorage.getItem('nepali-village-resources');
    
    if (savedVillage) {
      setVillageData(JSON.parse(savedVillage));
    } else {
      // Initialize with starter buildings
      const initialVillage = {
        buildings: [
          {
            id: 'townhall-1',
            type: 'townhall',
            level: 1,
            position: { x: 5, y: 5 },
            isBuilt: true
          },
          {
            id: 'house-1',
            type: 'house',
            level: 1,
            position: { x: 3, y: 3 },
            isBuilt: true
          },
          {
            id: 'library-1',
            type: 'library',
            level: 1,
            position: { x: 7, y: 3 },
            isBuilt: true
          }
        ],
        gridSize: { width: 12, height: 12 },
        level: 1,
        experience: 0
      };
      setVillageData(initialVillage);
      localStorage.setItem('nepali-village-data', JSON.stringify(initialVillage));
    }

    if (savedResources) {
      setResources(JSON.parse(savedResources));
    } else {
      const initialResources = {
        coins: 1000,
        knowledge: 500,
        books: 100,
        energy: 50
      };
      setResources(initialResources);
      localStorage.setItem('nepali-village-resources', JSON.stringify(initialResources));
    }
  }, []);

  // Save village data when it changes
  useEffect(() => {
    if (villageData) {
      localStorage.setItem('nepali-village-data', JSON.stringify(villageData));
    }
  }, [villageData]);

  // Save resources when they change
  useEffect(() => {
    localStorage.setItem('nepali-village-resources', JSON.stringify(resources));
  }, [resources]);

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    setShowBuildPanel(true);
  };

  const handleAddBuilding = (buildingType, position) => {
    const newBuilding = {
      id: `${buildingType}-${Date.now()}`,
      type: buildingType,
      level: 1,
      position,
      isBuilt: false,
      buildTime: getBuildTime(buildingType)
    };

    setVillageData(prev => ({
      ...prev,
      buildings: [...prev.buildings, newBuilding]
    }));

    // Start building process
    setTimeout(() => {
      setVillageData(prev => ({
        ...prev,
        buildings: prev.buildings.map(b => 
          b.id === newBuilding.id ? { ...b, isBuilt: true } : b
        )
      }));
    }, newBuilding.buildTime * 1000);
  };

  const handleUpgradeBuilding = (buildingId) => {
    setVillageData(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId ? { ...b, level: b.level + 1 } : b
      )
    }));
  };

  const getBuildTime = (buildingType) => {
    const buildTimes = {
      house: 5,
      library: 10,
      farm: 8,
      school: 15,
      temple: 20
    };
    return buildTimes[buildingType] || 5;
  };

  const getBuildingCost = (buildingType, level = 1) => {
    const baseCosts = {
      house: { coins: 100, knowledge: 50 },
      library: { coins: 200, knowledge: 100, books: 10 },
      farm: { coins: 150, knowledge: 25 },
      school: { coins: 300, knowledge: 200, books: 20 },
      temple: { coins: 500, knowledge: 300, books: 50 }
    };
    
    const baseCost = baseCosts[buildingType] || { coins: 100 };
    const multiplier = Math.pow(1.5, level - 1);
    
    return Object.keys(baseCost).reduce((cost, resource) => {
      cost[resource] = Math.floor(baseCost[resource] * multiplier);
      return cost;
    }, {});
  };

  const canAfford = (cost) => {
    return Object.keys(cost).every(resource => resources[resource] >= cost[resource]);
  };

  const spendResources = (cost) => {
    setResources(prev => {
      const newResources = { ...prev };
      Object.keys(cost).forEach(resource => {
        newResources[resource] -= cost[resource];
      });
      return newResources;
    });
  };

  const addResources = (reward) => {
    setResources(prev => {
      const newResources = { ...prev };
      Object.keys(reward).forEach(resource => {
        newResources[resource] = (newResources[resource] || 0) + reward[resource];
      });
      return newResources;
    });
  };

  // Generate floating clouds
  const clouds = Array.from({ length: 5 }, (_, i) => (
    <FloatingClouds
      key={i}
      initial={{ x: -100, y: Math.random() * 200 + 50 }}
      animate={{ 
        x: window.innerWidth + 100,
        y: Math.random() * 200 + 50
      }}
      transition={{
        duration: 20 + Math.random() * 10,
        repeat: Infinity,
        delay: i * 4
      }}
    />
  ));

  if (!villageData) {
    return (
      <DashboardLayout pageTitle={t('village')}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          color: '#666'
        }}>
          Loading village...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={t('village')}>
      <VillageContainer>
        {clouds}
        
        <VillageHeader>
          <ResourceBar 
            resources={resources}
            villageLevel={villageData.level}
          />
        </VillageHeader>

        <VillageContent>
          <VillageGrid
            villageData={villageData}
            onBuildingClick={handleBuildingClick}
            onAddBuilding={handleAddBuilding}
            canAfford={canAfford}
            getBuildingCost={getBuildingCost}
          />
        />
      </VillageContent>

      <QuestButton
        onClick={() => setShowQuestModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Book />
      </QuestButton>

      <AnimatePresence>
        {showBuildPanel && (
          <BuildingPanel
            building={selectedBuilding}
            onClose={() => setShowBuildPanel(false)}
            onUpgrade={handleUpgradeBuilding}
            canAfford={canAfford}
            getBuildingCost={getBuildingCost}
            spendResources={spendResources}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestModal && (
          <QuestModal
            onClose={() => setShowQuestModal(false)}
            onComplete={addResources}
            villageLevel={villageData.level}
          />
        )}
      </AnimatePresence>
      </VillageContainer>
    </DashboardLayout>
  );
};

export default Village;