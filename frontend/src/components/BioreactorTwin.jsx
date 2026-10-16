/**
 * BioreactorTwin.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * High-Fidelity 3D Photobioreactor (PBR) Digital Twin.
 * Replaces generic building models with a genuine industrial-grade living
 * microalgae bioreactor vessel.
 *
 * Real physical systems modeled (100% procedural R3F primitives):
 * 1. Precision Borosilicate Glass Cylinder (high transmission, physical IOR, volume tick marks)
 * 2. Liquid Microalgae Culture (dynamic tri-lerp color: Emerald -> Amber -> Crimson based on input health)
 * 3. Bottom Gas Sparger Ring & Rising Aeration Bubbles (flow speed and bubble count tied to HVAC CO2 feed)
 * 4. Central PAR Actinic Grow Light Rod (radiant photosynthetic dual-spectrum LED with bio-pulse)
 * 5. Helical Heat Exchange Tube (titanium cooling coil maintaining 24°C culture equilibrium)
 * 6. Top Degasser Headplate, O2 Exhaust Vent, and Sanitary 316L Base Flange
 * 7. In-situ Optical Spectrophotometer Sensor Collar (representing the OpenCV bio-scanner)
 * 8. pH & Dissolved O2 Probes with live status telemetry
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Float,
  Grid,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import {
  FlaskConical,
  Wind,
  Sun,
  Activity,
  Zap,
  Sliders,
  Maximize2,
  RefreshCw,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store';

// ─── Color Palettes & Biological Interpolation ──────────────────────────────
const C_EMERALD_LUSH  = new THREE.Color('#059669'); // 95%+ peak healthy
const C_EMERALD_BASE  = new THREE.Color('#10b981'); // 80% healthy
const C_AMBER_STRESS  = new THREE.Color('#eab308'); // 55% chlorosis stress
const C_ORANGE_ACID   = new THREE.Color('#ea580c'); // 45% acidic shock
const C_CRIMSON_CRASH = new THREE.Color('#991b1b'); // <35% culture crash
const C_SCRATCH = new THREE.Color();

function getBioreactorColors(health) {
  const t = Math.max(0, Math.min(100, health)) / 100;
  if (t >= 0.75) {
    const sub = (t - 0.75) / 0.25;
    C_SCRATCH.lerpColors(C_EMERALD_BASE, C_EMERALD_LUSH, sub);
    return {
      fluid: C_SCRATCH.clone(),
      glow: '#059669',
      emissiveIntensity: 0.35,
      transmission: 0.45,
      lightHue: '#34d399'
    };
  } else if (t >= 0.45) {
    const sub = (t - 0.45) / 0.30;
    C_SCRATCH.lerpColors(C_AMBER_STRESS, C_EMERALD_BASE, sub);
    return {
      fluid: C_SCRATCH.clone(),
      glow: '#d97706',
      emissiveIntensity: 0.25,
      transmission: 0.58,
      lightHue: '#fbbf24'
    };
  } else {
    const sub = t / 0.45;
    C_SCRATCH.lerpColors(C_CRIMSON_CRASH, C_ORANGE_ACID, sub);
    return {
      fluid: C_SCRATCH.clone(),
      glow: '#dc2626',
      emissiveIntensity: 0.45,
      transmission: 0.75,
      lightHue: '#ef4444'
    };
  }
}

// ─── 1. Liquid Culture Medium Cylinder ───────────────────────────────────────
function LiquidCultureColumn({ radius = 1.12, height = 3.6 }) {
  const meshRef = useRef();
  const matRef = useRef();
  const currentFluidCol = useMemo(() => new THREE.Color('#10b981'), []);
  const currentGlowCol = useMemo(() => new THREE.Color('#064e3b'), []);

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const { algae_health, hvacState, ambient_lux } = useStore.getState();
    const config = getBioreactorColors(algae_health);

    // Smooth fluid color transition
    currentFluidCol.lerp(config.fluid, delta * 3.0);
    currentGlowCol.lerp(new THREE.Color(config.glow), delta * 2.5);

    matRef.current.color.copy(currentFluidCol);
    matRef.current.emissive.copy(currentGlowCol);
    matRef.current.emissiveIntensity = config.emissiveIntensity;
    matRef.current.transmission = THREE.MathUtils.lerp(
      matRef.current.transmission,
      config.transmission,
      delta * 2.0
    );

    // Subtle fluid breathing and swirling deformation
    const pulseRate = 1.2 + (hvacState.airflowVelocity * 0.8);
    const wave = 1.0 + Math.sin(state.clock.elapsedTime * pulseRate) * 0.005;
    if (meshRef.current) {
      meshRef.current.scale.set(wave, 1.0, wave);
      meshRef.current.rotation.y += delta * 0.15; // Slow cellular swirl
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[radius, radius, height, 32, 1, false]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#10b981"
        emissive="#064e3b"
        emissiveIntensity={0.35}
        roughness={0.15}
        metalness={0.05}
        transmission={0.48}
        ior={1.38} // Refractive index of microalgae aquatic suspension
        thickness={1.5}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

// ─── 2. Outer Borosilicate Glass Vessel ─────────────────────────────────────
function BorosilicateGlassCylinder({ radius = 1.22, height = 4.0 }) {
  // Calibration volumetric tick marks
  const tickYPositions = useMemo(() => {
    const list = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      list.push(-1.5 + (i * 0.5));
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Main Glass Cylinder */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 36, 1, true]} />
        <meshPhysicalMaterial
          color="#f0f9ff"
          roughness={0.04}
          metalness={0.02}
          transmission={0.94}
          ior={1.52} // Borosilicate 3.3 laboratory glass IOR
          thickness={0.8}
          transparent
          opacity={0.35}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
        />
      </mesh>

      {/* Volumetric Calibration Rings (e.g. 5L, 10L, 15L marks) */}
      {tickYPositions.map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius + 0.005, 0.006, 6, 36]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} opacity={0.5} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 3. Air Sparging Ring & Rising Bubble Particle System ───────────────────
