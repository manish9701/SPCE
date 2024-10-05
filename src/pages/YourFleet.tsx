import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Satellite {
  id: string;
  name: string;
  type: string;
  rentalPeriod: string;
  workingCondition: string;
  creditsLeft: number;
  statusData: { time: number; value: number }[];
  logs: string[];
}

const fakeSatellites: Satellite[] = [
  {
    id: '1',
    name: 'MicroSat-1',
    type: 'Earth Observation',
    rentalPeriod: '3 months',
    workingCondition: 'Optimal',
    creditsLeft: 5000,
    statusData: Array.from({ length: 10 }, (_, i) => ({ time: i, value: Math.random() * 100 })),
    logs: ['[2023-04-15 08:30:22] Orbit adjusted', '[2023-04-15 09:15:43] Image captured', '[2023-04-15 10:02:11] Data transmitted'],
  },
  // ... Add similar data for other satellites
];

const YourFleet: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Fleet</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {fakeSatellites.map((satellite) => (
          <div key={satellite.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">{satellite.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  satellite.workingCondition === 'Optimal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {satellite.workingCondition}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-lg font-semibold text-gray-800">{satellite.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rental Period</p>
                  <p className="text-lg font-semibold text-gray-800">{satellite.rentalPeriod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Credits Left</p>
                  <p className="text-lg font-semibold text-gray-800">{satellite.creditsLeft}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Status</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={satellite.statusData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Logs</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md h-32 overflow-y-auto font-mono text-sm">
                  {satellite.logs.map((log, index) => (
                    <p key={index}>{log}</p>
                  ))}
                </div>
              </div>
              
              <Link 
                to={`/satellite/${satellite.id}`} 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Link 
        to="/dashboard" 
        className="inline-block mt-8 bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition duration-300"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default YourFleet;
