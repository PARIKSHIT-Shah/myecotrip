import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// Approximate lat/lng for a handful of eco-destinations, converted to 3D points on the globe
const DESTINATIONS = [
  { name: "Costa Rica", lat: 9.7, lng: -83.7 },
  { name: "Iceland", lat: 64.9, lng: -19.0 },
  { name: "Bhutan", lat: 27.5, lng: 90.4 },
  { name: "New Zealand", lat: -41.3, lng: 174.8 },
  { name: "Slovenia", lat: 46.1, lng: 14.8 },
  { name: "Norway", lat: 60.5, lng: 8.5 },
];

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function Pin({ position, name }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? "#D9A24B" : "#5B8C5A"}
          emissive={hovered ? "#D9A24B" : "#5B8C5A"}
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

function GlobeMesh() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const pins = useMemo(
    () =>
      DESTINATIONS.map((d) => ({
        ...d,
        position: latLngToVec3(d.lat, d.lng, 1.52),
      })),
    []
  );

  return (
    <group ref={groupRef}>
      {/* Core globe */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#1E3D32"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Wireframe overlay for a "data globe" feel */}
      <mesh>
        <sphereGeometry args={[1.51, 32, 32]} />
        <meshBasicMaterial color="#5B8C5A" wireframe transparent opacity={0.18} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.62, 32, 32]} />
        <meshBasicMaterial color="#5B8C5A" transparent opacity={0.06} />
      </mesh>

      {pins.map((pin) => (
        <Pin key={pin.name} position={pin.position} name={pin.name} />
      ))}
    </group>
  );
}

export default function EcoGlobe({ className = "" }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 3, 5]} intensity={1.2} color="#F4F0E4" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#5B8C5A" />
        <Stars radius={50} depth={30} count={1200} factor={2} saturation={0} fade speed={0.5} />
        <GlobeMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}
