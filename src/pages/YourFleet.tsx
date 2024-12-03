import React, { useState, useEffect } from 'react';
import ConfiguredSatCard from '../components/Common/ConfiguredSatCard';
import {  FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Navbar Components
/* const SearchBar = () => (
    <div className="flex items-center bg-gray-100 h-6 px-2 rounded-sm">
        <FiSearch className="w-3 h-3 text-gray-400" />
        <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[10px] w-24 focus:outline-none px-2"
        />
    </div>
); */

const FilterButtons = ({ filter, setFilter }: { 
    filter: 'all' | 'active'  |'scheduled' | 'completed',
    setFilter: (filter: 'all' | 'active' |'scheduled' |  'completed') => void 
}) => (
    <div className="flex h-6 bg-gray-100 rounded-sm p-0.5">
        {['all','active', 'scheduled',  'completed'].map((filterType) => (
            <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`relative px-2 h-full text-[10px] font-medium transition-colors rounded-sm ${
                    filter === filterType 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:text-black'
                }`}
            >
                {filterType.toUpperCase()}
                {filter === filterType && (
                    <div className="absolute inset-0 bg-black -z-10 rounded-sm" />
                )}
            </button>
        ))}
    </div>
);

const Pagination = ({ currentPage, totalPages, setCurrentPage }: {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (direction: number) => void;
}) => (
    <div className="flex items-center gap-2 ">
        <button
            onClick={() => setCurrentPage(-1)}
            disabled={currentPage === 0}
            className="group h-6 p-1.5 bg-black text-white text-[10px] font-medium disabled:bg-gray-300 rounded-sm flex items-center gap-1"
        >
            <FiChevronLeft size={16}/>
            <span className="hidden group-hover:inline">PREV</span>
        </button>
        <span className="text-[10px] font-medium text-gray-500">
            {currentPage + 1}/{totalPages}
        </span>
        <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === totalPages - 1}
            className="group h-6 p-1.5 bg-black text-white text-[10px] font-medium disabled:bg-gray-300 rounded-sm flex items-center gap-1"
        >
            <span className="hidden group-hover:inline">NEXT</span>
            <FiChevronRight size={16}/>
        </button>
    </div>
);

const ClearFleetButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="h-6 px-3  text-[10px] font-medium rounded-sm flex items-center gap-1 group hover:bg-red-500 hover:text-white"
    >
    
        <span className="hidden group-hover:inline">CLEAR FLEET</span>
    </button>
);

// Main Component
const YourFleet: React.FC = () => {
    const [satellites, setSatellites] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');

    useEffect(() => {
        localStorage.removeItem('activeSatelliteNoradId');
        const configuredSats = JSON.parse(localStorage.getItem('configuredSatellites') || '[]');
        setSatellites([...configuredSats].reverse());
    }, []);

    const handleClearFleet = () => {
        if (window.confirm('Are you sure you want to clear your entire fleet?')) {
            localStorage.removeItem('configuredSatellites');
            localStorage.removeItem('activeSatelliteNoradId');
            setSatellites([]);
        }
    };

    const filteredSatellites = satellites.filter(sat => {
        if (filter === 'all') return true;
        const now = new Date();
        const start = new Date(sat.startDate);
        const end = new Date(sat.endDate);
        
        switch(filter) {
            case 'scheduled':
                return start > now;
            case 'active':
                return now >= start && now <= end;
            case 'completed':
                return now > end;
            default:
                return true;
        }
    });

    const totalPages = Math.ceil(filteredSatellites.length / 4);
    const currentSatellites = filteredSatellites.slice(currentPage * 4, (currentPage + 1) * 4);

    // Updated paginate function
    const paginate = (newDirection: number) => {
        if (
            (currentPage === 0 && newDirection === -1) || 
            (currentPage === totalPages - 1 && newDirection === 1)
        ) return;
        
        setCurrentPage(prev => prev + newDirection);
    };

    return (
        <div className="flex flex-col h-full w-full p-2 ">
            <div className="flex-grow bg-zinc-200 p-2 rounded-sm">
                {/* Simplified Cards Container without animations */}
                <div className="h-[calc(100%-2.5rem)]">
                    <div className="h-full">
                        <div className="grid grid-cols-4 gap-2 h-full text-black">
                            {currentSatellites.map((satellite) => (
                                <div 
                                    key={satellite.id}
                                    className="h-full"
                                >
                                    <ConfiguredSatCard satellite={satellite} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Navbar - keeping button animations */}
                <div 
                    className="flex items-center justify-between bg-white h-8 px-1 mt-2 rounded-sm shadow-sm"
                >
                    <div className="w-1/4">
                        {satellites.length > 0 && <ClearFleetButton onClick={handleClearFleet} />}
                    </div>
                    
                    <div className="flex-1 flex justify-center">
                        <FilterButtons filter={filter} setFilter={setFilter} />
                    </div>
                    
                    <div className="w-1/4 flex justify-end">
                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                setCurrentPage={paginate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YourFleet;