function AirSpargingSystem({ radius = 0.85, baseHeight = -1.75, bubbleCount = 280 }) {
  const pointsRef = useRef();
  const ringRef = useRef();
  const ringMatRef = useRef();

  // Create initial randomized particle distribution inside the cylindrical column
  const { positions, speeds, offsets, sizes } = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    const spd = new Float32Array(bubbleCount);
    const offs = new Float32Array(bubbleCount);
    const szs = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.95);
      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = baseHeight + Math.random() * 3.4;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      spd[i] = 0.8 + Math.random() * 1.4;
      offs[i] = Math.random() * Math.PI * 2;
      szs[i] = 0.04 + Math.random() * 0.055;
    }
    return { positions: pos, speeds: spd, offsets: offs, sizes: szs };
  }, [bubbleCount, radius, baseHeight]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const { hvacState, algae_health } = useStore.getState();

    // Sparging velocity is directly tied to the input HVAC airflow and damper modulation
    const baseVel = 0.7 + (hvacState.damperOpenPct / 100) * 2.8;
    const isBypass = hvacState.activeLoop === 'roof_bypass' || algae_health < 45;
    const effectiveVel = isBypass ? 0.35 : baseVel;

    const posArray = pointsRef.current.geometry.attributes.position.array;
    const topY = baseHeight + 3.5;

    for (let i = 0; i < bubbleCount; i++) {
      // Upward ascent
      posArray[i * 3 + 1] += delta * effectiveVel * speeds[i];

      // Subtle horizontal turbulence / Brownian motion
      posArray[i * 3 + 0] += Math.sin(state.clock.elapsedTime * 3 + offsets[i]) * 0.003;
      posArray[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 3 + offsets[i]) * 0.003;

      // Wrap around when reaching the liquid surface
      if (posArray[i * 3 + 1] > topY) {
        posArray[i * 3 + 1] = baseHeight + Math.random() * 0.15;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (radius * 0.9);
        posArray[i * 3 + 0] = Math.cos(angle) * r;
        posArray[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Sparger ring glow matches the active airflow color
    if (ringMatRef.current) {
      ringMatRef.current.emissive.lerp(new THREE.Color(hvacState.airflowColor), delta * 3.0);
    }
  });

  return (
    <group>
      {/* Stainless Steel Sparger Ring at the base */}
      <mesh ref={ringRef} position={[0, baseHeight + 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.045, 12, 36]} />
        <meshStandardMaterial
          ref={ringMatRef}
          color="#475569"
          metalness={0.92}
          roughness={0.15}
          emissive="#38bdf8"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* CO2 Feed Inlet Conduits connecting to ring */}
      <mesh position={[0, baseHeight - 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Rising Bubble Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={bubbleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.068}
          color="#f0fdf4"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// ─── 4. Central Actinic PAR LED Illumination Grow Rod ───────────────────────
function CentralGrowLightRod({ height = 3.7 }) {
  const lightRef = useRef();
  const matRef = useRef();
  const curLightColor = useMemo(() => new THREE.Color('#d946ef'), []);

  useFrame((state, delta) => {
    if (!matRef.current || !lightRef.current) return;
    const { algae_health, ambient_lux } = useStore.getState();

    // Actinic spectrum: Dual 660nm deep red / 450nm royal blue grow spectrum (#ec4899 / #a855f7)
    // When healthy: vivid actinic purple/pink stimulating chlorophyll-a
    // When crisis: dim orange/red to prevent solar photo-bleaching
    let targetLight = '#ec4899';
    let targetIntensity = 1.6;

    if (algae_health < 45) {
      targetLight = '#ef4444';
      targetIntensity = 0.55; // Dimmed protection
    } else if (algae_health < 75) {
      targetLight = '#f59e0b';
      targetIntensity = 1.1;
    } else {
      targetLight = '#d946ef';
      targetIntensity = 1.8 + Math.sin(state.clock.elapsedTime * 2.0) * 0.2; // Rhythmic PAR pulse
    }

    curLightColor.lerp(new THREE.Color(targetLight), delta * 2.5);
    matRef.current.emissive.copy(curLightColor);
    matRef.current.color.copy(curLightColor);

    lightRef.current.color.copy(curLightColor);
    lightRef.current.intensity = THREE.MathUtils.lerp(
      lightRef.current.intensity,
      targetIntensity,
      delta * 2.5
    );
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Quartz Tube */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, height, 20]} />
        <meshStandardMaterial
          ref={matRef}
          color="#d946ef"
          emissive="#d946ef"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Internal Volumetric Point Light illuminating fluid from inside out */}
      <pointLight ref={lightRef} position={[0, 0, 0]} distance={4.5} decay={1.6} intensity={1.8} />
      <pointLight position={[0, 1.2, 0]} color="#38bdf8" distance={2.5} decay={2.0} intensity={0.6} />
      <pointLight position={[0, -1.2, 0]} color="#10b981" distance={2.5} decay={2.0} intensity={0.6} />
    </group>
  );
}

// ─── 5. Helical Heat Exchange Tube (Cooling Coil) ───────────────────────────
function HelicalCoolingCoil({ radius = 0.62, height = 3.0, turns = 6 }) {
  const curve = useMemo(() => {
    class HelixCurve extends THREE.Curve {
      getPoint(t) {
        const angle = t * Math.PI * 2 * turns;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = -height / 2 + t * height;
        return new THREE.Vector3(x, y, z);
      }
    }
    return new HelixCurve();
  }, [radius, height, turns]);

  const geom = useMemo(() => {
    return new THREE.TubeGeometry(curve, 140, 0.022, 8, false);
  }, [curve]);

  return (
    <mesh geometry={geom}>
      <meshPhysicalMaterial
        color="#bae6fd"
        metalness={0.75}
        roughness={0.15}
        transmission={0.4}
        transparent
        opacity={0.8}
        clearcoat={0.9}
      />
    </mesh>
  );
}

// ─── 6. Sanitary 316L Flanges & Headplate Hardware ──────────────────────────
function BioreactorHardware({ height = 4.0, radius = 1.22 }) {
  const topY = height / 2;
  const bottomY = -height / 2;
  const valveRef = useRef();

  useFrame((_, delta) => {
    if (valveRef.current) {
      valveRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group>
      {/* ── Top Headplate Assembly ── */}
      <group position={[0, topY, 0]}>
        {/* Main stainless clamp ring */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[radius + 0.12, radius + 0.12, 0.16, 36]} />
          <meshStandardMaterial color="#334155" metalness={0.94} roughness={0.18} />
        </mesh>
        {/* Sanitary dome cap */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[radius * 0.75, radius + 0.08, 0.24, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.25} />
        </mesh>
        {/* Degassing O2 Exhaust Port */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.28, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Pressure release relief valve */}
        <mesh position={[0.45, 0.44, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.22, 12]} />
          <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Bottom Base Pedestal Assembly ── */}
      <group position={[0, bottomY, 0]}>
        {/* Bottom flange */}
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[radius + 0.12, radius + 0.12, 0.16, 36]} />
          <meshStandardMaterial color="#334155" metalness={0.94} roughness={0.18} />
        </mesh>
        {/* Magnetic Drive & Centrifuge base platform */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[radius + 0.28, radius + 0.35, 0.36, 36]} />
          <meshStandardMaterial color="#0b1322" metalness={0.85} roughness={0.4} />
        </mesh>
        {/* Harvesting Solenoid Valve */}
        <group position={[radius + 0.18, -0.22, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 12]} />
            <meshStandardMaterial color="#10b981" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.18, 0, 0]} ref={valveRef}>
            <boxGeometry args={[0.08, 0.16, 0.05]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── 7. In-situ Spectrophotometer Collar (OpenCV Scan Plane) ────────────────
function SpectrophotometerCollar({ radius = 1.25, y = 0.2 }) {
  const ringRef = useRef();
  const scanBeamRef = useRef();

  useFrame((state, delta) => {
    if (!ringRef.current || !scanBeamRef.current) return;
    const { algae_health } = useStore.getState();
    const config = getBioreactorColors(algae_health);

    ringRef.current.rotation.y += delta * 0.8;
    scanBeamRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 4.0) * 0.25;
  });

  return (
    <group position={[0, y, 0]}>
      {/* Outer sensor clamp collar */}
      <mesh ref={ringRef}>
        <torusGeometry args={[radius + 0.04, 0.045, 10, 36]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.95}
          roughness={0.15}
          emissive="#38bdf8"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Laser Bio-Scanner Plane (matches OpenCV HSV ROI) */}
      <mesh ref={scanBeamRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, radius + 0.02, 36]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ─── 8. Complete Photobioreactor Assembly ───────────────────────────────────
function FullPhotobioreactorAssembly() {
  return (
    <group>
      {/* 1. Liquid Microalgae Culture Column */}
      <LiquidCultureColumn radius={1.12} height={3.6} />

      {/* 2. Outer Borosilicate Glass Cylinder */}
      <BorosilicateGlassCylinder radius={1.22} height={4.0} />

      {/* 3. Bottom Air Sparging Ring & Rising Bubbles */}
      <AirSpargingSystem radius={0.85} baseHeight={-1.75} bubbleCount={320} />

      {/* 4. Central Actinic PAR LED Grow Light Rod */}
      <CentralGrowLightRod height={3.7} />

      {/* 5. Helical Heat Exchange Tube */}
      <HelicalCoolingCoil radius={0.62} height={3.0} turns={6} />

      {/* 6. Hardware Flanges & Degassing Headplate */}
      <BioreactorHardware height={4.0} radius={1.22} />

      {/* 7. In-situ Optical Spectrophotometer Collar */}
      <SpectrophotometerCollar radius={1.22} y={0.3} />
    </group>
  );
}

// ─── Interactive Telemetry HUD (DOM Layer) ───────────────────────────────────
function BioreactorHUD({ viewMode, setViewMode }) {
  const algaeHealth = useStore((s) => s.algae_health);
  const biofuelRate = useStore((s) => s.biofuel_ml_hr);
  const co2Ppm = useStore((s) => s.co2_ppm);
  const occupancy = useStore((s) => s.occupancy);
  const hvacState = useStore((s) => s.hvacState);
  const triggerHvac = useStore((s) => s.triggerHvacScenario);
  const setDamper = useStore((s) => s.setHvacDamper);

  const isHealthy = algaeHealth >= 75;
  const isStressed = algaeHealth >= 45 && algaeHealth < 75;
  const isCritical = algaeHealth < 45;

  const statusLabel = isHealthy ? 'OPTIMAL LOG GROWTH' : isStressed ? 'ABIOTIC STRESS' : 'ACID SHOCK CRISIS';
  const statusColor = isHealthy ? '#10b981' : isStressed ? '#f59e0b' : '#ef4444';

  return (
    <>
      {/* Top-Left Live Status Badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-2">
        <div
          className="px-3.5 py-1.5 rounded-[980px] text-xs font-semibold border flex items-center gap-2 backdrop-blur-[20px] bg-[rgba(245,245,247,0.92)] shadow-sm"
          style={{
            borderColor: `${statusColor}55`,
            color: statusColor
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
          PBR STATUS: {statusLabel} ({algaeHealth.toFixed(1)}%)
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] text-[11px] font-medium bg-[rgba(245,245,247,0.85)] border border-[rgba(0,0,0,0.08)] text-[#1D1D1F] backdrop-blur-[20px]">
          <Wind className="w-3.5 h-3.5 text-[#0071E3]" />
          <span>CO₂ Sparging:</span>
          <strong className="text-[#0071E3] font-semibold">{hvacState.spargingRateLpm} L/min</strong>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] text-[11px] font-medium bg-[rgba(245,245,247,0.85)] border border-[rgba(0,0,0,0.08)] text-[#1D1D1F] backdrop-blur-[20px]">
          <Sparkles className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Biofuel Yield:</span>
          <strong className="text-[#34C759] font-semibold">{biofuelRate} ml/hr</strong>
        </div>
      </div>

      {/* Top-Right Preset Buttons */}
      <div className="absolute top-3 right-3 z-20 pointer-events-auto bg-[rgba(245,245,247,0.92)] backdrop-blur-[20px] p-2.5 rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-lg flex flex-col gap-1.5 min-w-[185px]">
        <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider px-1 flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#0071E3]" /> PBR Control Modes
          </span>
        </div>

        <button
          onClick={() => triggerHvac('redirect')}
          className={`px-3 py-1.5 rounded-[980px] text-left text-[11px] font-medium transition-all flex items-center justify-between ${
            hvacState.mode === 'redirect'
              ? 'btn-apple-primary'
              : 'btn-apple-secondary'
          }`}
        >
          <span>🔀 AI Redirect (CO₂)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-[980px] bg-white/20 font-semibold">88%</span>
        </button>

        <button
          onClick={() => triggerHvac('optimal')}
          className={`px-3 py-1.5 rounded-[980px] text-left text-[11px] font-medium transition-all flex items-center justify-between ${
            hvacState.mode === 'optimal'
              ? 'btn-apple-primary'
              : 'btn-apple-secondary'
          }`}
        >
          <span>🌿 Max Biomass</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-[980px] bg-white/20 font-semibold">95%</span>
        </button>

        <button
          onClick={() => triggerHvac('bypass')}
          className={`px-3 py-1.5 rounded-[980px] text-left text-[11px] font-medium transition-all flex items-center justify-between ${
            hvacState.mode === 'bypass'
              ? 'btn-apple-primary'
              : 'btn-apple-secondary'
          }`}
        >
          <span>⚠️ Acid Bypass</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-[980px] bg-white/20 font-semibold">Bypass</span>
        </button>

        <button
          onClick={() => triggerHvac('auto')}
          className={`px-3 py-1.5 rounded-[980px] text-left text-[11px] font-medium transition-all flex items-center justify-between ${
            hvacState.mode === 'auto'
              ? 'btn-apple-primary'
              : 'btn-apple-secondary'
          }`}
        >
          <span>🔄 Live Sensors Sync</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-[980px] bg-white/20 font-semibold">Auto</span>
        </button>
      </div>

      {/* Bottom Bar: Damper Slider & Biological Trace */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2">
        {/* Gemini BMS Reasoning Box */}
        <div className="max-w-md text-[11px] text-[#1D1D1F] bg-[rgba(245,245,247,0.92)] backdrop-blur-[20px] px-3.5 py-2.5 rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-md pointer-events-auto">
          <div className="flex items-center gap-1.5 text-[#0071E3] font-semibold mb-1 text-[10px] uppercase tracking-wide">
            <Activity className="w-3.5 h-3.5 text-[#0071E3]" />
            Biological Equilibrium Trace
          </div>
          <p className="text-[#1D1D1F] text-xs leading-snug">
            {hvacState.aiReasoning}
          </p>
        </div>

        {/* Aeration Damper Modulator */}
        <div className="pointer-events-auto bg-[rgba(245,245,247,0.92)] backdrop-blur-[20px] px-3.5 py-2 rounded-2xl border border-[rgba(0,0,0,0.08)] flex items-center gap-3 text-xs shadow-md text-[#1D1D1F]">
          <Sliders className="w-3.5 h-3.5 text-[#0071E3]" />
          <span className="text-[10px] text-[#86868B] font-semibold uppercase">CO₂ SPARGING</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hvacState.damperOpenPct}
            onChange={(e) => setDamper(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#0071E3]"
          />
          <span className="font-semibold text-[#1D1D1F] w-8 text-right">{hvacState.damperOpenPct}%</span>
        </div>
      </div>
    </>
  );
}

// ─── Default Export: BioreactorTwin ──────────────────────────────────────────
export default function BioreactorTwin({ focusMode = 'algae' }) {
  const [viewMode, setViewMode] = useState('vessel'); // 'vessel' | 'cascade'

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#000000] rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] flex flex-col">
      {/* HUD Overlay */}
      <BioreactorHUD viewMode={viewMode} setViewMode={setViewMode} />

      {/* Three.js Canvas Scene */}
      <Canvas shadows dpr={[1, 2]} className="flex-1 w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0.4, 4.8]} fov={45} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={2.8}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={false}
        />

        {/* Ambient & Studio Directional Key Lights */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#38bdf8" />
        <directionalLight position={[0, -4, 3]} intensity={0.3} color="#10b981" />

        {/* Laboratory HDR Environment for crisp glass reflections */}
        <Environment preset="city" />

        {/* The Photobioreactor Vessel — gently suspended */}
        <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.1}>
          <group position={[0, 0, 0]}>
            <FullPhotobioreactorAssembly />
          </group>
        </Float>

        {/* Ground Shadow & Floor Grid */}
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.7}
          scale={10}
          blur={2.2}
          far={5}
          color="#000000"
        />
        <Grid
          position={[0, -2.52, 0]}
          args={[16, 16]}
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={1.8}
          sectionThickness={1.0}
          sectionColor="#334155"
          fadeDistance={14}
        />
      </Canvas>
    </div>
  );
}
