import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSatelliteData } from './satData';

interface OpticalDataProps {
  selectedInstrument: 'RADAR' | 'OPTICAL';
  onInstrumentChange: (instrument: 'RADAR' | 'OPTICAL') => void;
}

const OpticalData: React.FC<OpticalDataProps> = ({ selectedInstrument, onInstrumentChange }) => {
  const { satData, isLoading, error } = useSatelliteData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const zoom = 10;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const tileSize = Math.max(containerSize.width, containerSize.height) / 2;

  const latLonToTileZXY = useCallback((lat: number, lon: number, zoomLevel: number): { z: number, x: number, y: number } => {
    const MIN_ZOOM_LEVEL = 0;
    const MAX_ZOOM_LEVEL = 22;
    const MIN_LAT = -85.051128779807;
    const MAX_LAT = 85.051128779806;
    const MIN_LON = -180.0;
    const MAX_LON = 180.0;

    if (zoomLevel < MIN_ZOOM_LEVEL || zoomLevel > MAX_ZOOM_LEVEL) {
      throw new Error(`Zoom level value is out of range [${MIN_ZOOM_LEVEL}, ${MAX_ZOOM_LEVEL}]`);
    }

    if (lat < MIN_LAT || lat > MAX_LAT) {
      throw new Error(`Latitude value is out of range [${MIN_LAT}, ${MAX_LAT}]`);
    }

    if (lon < MIN_LON || lon > MAX_LON) {
      throw new Error(`Longitude value is out of range [${MIN_LON}, ${MAX_LON}]`);
    }

    const z = Math.trunc(zoomLevel);
    const xyTilesCount = Math.pow(2, z);
    const x = Math.trunc(Math.floor(((lon + 180.0) / 360.0) * xyTilesCount));
    const y = Math.trunc(
      Math.floor(
        ((1.0 -
          Math.log(
            Math.tan((lat * Math.PI) / 180.0) +
              1.0 / Math.cos((lat * Math.PI) / 180.0)
          ) /
            Math.PI) /
          2.0) *
          xyTilesCount
      )
    );

    return { z, x, y };
  }, []);

  const tileCoordinates = satData && satData.positions && satData.positions.length > 0
    ? latLonToTileZXY(satData.positions[0].satlatitude, satData.positions[0].satlongitude, zoom)
    : null;

  return (
    <div className="border border-gray-200 rounded-sm flex-grow flex flex-col h-full">
      <div className="p-2 flex justify-between items-center ">
        <h2 className="font-semibold">OPTICAL INSTRUMENTS DATA  <span className="text-xs font-light text-gray-500">BY TOMTOM</span></h2>
        <div className="flex space-x-2 items-center">
          <span className="text-green-600 text-xs">STATUS - 100%</span>
          <button className="bg-black text-white rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div ref={containerRef} className="relative flex-grow overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            Loading satellite data...
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : tileCoordinates ? (
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              {[
                { x: tileCoordinates.x, y: tileCoordinates.y, top: 0, left: 0 },
                { x: tileCoordinates.x + 1, y: tileCoordinates.y, top: 0, left: tileSize },
                { x: tileCoordinates.x, y: tileCoordinates.y + 1, top: tileSize, left: 0 },
                { x: tileCoordinates.x + 1, y: tileCoordinates.y + 1, top: tileSize, left: tileSize },
              ].map(({ x, y, top, left }, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    top,
                    left,
                    width: tileSize,
                    height: tileSize,
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={`https://api.tomtom.com/map/1/tile/sat/main/${tileCoordinates.z}/${x}/${y}.jpg?key=ZlYmuSs4BJl18YpdVQEmZ3Ey3AWMJfKw`}
                    alt={`Satellite tile ${index + 1}`}
                    className={`w-full h-full object-cover ${selectedInstrument === 'RADAR' ? 'mix-blend-exclusion' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            No satellite data available
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded-full">
          NEXT TRANSMISSION IN 25 MINUTES
        </div>
        <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between items-end">
          <div className="flex space-x-2">
            <button className="bg-white rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button className="bg-white rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex bg-white rounded-full border border-gray-200">
            <button
              className={`px-2 py-1 text-xs w-16 rounded-l-full ${selectedInstrument === 'RADAR' ? 'bg-black text-white' : 'bg-white text-black'}`}
              onClick={() => onInstrumentChange('RADAR')}
            >
              RADAR
            </button>
            <button
              className={`px-2 py-1 text-xs w-16 rounded-r-full ${selectedInstrument === 'OPTICAL' ? 'bg-black text-white' : 'bg-white text-black'}`}
              onClick={() => onInstrumentChange('OPTICAL')}
            >
              OPTICAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticalData;
