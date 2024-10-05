import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSatelliteData } from '../satData';

const CustomSatellite: React.FC<{ orientation: { yaw: number; pitch: number; roll: number } }> = ({ orientation }) => {
  const satelliteRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/cubeo.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 'white' });
        const edges = new THREE.EdgesGeometry(child.geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 'black', linewidth: 0.2 })
        );
        child.add(line);
      }
    });
  }, [scene]);

  useFrame(() => {
    if (satelliteRef.current) {
      satelliteRef.current.rotation.set(
        orientation.pitch * Math.PI / 180,
        orientation.yaw * Math.PI / 180,
        orientation.roll * Math.PI / 180
      );
    }
  });

  const createRing = (color: string, rotation: [number, number, number]) => {
    const geometry = new THREE.RingGeometry(1.5, 1.51, 64);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(...rotation);
    return mesh;
  };

  const createValueRing = (value: number, color: string, rotation: [number, number, number]) => {
    const geometry = new THREE.RingGeometry(1.5, 1.55, 64, 1, 0, value * Math.PI / 180);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(...rotation);
    return mesh;
  };

  const createLine = (color: string, rotation: [number, number, number], value: number) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.5, 0, 0)
    ]);
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material);
    line.rotation.set(...rotation);
    line.rotateOnAxis(new THREE.Vector3(0, 0, 1), value * Math.PI / 180);
    return line;
  };

  return (
    <group ref={satelliteRef}>
      <primitive object={scene} scale={[0.15, 0.15, 0.15]} />
      {/* Light gray rings */}
      <primitive object={createRing('lightgray', [Math.PI/2, 0, 0])} /> {/* Yaw */}
      <primitive object={createRing('lightgray', [0, Math.PI/2, 0])} /> {/* Pitch */}
      <primitive object={createRing('lightgray', [0, 0, 0])} /> {/* Roll */}
      {/* Colored value rings */}
      <primitive object={createValueRing(orientation.yaw, 'red', [Math.PI/2, 0, 0])} />
      <primitive object={createValueRing(orientation.pitch, 'blue', [0, Math.PI/2, 0])} />
      <primitive object={createValueRing(orientation.roll, 'green', [0, 0, 0])} />
      {/* Lines from center to rings */}
      <primitive object={createLine('red', [Math.PI/2, 0, 0], orientation.yaw)} />
      <primitive object={createLine('blue', [0, Math.PI/2, 0], orientation.pitch)} />
      <primitive object={createLine('green', [0, 0, 0], orientation.roll)} />
    </group>
  );
};

const SatelliteOrientation: React.FC = () => {
  const { satData, error } = useSatelliteData();
  const [orientation, setOrientation] = React.useState({
    yaw: 0,
    pitch: 0,
    roll: 0
  });

  React.useEffect(() => {
    if (satData?.positions && satData.positions.length > 0) {
      const pos = satData.positions[0];
      if (pos.satlatitude !== undefined && pos.satlongitude !== undefined && pos.sataltitude !== undefined) {
        setOrientation({
          yaw: pos.satlongitude,
          pitch: pos.satlatitude,
          roll: pos.sataltitude * 0.1 // Arbitrary calculation for roll
        });
      }
    }
  }, [satData]);

  if (error) {
    return <div className="flex flex-col bg-white flex-grow border-r border-gray-200 relative p-4">Error loading satellite data</div>;
  }

  return (
    <div className="flex flex-col bg-white flex-grow border-r border-gray-200 relative w-1/2">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <ambientLight intensity={10} />
        <CustomSatellite orientation={orientation} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="absolute top-2  right-2 text-xs bg-white bg-opacity-70 p-1 rounded ">
        <div style={{color: 'red'}}>Y: {orientation.yaw.toFixed(2)}°</div>
        <div style={{color: 'blue'}}>P: {orientation.pitch.toFixed(2)}°</div>
        <div style={{color: 'green'}}>R: {orientation.roll.toFixed(2)}°</div>
      </div>
    </div>
  );
};

useGLTF.preload('/models/cubeo.glb');

export default SatelliteOrientation;