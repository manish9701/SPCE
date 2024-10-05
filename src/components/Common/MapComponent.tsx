import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

interface SatelliteData {
  info: {
    satname: string;
    satid: number;
  };
  positions: SatellitePosition[];
}

const MapComponent: React.FC<{ satData: SatelliteData }> = ({ satData }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Circle | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);

      const tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        width: 100,
        /* attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', */
        ext: 'png'
      } as any).addTo(mapRef.current);

      // Invert colors of the tile layer only
      tileLayer.getContainer()!.style.filter = 'invert(100%) hue-rotate(180deg)';

      mapRef.current.on('drag', () => setUserInteracted(true));
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && satData) {
      const currentPosition = satData.positions[0];
      const path = satData.positions.map(pos => [pos.satlatitude, pos.satlongitude] as [number, number]);

      // Remove existing path and marker
      if (pathRef.current) {
        pathRef.current.remove();
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new path
      pathRef.current = L.layerGroup(
        path.map(pos => 
          L.circleMarker(pos, { 
            radius: 3, 
            color: 'red', 
            fillColor: 'red', 
            fillOpacity: 1 
          })
        )
      ).addTo(mapRef.current);

      // Add new marker
      markerRef.current = L.circle([currentPosition.satlatitude, currentPosition.satlongitude], {
        radius: 2000000,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0,
      }).addTo(mapRef.current).bindPopup(`
        ${satData.info.satname}<br>
        Lat: ${currentPosition.satlatitude.toFixed(2)}<br>
        Lon: ${currentPosition.satlongitude.toFixed(2)}<br>
        Alt: ${currentPosition.sataltitude.toFixed(2)} km
      `);

      // Only set view if the map hasn't been interacted with
      if (!userInteracted) {
        mapRef.current.setView([currentPosition.satlatitude, currentPosition.satlongitude], 3);
      }
    }
  }, [satData, userInteracted]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default MapComponent;
