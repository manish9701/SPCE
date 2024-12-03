import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSatelliteData } from '../satData';

type InstrumentType = 'RADAR' | 'OPTICAL';

interface OpticalDataProps {
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
}

interface ControlButton {
  id: string;
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
}

const OpticalData: React.FC<OpticalDataProps> = ({ 
  selectedInstrument, 
  onInstrumentChange 
}) => {
  const { satData, isLoading, error } = useSatelliteData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const zoom = 10;

  // Control buttons configuration
  const viewControls: ControlButton[] = [
    {
      id: 'view',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'menu',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    }
  ];

  const instrumentControls: ControlButton[] = [
    {
      id: 'RADAR',
      label: 'RADAR',
      onClick: () => onInstrumentChange('RADAR')
    },
    {
      id: 'OPTICAL',
      label: 'OPTICAL',
      onClick: () => onInstrumentChange('OPTICAL')
    }
  ];

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

  // Tile calculation functions
  const tileSize = Math.max(containerSize.width, containerSize.height) / 2;

  const latLonToTileZXY = useCallback((lat: number, lon: number, zoomLevel: number) => {
    const MIN_ZOOM_LEVEL = 0;
    const MAX_ZOOM_LEVEL = 22;
    const MIN_LAT = -90.0;
    const MAX_LAT = 90.0;
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

  const tileCoordinates = satData?.positions?.[0] 
    ? latLonToTileZXY(
        satData.positions[0].satlatitude, 
        satData.positions[0].satlongitude, 
        zoom
      ) 
    : null;

  // Render helper functions
  const renderSegmentedButtons = (
    buttons: ControlButton[], 
    isInstrumentControl: boolean = false
  ) => (
    <div className="flex backdrop-blur-md bg-black/30  font-medium  ">
      {buttons.map((button, index) => (
        <button
          key={button.id}
          onClick={button.onClick}
          className={`
            ${isInstrumentControl ? 'p-1 text-xs w-16' : 'p-1'} 
            transition-all duration-300
            ${index === 0 }
            ${index === buttons.length - 1 ? '': 'border-r border-white/20'}
            ${isInstrumentControl && selectedInstrument === button.id as InstrumentType
              ? 'bg-white/40 text-white backdrop-blur-lg' 
              : 'bg-transparent text-white hover:bg-white/20'
            }
          `}
        >
          {button.icon || button.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-sm flex-grow flex flex-col h-full">
      {/* Header */}
      <div className="p-2 flex justify-between items-center border-b border-gray-200">
        <h2 className="font-semibold">
          OPTICAL INSTRUMENTS DATA <span className="text-[10px] font-light text-gray-500">BY TOMTOM</span>
            
        </h2>
        <div className="flex space-x-2 items-center">
          {/* <span className="text-green-600 text-xs">STATUS - 100%</span> */}
          {/* <button className="bg-black text-white rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button> */}
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="relative flex-grow overflow-hidden rounded-b-sm">
        {!satData && isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            Loading satellite data...
          </div>
        ) : error && !satData ? (
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
        {/* Updated transmission info div */}
        <div className="absolute top-2 right-2 backdrop-blur-md bg-black/20 text-white text-[10px] px-2 py-1 rounded-xs  ">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>NEXT TRANSMISSION IN 25 MINUTES</span>
          </div>
        </div>

        {/* Updated controls container */}
        <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between items-end">
          <div className="space-x-2 flex items-center">
            {renderSegmentedButtons(viewControls)}
          </div>
          <div className="space-x-2 flex items-center">
            {renderSegmentedButtons(instrumentControls, true)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticalData;
