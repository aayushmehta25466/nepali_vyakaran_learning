import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Building from './Building';
import BuildingSelector from './BuildingSelector';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 45px);
  grid-template-rows: repeat(12, 45px);
  gap: 2px;
  justify-content: center;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  max-width: fit-content;
`;

const GridCell = styled(motion.div)`
  width: 45px;
  height: 45px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.6);
  }
  
  &.occupied {
    border: none;
    cursor: default;
    
    &:hover {
      background: transparent;
    }
  }
  
  &.buildable {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4CAF50;
    
    &:hover {
      background: rgba(76, 175, 80, 0.4);
    }
  }
`;

const AddButton = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
`;

const VillageGrid = ({ 
  villageData, 
  onBuildingClick, 
  onAddBuilding, 
  canAfford, 
  getBuildingCost 
}) => {
  const [showBuildingSelector, setShowBuildingSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const isOccupied = (x, y) => {
    return villageData.buildings.some(building => 
      building.position.x === x && building.position.y === y
    );
  };

  const getBuildingAt = (x, y) => {
    return villageData.buildings.find(building => 
      building.position.x === x && building.position.y === y
    );
  };

  const handleCellClick = (x, y) => {
    const building = getBuildingAt(x, y);
    if (building) {
      onBuildingClick(building);
    } else {
      setSelectedPosition({ x, y });
      setShowBuildingSelector(true);
    }
  };

  const handleBuildingSelect = (buildingType) => {
    if (selectedPosition) {
      const cost = getBuildingCost(buildingType);
      if (canAfford(cost)) {
        onAddBuilding(buildingType, selectedPosition);
      }
    }
    setShowBuildingSelector(false);
    setSelectedPosition(null);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < villageData.gridSize.height; y++) {
      for (let x = 0; x < villageData.gridSize.width; x++) {
        const building = getBuildingAt(x, y);
        const occupied = isOccupied(x, y);
        
        cells.push(
          <GridCell
            key={`${x}-${y}`}
            className={occupied ? 'occupied' : 'buildable'}
            onClick={() => handleCellClick(x, y)}
            whileHover={{ scale: occupied ? 1 : 1.05 }}
            whileTap={{ scale: occupied ? 1 : 0.95 }}
          >
            {building ? (
              <Building building={building} />
            ) : (
              <AddButton>+</AddButton>
            )}
          </GridCell>
        );
      }
    }
    return cells;
  };

  return (
    <>
      <GridContainer>
        {renderGrid()}
      </GridContainer>
      
      {showBuildingSelector && (
        <BuildingSelector
          position={selectedPosition}
          onSelect={handleBuildingSelect}
          onClose={() => {
            setShowBuildingSelector(false);
            setSelectedPosition(null);
          }}
          canAfford={canAfford}
          getBuildingCost={getBuildingCost}
        />
      )}
    </>
  );
};

export default VillageGrid;