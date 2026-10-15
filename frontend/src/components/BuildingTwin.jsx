import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Wind, 
  Zap, 
  RotateCcw, 
  ShieldAlert, 
  Bot, 
  ArrowRight, 
  Sliders, 
  Activity,
  Droplet
} from 'lucide-react';
import { useStore } from '../store';

// Color stops for microalgae health gradient
const COLOR_HEALTHY = new THREE.Color('#10b981');  // Emerald Green
const COLOR_STRESSED = new THREE.Color('#eab308'); // Amber / Yellow
const COLOR_CRISIS = new THREE.Color('#ef4444');   // Crimson Decay

/**
 * 56 Photobioreactor flat-panel glass facade with dynamic health colors and pulse.
 */
function FacadeAlgaePanels() {
  const meshRef = useRef();
  const materialRef = useRef();
  const algaeHealth = useStore((state) => state.algae_health);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const hvacState = useStore((state) => state.hvacState);

  const targetColor = useMemo(() => new THREE.Color(), []);
  const targetEmissive = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const t = Math.max(0, Math.min(100, algaeHealth)) / 100;

    if (t > 0.55) {
      const subT = (t - 0.55) / 0.45;
      targetColor.lerpColors(COLOR_STRESSED, COLOR_HEALTHY, subT);
      targetEmissive.lerpColors(new THREE.Color('#000000'), new THREE.Color('#064e3b'), subT * 0.45);
    } else {
      const subT = t / 0.55;
      targetColor.lerpColors(COLOR_CRISIS, COLOR_STRESSED, subT);
      targetEmissive.lerpColors(new THREE.Color('#7f1d1d'), new THREE.Color('#451a03'), 0.35);
    }

    materialRef.current.color.lerp(targetColor, delta * 3.5);
    materialRef.current.emissive.lerp(targetEmissive, delta * 3.5);

    const targetTransmission = 0.85 - (t * 0.40);
    const targetRoughness = 0.12 + (t * 0.18);
    materialRef.current.transmission = THREE.MathUtils.lerp(materialRef.current.transmission, targetTransmission, delta * 2.0);
    materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, delta * 2.0);

    // Photosynthetic aeration pulse accelerated by HVAC redirection
    const pulseRate = 1.0 + (hvacState.airflowVelocity * 0.8) + (co2Ppm / 800);
    const scalePulse = 1.0 + Math.sin(state.clock.elapsedTime * pulseRate) * 0.0035;
    if (meshRef.current) {
      meshRef.current.scale.set(scalePulse, 1.0, scalePulse);
    }
  });

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

/**
 * Physical Structural Core with visible HVAC Riser & Motorized Damper Conduits.
 */
