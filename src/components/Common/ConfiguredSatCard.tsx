import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { FiArrowUpRight} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const MapComponent = lazy(() => import('./dash/MapComponent'));

interface ConfiguredSatellite {
    id: string;
    name: string;
    noradId: number;
    type: string;
    orbit: string;
    downlinkRate: string;
    startDate: Date;
    endDate: Date;
    totalCost: number;
    status: 'operational' | 'warning' | 'critical' | 'standby' | 'scheduled';
}

interface ConfiguredSatCardProps {
    satellite: ConfiguredSatellite;
}

interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

interface SatelliteMapData {
  info: {
    satname: string;
    satid: number;
  };
  positions: SatellitePosition[];
}

interface SatelliteLog {
    timestamp: Date;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

const ConfiguredSatCard = React.memo<ConfiguredSatCardProps>(({ satellite }) => {
    const [activeView, setActiveView] = useState<'status' | 'logs'>('status');
    const navigate = useNavigate();
    const [satMapData, setSatMapData] = useState<SatelliteMapData | null>(null);
    const [systemData, setSystemData] = useState<any[]>([]);
    const [signalData, setSignalData] = useState<any[]>([]);
    const [satelliteLogs, setSatelliteLogs] = useState<SatelliteLog[]>([]);
    
    console.log('Satellite data:', satellite);

    

    

    // Move calculateDuration to be memoized
    const calculateDuration = useCallback(() => {
        if (!satellite?.startDate || !satellite?.endDate) return 0;
        try {
            const start = new Date(satellite.startDate);
            const end = new Date(satellite.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.error('Error calculating duration:', error);
            return 0;
        }
    }, [satellite?.startDate, satellite?.endDate]);

    // Format date with error handling
    const formatDate = useCallback((date: Date) => {
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return '---';
        }
    }, []);

    // Helper function for time until start with error handling
    const formatTimeUntilStart = useCallback((startDate: Date): string => {
        try {
            const now = new Date();
            const start = new Date(startDate);
            const diffTime = Math.abs(start.getTime() - now.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
        } catch (error) {
            console.error('Error calculating time until start:', error);
            return '0';
        }
    }, []);

    // First, memoize the stable data arrays using useMemo
    const {
        stableSystemData,
        stableSignalData,
        stablePowerData,
        stableTempData
    } = useMemo(() => ({
        stableSystemData: systemData.map(d => ({ value: d.status })),
        stableSignalData: signalData.map(d => ({ value: d.signal })),
        stablePowerData: systemData.map(d => ({ value: d.power })),
        stableTempData: systemData.map(d => ({ value: d.temp }))
    }), [systemData, signalData]); // Only recalculate when source data changes

    // Memoize the LineChart component
    const MemoizedLineChart = React.memo(({ data }: { data: any[] }) => (
        <ResponsiveContainer width={80} height={40}>
            <LineChart data={data}>
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#000" 
                    strokeWidth={1} 
                    dot={false} 
                    isAnimationActive={false} // Disable animation
                />
                
            </LineChart>
        </ResponsiveContainer>
    ));

    // Update the DataDisplay component to use the memoized chart
    const DataDisplay = React.memo<{ 
        label: string; 
        value: string | number | null; 
        unit?: string; 
        width: string; 
        border: boolean;
        isLoading?: boolean;
        data?: any[];
        isDate?: boolean;
    }>(({ label, value, unit = '', width, border, isLoading = false, data, isDate = false }) => (
        <div className={`flex flex-row flex-grow p-2 ${border ? 'border-r border-gray-200' : ''} ${width}`}>
            <div className='flex flex-col justify-between'>
                <div className='text-[10px] font-normal text-gray-500'>{label}</div>
                <div className="flex items-center">
                    <span className={`${isDate ? 'text-sm' : 'text-base'} font-semibold uppercase mr-2`}>
                        {value}{unit}
                    </span>
                </div>
            </div>
            
            {data && (
                <div className="flex items-center ml-auto">
                    <MemoizedLineChart data={data} />
                </div>
            )}
        </div>
    ), (prevProps, nextProps) => {
        // Custom comparison function for memo
        return (
            prevProps.value === nextProps.value &&
            prevProps.label === nextProps.label &&
            prevProps.border === nextProps.border &&
            prevProps.width === nextProps.width &&
            prevProps.isDate === nextProps.isDate &&
            JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
        );
    });

    const handleDashboardClick = () => {
        if (satellite.noradId) {
            // Store all necessary satellite data
            const satelliteData = {
                name: satellite.name,
                type: satellite.type,
                orbit: satellite.orbit,
                downlinkRate: satellite.downlinkRate,
                startDate: satellite.startDate,
                endDate: satellite.endDate,
                noradId: satellite.noradId
            };
            
            localStorage.setItem('activeSatelliteNoradId', satellite.noradId.toString());
            localStorage.setItem('activeSatelliteData', JSON.stringify(satelliteData));
            console.log('Navigating to dashboard with satellite data:', satelliteData);
            navigate('/dashboard');
        } else {
            console.warn('No NORAD ID available for satellite:', satellite);
        }
    };

    const getMissionStatus = useCallback(() => {
        const now = new Date();
        const start = new Date(satellite.startDate);
        const end = new Date(satellite.endDate);

        if (start > now) {
            return {
                status: 'scheduled',
                label: 'SCHEDULED',
                className: 'bg-yellow-50 text-yellow-600'
            };
        }

        if (now >= start && now <= end) {
            return {
                status: 'operational',
                label: 'ACTIVE',
                className: 'bg-green-50 text-green-600'
            };
        }

        return {
            status: 'completed',
            label: 'COMPLETED',
            className: 'bg-blue-50 text-blue-600'
        };
    }, [satellite.startDate, satellite.endDate]);

    const missionStatus = getMissionStatus();
    const isScheduled = missionStatus.status === 'scheduled';

    useEffect(() => {
        if (!satellite.noradId) return;

        const fetchSatellitePositions = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/satellite/positions/${satellite.noradId}/41.702/-76.014/0/2`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setSatMapData({
                    info: {
                        satname: satellite.name,
                        satid: satellite.noradId
                    },
                    positions: data.positions
                });
            } catch (error) {
                console.error("Error fetching satellite positions:", error);
            }
        };

        fetchSatellitePositions();
        const interval = setInterval(fetchSatellitePositions, 20000);

        return () => clearInterval(interval);
    }, [satellite.noradId ,satellite.name ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemData(prev => {
                const newPoint = {
                    time: prev.length,
                    status: Math.sin(prev.length * 0.2) * 10 + 90, // Varies between 80-100
                    signal: Math.sin(prev.length * 0.5) * 30 + 70, // Varies between 40-100
                    power: Math.sin(prev.length * 0.3) * 20 + 70,  // Varies between 50-90
                    temp: Math.sin(prev.length * 0.4) * 20 + 50,   // Varies between 30-70
                };
                const updatedData = [...prev, newPoint];
                return updatedData.length > 20 ? updatedData.slice(-20) : updatedData;
            });

            setSignalData(prev => {
                const newPoint = {
                    time: prev.length,
                    signal: Math.sin(prev.length * 0.5) * 30 + 70
                };
                const updatedData = [...prev, newPoint];
                return updatedData.length > 20 ? updatedData.slice(-20) : updatedData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const generateRandomLog = () => {
            const logTypes = [
                { type: 'info', messages: ['Telemetry data received', 'Position updated', 'Signal strength nominal'] },
                { type: 'warning', messages: ['Signal strength fluctuating', 'Temperature slightly elevated'] },
                { type: 'success', messages: ['Data package transmitted successfully', 'Orbit correction completed'] },
                { type: 'error', messages: ['Signal interference detected', 'Minor system anomaly'] }
            ];
            
            const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
            const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];
            
            return {
                timestamp: new Date(),
                message: randomMessage,
                type: randomType.type as SatelliteLog['type']
            };
        };

        const interval = setInterval(() => {
            setSatelliteLogs(prev => {
                const newLogs = [...prev, generateRandomLog()];
                return newLogs.slice(-8); // Keep only the last 8 logs
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Add getMissionCode function similar to satData.tsx
    const getMissionCode = useCallback(() => {
        if (!satellite) return '----';
        const category = satellite.type;
        const satelliteType = satellite.name;
        const orbit = satellite.orbit;
        const downlinkType = satellite.downlinkRate;
        const duration = calculateDuration();

        return `${category.split(' ').map(word => word[0]).join('')}.${satelliteType}.${orbit}.${satellite.noradId}.${downlinkType[0]}.${duration}D`;
    }, [satellite, calculateDuration]);

    const calculateTimeLeftInHours = (endDate: Date) => {
        const now = new Date();
        const end = new Date(satellite.endDate);
        
        // Debug logs
        console.log('Satellite:', satellite.name);
        console.log('End Date:', satellite.endDate);
        console.log('Now:', now.toISOString());
        
        const diffTime = end.getTime() - now.getTime();
        const hoursLeft = Math.floor(diffTime / (1000 * 60 * 60));
        
        console.log('Hours left for', satellite.name, ':', hoursLeft);
        return Math.max(0, hoursLeft);
    };

    return (
        <div className="bg-white h-full flex flex-col">
            {/* Header Section */}
            <div className="flex justify-between items-start p-2 border-b border-gray-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-normal text-black uppercase tracking-wide">
                            {getMissionCode()}
                        </h2>
                        <span className={`flex items-center gap-1 text-[10px] ${missionStatus.className} px-1.5 py-0.5`}>
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                            {missionStatus.label}
                        </span>
                    </div>
                    
                </div>
                {!isScheduled && (
                    <button 
                        onClick={handleDashboardClick}
                        className="bg-black text-white p-1.5 group hover:bg-gray-800 transition-colors"
                        aria-label="View Dashboard">
                        <FiArrowUpRight />
                    </button>
                )}
            </div>

            {/* Main Content Section */}
            {isScheduled ? (
                // Scheduled Mission View - Improved layout
                <div className="flex-grow flex flex-col">
                    <div className="flex-grow flex flex-col justify-center items-center p-6 space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-400 uppercase mb-2">Mission Starts In</div>
                            <div className="text-4xl font-bold text-black">
                                {formatTimeUntilStart(new Date(satellite.startDate))}
                            </div>
                            <div className="text-sm text-gray-500 uppercase">Days</div>
                        </div>
                        <div className="text-sm text-gray-600 uppercase">
                            Scheduled for {formatDate(satellite.startDate)}
                        </div>
                    </div>
                    {/* Duration and Cost Display */}
                    <div className="flex flex-row justify-between border-t border-gray-200">
                        <DataDisplay 
                            label="DURATION" 
                            value={`${formatDate(satellite.startDate)} - ${formatDate(satellite.endDate)}`}
                            width="w-1/2" 
                            border={true}
                            isDate={true}
                        />
                        <DataDisplay 
                            label="TOTAL COST" 
                            value={`$${satellite.totalCost}`}
                            width="w-1/2" 
                            border={false}
                        />
                    </div>
                </div>
            ) : missionStatus.status === 'completed' ? (
                // Completed Mission View - Without duration/cost
                <div className="flex-grow flex flex-col">
                    {/* Mission Summary */}
                    <div className=" border-b border-gray-200">
                        <h3 className="text-xs  p-2 uppercase">Mission Summary</h3>
                        
                            <div className="flex flex-row justify-between border-t border-gray-200">
                                <DataDisplay 
                                    label="TOTAL OPERATION TIME" 
                                    value={`${calculateDuration()} DAYS`}
                                    width="w-1/2" 
                                    border={true}
                                    isDate={true}
                                />
                                <DataDisplay 
                                    label="DATA COLLECTED" 
                                    value={`1.2 TB`}
                                    width="w-1/2" 
                                    border={false}
                                />
                            </div>

                            <div className="flex flex-row justify-between border-t border-gray-200">
                                <DataDisplay 
                                    label="TOTAL PASSES" 
                                    value={`1,234`}
                                    width="w-1/2" 
                                    border={true}
                                />
                                <DataDisplay 
                                    label="SUCCESS RATE" 
                                    value={`99.8%`}
                                    width="w-1/2" 
                                    border={false}
                                />
                            </div>
                        
                    </div>

                    {/* Data Collection Summary */}
                    <div className=" flex-grow">
                    <h3 className="text-xs  p-2 uppercase border-b border-gray-200">COLLECTED DATA</h3>
                        
                            
                                
                                
                            <div className="flex flex-row justify-between border-b border-gray-200">
                            <DataDisplay
                                label="Imagery Data"
                                value="842 GB • 12,453 Files"
                                     width="w-1/2" 
                                    border={false}
                                />
                                <button className="text-[10px] mr-2 my-4 bg-black text-white px-2 py-1 rounded">
                                        Download
                                    </button>
                            </div>

                            <div className="flex flex-row justify-between border-b border-gray-200">
                            <DataDisplay
                                label="Telemetry Data"
                                value="358 GB • 8,234 Files"
                                     width="w-1/2" 
                                    border={false}
                                />
                                <button className="text-[10px] mr-2 my-4 bg-black text-white px-2 py-1 rounded">
                                        Download
                                    </button>
                            </div>

                                
                        
                    </div>

                    
                    {/* Duration and Cost Display */}
                
                    <div className="flex flex-row justify-between border-t border-gray-200">
                        <DataDisplay 
                            label="DURATION" 
                            value={`${formatDate(satellite.startDate)} - ${formatDate(satellite.endDate)}`}
                            width="w-1/2" 
                            border={true}
                            isDate={true}
                        />
                        <DataDisplay 
                            label="TOTAL COST" 
                            value={`$${satellite.totalCost}`}
                            width="w-1/2" 
                            border={false}
                        />
                    </div>
                </div>
            ) : (
                // Active Mission Content
                <>
                    {/* Map Section */}
                    <div className="relative flex-grow bg-gray-100">
                        {satMapData ? (
                            <Suspense fallback={<div className="w-full h-full bg-gray-100" />}>
                                <MapComponent satData={satMapData} mapStyle="simple" />
                            </Suspense>
                        ) : (
                            <div className="w-full h-full bg-gray-100 animate-pulse" />
                        )}
                        <div className="absolute bottom-2 left-2 text-white z-[999] bg-black/30 backdrop-blur-md rounded p-1.5">
                            <div className="text-[10px] opacity-90">CURRENT POSITION</div>
                            <div className="text-[10px]">
                                {satMapData ? 
                                    `${satMapData.positions[0].satlatitude.toFixed(2)}° N, ${satMapData.positions[0].satlongitude.toFixed(2)}° W` 
                                    : "Loading..."}
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 text-white text-right z-[999] bg-black/30 backdrop-blur-md rounded p-1.5">
                            <div className="text-[10px] opacity-90">ALTITUDE</div>
                            <div className="text-[10px]">
                                {satMapData ? 
                                    `${satMapData.positions[0].sataltitude.toFixed(2)} KM` 
                                    : "Loading..."}
                            </div>
                        </div>
                    </div>

                    {/* Console/Status Section */}
                    <div className="bg-white text-black">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 text-xs font-mono">
                            <button
                                onClick={() => setActiveView('status')}
                                className={`flex-1 px-2 py-1 transition-colors ${
                                    activeView === 'status'  
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                SYSTEM STATUS
                            </button>
                            <button
                                onClick={() => setActiveView('logs')}
                                className={`flex-1 px-2 py-1 transition-colors ${
                                    activeView === 'logs' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                LOGS
                            </button>
                        </div>

                        {/* Dynamic Content Based on Toggle */}
                        {activeView === 'status' ? (
                            // System Status View
                            <div className="flex flex-col flex-1">
                                {/* System Info View */}
                                

                                <div className="flex flex-row justify-between border-b border-gray-200">
                                    <DataDisplay 
                                        label="SYSTEM STATUS" 
                                        value='100%'
                                        width="w-1/2" 
                                        border={true} 
                                        data={stableSystemData}
                                    />
                                    <DataDisplay 
                                        label="SIGNAL STRENGTH" 
                                        value='70%'
                                        width="w-1/2" 
                                        border={false} 
                                        data={stableSignalData}
                                    />
                                </div>

                                <div className="flex flex-row justify-between">
                                    <DataDisplay 
                                        label="POWER LEVEL" 
                                        value='70%'
                                        width="w-1/2" 
                                        border={true} 
                                        data={stablePowerData}
                                    />
                                    <DataDisplay 
                                        label="TEMPERATURE" 
                                        value='50°C'
                                        width="w-1/2" 
                                        border={false} 
                                        data={stableTempData}
                                    />
                                </div>
                                <div className="flex flex-row justify-between border-t border-gray-200">
                                    <DataDisplay 
                                        label="DURATION" 
                                        value={`${formatDate(satellite.startDate)} - ${formatDate(satellite.endDate)}`}
                                        width="w-1/2" 
                                        border={true}
                                        isDate={true}
                                    />
                                    <DataDisplay 
                                        label="TIME LEFT" 
                                        value={`${calculateTimeLeftInHours(satellite.endDate)}H`} 
                                        width="w-1/2" 
                                        border={false} 
                                    />
                                </div>
                            </div>
                        ) : (
                            // Logs View
                            <div className="flex flex-col flex-1 h-[168px] overflow-hidden">
                                <div className="p-2 font-mono text-[10px] space-y-2 ">
                                    {satelliteLogs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-start space-x-2 text-gray-600"
                                        >
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {log.timestamp.toLocaleTimeString()}
                                            </span>
                                            <span className="flex-1">
                                                {log.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Mission Status Footer - Keeping as requested */}
            {/* <div className="p-2 border-t border-gray-200">
                <div className="grid grid-cols-2">
                    <div>
                        <span className="text-[10px] text-gray-500">
                            MISSION DURATION
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-semibold text-black">
                                {calculateDuration()}
                            </span>
                            <span className="text-xs text-gray-600">
                                DAYS
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                            {formatDate(satellite.startDate)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-500">
                            TOTAL COST
                        </span>
                        <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-lg font-semibold text-black">
                                ${satellite.totalCost}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                            {formatDate(satellite.endDate)}
                        </span>
                    </div>
                </div>
            </div> */}
        </div>
    );
});

export default ConfiguredSatCard;