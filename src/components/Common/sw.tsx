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
    <div className="flex items-center w-full">
      <div className="w-8 h-6 flex items-center justify-center bg-white">
        <span style={{ color }} className="font-bold text-lg">{letter}{value || '0'}</span>
      </div>
      <div style={{ backgroundColor: color }} className="flex-grow h-4 flex items-center justify-end px-1 ">
        <span className="text-xs text-black">{label || 'None'}</span>
      </div>
    </div>
  );
};

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

  const renderScaleIndicators = (scaleData: any) => {
    if (!scaleData || !scaleData.R || !scaleData.S || !scaleData.G) {
      return <div>Data not available</div>;
    }
    return (
      <div className="flex flex-col space-y-2">
        <ScaleIndicator letter="R" value={scaleData.R.Scale || '0'} label={scaleData.R.Text || 'None'} />
        <ScaleIndicator letter="S" value={scaleData.S.Scale || '0'} label={scaleData.S.Text || 'None'} />
        <ScaleIndicator letter="G" value={scaleData.G.Scale || '0'} label={scaleData.G.Text || 'None'} />
      </div>
    );
  };

  if (loading) return <div>Loading space weather data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weatherData) return <div>No space weather data available</div>;

  return (
    <div className=' bg-white  text-black  border rounded-sm p-2 flex flex-col w-[16%]'> 
      <h3 className="font-semibold mb-2">SPACE WEATHER CONDITIONS 
        <span className='text-xs font-light'> BY NOAA</span>
      </h3>
      <div className="rounded-sm text-black flex flex-col text-xs space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold">24-Hour Observed Max</h3>
          {renderScaleIndicators(weatherData.scales.observedMax)}
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold">Latest Observed</h3>
          {renderScaleIndicators(weatherData.scales.latestObserved)}
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold">Predicted</h3>
          {renderScaleIndicators(weatherData.scales.predicted)}
        </div>
        <div className="h-px bg-gray-300"></div>
        <div className="flex flex-col space-y-2">
          <div>
            <span className="font-bold">Solar Wind Speed:</span> {weatherData.solarWindSpeed} km/s
          </div>
          <div>
            <span className="font-bold">Solar Wind Magnetic Field:</span>
            <br />
            Bt: {weatherData.solarWindMagneticFieldBt} nT, 
            Bz: {weatherData.solarWindMagneticFieldBz} nT
          </div>
          <div>
            <span className="font-bold">10.7cm Radio Flux:</span> {weatherData.radioFlux} sfu
          </div>
        </div>
      </div>
    </div>
  );
};

export default SW;