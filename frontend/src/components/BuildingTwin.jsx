/**
 * BuildingTwin.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Procedural 5-floor modern building + living bioreactor facade panels.
 * Receives focusMode prop ('overview' | 'human' | 'algae') and adapts HUD.
 *
 * ZERO external GLTF files — all geometry is R3F primitives.
 *
 * Data bindings via Zustand store:
 *   algae_health → bioreactor panel colour (emerald → amber → crimson)
 *   co2_ppm / occupancy → facade pulse rate
 *   hvacState  → airflow colour, damper position, BMS AI reasoning
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame }                  from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Float,
  Grid,
  Environment,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import * as THREE  from 'three';
import { Wind, Bot, Zap, Sliders, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import HVACSystem   from './HVACSystem';

// ─── Shared colour instances ─────────────────────────────────────────────
const C_HEALTHY  = new THREE.Color('#10b981');
const C_STRESSED = new THREE.Color('#eab308');
const C_CRISIS   = new THREE.Color('#ef4444');
const C_SCRATCH  = new THREE.Color();

// ─── FLOOR STRUCTURAL PLATE ───────────────────────────────────────────────
function FloorPlate({ y, width = 3.2, depth = 3.2, thickness = 0.14 }) {
  return (
    <mesh position={[0, y, 0]} receiveShadow>
      <boxGeometry args={[width, thickness, depth]} />
      <meshStandardMaterial
        color="#0c1828"
        roughness={0.6}
        metalness={0.5}
        emissive="#0284c7"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

// ─── BUILDING CORE COLUMN ─────────────────────────────────────────────────
function CoreColumn({ floors = 5, floorH = 1.1, radius = 0.95 }) {
  const totalH = floors * floorH;
  return (
    <mesh position={[0, totalH / 2 - (floors / 2) * floorH, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius * 1.06, totalH, 20]} />
      <meshStandardMaterial
        color="#162032"
        roughness={0.75}
        metalness={0.45}
      />
    </mesh>
  );
}

// ─── GLASS CURTAIN-WALL PANEL per floor ───────────────────────────────────
function CurtainWallPanel({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.85, 0.88, 0.04]} />
      <meshPhysicalMaterial
        color="#a5f3fc"
        roughness={0.05}
        metalness={0}
        transmission={0.88}
        ior={1.45}
        thickness={0.6}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

// ─── BIOREACTOR PANEL ARRAY ─── the living algae facades ─────────────────
/**
 * Each panel is a tall, thin glass-like slab filled with liquid Chlorella culture.
 * Colour lerps from Emerald → Amber → Crimson driven by algae_health.
 * Transmission + emissive intensity animate with a slow "breathing" pulse.
 */
