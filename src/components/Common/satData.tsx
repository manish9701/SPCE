import React, { useState, useEffect, useMemo, Suspense, lazy, useContext } from 'react';
import { motion} from 'framer-motion';
import { NoradIdContext, SatelliteContext } from '../../pages/dash';
import { MdAdd } from "react-icons/md";


export interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

export interface SatelliteData {
  info: {
    satname: string;
    satid: number;
  };
  positions: SatellitePosition[];
}

export interface TLEData {
  tle: string;
}

const MapComponent = lazy(() => import('./dash/MapComponent'));

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error loading map. Please try refreshing the page.</div>;
    }

    return this.props.children;
  }
}

export const useSatelliteData = () => {
  const noradId = useContext(NoradIdContext);
  const [satData, setSatData] = useState<SatelliteData | null>(null);
  const [tleData, setTLEData] = useState<TLEData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PROXY_URL = 'http://localhost:3001/api'; // Update this with your proxy server URL

  useEffect(() => {
    if (!noradId) return;

    const fetchSatellitePositions = async () => {
      try {
        const positionsResponse = await fetch(`${PROXY_URL}/satellite/positions/${noradId}/41.702/-76.014/0/2`);
        if (!positionsResponse.ok) throw new Error('Network response was not ok');
        const positionsData = await positionsResponse.json();
        setSatData(prevData => ({
          info: prevData?.info ?? { satname: '', satid: 0 },
          positions: positionsData.positions
        }));
      } catch (error) {
        console.error("Error fetching satellite positions:", error);
      }
    };

    const fetchTLEData = async () => {
      try {
        const tleResponse = await fetch(`${PROXY_URL}/satellite/tle/${noradId}`);
        if (!tleResponse.ok) throw new Error('Network response was not ok');
        const tleData = await tleResponse.json();
        setTLEData(tleData);
      } catch (error) {
        console.error("Error fetching TLE data:", error);
      }
    };

    const initialFetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchSatellitePositions(), fetchTLEData()]);
      } catch (error) {
        console.error("Error fetching initial satellite data:", error);
        setError('Failed to fetch satellite data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();

    const positionsInterval = setInterval(fetchSatellitePositions, 20000); // Update positions every 20 seconds
    const tleInterval = setInterval(fetchTLEData, 20000); // Update TLE every 100 seconds

    return () => {
      clearInterval(positionsInterval);
      clearInterval(tleInterval);
    };
  }, [noradId]);

  return { satData, tleData, isLoading, error };
};

const SkeletonLoader: React.FC = () => {
  const skeletonData = [
    [
      { label: 'TIMESTAMP', border: true },
      { label: 'ALTITUDE [km]', border: false }
    ],
    [
      { label: 'LATITUDE', border: true },
      { label: 'LONGITUDE', border: false }
    ],
    [
      { label: 'AZIMUTH', border: true },
      { label: 'ELEVATION', border: false }
    ],
    [
      { label: 'RIGHT ASCENSION', border: true },
      { label: 'DECLINATION', border: false }
    ]
  ];

  return (
    <>
      <div className="h-1/2 border-y border-gray-300 bg-gray-100 animate-pulse" />
      
      <div className="flex flex-col">
        {skeletonData.map((row, index) => (
          <div key={index} className="flex flex-row justify-between border-b border-gray-200">
            {row.map((item, i) => (
              <div key={i} className={`flex flex-col flex-grow p-2 ${item.border ? 'border-r border-gray-200' : ''} w-1/2`}>
                <div className="text-[10px] font-normal text-gray-500">{item.label}</div>
                <div className="h-5 bg-gray-200 animate-pulse rounded mt-1 w-24" />
              </div>
            ))}
          </div>
        ))}
        
        <div className="flex flex-row items-center p-2">
          <div className="flex flex-col">
            <div className="text-[10px] font-normal text-gray-500">MISSION INFO</div>
            <div className="h-5 bg-gray-200 animate-pulse rounded w-48 mt-1" />
          </div>
        </div>
      </div>
    </>
  );
};

const DataDisplay = React.memo<{ 
  label: string; 
  value: string | number | null; 
  unit?: string; 
  width: string; 
  border: boolean;
  isLoading?: boolean;
}>(({ label, value, unit = '', width, border, isLoading = false }) => (
  <div className={`flex flex-col flex-grow p-2 ${border ? 'border-r border-gray-200' : ''} ${width}`}>
    <div className='text-[10px] font-normal text-gray-500'>{label}</div>
    {isLoading ? (
      <div className="h-6 bg-gray-200 animate-pulse rounded mt-1 w-24" />
    ) : (
      <span className='text-base font-semibold uppercase'>{value}{unit}</span>
    )}
  </div>
));

