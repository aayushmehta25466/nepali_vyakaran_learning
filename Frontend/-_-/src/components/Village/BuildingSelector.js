import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Book, Wheat, School, Church, X, Coins, 
  Crown, Shield, Zap, Shovel,
  Factory, Target, Crosshair, Bomb, Castle
} from 'lucide-react';

const SelectorOverlay = styled(motion.div)`
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

const SelectorPanel = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const SelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SelectorTitle = styled.h2`
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

const BuildingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
`;

const CategoryHeader = styled.h3`
  color: #333;
  font-size: 1rem;
  margin: 15px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 2px solid #4CAF50;
  grid-column: 1 / -1;
  
  &:first-child {
    margin-top: 0;
  }
`;

const BuildingOption = styled(motion.div)`
  border: 2px solid ${props => props.canAfford ? '#4CAF50' : '#ccc'};
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: ${props => props.canAfford ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.canAfford ? 1 : 0.6};
  background: ${props => props.canAfford ? 'rgba(76, 175, 80, 0.05)' : 'rgba(200, 200, 200, 0.05)'};
  
  &:hover {
    transform: ${props => props.canAfford ? 'scale(1.02)' : 'none'};
    box-shadow: ${props => props.canAfford ? '0 4px 15px rgba(76, 175, 80, 0.2)' : 'none'};
  }
`;

const BuildingIconLarge = styled.div`
  color: ${props => props.color};
  font-size: 48px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
`;

const BuildingName = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1rem;
`;

const BuildingDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const CostContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CostItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #333;
`;

const BuildingSelector = ({ position, onSelect, onClose, canAfford, getBuildingCost }) => {
  const buildingTypes = [
    // Main Buildings
    {
      type: 'townhall',
      name: 'टाउन हल',
      description: 'मुख्य भवन - सबै कुरा अनलक गर्छ',
      icon: Crown,
      color: '#FFD700',
      category: 'main'
    },
    {
      type: 'house',
      name: 'घर',
      description: 'जनसंख्या बढाउँछ र सिक्का उत्पादन गर्छ',
      icon: Home,
      color: '#8B4513',
      category: 'resource'
    },
    {
      type: 'library',
      name: 'पुस्तकालय',
      description: 'ज्ञान उत्पादन गर्छ र नयाँ पाठहरू अनलक गर्छ',
      icon: Book,
      color: '#4169E1',
      category: 'resource'
    },
    
    // Resource Buildings
    {
      type: 'farm',
      name: 'खेत',
      description: 'खाना उत्पादन गर्छ र शक्ति पुनर्स्थापना गर्छ',
      icon: Wheat,
      color: '#228B22',
      category: 'resource'
    },
    {
      type: 'goldmine',
      name: 'सुन खानी',
      description: 'सुन उत्पादन गर्छ',
      icon: Shovel,
      color: '#FFD700',
      category: 'resource'
    },
    {
      type: 'elixircollector',
      name: 'अमृत संग्राहक',
      description: 'अमृत उत्पादन गर्छ',
      icon: Zap,
      color: '#9370DB',
      category: 'resource'
    },
    
    // Military Buildings
    {
      type: 'school',
      name: 'विद्यालय',
      description: 'उन्नत सिकाइ र विशेष चुनौतीहरू प्रदान गर्छ',
      icon: School,
      color: '#DC143C',
      category: 'military'
    },
    {
      type: 'barracks',
      name: 'सेना शिविर',
      description: 'भूमि सेना तालिम दिन्छ',
      icon: Shield,
      color: '#8B0000',
      category: 'military'
    },
    {
      type: 'spellfactory',
      name: 'जादू कारखाना',
      description: 'जादुई मन्त्र बनाउँछ',
      icon: Factory,
      color: '#4B0082',
      category: 'military'
    },
    
    // Defensive Buildings
    {
      type: 'cannon',
      name: 'तोप',
      description: 'भूमि आक्रमणकारीहरूलाई रक्षा गर्छ',
      icon: Target,
      color: '#8B4513',
      category: 'defense'
    },
    {
      type: 'archertower',
      name: 'धनुर्धारी मीनार',
      description: 'भूमि र हवाई आक्रमणकारीहरूलाई रक्षा गर्छ',
      icon: Crosshair,
      color: '#228B22',
      category: 'defense'
    },
    {
      type: 'mortar',
      name: 'मोर्टार',
      description: 'क्षेत्र क्षति गर्छ',
      icon: Bomb,
      color: '#DC143C',
      category: 'defense'
    },
    
    // Special Buildings
    {
      type: 'temple',
      name: 'मन्दिर',
      description: 'आशीर्वाद र बोनस प्रदान गर्छ',
      icon: Church,
      color: '#9370DB',
      category: 'special'
    },
    {
      type: 'clancastle',
      name: 'कुल किल्ला',
      description: 'कुल सेना र सहायता प्रदान गर्छ',
      icon: Castle,
      color: '#4682B4',
      category: 'special'
    }
  ];

  const renderCost = (cost) => {
    const resourceIcons = {
      coins: { icon: Coins, color: '#FFD700' },
      knowledge: { icon: Book, color: '#4169E1' },
      books: { icon: Book, color: '#8B4513' }
    };

    return Object.entries(cost).map(([resource, amount]) => {
      const config = resourceIcons[resource];
      if (!config) return null;
      
      const IconComponent = config.icon;
      
      return (
        <CostItem key={resource}>
          <IconComponent size={12} color={config.color} />
          <span>{amount}</span>
        </CostItem>
      );
    });
  };

  return (
    <AnimatePresence>
      <SelectorOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <SelectorPanel
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SelectorHeader>
            <SelectorTitle className="nepali-text">
              भवन छान्नुहोस्
            </SelectorTitle>
            <CloseButton onClick={onClose}>
              <X size={24} />
            </CloseButton>
          </SelectorHeader>

          <BuildingGrid>
            {/* Group buildings by category */}
            {['main', 'resource', 'military', 'defense', 'special'].map(category => {
              const categoryBuildings = buildingTypes.filter(b => b.category === category);
              if (categoryBuildings.length === 0) return null;
              
              const categoryNames = {
                main: 'मुख्य भवनहरू',
                resource: 'संसाधन भवनहरू', 
                military: 'सैन्य भवनहरू',
                defense: 'रक्षा भवनहरू',
                special: 'विशेष भवनहरू'
              };
              
              return [
                <CategoryHeader key={`header-${category}`} className="nepali-text">
                  {categoryNames[category]}
                </CategoryHeader>,
                ...categoryBuildings.map((building) => {
                  const cost = getBuildingCost(building.type);
                  const affordable = canAfford(cost);
                  const IconComponent = building.icon;

                  return (
                    <BuildingOption
                      key={building.type}
                      canAfford={affordable}
                      onClick={() => affordable && onSelect(building.type)}
                      whileHover={affordable ? { scale: 1.02 } : {}}
                      whileTap={affordable ? { scale: 0.98 } : {}}
                    >
                      <BuildingIconLarge color={building.color}>
                        <IconComponent />
                      </BuildingIconLarge>
                      
                      <BuildingName className="nepali-text">
                        {building.name}
                      </BuildingName>
                      
                      <BuildingDescription className="nepali-text">
                        {building.description}
                      </BuildingDescription>
                      
                      <CostContainer>
                        {renderCost(cost)}
                      </CostContainer>
                    </BuildingOption>
                  );
                })
              ];
            })}
          </BuildingGrid>
        </SelectorPanel>
      </SelectorOverlay>
    </AnimatePresence>
  );
};

export default BuildingSelector;