import React from 'react';
import SatelliteTable from '../Common/SatelliteTable'; // Import the new component

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
}) => {
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

  return (
    <div  className="bg-white p-4 rounded-sm text-black flex flex-col items-center cursor-pointer">
      <div className='flex w-full justify-between items-center'>
        <h2 className="text-base font-medium uppercase">{name}</h2>
        <div>
          <button onClick={onSelect} className='bg-black text-white text-xs font-mono p-2 rounded-full'>SELECT</button>
        </div>
      </div>

      <img src={image} alt={name} className="w-52  object-contain rounded mb-2" />
      
      <div className="flex-grow flex flex-col justify-between  text-xs uppercase "> {/* Added flex and justify classes */}
        <SatelliteTable data={tableData} /> {/* Use the new table component */}
      </div>
    </div>
  );
};

export default SatCard;
