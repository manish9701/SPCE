import React from 'react';
import { motion } from 'framer-motion';

interface InfoCardProps {
    name: string;
    onClose: () => void;
    costPerDay: { [key: string]: string };
    downlinkDataRate: { 
        Base: string;
        High: string;
    };
    DownlinkCost: { [key: string]: string };
    currentFleet: { 
        "In-Orbit": string;
        "Scheduled": string;
    };
    manufacturer: { [key: string]: string };
}

const InfoCard: React.FC<InfoCardProps> = ({ 
    name, 
    onClose, 
    costPerDay, 
    downlinkDataRate, 
    DownlinkCost,
    currentFleet, 
    manufacturer 
}) => {
    // Define all possible orbits
    const allOrbits = ['LEO',  'POLAR', 'SSO', 'GEO'];

    return (
        <div className="flex flex-col h-full bg-white text-black font-mono">   
            {/* Updated Header */}
            <div className="relative py-2 mb-4 border-b border-gray-200">
                {/* <div className="absolute inset-0 border-b border-gray-200"></div> */}
                <div className="relative flex justify-between items-center h-full">
                    <h2 className="text-base font-medium uppercase tracking-tight ml-2">{name}</h2>
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
            </div>

            <div className="px-4 space-y-6">
                {/* Costs Grid - Added min-height */}
                <div className="grid grid-cols-2 gap-4 min-h-[120px]">
                    <div className="space-y-1">
                        <p className="text-[10px] tracking-wider text-gray-400">ORBITAL COSTS</p>
                        {allOrbits.map((orbit) => (
                            <div key={orbit} 
                                className="group cursor-default border-b border-gray-200 py-1"
                            >
                                {costPerDay[orbit] ? (
                                    <>
                                        <div className="flex items-end gap-1">
                                            <span className="text-xl font-light">${costPerDay[orbit]}</span>
                                            <span className="text-[10px] mb-0.5">/day</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{orbit}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-end gap-1">
                                            <span className="text-xl font-light">----</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{orbit}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] tracking-wider text-gray-400 uppercase">Downlink Costs</p>
                        <div className="group cursor-default border-b border-gray-200 py-1">
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-light">${DownlinkCost.high}</span>
                                <span className="text-[10px] mb-0.5">/day</span>
                            </div>
                            <span className="text-xs text-gray-500">{downlinkDataRate.High}</span>
                        </div>
                        <div className="group cursor-default border-b border-gray-200 py-1">
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-light">{DownlinkCost.base}</span>
                                
                            </div>
                            <span className="text-xs text-gray-500">{downlinkDataRate.Base}</span>
                        </div>
                    </div>
                </div>

                {/* Fleet Status - Added min-height */}
                <div >
                    <p className="text-[10px] tracking-wider text-gray-400 mb-2">FLEET STATUS</p>
                    <div className="flex gap-4">
                        <div className="flex-1 relative overflow-hidden group">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-light">{currentFleet["In-Orbit"]}</span>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] block">ACTIVE</span>
                                    <span className="text-[10px] text-gray-500">SATELLITES</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        </div>
                        <div className="flex-1 relative overflow-hidden group">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-light">{currentFleet.Scheduled}</span>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] block">PLANNED</span>
                                    <span className="text-[10px] text-gray-500"> Q1 2025</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        </div>
                    </div>
                </div>

                {/* Manufacturers - Added min-height */}
                <div className="min-h-[100px]">
                    <p className="text-[10px] tracking-wider text-gray-400 mb-2">MANUFACTURERS</p>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(manufacturer).map(([name, logoPath]) => (
                            <div 
                                key={name}
                                className="group relative p-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <img 
                                    src={logoPath} 
                                    alt={name}
                                    className="h-6 w-full object-contain filter group-hover:brightness-110 transition-all duration-200"
                                />
                                <div className="absolute inset-0 border border-black border-opacity-0 group-hover:border-opacity-5 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
