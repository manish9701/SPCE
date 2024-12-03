import React, { useEffect, createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SatData from '../components/Common/satData';
import InstrumentData from '../components/Common/dash/instrumentdata';
import SW from '../components/Common/dash/sw';

interface SatelliteData {
  name: string;
  type: string;
  orbit: string;
  downlinkRate: string;
  startDate: Date;
  endDate: Date;
  noradId: number;
}

export const NoradIdContext = createContext<number | null>(null);
export const SatelliteContext = createContext<SatelliteData | null>(null);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [noradId, setNoradId] = useState<number | null>(null);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);

  useEffect(() => {
    const storedNoradId = localStorage.getItem('activeSatelliteNoradId');
    const storedSatData = localStorage.getItem('activeSatelliteData');
    
    if (storedNoradId) {
      setNoradId(parseInt(storedNoradId));
    }
    if (storedSatData) {
      setSatelliteData(JSON.parse(storedSatData));
    }
  }, []);

  return (
    <NoradIdContext.Provider value={noradId}>
      <SatelliteContext.Provider value={satelliteData}>
        <div className="flex flex-col p-2 h-full w-full">
          <div className="flex flex-grow w-full h-full">
            <div className="flex-grow bg-zinc-200 p-2 rounded-sm w-full h-full">
              <div className="flex flex-row gap-2 w-full h-full">
                <SatData />
                <InstrumentData />
                <SW />
              </div>
            </div>
          </div>
        </div>
      </SatelliteContext.Provider>
    </NoradIdContext.Provider>
  );
};

export default Dashboard;

