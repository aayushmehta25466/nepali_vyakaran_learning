import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Home, Book, Wheat, School, Church, X, Coins, 
  Crown, Shield, Zap, Shovel,
  Factory, Target, Crosshair, Bomb, Castle
} from 'lucide-react';

const BuildingSelector = ({ position, onSelect, onClose, canAfford, getBuildingCost }) => {
  const { t } = useLanguage();

  const buildingTypes = [
    // Main Buildings
    {
      type: 'townhall',
      nameKey: 'building_townhall',
      descKey: 'building_townhall_desc',
      icon: Crown,
      color: '#FFD700',
      category: 'main'
    },
    {
      type: 'house',
      nameKey: 'building_house',
      descKey: 'building_house_desc',
      icon: Home,
      color: '#8B4513',
      category: 'resource'
    },
    {
      type: 'library',
      nameKey: 'building_library',
      descKey: 'building_library_desc',
      icon: Book,
      color: '#4169E1',
      category: 'resource'
    },
    
    // Resource Buildings
    {
      type: 'farm',
      nameKey: 'building_farm',
      descKey: 'building_farm_desc',
      icon: Wheat,
      color: '#228B22',
      category: 'resource'
    },
    {
      type: 'goldmine',
      nameKey: 'building_goldmine',
      descKey: 'building_goldmine_desc',
      icon: Shovel,
      color: '#FFD700',
      category: 'resource'
    },
    {
      type: 'elixircollector',
      nameKey: 'building_elixircollector',
      descKey: 'building_elixircollector_desc',
      icon: Zap,
      color: '#9370DB',
      category: 'resource'
    },
    
    // Military Buildings
    {
      type: 'school',
      nameKey: 'building_school',
      descKey: 'building_school_desc',
      icon: School,
      color: '#DC143C',
      category: 'military'
    },
    {
      type: 'barracks',
      nameKey: 'building_barracks',
      descKey: 'building_barracks_desc',
      icon: Shield,
      color: '#8B0000',
      category: 'military'
    },
    {
      type: 'spellfactory',
      nameKey: 'building_spellfactory',
      descKey: 'building_spellfactory_desc',
      icon: Factory,
      color: '#4B0082',
      category: 'military'
    },
    
    // Defensive Buildings
    {
      type: 'cannon',
      nameKey: 'building_cannon',
      descKey: 'building_cannon_desc',
      icon: Target,
      color: '#8B4513',
      category: 'defense'
    },
    {
      type: 'archertower',
      nameKey: 'building_archertower',
      descKey: 'building_archertower_desc',
      icon: Crosshair,
      color: '#228B22',
      category: 'defense'
    },
    {
      type: 'mortar',
      nameKey: 'building_mortar',
      descKey: 'building_mortar_desc',
      icon: Bomb,
      color: '#DC143C',
      category: 'defense'
    },
    
    // Special Buildings
    {
      type: 'temple',
      nameKey: 'building_temple',
      descKey: 'building_temple_desc',
      icon: Church,
      color: '#9370DB',
      category: 'special'
    },
    {
      type: 'clancastle',
      nameKey: 'building_clancastle',
      descKey: 'building_clancastle_desc',
      icon: Castle,
      color: '#4682B4',
      category: 'special'
    }
  ];

  const categoryKeys = {
    main: 'category_main_buildings',
    resource: 'category_resource_buildings', 
    military: 'category_military_buildings',
    defense: 'category_defense_buildings',
    special: 'category_special_buildings'
  };

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
        <div 
          key={resource}
          className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-xl text-xs text-gray-700"
        >
          <IconComponent size={12} color={config.color} />
          <span>{amount}</span>
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-gray-800 text-xl font-semibold font-nepali">
              {t('select_building')}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            {['main', 'resource', 'military', 'defense', 'special'].map(category => {
              const categoryBuildings = buildingTypes.filter(b => b.category === category);
              if (categoryBuildings.length === 0) return null;
              
              return (
                <React.Fragment key={category}>
                  <h3 className="col-span-full text-gray-800 text-sm font-semibold mt-3 mb-2 pb-1 border-b-2 border-green-500 first:mt-0 font-nepali">
                    {t(categoryKeys[category])}
                  </h3>
                  {categoryBuildings.map((building) => {
                    const cost = getBuildingCost(building.type);
                    const affordable = canAfford(cost);
                    const IconComponent = building.icon;

                    return (
                      <motion.div
                        key={building.type}
                        onClick={() => affordable && onSelect(building.type)}
                        whileHover={affordable ? { scale: 1.02 } : {}}
                        whileTap={affordable ? { scale: 0.98 } : {}}
                        className={`
                          border-2 rounded-xl p-4 text-center transition-all duration-200
                          ${affordable 
                            ? 'border-green-500 bg-green-500/5 cursor-pointer hover:shadow-md' 
                            : 'border-gray-300 bg-gray-100/50 cursor-not-allowed opacity-60'}
                        `}
                      >
                        <div className="flex justify-center mb-2" style={{ color: building.color }}>
                          <IconComponent size={40} />
                        </div>
                        
                        <h3 className="text-gray-800 font-semibold mb-1 text-sm font-nepali">
                          {t(building.nameKey)}
                        </h3>
                        
                        <p className="text-gray-500 text-xs mb-3 leading-relaxed font-nepali">
                          {t(building.descKey)}
                        </p>
                        
                        <div className="flex justify-center gap-2 flex-wrap">
                          {renderCost(cost)}
                        </div>
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BuildingSelector;