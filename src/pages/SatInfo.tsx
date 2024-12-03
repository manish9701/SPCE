import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams to get the category from the URL and useNavigate for navigation
import SatCard from '../components/Common/Satcard';
import BackButton from '../components/Common/Backbutton'; // Import the BackButton component
import SatConfirm from './satconfirm';
import { DateRange } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';

interface BillingInfo {
	selectedOrbit: string;
	selectedDownlinkRate: string;
	dateRange?: DateRange;
	duration: number;
	totalCost: number;
	
}

interface NoradIDs {
	LEO: number[];
	SSO: number[];
	GEO: number[];
	Polar: number[];
}

const SatInfo: React.FC = () => {
	const { category } = useParams<{ category: string }>(); // Get the category from the URL
	const [satelliteData, setSatelliteData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const [selectedSatellite, setSelectedSatellite] = useState<any>(null);
	const [billingInfo, setBillingInfo] = useState<BillingInfo>({
		selectedOrbit: '',
		selectedDownlinkRate: '',
		dateRange: undefined,
		duration: 0,
		totalCost: 0
	});
	const [error, setError] = useState<string>('');
	const [isHovered, setIsHovered] = useState(false);
	const [noradIds, setNoradIds] = useState<NoradIDs | null>(null);

	const handleBillingUpdate = (info: BillingInfo) => {
		setBillingInfo(info);
	};

	useEffect(() => {
		const fetchSatelliteData = async () => {
			try {
				const response = await fetch('http://localhost:3005/satellites');
				const data = await response.json();
				
				// Store NoradID data for the current category
				if (category && data[category]?.NoradID) {
					setNoradIds(data[category].NoradID);
				}

				if (category) {
					const categoryData = data[category];
					if (categoryData) {
						setSatelliteData(Object.entries(categoryData)
							.filter(([key]) => key !== 'image' && key !== 'Description' && key !== 'NoradID')
							.map(([name, details]) => 
								(typeof details === 'object' ? { name, ...details } : { name })
							));
					}
				}
			} catch (error) {
				console.error('Error fetching satellite data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchSatelliteData();
	}, [category]);

	const getRandomNoradId = (orbit: string): number | null => {
		if (!noradIds) {
			console.log('No NORAD IDs available for', category);
			return null;
		}
		
		const orbitKey = orbit as keyof NoradIDs;
		if (!noradIds[orbitKey]) {
			console.log('No matching orbit found for:', orbit);
			return null;
		}

		const ids = noradIds[orbitKey];
		const randomId = ids[Math.floor(Math.random() * ids.length)];
		console.log(`Selected NORAD ID for ${orbit} in ${category}:`, randomId);
		return randomId;
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!satelliteData.length) {
		return <div>No satellites found for this category.</div>; // Handle case where no data is found
	}

	const handleSelect = () => {
		if (!billingInfo.selectedOrbit || !billingInfo.selectedDownlinkRate || !billingInfo.dateRange) {
			setError('Please select an orbit, downlink rate, and date range before confirming.');
			return;
		}

		// Get NORAD ID for the selected orbit from the current category
		const noradId = noradIds ? getRandomNoradId(billingInfo.selectedOrbit) : null;
		
		// Create dates for comparison, using UTC to avoid timezone issues
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const startDate = new Date(billingInfo.dateRange?.from || today);
		startDate.setHours(0, 0, 0, 0);

		const newSatellite = {
			id: crypto.randomUUID(),
			noradId: noradId,
			name: selectedSatellite.name,
			type: category,
			orbit: billingInfo.selectedOrbit,
			downlinkRate: billingInfo.selectedDownlinkRate,
			DownlinkCost: selectedSatellite.DownlinkCost,
			startDate: billingInfo.dateRange.from,
			endDate: billingInfo.dateRange.to,
			totalCost: billingInfo.totalCost
		};

		// Get existing satellites from localStorage
		const existingSatellites = JSON.parse(localStorage.getItem('configuredSatellites') || '[]');
		
		// Add new satellite
		localStorage.setItem('configuredSatellites', JSON.stringify([...existingSatellites, newSatellite]));

		// If start date is today, set as active satellite and go to dashboard
		if (startDate.getTime() === today.getTime()) {
			if (noradId) {
				localStorage.setItem('activeSatelliteNoradId', noradId.toString());
			}
			navigate('/dashboard');
		} else {
			// If future date, go to fleet view
			navigate('/yourfleet');
		}
	};

	return (
		<div className="flex flex-col p-2 h-full bg-black">
			<h1 className="font-mono text-xl font-medium flex items-center mb-2 text-white">
				<BackButton /> 
				{category} Satellites
			</h1>

			<div className="flex flex-grow w-full h-full">
				<div className="flex-grow bg-zinc-200 p-2 rounded-sm mr-4 w-4/5 h-full relative">
					<div className="flex flex-row gap-2 w-full h-full">
						{satelliteData
							.filter(satellite => satellite.name && satellite.Image)
							.map((satellite) => (
								<SatCard
									key={satellite.name}
									name={satellite.name}
									image={satellite.Image}
									orbitType={satellite.OrbitType}
									resolution={satellite.Resolution}
									swathWidth={satellite.SwathWidth}
									spectralBands={satellite.SpectralBands}
									dataDelivery={satellite.DataDelivery}
									instrumentType={satellite.InstrumentType}
									applications={satellite.Applications}
									onSelect={() => setSelectedSatellite(satellite)}
									downlinkDataRate={satellite.downlinkDataRate}
									DownlinkCost={satellite.DownlinkCost}
									costPerDay={satellite.CostPerDay}
									currentFleet={satellite.CurrentFleet}
									manufacturer={satellite.Manufacturer}
								/>
							))}
					</div>
					{selectedSatellite && (
						<div className="absolute inset-0 w-full h-full">
							<SatConfirm
								satellite={selectedSatellite}
								onClose={() => setSelectedSatellite(null)}
								onBillingUpdate={handleBillingUpdate}
							/>
						</div>
					)}
				</div>
				
				<div className="w-1/5">
					{!selectedSatellite ? (
						<div className="flex flex-col h-full justify-between">
							<p className="text-sm text-justify text-white">
								Our Earth observation satellites are equipped with high-resolution imaging and advanced sensors, ideal for monitoring environmental changes, disaster management, agriculture, urban planning, and climate studies. Utilize these satellites to capture detailed imagery and valuable data from space, empowering you to make informed decisions and drive impactful projects.
							</p>
							<div 
								className="relative"
								onMouseEnter={() => setIsHovered(true)}
								onMouseLeave={() => setIsHovered(false)}
							>
								<AnimatePresence>
									{isHovered && (
										<motion.div 
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 200, opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3, ease: "easeOut" }}
											className="absolute bottom-full left-0 w-full overflow-hidden"
										>
											<img 
												src="/images/ve1.png" 
												alt="Custom Solution" 
												className="w-full object-cover"
												style={{ height: '200px' }}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
										</motion.div>
									)}
								</AnimatePresence>
								<button 
									onClick={handleSelect}
									className={`
										bg-white text-black text-sm p-2 font-mono w-full 
										transition-all duration-300 relative z-10
										${isHovered ? 'bg-opacity-0 text-white hover:bg-opacity-0' : 'hover:bg-zinc-700 hover:text-white'}
									`}
								>
									looking for custom solution?
								</button>
							</div>
						</div>
					) : (
						<div id="pricing" className="flex flex-col justify-between h-full text-white text-sm">
							<div>
								<h2 className="text-xl font-bold mb-4">Billing Summary</h2>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Selected Orbit:</span>
										<span className="font-medium">{billingInfo.selectedOrbit || 'Not selected'}</span>
									</div>
									<div className="flex justify-between">
										<span>Downlink Rate:</span>
										<span className="font-medium">{billingInfo.selectedDownlinkRate || 'Not selected'}</span>
									</div>
									<div className="flex justify-between">
										<span>Duration:</span>
										<span className="font-medium">{billingInfo.duration} days</span>
									</div>
									<div className="flex justify-between">
										<span>Start Date:</span>
										<span className="font-medium">
											{billingInfo.dateRange?.from?.toDateString() || 'Not selected'}
										</span>
									</div>
									<div className="flex justify-between">
										<span>End Date:</span>
										<span className="font-medium">
											{billingInfo.dateRange?.to?.toDateString() || 'Not selected'}
										</span>
									</div>
									
									<div className="border-t border-gray-600 my-2 pt-2">
										<div className="flex justify-between text-lg font-semibold">
											<span>Total Cost :</span>
											<span>${billingInfo.totalCost.toFixed(2)}</span>
										</div>
									</div>
								</div>
								{error && (
									<div className="text-red-500 text-sm mt-2">
										{error}
									</div>
								)}
								
							</div>
							<div className="mt-auto">
								<div className="text-xs text-gray-400 mb-4">
									By confirming this configuration, you agree to our Terms and Conditions, including data usage policies and service agreements.
									<a href="/terms" className="text-blue-400 hover:text-blue-300 ml-1">
										View Terms
									</a>
								</div>
								<button 
									onClick={handleSelect}
									className="relative group overflow-hidden bg-white text-black hover:text-white font-mono text-sm p-2 w-full transition-colors"
								>
									<div 
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										style={{
											backgroundImage: 'url(/images/confirm.gif)',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											backgroundRepeat: 'repeat',
										}}
									/>
									<span className="relative z-10">Confirm Selection</span>
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SatInfo;