import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get the category from the URL
import SatCard from '../components/Common/Satcard';
import BackButton from '../components/Common/Backbutton'; // Import the BackButton component
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const SatInfo: React.FC = () => {
	const { category } = useParams<{ category: string }>(); // Get the category from the URL
	const [satelliteData, setSatelliteData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate(); // Get the navigate function for navigation

	

	useEffect(() => {
		const fetchSatelliteData = async () => {
			try {
				const response = await fetch('http://localhost:3005/satellites'); // Fetch all satellites
				const data = await response.json();
				
				// Get the satellites for the selected category
				if (category) { // Check if category is defined
					const categoryData = data[category];
					if (categoryData) {
						setSatelliteData(Object.entries(categoryData).map(([name, details]) => 
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

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!satelliteData.length) {
		return <div>No satellites found for this category.</div>; // Handle case where no data is found
	}

	return (
		<div className="flex flex-col p-4 h-full ">
			<h1 className="font-mono text-xl font-medium flex items-center mb-4 ">
				<BackButton /> 
				{category} Satellites
			</h1>

			<div className=" flex flex-grow w-full h-full"> {/* Main container */}
				<div className="flex-grow bg-zinc-200 p-2 rounded-sm mr-4 w-4/5 h-full "> 
					<div className="flex flex-row gap-2 w-full h-full"> 
						{satelliteData
							.filter(satellite => satellite.name && satellite.Image) 
							.map((satellite) => ( // Iterate over satelliteData
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
									onSelect={() => navigate('/satconfirm', { state: { satellite }})} // Navigate to SatConfirm
								/>
							))}
					</div>
				</div>
				
				<div  className="flex flex-col justify-between w-1/5  text-white text-sm text-justify"> 
					<p > 
					Our Earth observation satellites are equipped with high-resolution imaging and advanced sensors, ideal for monitoring environmental changes, disaster management, agriculture, urban planning, and climate studies. Utilize these satellites to capture detailed imagery and valuable data from space, empowering you to make informed decisions and drive impactful projects. 
					</p>
					<button  className="bg-white text-black p-2 rounded-sm w-full">
							Confirm Selection
						</button>
				</div>
			</div>
		</div>
	);
};

export default SatInfo;
