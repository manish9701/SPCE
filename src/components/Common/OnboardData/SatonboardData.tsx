import { useState, useEffect, useCallback } from 'react';
import { useSatelliteData, SatellitePosition } from '../satData';

interface SystemStatus {
  surfaceTemperature: number;
  internalTemperature: number;
  batteryLevel: number;
  solarPanelEfficiency: number;
  powerOutput: number;
}

export const useSatelliteOnboardData = () => {
  
  const { satData, isLoading, error } = useSatelliteData() ;
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    surfaceTemperature: 0,
    internalTemperature: 20,
    batteryLevel: 50,
    solarPanelEfficiency: 0,
    powerOutput: 0,
  });

  const updateSystemStatus = useCallback((satelliteData: SatellitePosition) => {
    const { satlatitude, satlongitude, sataltitude, timestamp } = satelliteData;
    const date = new Date(timestamp * 1000);

    const sunExposure = calculateSunExposure(satlatitude, satlongitude, date);
    const surfaceTemperature = calculateSurfaceTemperature(sunExposure, sataltitude);
    const internalTemperature = calculateInternalTemperature(surfaceTemperature);
    const solarPanelEfficiency = calculateSolarPanelEfficiency(sunExposure, surfaceTemperature);
    const powerOutput = calculatePowerOutput(solarPanelEfficiency);
    const batteryLevel = updateBatteryLevel(systemStatus.batteryLevel, powerOutput);

    setSystemStatus({
      surfaceTemperature,
      internalTemperature,
      batteryLevel,
      solarPanelEfficiency,
      powerOutput,
    });
  }, [systemStatus.batteryLevel]);

  useEffect(() => {
    if (satData?.positions?.[0]) {
      updateSystemStatus(satData.positions[0]);
    }
  }, [satData, updateSystemStatus]);

  return { 
    positions: satData?.positions || [],
    ...systemStatus, 
    isLoading, 
    error 
  };
};

function calculateSunExposure(latitude: number, longitude: number, date: Date): number {
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
  const hourAngle = 15 * (hour - 12);
  
  const elevation = Math.asin(
    Math.sin(latitude * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
    Math.cos(latitude * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
  ) * 180 / Math.PI;

  return Math.max(0, Math.min(1, (elevation + 90) / 180));
}

function calculateSurfaceTemperature(sunExposure: number, altitude: number): number {
  const minTemp = -150;
  const maxTemp = 120;
  const tempRange = maxTemp - minTemp;
  const altitudeFactor = Math.max(0, 1 - altitude / 1000000); // Decrease temperature with altitude
  const baseTemp = minTemp + tempRange * sunExposure * altitudeFactor;
  return Math.round(baseTemp);
}

function calculateInternalTemperature(surfaceTemperature: number): number {
  // Internal temperature is more stable, between 0 and 50 degrees Celsius
  return Math.round(Math.max(0, Math.min(50, (surfaceTemperature + 150) / 5.4)));
}

function calculateSolarPanelEfficiency(sunExposure: number, temperature: number): number {
  // Solar panel efficiency decreases with higher temperatures
  const baseEfficiency = 0.3; // 30% efficiency at optimal temperature
  const temperatureCoefficient = 0.005; // 0.5% decrease per degree above 25°C
  const temperatureEffect = Math.max(0, temperature - 25) * temperatureCoefficient;
  return Math.round((baseEfficiency - temperatureEffect) * sunExposure * 100);
}

function calculatePowerOutput(solarPanelEfficiency: number): number {
  // Assuming a 1000W solar panel system
  return Math.round(10 * solarPanelEfficiency);
}

function updateBatteryLevel(currentLevel: number, powerOutput: number): number {
  if (powerOutput > 500) {
    // Charging
    return Math.min(100, currentLevel + 1);
  } else {
    // Discharging
    return Math.max(0, currentLevel - 0.5);
  }
}
