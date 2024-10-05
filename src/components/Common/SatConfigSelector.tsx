import React from 'react';

interface SatConfigSelectorProps {
	satellite: any;
	selectedOrbit: string;
	setSelectedOrbit: (orbit: string) => void;
	downlinkRates: string[];
	selectedDownlinkRate: string;
	setSelectedDownlinkRate: (rate: string) => void;
	error: string; // Add this line to include the error prop
}

const SatConfigSelector: React.FC<SatConfigSelectorProps> = ({ 
	satellite, 
	selectedOrbit, 
	setSelectedOrbit,
	selectedDownlinkRate,
	setSelectedDownlinkRate,
	error // Add this line to destructure the error prop
}) => {
	if (!satellite) return null;

	const orbitTypes = satellite.OrbitType 
		? satellite.OrbitType.split(',').map((orbit: string) => orbit.trim().toUpperCase())
		: [];

	const downlinkRates = satellite.downlinkDataRate || {};
	const costPerDay = satellite.CostPerDay || {};
	const DownlinkCost = satellite.DownlinkCost || {};

	return (
		<div className="bg-white p-4 rounded-sm text-black flex flex-col h-full">
			<div className='flex flex-col w-full h-1/2 justify-between items-center mb-4'>
				<img src={satellite.Image} alt={satellite.name} className="w-1/2 h-full object-contain " />
				<h2 className="text-base text-black font-medium uppercase w-1/2 text-center">{satellite?.name}</h2>
			</div>

			<div className="flex flex-col justify-between text-xs w-full h-1/2">
				<div>
					<h3 className="font-semibold mt-2">Select Orbit:</h3>
					<p className="text-xs text-gray-500 mb-2">*LEO: ${costPerDay.LEO}/day, SSO: ${costPerDay.SSO}/day</p>
					<div className="flex rounded-full overflow-hidden border border-gray-300">
						{orbitTypes.map((orbit: string, index: number) => (
							<button
								key={orbit}
								onClick={() => setSelectedOrbit(orbit)}
								className={`flex-1 py-2 ${
									selectedOrbit === orbit 
										? 'bg-black text-white' 
										: 'bg-white text-black'
								} ${index !== 0 ? 'border-l border-gray-300' : ''}`}
							>
								{orbit}
							</button>
						))}
					</div>

					<h3 className="font-semibold mt-4">Downlink data rate:</h3>
					<p className="text-xs text-gray-500 mb-2">*Base: {DownlinkCost.base}, High: ${DownlinkCost.high}/day</p>
					<div className="flex rounded-full overflow-hidden border border-gray-300">
						<button
							onClick={() => setSelectedDownlinkRate('High')}
							className={`flex-1 py-2 ${
								selectedDownlinkRate === 'High' 
									? 'bg-black text-white' 
									: 'bg-white text-black'
							}`}
						>
							High - {downlinkRates.High}
						</button>
						<button
							onClick={() => setSelectedDownlinkRate('Base')}
							className={`flex-1 py-2 border-l border-gray-300 ${
								selectedDownlinkRate === 'Base' 
									? 'bg-black text-white' 
									: 'bg-white text-black'
							}`}
						>
							Base - {downlinkRates.Base}
						</button>
					</div>
				</div>
				
				{/* Add the error message here */}
				{error && (
					<div className="mt-4 text-red-500 text-xs">
						 {error}
					</div>
				)}
			</div>
		</div>
	);
};

export default SatConfigSelector;
