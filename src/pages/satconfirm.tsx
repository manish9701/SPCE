import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import BackButton from '../components/Common/Backbutton';
import Calender from '../components/Common/Calender';
import 'react-day-picker/dist/style.css';
import SatConfigSelector from '../components/Common/SatConfigSelector';
import { differenceInDays } from 'date-fns';


const SatConfirm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { satellite } = location.state as { satellite: any };
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

    const handleSelect = () => {
        if (!selectedOrbit || !selectedDownlinkRate || !dateRange) {
            setError('Please select an orbit, downlink rate, and date range before confirming.');
            return;
        }
        console.log('Selected Date Range:', dateRange);
        console.log('Selected Orbit:', selectedOrbit);
        console.log('Selected Downlink Rate:', selectedDownlinkRate);
        console.log('Total Cost:', totalCost);
        navigate('/dashboard');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col p-4 h-full">
            <h1 className="font-mono text-xl font-medium flex items-center mb-4">
                <BackButton />
                {satellite?.name} Satellite Configuration
            </h1>

            <div className="flex flex-grow w-full h-full">
                <div className="flex-grow bg-zinc-200 p-2 rounded-sm mr-4 w-4/5 h-full">
                    <div className="flex flex-row gap-2 w-full h-full">
                        <div className="w-1/2 h-full flex flex-col">
                            <SatConfigSelector
                                satellite={satelliteConfig}
                                selectedOrbit={selectedOrbit}
                                setSelectedOrbit={handleOrbitChange}
                                selectedDownlinkRate={selectedDownlinkRate}
                                setSelectedDownlinkRate={handleDownlinkRateChange}
                                downlinkRates={satelliteConfig?.downlinkRates || []}
                                error={error} // Pass the error prop here
                            />
                        </div>
                        <div className="bg-white text-black p-4 rounded-sm flex-1 w-1/2">
                            <Calender 
                                onChange={handleDateRangeChange}
                                value={dateRange}
                                disabled={!selectedOrbit || !selectedDownlinkRate} // Add this line
                                onDisabledClick={handleCalendarDisabledClick} // Add this line
                            />
                        </div>
                    </div>
                </div>
                <div id="pricing" className="flex flex-col justify-between w-1/5 text-white text-sm">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Billing Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Selected Orbit:</span>
                                <span className="font-medium">{selectedOrbit || 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Downlink Rate:</span>
                                <span className="font-medium">{selectedDownlinkRate || 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-medium">{getDaysInRange(dateRange)} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date Range:</span>
                                <span className="font-medium">
                                    {dateRange?.from?.toDateString()} - {dateRange?.to?.toDateString() || 'Not selected'}
                                </span>
                            </div>
                            <div className="border-t border-gray-600 my-2 pt-2">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total Cost:</span>
                                    <span>${totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs mb-4">
                            Our Earth observation satellites are equipped with high-resolution imaging and advanced sensors, ideal for monitoring environmental changes, disaster management, agriculture, urban planning, and climate studies.
                        </p>
                        <button 
                            onClick={handleSelect} 
                            className="bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 transition-colors duration-200"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatConfirm;