const SatData: React.FC = () => {
  const { satData, tleData, isLoading, error } = useSatelliteData();
  const noradId = useContext(NoradIdContext);
  const satelliteData = useContext(SatelliteContext);

  const formatTimeOnly = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const memoizedMap = useMemo(() => {
    if (satData) {
      return (
        <ErrorBoundary>
          <Suspense fallback={
            <div className="h-1/2 w-full " />
          }>
            <MapComponent satData={satData} mapStyle='detailed' />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return null;
  }, [satData]);

  const getMissionCode = () => {
    if (!satelliteData) return '----';
    const category = satelliteData.type ;
    const satelliteType = satelliteData.name ;
    const orbit = satelliteData.orbit ;
    const downlinkType = satelliteData.downlinkRate ;
    const duration = calculateDuration();

    return `${category.split(' ').map(word => word[0]).join('')}.${satelliteType}.${orbit}.${noradId}.${downlinkType[0]}.${duration}D`;
  };

  const calculateDuration = () => {
    if (!satelliteData?.startDate || !satelliteData?.endDate) return 0;
    const start = new Date(satelliteData.startDate);
    const end = new Date(satelliteData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white text-black flex flex-col rounded-sm w-1/3">
      <div className="p-2 flex justify-between items-center">
        <h2 className="text-base font-semibold uppercase">
          Satellite Data<span className="text-[10px] font-light text-gray-500"> BY N2YO</span>
        </h2>
        <motion.button 
          className="bg-black text-white rounded-full size-7 mb-1 hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdAdd size={18} />
        </motion.button>
      </div>
      
      {error ? (
        <div className="p-2">Error: {error}</div>
      ) : (!satData || !satData.positions || satData.positions.length === 0 || !tleData || isLoading) ? (
        <SkeletonLoader />
      ) : (
        <>
          <div className="h-1/2 border-y border-gray-200">
            {memoizedMap}
          </div>
          
          <div className="flex flex-col">
            <div className="flex flex-row justify-between border-b border-gray-200">
              <DataDisplay 
                label="TIMESTAMP" 
                value={satData?.positions[0]?.timestamp ? formatTimeOnly(satData.positions[0].timestamp) : null}
                width="w-1/2" 
                border={true}
                isLoading={isLoading}
              />
              <DataDisplay 
                label="ALTITUDE [km]" 
                value={satData.positions[0].sataltitude.toFixed(2)}
                width="w-1/2" 
                border={false} 
              />
            </div>

            <div className="flex flex-row justify-between border-b border-gray-200">
              <DataDisplay 
                label="LATITUDE" 
                value={satData.positions[0].satlatitude.toFixed(2)} 
                unit="° N" 
                width="w-1/2" 
                border={true} 
              />
              <DataDisplay 
                label="LONGITUDE" 
                value={satData.positions[0].satlongitude.toFixed(2)} 
                unit="° W" 
                width="w-1/2" 
                border={false} 
              />
            </div>

            <div className="flex flex-row justify-between border-b border-gray-200">
              <DataDisplay 
                label="AZIMUTH" 
                value={satData.positions[0].azimuth.toFixed(1)} 
                unit="°" 
                width="w-1/2" 
                border={true} 
              />
              <DataDisplay 
                label="ELEVATION" 
                value={satData.positions[0].elevation.toFixed(1)} 
                unit="°" 
                width="w-1/2" 
                border={false} 
              />
            </div>

            <div className="flex flex-row justify-between border-b border-gray-200">
              <DataDisplay 
                label="RIGHT ASCENSION" 
                value={formatRA(satData.positions[0].ra)} 
                width="w-1/2" 
                border={true} 
              />
              <DataDisplay 
                label="DECLINATION" 
                value={formatDec(satData.positions[0].dec)} 
                width="w-1/2" 
                border={false} 
              />
            </div>

            <div className="flex flex-row items-center">
              <DataDisplay
                label="MISSION INFO"
                value={getMissionCode()}
                width="w-fit"
                border={false}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const formatRA = (ra: number) => {
  const hours = Math.floor(ra);
  const minutes = Math.floor((ra - hours) * 60);
  const seconds = Math.floor(((ra - hours) * 60 - minutes) * 60);
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};

const formatDec = (dec: number) => {
  const sign = dec >= 0 ? '+' : '-';
  const absDec = Math.abs(dec);
  const degrees = Math.floor(absDec);
  const minutes = Math.floor((absDec - degrees) * 60);
  const seconds = Math.floor(((absDec - degrees) * 60 - minutes) * 60);
  return `${sign}${degrees}° ${minutes.toString().padStart(2, '0')}' ${seconds.toString().padStart(2, '0')}''`;
};

export default SatData;
