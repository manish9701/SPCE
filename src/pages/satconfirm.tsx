import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import Calender from '../components/Common/Calender';
import 'react-day-picker/dist/style.css';
import SatConfigSelector from '../components/Common/SatConfigSelector';
import { differenceInDays } from 'date-fns';
/* import { ReactComponent as Closebutton } from '../../src/assets/close_small.svg'; */
import { motion } from 'framer-motion';

interface BillingInfo {
    selectedOrbit: string;
    selectedDownlinkRate: string;
    dateRange?: DateRange;
    duration: number;
    totalCost: number;
}

interface SatConfirmProps {
    satellite: any;
    onClose: () => void;
    onBillingUpdate: (info: BillingInfo) => void;
}

const SatConfirm: React.FC<SatConfirmProps> = ({ satellite, onClose, onBillingUpdate }) => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [satelliteConfig, setSatelliteConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrbit, setSelectedOrbit] = useState<string>('');
    const [selectedDownlinkRate, setSelectedDownlinkRate] = useState<string>('');
    const [totalCost, setTotalCost] = useState<number>(0);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSatelliteConfig = async () => {
            try {
                const response = await fetch('http://localhost:3005/satellites');
                const data = await response.json();
                const category = Object.keys(data).find(cat => 
                    Object.keys(data[cat]).includes(satellite.name)
                );
                if (category) {
                    setSatelliteConfig(data[category][satellite.name]);
                }
            } catch (error) {
                console.error('Error fetching satellite configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSatelliteConfig();
    }, [satellite.name]);

    const calculateCost = (orbit: string, downlinkRate: string, range: DateRange | undefined) => {
        if (!satelliteConfig || !range || !range.from || !range.to) return 0;

        let cost = 0;
        const orbitCost = satelliteConfig.CostPerDay[orbit];
        const downlinkCost = satelliteConfig.DownlinkCost[downlinkRate.toLowerCase()];

        const days = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (orbitCost) {
            cost += parseFloat(orbitCost) * days;
        }

        if (downlinkCost && downlinkCost !== "included") {
            cost += parseFloat(downlinkCost) * days;
        }

        return cost;
    };

    const getDaysInRange = (range: DateRange | undefined) => {
        if (!range || !range.from || !range.to) return 0;
        return differenceInDays(range.to, range.from) + 1;
    };

    const handleOrbitChange = (orbit: string) => {
        setSelectedOrbit(orbit);
        setTotalCost(calculateCost(orbit, selectedDownlinkRate, dateRange));
        setError('');
    };

    const handleDownlinkRateChange = (rate: string) => {
        setSelectedDownlinkRate(rate);
        setTotalCost(calculateCost(selectedOrbit, rate, dateRange));
        setError('');
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (!selectedOrbit || !selectedDownlinkRate) {
            setError('Please select an orbit and downlink rate before choosing dates.');
            return;
        }
        setDateRange(range);
        setTotalCost(calculateCost(selectedOrbit, selectedDownlinkRate, range));
    };

    const handleCalendarDisabledClick = () => {
        setError('Please select an orbit and downlink rate before choosing dates.');
    };
    

    // Update billing info whenever relevant values change
    useEffect(() => {
        onBillingUpdate({
            selectedOrbit,
            selectedDownlinkRate,
            dateRange,
            duration: getDaysInRange(dateRange),
            totalCost
        });
    }, [selectedOrbit, selectedDownlinkRate, dateRange, totalCost, onBillingUpdate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="absolute inset-0 bg-zinc-200 p-2 rounded-sm w-full h-full flex flex-col">
            <div className="flex   justify-between items-center py-2  bg-white text-black border-b border-gray-200">
                
                    <h1 className=" text-base font-medium uppercase tracking-tight ml-2 ">
                        {satellite?.name} Configuration
                    </h1>
                    <motion.button 
                        onClick={onClose}
                        className="bg-black text-white h-8 w-8 text-xs font-mono rounded-sm hover:bg-red-500 transition-colors mr-2 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-white rotate-45" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 4v16m8-8H4" 
                            />
                        </svg>
                    </motion.button>
                
            </div>

            <div className="flex   w-full h-full flex-1 ">
                <div className="w-1/2 h-full bg-white  p-4 border-r border-gray-200 ">
                    <SatConfigSelector
                        satellite={satelliteConfig}
                        selectedOrbit={selectedOrbit}
                        setSelectedOrbit={handleOrbitChange}
                        selectedDownlinkRate={selectedDownlinkRate}
                        setSelectedDownlinkRate={handleDownlinkRateChange}
                        downlinkRates={satelliteConfig?.downlinkRates || []}
                        error={error}
                    />
                </div>
                <div className="w-1/2 h-full bg-white p-4 ">
                    <Calender 
                        onChange={handleDateRangeChange}
                        value={dateRange}
                        disabled={!selectedOrbit || !selectedDownlinkRate}
                        onDisabledClick={handleCalendarDisabledClick}
                    />
                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SatConfirm;