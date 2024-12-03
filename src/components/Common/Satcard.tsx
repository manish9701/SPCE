import React, { useState } from 'react';
import SatelliteTable from '../Common/SatelliteTable'; // Import the new component
import InfoCard from './InfoCard';
import { motion } from 'framer-motion';

interface SatelliteProps {
  name: string;
  image: string;
  orbitType: string;
  resolution: string;
  spectralBands: string;
  swathWidth: string;
  dataDelivery: string;
  instrumentType: string;
  applications: string;
  onSelect: () => void; // Add onSelect prop

  // New optional technical details
  technicalDetails?: {
    manufacturer?: string;
    launchDate?: string;
    operationalLife?: string;
    sensorDetails?: {
      manufacturer?: string;
      model?: string;
      technology?: string;
    };
    constellation?: {
      current?: number;
      planned?: number;
      operator?: string;
    };
    specifications?: {
      mass?: string;
      power?: string;
      altitude?: string;
      revisitTime?: string;
    };
  };

  downlinkDataRate: {
    Base: string;
    High: string;
  };

  DownlinkCost: {
    base: string;
    high: string;
  };

  costPerDay: { [key: string]: string };

  currentFleet: {
    "In-Orbit": string;
    "Scheduled": string;
  };

  manufacturer: { [key: string]: string };
}

const SatCard: React.FC<SatelliteProps> = ({
  name,
  image,
  orbitType,
  resolution,
  spectralBands,
  swathWidth,
  dataDelivery,
  instrumentType,
  applications,
  onSelect, // Add onSelect prop
  costPerDay,
  downlinkDataRate,
  DownlinkCost,
  currentFleet,
  manufacturer  
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Prepare data for the table
  const tableData = [
    { label: 'Orbit Type', values: orbitType }, // Changed 'value' to 'values'
    { label: 'Resolution', values: resolution }, // Changed 'value' to 'values'
    { label: 'Spectral Bands', values: spectralBands }, // Changed 'value' to 'values'
    { label: 'Swath Width', values: swathWidth }, // Changed 'value' to 'values'
    { label: 'Data Delivery', values: dataDelivery }, // Changed 'value' to 'values'
    { label: 'Instrument Type', values: instrumentType }, // Changed 'value' to 'values'
    { label: 'Applications', values: applications }, // Changed 'value' to 'values'
  ];

  const availability = {
    status: 'available',
    
  };

  return (
    <div className="bg-white py-2 rounded-sm text-black flex flex-col h-full w-[33.33%] relative overflow-hidden font-mono">
      <div className={`w-full flex flex-col h-full transition-transform duration-300 ease-in-out ${showInfo ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="relative pb-2 mb-4">
          <div className="absolute inset-0 border-b border-gray-200"></div>
          <div className="relative flex justify-between items-center h-full">
            <h2 className="text-base font-medium uppercase tracking-tight ml-2">{name}</h2>
            <div className="flex gap-2 mr-2">
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(true);
                }} 
                className="bg-gray-100 text-black text-xs h-8 font-mono px-3 py-1.5 rounded-sm hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                INFO
              </motion.button>
              <motion.button 
                onClick={onSelect} 
                className="bg-black text-white text-xs h-8 font-mono px-3 py-1.5 rounded-sm "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                SELECT
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center px-3">
          <img src={image} alt={name} className="w-52 object-contain mb-2" />
          
          <div className="flex-grow flex flex-col justify-between text-xs uppercase w-full"> 
            <SatelliteTable data={tableData} />
          </div>
        </div>

        <div className='w-full mt-2 px-2 flex justify-between items-center border-t pt-2'> 
          <span className="text-xs uppercase">Availability</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              availability.status === 'available' ? 'bg-green-500' : 
              availability.status === 'limited' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} />
            <span className="text-xs uppercase">{availability.status}</span>
          </div>
        </div>
      </div>

      {/* Detailed Info Panel */}
      <div 
        className={`absolute top-0 left-0 w-full h-full bg-white transition-transform duration-300 ease-in-out  ${
          showInfo ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        
        <InfoCard
          name={name}
          onClose={() => setShowInfo(false)}
          costPerDay={costPerDay}
          downlinkDataRate={downlinkDataRate}
          DownlinkCost={DownlinkCost}
          currentFleet={currentFleet}
          manufacturer={manufacturer}
        />
      </div>
    </div>
  );
};

export default SatCard;