function BioreactorFacade({ floors = 5, panelsPerFloor = 8, facadeRadius = 2.6 }) {
  // One shared material ref driving all panel instances
  const matRef    = useRef();
  const groupRef  = useRef();
  const lerpColor = useMemo(() => new THREE.Color('#10b981'), []);
  const lerpEmit  = useMemo(() => new THREE.Color('#064e3b'), []);
  const floorH    = 1.1;

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const { algae_health, co2_ppm, hvacState } = useStore.getState();
    const t = Math.max(0, Math.min(1, algae_health / 100));

    // Tri-lerp colour across health range
    if (t > 0.55) {
      const st = (t - 0.55) / 0.45;
      C_SCRATCH.lerpColors(C_STRESSED, C_HEALTHY, st);
      lerpEmit.set(t > 0.8 ? '#064e3b' : '#451a03');
    } else {
      const st = t / 0.55;
      C_SCRATCH.lerpColors(C_CRISIS, C_STRESSED, st);
      lerpEmit.set('#7f1d1d');
    }

    lerpColor.lerp(C_SCRATCH, delta * 3.5);
    matRef.current.color.copy(lerpColor);
    matRef.current.emissive.lerp(lerpEmit, delta * 2.5);

    // Transmission: sicker = thinner / clearer
    const targetTx = 0.8 - t * 0.35;
    matRef.current.transmission = THREE.MathUtils.lerp(
      matRef.current.transmission, targetTx, delta * 2
    );

    // Photosynthetic breathing pulse — faster when HVAC redirected
    const pulseHz = 1.0 + (hvacState.airflowVelocity * 0.9) + (co2_ppm / 900);
    const scale   = 1 + Math.sin(state.clock.elapsedTime * pulseHz) * 0.003;
    if (groupRef.current) groupRef.current.scale.set(scale, 1, scale);
  });

  const panels = useMemo(() => {
    const list = [];
    for (let f = 0; f < floors; f++) {
      const y = (f - (floors - 1) / 2) * floorH;
      for (let p = 0; p < panelsPerFloor; p++) {
        const angle = (p / panelsPerFloor) * Math.PI * 2;
        const x = Math.cos(angle) * facadeRadius;
        const z = Math.sin(angle) * facadeRadius;
        list.push({
          id:  `bio-${f}-${p}`,
          pos: [x, y, z],
          rot: [0, -angle + Math.PI / 2, 0],
        });
      }
    }
    return list;
  }, [floors, panelsPerFloor, facadeRadius]);

  return (
    <group ref={groupRef}>
      {panels.map((p, i) => (
        <mesh key={p.id} position={p.pos} rotation={p.rot} castShadow receiveShadow>
          <boxGeometry args={[1.2, floorH * 0.88, 0.13]} />
          {/* Only the FIRST panel carries the live material ref;
              all share the same object so mutations propagate. */}
          <meshPhysicalMaterial
            ref={i === 0 ? matRef : undefined}
            color="#10b981"
            emissive="#064e3b"
            emissiveIntensity={0.25}
            transmission={0.5}
            transparent
            opacity={1}
            roughness={0.18}
            metalness={0.08}
            ior={1.42}
            thickness={1.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── ROOFTOP DOME ── control / monitoring hub ─────────────────────────────
function RooftopDome({ topY }) {
  const matRef = useRef();

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const { hvacState } = useStore.getState();
    const isBypass = hvacState.activeLoop === 'roof_bypass';
    matRef.current.emissive.lerp(
      new THREE.Color(isBypass ? '#ef4444' : '#0284c7'),
      delta * 3
    );
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity,
      isBypass ? 0.9 : 0.22,
      delta * 3
    );
  });

  return (
    <mesh position={[0, topY, 0]} castShadow>
      <sphereGeometry args={[1.1, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#38bdf8"
        emissive="#0284c7"
        emissiveIntensity={0.22}
        transmission={0.78}
        transparent
        roughness={0.08}
        ior={1.5}
      />
    </mesh>
  );
}

// ─── HVAC BASE MANIFOLD RING ─────────────────────────────────────────────
function BaseManifold({ radius = 2.3 }) {
  const matRef  = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (!matRef.current || !ringRef.current) return;
    const { hvacState } = useStore.getState();
    matRef.current.emissive.lerp(
      new THREE.Color(hvacState.airflowColor), delta * 3
    );
    ringRef.current.rotation.y += delta * (0.6 + hvacState.airflowVelocity * 0.5);
  });

  return (
    <group ref={ringRef} position={[0, -2.55, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.095, 12, 48]} />
        <meshStandardMaterial
          ref={matRef}
          color="#334155"
          metalness={0.95}
          roughness={0.15}
          emissive="#38bdf8"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  );
}

// ─── FULL PROCEDURAL BUILDING ─────────────────────────────────────────────
const FLOORS      = 5;
const FLOOR_H     = 1.1;
const FACADE_R    = 2.6;
const CURTAIN_R   = 1.72;
const FLOOR_BASE  = -(FLOORS / 2) * FLOOR_H;
const FLOOR_TOP   =  (FLOORS / 2) * FLOOR_H;

function ProceduralBuilding() {
  const curtainAngles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2),
    []
  );

  return (
    <group>
      {/* Structural core */}
      <CoreColumn floors={FLOORS} floorH={FLOOR_H} />

      {/* Floor slabs */}
      {Array.from({ length: FLOORS + 1 }, (_, i) => {
        const y = FLOOR_BASE + i * FLOOR_H;
        return <FloorPlate key={`fl-${i}`} y={y} />;
      })}

      {/* Curtain-wall glass panels (interior glazing) */}
      {Array.from({ length: FLOORS }, (_, f) => {
        const y = FLOOR_BASE + f * FLOOR_H + FLOOR_H / 2;
        return curtainAngles.map((ang) => (
          <CurtainWallPanel
            key={`cw-${f}-${ang}`}
            position={[Math.cos(ang) * CURTAIN_R, y, Math.sin(ang) * CURTAIN_R]}
            rotation={[0, -ang + Math.PI / 2, 0]}
          />
        ));
      })}

      {/* Living algae bioreactor facade */}
      <BioreactorFacade floors={FLOORS} panelsPerFloor={8} facadeRadius={FACADE_R} />

      {/* HVAC ductwork + particle streams */}
      <HVACSystem floors={FLOORS} facadeRadius={FACADE_R} />

      {/* Architectural details */}
      <RooftopDome  topY={FLOOR_TOP + 0.6} />
      <BaseManifold radius={FACADE_R - 0.25} />

      {/* Ground podium */}
      <mesh position={[0, FLOOR_BASE - 0.38, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 3.8, 0.55, 28]} />
        <meshStandardMaterial color="#07101d" roughness={0.9} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ─── BIO-POINT LIGHT – reacts to algae health ─────────────────────────────
function DynamicBioLight() {
  const lightRef = useRef();
  const col      = useMemo(() => new THREE.Color('#10b981'), []);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const { algae_health, hvacState } = useStore.getState();
    col.lerp(new THREE.Color(hvacState.airflowColor), delta * 2);
    lightRef.current.color.copy(col);
    lightRef.current.intensity = 0.9 + (algae_health / 100) * 1.2;
  });

  return <pointLight ref={lightRef} position={[0, 0.5, 0]} distance={9} decay={1.8} />;
}

