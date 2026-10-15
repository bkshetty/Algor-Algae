import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

// Color stops for microalgae health gradient
const COLOR_HEALTHY = new THREE.Color('#10b981');  // Emerald Green
const COLOR_STRESSED = new THREE.Color('#eab308'); // Amber / Yellow
const COLOR_CRISIS = new THREE.Color('#ef4444');   // Crimson Decay
const COLOR_DEGRADED = new THREE.Color('#b45309'); // Sickly Yellow-Brown

function FacadeAlgaePanels() {
  const meshRef = useRef();
  const materialRef = useRef();
  const algaeHealth = useStore((state) => state.algae_health);
  const co2Ppm = useStore((state) => state.co2_ppm);

  // Target color based on health percentage
  const targetColor = useMemo(() => new THREE.Color(), []);
  const targetEmissive = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const t = Math.max(0, Math.min(100, algaeHealth)) / 100;

    // Calculate interpolated bio-color:
    // 1.0 -> Emerald Green
    // 0.5 -> Chartreuse / Amber
    // 0.0 -> Sickly Yellow-Brown / Crimson
    if (t > 0.55) {
      const subT = (t - 0.55) / 0.45;
      targetColor.lerpColors(COLOR_STRESSED, COLOR_HEALTHY, subT);
      targetEmissive.lerpColors(new THREE.Color('#000000'), new THREE.Color('#064e3b'), subT * 0.4);
    } else {
      const subT = t / 0.55;
      targetColor.lerpColors(COLOR_CRISIS, COLOR_STRESSED, subT);
      targetEmissive.lerpColors(new THREE.Color('#7f1d1d'), new THREE.Color('#451a03'), 0.3);
    }

    // Smoothly damp material color
    materialRef.current.color.lerp(targetColor, delta * 3.5);
    materialRef.current.emissive.lerp(targetEmissive, delta * 3.5);

    // Dynamic transmission & roughness
    // Healthy: denser, lush microalgal culture (transmission ~0.45, roughness ~0.2)
    // Depleted/Crisis: thin faded yellowish watery film (transmission ~0.85, roughness ~0.08)
    const targetTransmission = 0.85 - (t * 0.40);
    const targetRoughness = 0.12 + (t * 0.18);
    materialRef.current.transmission = THREE.MathUtils.lerp(materialRef.current.transmission, targetTransmission, delta * 2.0);
    materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, delta * 2.0);

    // Subtle breathing pulse on the facade
    const pulseRate = 1.0 + (co2Ppm / 600);
    const scalePulse = 1.0 + Math.sin(state.clock.elapsedTime * pulseRate) * 0.003;
    if (meshRef.current) {
      meshRef.current.scale.set(scalePulse, 1.0, scalePulse);
    }
  });

  // Generate procedural array of facade bioreactor panel positions
  const panelMatrix = useMemo(() => {
    const panels = [];
    const floors = 7;
    const perimeterPerFloor = 8;
    const floorHeight = 1.1;

    for (let f = 0; f < floors; f++) {
      const y = (f - floors / 2) * floorHeight + 1.2;
      for (let p = 0; p < perimeterPerFloor; p++) {
        const angle = (p / perimeterPerFloor) * Math.PI * 2;
        const radius = 2.15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        panels.push({ id: `p-${f}-${p}`, position: [x, y, z], rotation: [0, -angle + Math.PI / 2, 0] });
      }
    }
    return panels;
  }, []);

  return (
    <group ref={meshRef}>
      {panelMatrix.map((panel) => (
        <mesh key={panel.id} position={panel.position} rotation={panel.rotation} castShadow receiveShadow>
          {/* Glass flat-panel photobioreactor geometry */}
          <boxGeometry args={[1.35, 0.95, 0.14]} />
          <meshPhysicalMaterial
            ref={materialRef}
            color="#10b981"
            transmission={0.5}
            opacity={1.0}
            transparent={true}
            roughness={0.2}
            metalness={0.1}
            ior={1.42}
            thickness={1.1}
            specularIntensity={1.0}
            specularColor="#ffffff"
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function BuildingCoreStructure() {
  return (
    <group>
      {/* Central Concrete & Steel Structural Spire */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 2.05, 8.2, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Internal Floor Plates (Glowing structural bands) */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[0, (i - 3.5) * 1.1 + 1.2, 0]} receiveShadow>
          <cylinderGeometry args={[2.08, 2.08, 0.12, 16]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.3}
            metalness={0.8}
            emissive="#0284c7"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      {/* Roof Bioreactor Control Dome */}
      <mesh position={[0, 5.6, 0]} castShadow>
        <sphereGeometry args={[1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.8}
          transparent={true}
          roughness={0.1}
          ior={1.5}
        />
      </mesh>

      {/* HVAC CO2 Injection Ring at base */}
      <mesh position={[0, -2.8, 0]} castShadow receiveShadow>
        <torusGeometry args={[2.25, 0.12, 12, 32]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.9}
          roughness={0.2}
          emissive="#38bdf8"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Base Podium Grounding */}
      <mesh position={[0, -3.2, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.6, 24]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} metalness={0.2} />
      </mesh>
    </group>
  );
}

function CO2CirculationFlow() {
  const co2Ppm = useStore((state) => state.co2_ppm);
  const occupancy = useStore((state) => state.occupancy);
  const particlesRef = useRef();

  const particleCount = 45;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.35 + (Math.sin(i * 3) * 0.1);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = ((i / particleCount) * 7.5) - 2.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    // Speed increases with higher occupant count and CO2 load
    const speed = 0.8 + (occupancy * 0.4);
    particlesRef.current.rotation.y += delta * speed * 0.4;

    const array = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      let y = array[i * 3 + 1];
      y += delta * speed * 0.8;
      if (y > 5.0) y = -2.8;
      array[i * 3 + 1] = y;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color={co2Ppm > 800 ? '#f59e0b' : '#38bdf8'}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function BuildingTwin() {
  const algaeHealth = useStore((state) => state.algae_health);
  const status = useStore((state) => state.status);

  // Status banner color
  const statusColorHex = algaeHealth >= 70 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#060a12] via-[#0b1220] to-[#080d1a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Viewport Title Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center space-x-3">
        <div className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide border"
             style={{ borderColor: `${statusColorHex}55`, backgroundColor: `${statusColorHex}15`, color: statusColorHex }}>
          <span className="inline-block w-2 h-2 rounded-full mr-2 animate-ping" style={{ backgroundColor: statusColorHex }} />
          BIO-FACADE: {status} ({algaeHealth.toFixed(1)}%)
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:inline-block">
          Interactive 3D Digital Twin • Drag to Rotate • Scroll to Zoom
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[6.5, 4.0, 7.5]} fov={42} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={4.5}
          maxDistance={14.0}
          maxPolarAngle={Math.PI / 2 + 0.05}
          autoRotate={false}
          autoRotateSpeed={0.6}
        />

        {/* Ambient & Studio Directional Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Soft bio-glow fill light */}
        <pointLight
          position={[0, 1, 0]}
          intensity={1.2}
          color={algaeHealth >= 60 ? '#10b981' : '#f59e0b'}
          distance={8}
        />

        {/* 3D Building Procedural Mesh */}
        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
          <group position={[0, -0.4, 0]}>
            <BuildingCoreStructure />
            <FacadeAlgaePanels />
            <CO2CirculationFlow />
          </group>
        </Float>

        {/* Ground grid & contact shadows */}
        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.6}
          scale={14}
          blur={1.8}
          far={6}
          color="#000000"
        />
        <Grid
          position={[0, -3.52, 0]}
          args={[20, 20]}
          cellSize={0.8}
          cellThickness={0.6}
          cellColor="#1e293b"
          sectionSize={2.4}
          sectionThickness={1.2}
          sectionColor="#334155"
          fadeDistance={18}
        />
      </Canvas>
    </div>
  );
}