function BuildingHVACStructure() {
  const hvacState = useStore((state) => state.hvacState);
  const damperCollarRef = useRef();

  // Dynamic airflow color for duct indicators
  const flowColor = useMemo(() => new THREE.Color(hvacState.airflowColor), [hvacState.airflowColor]);

  useFrame((state, delta) => {
    if (damperCollarRef.current) {
      damperCollarRef.current.rotation.y += delta * (0.8 + hvacState.airflowVelocity * 0.4);
    }
  });

  // 7 floors with radial branch ducts connecting the core to the facade panels
  const floors = [0, 1, 2, 3, 4, 5, 6];
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  return (
    <group>
      {/* Central Concrete Core */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.88, 2.05, 8.2, 16]} />
        <meshStandardMaterial
          color="#162032"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Internal HVAC Supply Riser Conduit (Glowing center column) */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 8.4, 16]} />
        <meshStandardMaterial
          color={hvacState.airflowColor}
          emissive={hvacState.airflowColor}
          emissiveIntensity={0.65}
          transparent={true}
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>

      {/* Horizontal HVAC Branch Ducts from Core to Exterior Panels */}
      {floors.map((f) => {
        const y = (f - 3.5) * 1.1 + 1.2;
        return (
          <group key={`floor-ducts-${f}`} position={[0, y, 0]}>
            {/* Structural Floor Plate */}
            <mesh receiveShadow>
              <cylinderGeometry args={[2.08, 2.08, 0.10, 16]} />
              <meshStandardMaterial
                color="#0c1220"
                roughness={0.4}
                metalness={0.8}
                emissive="#0284c7"
                emissiveIntensity={0.12}
              />
            </mesh>

            {/* 4 Radial HVAC Conduits per floor */}
            {angles.map((ang, i) => (
              <group key={`duct-${f}-${i}`} rotation={[0, ang, 0]}>
                {/* Branch Pipe */}
                <mesh position={[1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
                  <meshStandardMaterial
                    color="#475569"
                    metalness={0.85}
                    roughness={0.25}
                  />
                </mesh>

                {/* Motorized BMS Damper Valve Collar */}
                <mesh position={[1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.13, 0.04, 8, 16]} />
                  <meshStandardMaterial
                    color={hvacState.airflowColor}
                    emissive={hvacState.airflowColor}
                    emissiveIntensity={hvacState.damperOpenPct > 50 ? 0.9 : 0.3}
                    metalness={0.9}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Rotating Master Damper Collar at Base Intake */}
      <group ref={damperCollarRef} position={[0, -2.8, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[2.28, 0.12, 12, 32]} />
          <meshStandardMaterial
            color={hvacState.airflowColor}
            metalness={0.9}
            roughness={0.2}
            emissive={hvacState.airflowColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Roof Bioreactor Scrubber Dome (Illuminates in Bypass) */}
      <mesh position={[0, 5.6, 0]} castShadow>
        <sphereGeometry args={[1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={hvacState.activeLoop === 'roof_bypass' ? '#ef4444' : '#38bdf8'}
          emissive={hvacState.activeLoop === 'roof_bypass' ? '#ef4444' : '#0284c7'}
          emissiveIntensity={hvacState.activeLoop === 'roof_bypass' ? 0.8 : 0.2}
          transmission={0.75}
          transparent={true}
          roughness={0.1}
          ior={1.5}
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

/**
 * High-Tech 3D Airflow Redirection Particles:
 * 1. Core rising airflow stream.
 * 2. Radial branch redirection stream (traveling from Core OUTWARD into Facade Panels).
 * 3. Effervescent facade panel sparging bubbles.
 */
function DynamicHVACAirflowSystem() {
  const hvacState = useStore((state) => state.hvacState);
  const coreParticlesRef = useRef();
  const radialParticlesRef = useRef();
  const facadeBubblesRef = useRef();

  // 1. Core rising stream (60 particles)
  const coreCount = 60;
  const corePositions = useMemo(() => {
    const pos = new Float32Array(coreCount * 3);
    for (let i = 0; i < coreCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.45;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = ((i / coreCount) * 8.2) - 2.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  // 2. Radial branch redirection stream (80 particles moving from core to facade)
  const radialCount = 80;
  const radialData = useMemo(() => {
    const pos = new Float32Array(radialCount * 3);
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const floors = [-2.5, -1.4, -0.3, 0.8, 1.9, 3.0, 4.1];
    const metadata = [];

    for (let i = 0; i < radialCount; i++) {
      const ang = angles[i % angles.length] + ((Math.random() - 0.5) * 0.15);
      const y = floors[Math.floor(Math.random() * floors.length)];
      const progress = Math.random(); // 0 (core) to 1 (facade)
      const r = 0.5 + progress * 1.65;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(ang) * r;
      metadata.push({ ang, y, progress, speed: 0.8 + Math.random() * 0.6 });
    }
    return { pos, metadata };
  }, []);

  // 3. Facade panel bubbling sparging stream (90 particles inside panels)
  const bubbleCount = 90;
  const bubblePositions = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * Math.PI * 2;
      const radius = 2.18 + (Math.sin(i * 5) * 0.05);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = ((i / bubbleCount) * 7.5) - 2.7;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const vel = hvacState.airflowVelocity || 1.2;

    // Update Core Rising Stream
    if (coreParticlesRef.current) {
      const arr = coreParticlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < coreCount; i++) {
        let y = arr[i * 3 + 1];
        y += delta * vel * 1.5;
        if (y > 5.5) y = -2.8;
        arr[i * 3 + 1] = y;
      }
      coreParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Update Radial Redirection Streams (Core -> Facade)
    if (radialParticlesRef.current) {
      const arr = radialParticlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < radialCount; i++) {
        const meta = radialData.metadata[i];
        meta.progress += delta * vel * meta.speed * 0.7;
        if (meta.progress > 1.0) meta.progress = 0.0;

        const r = 0.5 + meta.progress * 1.65;
        arr[i * 3] = Math.cos(meta.ang) * r;
        arr[i * 3 + 1] = meta.y;
        arr[i * 3 + 2] = Math.sin(meta.ang) * r;
      }
      radialParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Update Facade Panel Bubbles
    if (facadeBubblesRef.current) {
      const arr = facadeBubblesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        let y = arr[i * 3 + 1];
        y += delta * (0.6 + (hvacState.damperOpenPct / 100) * 1.8);
        if (y > 5.0) y = -2.7;
        arr[i * 3 + 1] = y;
      }
      facadeBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Core Internal Riser Stream */}
      <points ref={coreParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={coreCount}
            array={corePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color={hvacState.airflowColor}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Radial Redirection Streams (Core OUTWARD to Exterior Facade) */}
      <points ref={radialParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={radialCount}
            array={radialData.pos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={hvacState.damperOpenPct > 60 ? 0.22 : 0.14}
          color={hvacState.airflowColor}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 3. Facade Panel Effervescent Sparging Bubbles */}
      <points ref={facadeBubblesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={bubbleCount}
            array={bubblePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={hvacState.mode === 'bypass' ? '#ef4444' : '#10b981'}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function BuildingTwin({ focusMode = 'overview' }) {
  const algaeHealth = useStore((state) => state.algae_health);
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);
  const hvacState = useStore((state) => state.hvacState);
  const triggerHvacScenario = useStore((state) => state.triggerHvacScenario);
  const setHvacDamper = useStore((state) => state.setHvacDamper);

  const [showDuctControls, setShowDuctControls] = useState(true);

  // Status color
  const statusColorHex = algaeHealth >= 70 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#060a12] via-[#0b1220] to-[#080d1a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Viewport Title Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Mode Tag */}
          <div
            className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide border flex items-center shadow-lg backdrop-blur-md"
            style={{
              borderColor: `${hvacState.airflowColor}66`,
              backgroundColor: `${hvacState.airflowColor}18`,
              color: hvacState.airflowColor
            }}
          >
            <span
              className="w-2 h-2 rounded-full mr-2 animate-ping"
              style={{ backgroundColor: hvacState.airflowColor }}
            />
            {hvacState.hvacStatusText}
          </div>

          {/* Damper Gauge Badge */}
          <div className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/50 border border-white/10 text-slate-300 backdrop-blur-md flex items-center space-x-1.5">
            <span className="text-slate-400">BMS DAMPER:</span>
            <span className="font-bold" style={{ color: hvacState.airflowColor }}>
              {hvacState.damperOpenPct}% OPEN
            </span>
          </div>

          {/* Airflow Velocity & Sparging Badge */}
          <div className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/50 border border-white/10 text-slate-300 backdrop-blur-md hidden sm:flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>{(hvacState.airflowVelocity * 160).toFixed(0)} CFM ({hvacState.spargingRateLpm} L/min)</span>
          </div>
        </div>

        {/* Focus Mode Indicator */}
        <div className="text-[11px] text-slate-400 font-mono hidden md:inline-block bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
          {focusMode === 'human' ? 'Occupancy Airflow Dynamics' : focusMode === 'algae' ? 'Bioreactor Spectrophotometric Loop' : 'Interactive 3D Twin'} • Drag to Rotate
        </div>
      </div>

      {/* Floating Bottom AI Reasoning & Actuator Trace */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2">
        <div className="max-w-xl text-[11px] font-mono text-slate-300 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-bold mb-0.5">
            <Bot className="w-3.5 h-3.5" />
            <span>GEN AI BMS ACTUATOR REASONING:</span>
          </div>
          <p className="text-slate-300 text-xs font-sans leading-tight">
            {hvacState.aiReasoning}
          </p>
        </div>

        {/* Quick Damper Slider & Stats */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1 text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px]">VALVE:</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={hvacState.damperOpenPct}
            onChange={(e) => setHvacDamper(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="font-bold text-slate-200 text-xs w-9 text-right">
            {hvacState.damperOpenPct}%
          </span>
        </div>
      </div>

      {/* Floating Interactive GenAI HVAC Demo Controller for Hackathon Judges */}
      <div className="absolute top-14 right-3 z-20 pointer-events-auto bg-[#0a101d]/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-2xl flex flex-col space-y-1.5 max-w-[210px]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          <span className="flex items-center text-amber-400 font-bold">
            <Zap className="w-3 h-3 mr-1" /> AI Demo Presets:
          </span>
          <button 
            onClick={() => setShowDuctControls(!showDuctControls)}
            className="text-slate-500 hover:text-slate-300 text-[9px]"
          >
            {showDuctControls ? 'Hide' : 'Show'}
          </button>
        </div>

        {showDuctControls && (
          <div className="flex flex-col space-y-1.5 pt-0.5">
            <button
              onClick={() => triggerHvacScenario('redirect')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left border flex items-center justify-between ${
                hvacState.mode === 'redirect'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-amber-400'
              }`}
            >
              <span>🔀 AI Redirect (Amber)</span>
              <span className="text-[9px] bg-amber-500/30 px-1 rounded text-amber-200">88%</span>
            </button>

            <button
              onClick={() => triggerHvacScenario('bypass')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left border flex items-center justify-between ${
                hvacState.mode === 'bypass'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-rose-400'
              }`}
            >
              <span>⚠️ AI Bypass (Crimson)</span>
              <span className="text-[9px] bg-rose-500/30 px-1 rounded text-rose-200">Scrub</span>
            </button>

            <button
              onClick={() => triggerHvacScenario('optimal')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left border flex items-center justify-between ${
                hvacState.mode === 'optimal'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-emerald-400'
              }`}
            >
              <span>🌿 Max Bio (Emerald)</span>
              <span className="text-[9px] bg-emerald-500/30 px-1 rounded text-emerald-200">75%</span>
            </button>

            <button
              onClick={() => triggerHvacScenario('auto')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left border flex items-center justify-between ${
                hvacState.mode === 'auto'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span>🔄 Auto Sensor Sync</span>
              <span className="text-[9px] bg-sky-500/30 px-1 rounded text-sky-200">Live</span>
            </button>
          </div>
        )}
      </div>

      {/* Three.js Canvas */}
      <Canvas shadows dpr={[1, 2]} className="flex-1 w-full h-full">
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

        {/* Soft bio-glow dynamic fill light responding to airflow color */}
        <pointLight
          position={[0, 1.2, 0]}
          intensity={1.5}
          color={hvacState.airflowColor}
          distance={9}
        />

        {/* 3D Building Procedural Mesh */}
        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
          <group position={[0, -0.4, 0]}>
            <BuildingHVACStructure />
            <FacadeAlgaePanels />
            <DynamicHVACAirflowSystem />
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