// ─── OVERLAY HUD (DOM layer, absolute positioned) ─────────────────────────
function TwinHUD({ focusMode }) {
  const algaeHealth = useStore((s) => s.algae_health);
  const occupancy   = useStore((s) => s.occupancy);
  const co2Ppm      = useStore((s) => s.co2_ppm);
  const biofuelRate = useStore((s) => s.biofuel_ml_hr);
  const status      = useStore((s) => s.status);
  const hvacState   = useStore((s) => s.hvacState);
  const triggerHvac = useStore((s) => s.triggerHvacScenario);
  const setDamper   = useStore((s) => s.setHvacDamper);
  const [showPanel, setShowPanel] = useState(true);

  const statusColor = algaeHealth >= 70 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <>
      {/* Top-left mode badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-2">
        <div
          className="px-3 py-1 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          style={{
            borderColor: `${hvacState.airflowColor}66`,
            backgroundColor: `${hvacState.airflowColor}18`,
            color: hvacState.airflowColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: hvacState.airflowColor }} />
          {hvacState.hvacStatusText}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/50 border border-white/10 text-slate-300 backdrop-blur-md">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          {hvacState.damperOpenPct}% damper · {hvacState.spargingRateLpm} L/min
        </div>

        <div className="hidden md:flex px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/45 border border-white/8 text-slate-400 backdrop-blur-md">
          {focusMode === 'human'   ? 'Occupancy Airflow Dynamics'
          : focusMode === 'algae' ? 'Bioreactor Spectrophotometric Loop'
          :                         'Interactive 3D Digital Twin'} · Drag to orbit
        </div>
      </div>

      {/* Bottom-left AI reasoning trace */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2">
        <div className="max-w-lg text-[11px] font-mono text-slate-300 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-0.5 text-[10px] uppercase tracking-wide">
            <Bot className="w-3 h-3" /> Gemini 3.8 Flash BMS Reasoning
          </div>
          <p className="text-slate-300 font-sans text-xs leading-tight">{hvacState.aiReasoning}</p>
        </div>

        {/* Damper slider */}
        <div
          className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-3 text-xs font-mono"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400">VALVE</span>
          <input
            type="range" min="0" max="100"
            value={hvacState.damperOpenPct}
            onChange={(e) => setDamper(parseInt(e.target.value))}
            className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="font-bold text-slate-200 w-8 text-right">{hvacState.damperOpenPct}%</span>
        </div>
      </div>

      {/* Top-right GenAI demo preset panel */}
      <div className="absolute top-12 right-3 z-20 pointer-events-auto bg-[#0a101d]/92 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-2xl flex flex-col gap-1.5 w-[210px]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />AI Airflow Presets</span>
          <button onClick={() => setShowPanel(!showPanel)} className="text-slate-500 hover:text-slate-300">{showPanel ? 'hide' : 'show'}</button>
        </div>

        {showPanel && (
          <>
            {[
              { key: 'redirect', emoji: '🔀', label: 'Redirect (Amber)',  badge: '88%',  cls: 'amber'   },
              { key: 'bypass',   emoji: '⚠️', label: 'Bypass (Crimson)', badge: 'Scrub', cls: 'rose'    },
              { key: 'optimal',  emoji: '🌿', label: 'Max Bio (Emerald)', badge: '75%',  cls: 'emerald' },
              { key: 'auto',     emoji: '🔄', label: 'Auto Sync',         badge: 'Live',  cls: 'sky'     },
            ].map(({ key, emoji, label, badge, cls }) => {
              const active = hvacState.mode === key;
              const colMap = { amber: '#f59e0b', rose: '#ef4444', emerald: '#10b981', sky: '#38bdf8' };
              const c = colMap[cls];
              return (
                <button
                  key={key}
                  onClick={() => triggerHvac(key)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left flex items-center justify-between border"
                  style={active
                    ? { backgroundColor: `${c}22`, borderColor: c, color: c, fontWeight: 700 }
                    : { backgroundColor: 'transparent', borderColor: '#334155', color: '#94a3b8' }
                  }
                >
                  <span>{emoji} {label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${c}33`, color: c }}>{badge}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}

// ─── Default export: full R3F canvas scene ───────────────────────────────
export default function BuildingTwin({ focusMode = 'overview' }) {
  const algaeHealth = useStore((s) => s.algae_health);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#050c17] via-[#091220] to-[#070e1a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* DOM overlay */}
      <TwinHUD focusMode={focusMode} />

      {/* Bottom footer */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
        <span className="text-emerald-400">5-STORY BIO-FACADE</span>
        <span>·</span>
        <span>40 CHLORELLA PANELS</span>
        <span>·</span>
        <span className="text-sky-400">CLOSED-LOOP HVAC SPARGING</span>
      </div>

      {/* Three.js Canvas */}
      <Canvas shadows dpr={[1, 2]} className="flex-1 w-full h-full">
        <PerspectiveCamera makeDefault position={[6, 3.5, 7]} fov={44} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={4}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2 + 0.08}
          autoRotate={false}
        />

        {/* Lighting rig */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[10, 16, 8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.002}
        />
        <directionalLight position={[-8, 6, -6]} intensity={0.35} color="#b2e8ff" />

        {/* Dynamic bio point light */}
        <DynamicBioLight />

        {/* HDR sky environment for realistic glass reflections */}
        <Environment preset="city" />

        {/* The actual building — gently floating */}
        <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.12}>
          <group position={[0, -0.3, 0]}>
            <ProceduralBuilding />
          </group>
        </Float>

        {/* Ground plane */}
        <ContactShadows
          position={[0, -3.6, 0]}
          opacity={0.65}
          scale={15}
          blur={2}
          far={6}
          color="#000000"
        />
        <Grid
          position={[0, -3.62, 0]}
          args={[22, 22]}
          cellSize={0.85}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={2.55}
          sectionThickness={1.1}
          sectionColor="#334155"
          fadeDistance={20}
        />
      </Canvas>
    </div>
  );
}
