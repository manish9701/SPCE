import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';

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

const MapComponent = lazy(() => import('./MapComponent'));

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
  const [satData, setSatData] = useState<SatelliteData | null>(null);
  const [tleData, setTLEData] = useState<TLEData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SATELLITE_ID = 25544; // ISS NORAD ID
  const PROXY_URL = 'http://localhost:3001/api'; // Update this with your proxy server URL

  useEffect(() => {
    const fetchSatellitePositions = async () => {
      try {
        const positionsResponse = await fetch(`${PROXY_URL}/satellite/positions/${SATELLITE_ID}/41.702/-76.014/0/2`);
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
        const tleResponse = await fetch(`${PROXY_URL}/satellite/tle/${SATELLITE_ID}`);
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
  }, []);

  return { satData, tleData, isLoading, error };
};

const SatData: React.FC = () => {
  const { satData, tleData, isLoading, error } = useSatelliteData();

  const memoizedMap = useMemo(() => {
    if (satData) {
      return (
        <ErrorBoundary>
          <Suspense fallback={<div>Loading map...</div>}>
            <MapComponent satData={satData} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return null;
  }, [satData]);

  return (
    <div className=" bg-white text-black flex flex-col rounded-sm w-1/3">
      <div className="p-2 flex justify-between items-center ">
        <h2 className="text-base font-semibold uppercase">Satellite Data<span className="text-xs font-light text-gray-500 ">BY N2YO</span></h2>

        <button className="bg-black text-white p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-2">Loading satellite data...</div>
      ) : error ? (
        <div className="p-2">Error: {error}</div>
      ) : !satData || !satData.positions || satData.positions.length === 0 || !tleData ? (
        <div className="p-2">No satellite data available.</div>
      ) : (
        <>
          <div className="h-1/2  border-y border-gray-300">
            {memoizedMap}
          </div>
          
          <div className="flex flex-grow p-2">
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td>NORAD ID:</td>
                  <td className="text-right">{satData.info.satid}</td>
                </tr>
                <tr>
                  <td>LATITUDE:</td>
                  <td className="text-right">{satData.positions[0].satlatitude.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>LONGITUDE:</td>
                  <td className="text-right">{satData.positions[0].satlongitude.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>ALTITUDE [km]:</td>
                  <td className="text-right">{satData.positions[0].sataltitude.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>AZIMUTH:</td>
                  <td className="text-right">{satData.positions[0].azimuth.toFixed(1)}</td>
                </tr>
                <tr>
                  <td>ELEVATION:</td>
                  <td className="text-right">{satData.positions[0].elevation.toFixed(1)}</td>
                </tr>
                <tr>
                  <td>RIGHT ASCENSION:</td>
                  <td className="text-right">{formatRA(satData.positions[0].ra)}</td>
                </tr>
                <tr>
                  <td>DECLINATION:</td>
                  <td className="text-right">{formatDec(satData.positions[0].dec)}</td>
                </tr>
                <tr>
                  <td>TIMESTAMP:</td>
                  <td className="text-right">{new Date(satData.positions[0].timestamp * 1000).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
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
