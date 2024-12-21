import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SpaceWeatherData {
  scales: {
    observedMax: { R: any; S: any; G: any };
    latestObserved: { R: any; S: any; G: any };
    predicted: { R: any; S: any; G: any };
  };
  solarWindSpeed: string;
  solarWindMagneticFieldBt: string;
  solarWindMagneticFieldBz: string;
  radioFlux: string;
}

interface ApiResponse {
  Flux?: string;
  WindSpeed?: string;
  Bt?: string;
  Bz?: string;
  TimeStamp?: string;
}

const getColorForValue = (value: string): string => {
  switch (value.toLowerCase()) {
    case 'none': return '#93D04F';
    case 'minor': return '#F6EB14';
    case 'moderate': return '#FFC800';
    case 'strong': return '#FF9600';
    case 'severe': return '#FF0000';
    case 'extreme': return '#C80000';
    default: return '#808080';
  }
};

const ScaleIndicator: React.FC<{ letter: string; value: string; label: string }> = ({ letter, value, label }) => {
  const color = getColorForValue(label || 'none');
  return (
    <div className="flex items-center w-full" aria-label={`${letter}-scale indicator: ${label || 'None'}`}>
      <div className="w-8 h-6 flex items-center justify-center bg-white">
        <span style={{ color }} className="font-bold text-lg">{letter}{value || '0'}</span>
      </div>
      <div style={{ backgroundColor: color }} className="flex-grow h-4 flex items-center justify-end px-1">
        <span className="text-xs text-black">{label || 'None'}</span>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string | null; unit: string; border?: boolean }> = ({ label, value, unit, border = true }) => (
  <div className={`flex flex-col flex-grow px-2 py-1 ${border ? 'border-b border-gray-200' : ''} text-base font-semibold`} aria-label={`${label} information`}>
    <span className="text-[10px] font-normal text-gray-500 uppercase">{label}</span>
    {!value ? (
      <div className="animate-pulse h-6 bg-gray-200 rounded w-24" />
    ) : (
      <span className='text-sm font-semibold '>{value} {unit}</span>
    )}
  </div>
);

const SW: React.FC = () => {
  const [weatherData, setWeatherData] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceWeatherData = async () => {
      try {
        const [scalesData, solarWindSpeedData, solarWindMagFieldData, radioFluxData] = await Promise.all([
          axios.get<any>('https://services.swpc.noaa.gov/products/noaa-scales.json'),
          axios.get<ApiResponse>('https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'),
          axios.get<ApiResponse>('https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json'),
          axios.get<ApiResponse>('https://services.swpc.noaa.gov/products/summary/10cm-flux.json')
        ]);

        const scalesJson = scalesData.data;
        setWeatherData({
          scales: {
            observedMax: scalesJson['-1'] || {},
            latestObserved: scalesJson['0'] || {},
            predicted: scalesJson['1'] || {},
          },
          solarWindSpeed: solarWindSpeedData.data.WindSpeed || 'N/A',
          solarWindMagneticFieldBt: solarWindMagFieldData.data.Bt || 'N/A',
          solarWindMagneticFieldBz: solarWindMagFieldData.data.Bz || 'N/A',
          radioFlux: radioFluxData.data.Flux || 'N/A',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching space weather data:', err);
        setError('Failed to fetch space weather data');
        setLoading(false);
      }
    };

    fetchSpaceWeatherData();
  }, []);

  const renderScaleSection = (title: string, data: any) => (
    <div className="flex flex-col space-y-2 flex-1" aria-label={`${title} scales`}>
      <h3 className="font-bold">{title}</h3>
      <div className="space-y-2">
        <ScaleIndicator letter="R" value={data?.R?.Scale || '0'} label={data?.R?.Text || 'None'} />
        <ScaleIndicator letter="S" value={data?.S?.Scale || '0'} label={data?.S?.Text || 'None'} />
        <ScaleIndicator letter="G" value={data?.G?.Scale || '0'} label={data?.G?.Text || 'None'} />
      </div>
    </div>
  );

  if (loading) return (
    <div className='bg-white text-black border rounded-sm flex flex-col w-[16%]' aria-label="Loading space weather data">
      <h3 className="font-semibold p-2 border-b border-gray-200">SPACE WEATHER</h3>
      <div className="rounded-sm text-black flex flex-col flex-1 text-xs justify-between">
        <div className='flex flex-col p-2 flex-1'>
          {['24-Hour Observed Max', 'Latest Observed', 'Predicted'].map(title => renderScaleSection(title, {}))}
        </div>
        <div className="flex flex-col border-t border-gray-200">
          {[
            { label: "Solar Wind Speed", unit: "km/s" },
            { label: "Solar Magnetic Field", unit: "nT" },
            { label: "10.7cm Radio Flux", unit: "sfu" }
          ].map(({ label, unit }) => (
            <InfoRow key={label} label={label} value={null} unit={unit} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return <div aria-label="Error message">Error: {error}</div>;
  if (!weatherData) return <div aria-label="No data message">No space weather data available</div>;

  return (
    <div className='bg-white text-black  rounded-sm flex flex-col w-[16%]' aria-label="Space weather information">
      <h3 className="font-semibold p-2 border-b border-gray-200">SPACE WEATHER</h3>
      <div className="rounded-sm text-black flex flex-col flex-1 text-xs ">

        <div className='flex flex-col p-2 flex-1'>
          {renderScaleSection('24-Hour Observed Max', weatherData.scales.observedMax)}
          {renderScaleSection('Latest Observed', weatherData.scales.latestObserved)}
          {renderScaleSection('Predicted', weatherData.scales.predicted)}

          <div className='flex flex-col text-[8px] font-normal px-2 text-gray-400 uppercase'>
            <span>R:Radio Blackout</span>
            <span>S:Solar Radiation Storms</span>
            <span>G:Geomagnetic Storms</span>
          </div>
        </div>

        <div className="flex flex-col border-t border-gray-200">
          <InfoRow label="Solar Wind Speed" value={weatherData.solarWindSpeed} unit="km/s" border={true} />
          <InfoRow 
            label="Solar Magnetic Field" 
            value={`Bt: ${weatherData.solarWindMagneticFieldBt}, Bz: ${weatherData.solarWindMagneticFieldBz}`} 
            unit="nT" 
            border={true}
          />
          <InfoRow label="10.7cm Radio Flux" value={weatherData.radioFlux} unit="sfu" border={false} />
        </div>
      </div>
    </div>
  );
};

export default SW;