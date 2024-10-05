import React, { useEffect, useState } from 'react';
import { useSatelliteOnboardData } from './OnboardData/SatonboardData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import SatelliteOrientation from './OnboardData/SatOrientation';
import CommsData from './commsdata';

const OnboardData: React.FC = () => {
  const {surfaceTemperature, internalTemperature, batteryLevel, solarPanelEfficiency, powerOutput } = useSatelliteOnboardData();

  // State to hold chart data
  const [tempData, setTempData] = useState<any[]>([]);
  const [powerData, setPowerData] = useState<any[]>([]);

  // Function to add new data points
  const addDataPoint = (data: any[], values: number[]) => {
    const newDataPoint = { 
      time: data.length,
      ...values.reduce((acc, val, index) => ({ ...acc, [`value${index}`]: val }), {})
    };
    const updatedData = [...data, newDataPoint];
    return updatedData.length > 20 ? updatedData.slice(updatedData.length - 20) : updatedData;
  };

  // Update chart data on value change
  useEffect(() => {
    setTempData(prev => addDataPoint(prev, [surfaceTemperature, internalTemperature]));
    setPowerData(prev => addDataPoint(prev, [batteryLevel, solarPanelEfficiency, powerOutput]));
  }, [surfaceTemperature, internalTemperature, batteryLevel, solarPanelEfficiency, powerOutput]);

  const DataDisplay: React.FC<{ label: string; value: number; unit: string; width: string; border: boolean }> = ({ label, value, unit, width, border }) => (
    <div className={`flex flex-col flex-grow p-2 ${border ? 'border-r border-gray-200' : ''} ${width}`}>
      <div className='flex flex-col text-xs font-semibold'>{label}</div>
      <span className='text-xl font-semibold'>{value}{unit}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-sm text-black flex flex-col border border-gray-200">
      <div className="flex justify-between items-center border-b border-gray-200 p-2">
        <span className="font-semibold ">ONBOARD DATA</span>
        <div className="flex space-x-2 items-center">
          <span className="text-green-600 text-xs">STATUS - 100%</span>
          <button className="bg-black text-white rounded-full p-2">
            {/* SVG icon */}
          </button>
        </div>
      </div>

      <div className='flex flex-row border-b border-gray-200 h-1/2 w-full'>
        <div id='temp' className='border-r border-gray-200 flex-grow w-1/2'>
          <div className='flex flex-col h-full'>
            <div className='flex flex-row justify-between border-b border-gray-200'>
              <DataDisplay label="Surface Temp." value={surfaceTemperature} unit="°C" width="w-1/2" border={true} />
              <DataDisplay label="Internal Temp." value={internalTemperature} unit="°C" width="w-1/2" border={false} />
            </div>
            <div className='flex-grow p-2'>
              <ResponsiveContainer>
                <LineChart data={tempData}>
                  <Line type="monotone" dataKey="value0" stroke="yellow" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="value1" stroke="blue" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div id='power' className='flex-grow w-1/2'>
          <div className='flex flex-col h-full'>
            <div className='flex flex-row justify-between border-b border-gray-200'>
              <DataDisplay label="Battery" value={batteryLevel} unit="%" width="w-1/3" border={true} />
              <DataDisplay label="Solar" value={solarPanelEfficiency} unit="%" width="w-1/3" border={true} />
              <DataDisplay label="Output" value={powerOutput} unit="W" width="w-1/3" border={false} />
            </div>
            <div className='flex-grow p-2'>
              <ResponsiveContainer>
                <LineChart data={powerData}>
                  <Line type="monotone" dataKey="value0" stroke="pink" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="value1" stroke="green" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="value2" stroke="orange" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-row h-1/2 w-full'>
        <SatelliteOrientation />
        <CommsData />
      </div>
    </div>
  );
};

export default OnboardData;
