import React, { useState } from 'react';
/* import SpaceWeather from './spaceweather'; */
import CommandInterface from './Commandinterface';
import OpticalData from './OpticalData';
import OnboardData from './OnboardData';
import Console from './console';

const InstrumentData: React.FC = () => {
  const [selectedInstrument, setSelectedInstrument] = useState<'RADAR' | 'OPTICAL'>('OPTICAL');

  return (
    <div className="bg-white p-2 rounded-sm w-full text-black h-full flex flex-col gap-2">
      
      <div className="grid grid-cols-2 gap-2 flex-grow h-[70%] ">
      <OpticalData
        selectedInstrument={selectedInstrument}
        onInstrumentChange={setSelectedInstrument}
      />
      <OnboardData/>
      
        
      </div>
      
      
      <div className="grid grid-cols-2 gap-2 flex-grow h-[30%]">
      <Console/>
      <CommandInterface />
      {/* <SpaceWeather /> */}
      
        
      </div>
    </div>
  );
};

export default InstrumentData;
