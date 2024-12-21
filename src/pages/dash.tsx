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
export const ExpandedViewContext = createContext<{
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}>({ expanded: false, setExpanded: () => {} });

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [noradId, setNoradId] = useState<number | null>(null);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [expanded, setExpanded] = useState(false);

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
        <ExpandedViewContext.Provider value={{ expanded, setExpanded }}>
          <div className="flex flex-col p-2 h-full w-full">
            <div className="flex flex-grow w-full h-full">
              <div className="flex-grow bg-zinc-200 p-2 rounded-sm w-full h-full">
                {!expanded ? (
                  <div className="flex flex-row gap-2 w-full h-full">
                    <SatData />
                    <InstrumentData />
                    <SW />
                  </div>
                ) : (
                  <div className="flex h-full gap-2">
                    <div className="  text-black text-sm flex flex-col h-full gap-2">
                      <button className="p-3 bg-white text-left hover:bg-gray-900 hover:text-white transition-colors">
                        <div>SATELLITE DATA</div>
                      </button>
                      <button className="p-3 bg-white text-left hover:bg-gray-900 transition-colors">
                        <div>INSTRUMENTS DATA</div>
                      </button>
                      <button className="p-3 bg-white text-left hover:bg-gray-900 transition-colors">
                        <div>SYSTEM DATA</div>
                      </button>
                      <button className="p-3  bg-white text-left hover:bg-gray-900 transition-colors">
                        <div>COMMAND INTERFACE</div>
                      </button>
                      <button className='p-3 bg-white text-left hover:bg-gray-900 transition-colors'>
                        <div> SPACE WEATHER</div>
                      </button>
                      <div className="p-3 bg-white">
                        <div className="text-xs text-gray-400">MISSION ID:</div>
                        <div className="text-sm">{satelliteData?.name || 'N/A'}</div>
                      </div>
                      <div className="flex-grow bg-white"></div>
                      <div className="p-4 bg-white">
                        <div className="text-xs text-gray-400">SOLAR WIND SPEED:</div>
                        <div className="text-sm">387 Km/s</div>
                        <div className="text-xs text-gray-400 mt-2">SOLAR MAGNETIC FIELD:</div>
                        <div className="text-sm">Bt: 8 nT, Bz: -8 nT</div>
                        <div className="text-xs text-gray-400 mt-2">10.7CM RADIO FLUX:</div>
                        <div className="text-sm">165 sfu</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <SatData />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ExpandedViewContext.Provider>
      </SatelliteContext.Provider>
    </NoradIdContext.Provider>
  );
};

export default Dashboard;

