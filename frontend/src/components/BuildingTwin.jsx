/**
 * BuildingTwin.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Neoclassical Architectural Digital Twin with Integrated Living Algae Bioreactors.
 *
 * Faithfully reproduces the 4-Side Architectural Elevation Reference:
 * - Symmetrical 7-bay classical neoclassical facade (41.4m width x 34.2m depth x 18.0m height)
 * - Cream and beige limestone finish, fluted columns, pilasters, and classical cornices
 * - Ground Floor (+0.000): Rusticated ashlar base with arched Roman windows & grand central entrance
 * - Upper Floors (+4.2m First, +7.8m Second, +11.4m Third): Rectangular molded windows with sash muntins
 * - Central Portico (+15.0m Terrace, +18.0m Roof): Triangular pediment with oculus window
 * - Rear Elevation: Matching classical pilaster colonnade and window bays
 * - Left & Right Elevations: 5-bay symmetrical elevations with side porticos
 *
 * Bioreactor Integration:
 * - Stacked cylindrical glass photobioreactors placed on exterior corners on every floor
 * - Dynamic culture fluid lerping: Emerald Green -> Light Green -> Yellow -> Murky Brown
 * - Internal rising aeration bubble particle systems
 * - Connecting HVAC supply pipes with animated airflow particles responding to:
 *   occupancy, co2_ppm, algae_health, damperOpenPct, airflowVelocity, airflowColor
 *
 * View Controls:
 * - Quick-switch buttons for Front, Rear, Left Side, Right Side, and 3D Orbit angles
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  Wind,
  Bot,
  Zap,
  Sliders,
  Eye,
  Camera,
  Activity,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store';

// ─── Dimensions (Normalized scale based on 41.4m x 34.2m x 18.0m) ───────────
const B_WIDTH   = 8.28; // 41.4m
const B_DEPTH   = 6.84; // 34.2m
const B_HEIGHT  = 3.60; // 18.0m to roofline
const HALF_W    = B_WIDTH / 2;  // 4.14
const HALF_D    = B_DEPTH / 2;  // 3.42

// Floor Level Y Positions (Base centered at Y = 0)
const Y_GROUND  = -1.35; // +0.000m
const Y_FLOOR1  = -0.55; // +4.200m
const Y_FLOOR2  =  0.15; // +7.800m
const Y_FLOOR3  =  0.85; // +11.400m
const Y_TERRACE =  1.55; // +15.000m
const Y_ROOF    =  2.15; // +18.000m

// ─── Color & Material Palettes (Neoclassical Limestone & Slate) ─────────────
const STONE_CREAM       = '#dfd5c4'; // Primary warm limestone wall
const STONE_BEIGE_LIGHT = '#ebe4d8'; // Refined molded stone trim
const STONE_RUSTIC      = '#c8bea9'; // Rusticated ground ashlar
const STONE_COLUMN      = '#f5f0e6'; // Corinthian/Ionic white alabaster stone
const WINDOW_FRAME      = '#1a2e4a'; // Classical blue-grey frame
const WINDOW_GLASS      = '#7ba6c9'; // Multi-pane reflective window glass
const ROOF_SLATE        = '#374151'; // Dark roof trim and zinc capping
const PIPE_METAL        = '#64748b'; // HVAC intake/exhaust stainless conduits

// ─── Biological Culture Color Interpolation ─────────────────────────────────
const C_EMERALD_LUSH  = new THREE.Color('#059669'); // 95%+ peak healthy
const C_EMERALD_BASE  = new THREE.Color('#10b981'); // 80% healthy
const C_LIGHT_GREEN   = new THREE.Color('#84cc16'); // 65% moderate health
const C_AMBER_STRESS  = new THREE.Color('#eab308'); // 50% chlorosis stress
const C_CRIMSON_CRASH = new THREE.Color('#78350f'); // <35% yellow-brown/acid collapse
const C_SCRATCH = new THREE.Color();

function getBioreactorFluidColor(health) {
  const t = Math.max(0, Math.min(100, health)) / 100;
  if (t >= 0.80) {
    const sub = (t - 0.80) / 0.20;
    C_SCRATCH.lerpColors(C_EMERALD_BASE, C_EMERALD_LUSH, sub);
  } else if (t >= 0.60) {
    const sub = (t - 0.60) / 0.20;
    C_SCRATCH.lerpColors(C_LIGHT_GREEN, C_EMERALD_BASE, sub);
  } else if (t >= 0.40) {
    const sub = (t - 0.40) / 0.20;
    C_SCRATCH.lerpColors(C_AMBER_STRESS, C_LIGHT_GREEN, sub);
  } else {
    const sub = t / 0.40;
    C_SCRATCH.lerpColors(C_CRIMSON_CRASH, C_AMBER_STRESS, sub);
  }
  return C_SCRATCH.clone();
}

// ─── 1. Classical Window Components (Arched & Rectangular) ───────────────────
function ArchedWindow({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Outer Stone Surround / Architrave */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.48, 0.62, 0.04]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.65} />
      </mesh>
      {/* Rounded Arch Top Cap */}
      <mesh position={[0, 0.31, 0.015]}>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.65} />
      </mesh>
      {/* Keystones on top of arch */}
      <mesh position={[0, 0.44, 0.03]}>
        <boxGeometry args={[0.10, 0.12, 0.04]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.5} />
      </mesh>
      {/* Dark Frame */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.40, 0.54, 0.02]} />
        <meshStandardMaterial color={WINDOW_FRAME} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Glass Pane */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[0.36, 0.50, 0.01]} />
        <meshPhysicalMaterial
          color={WINDOW_GLASS}
          roughness={0.1}
          metalness={0.1}
          transmission={0.65}
          ior={1.45}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Muntin Cross Bar */}
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.36, 0.02, 0.01]} />
        <meshStandardMaterial color={WINDOW_FRAME} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.02, 0.50, 0.01]} />
        <meshStandardMaterial color={WINDOW_FRAME} />
      </mesh>
    </group>
  );
}

function RectangularWindow({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Molded Architrave Surround */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.44, 0.54, 0.04]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.65} />
      </mesh>
      {/* Projecting Window Sill */}
      <mesh position={[0, -0.28, 0.035]}>
        <boxGeometry args={[0.50, 0.05, 0.07]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>
      {/* Molded Lintel Cornice on Top */}
      <mesh position={[0, 0.28, 0.035]}>
        <boxGeometry args={[0.50, 0.05, 0.07]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>
      {/* Dark Frame */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.36, 0.46, 0.02]} />
        <meshStandardMaterial color={WINDOW_FRAME} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Glass Pane */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[0.32, 0.42, 0.01]} />
        <meshPhysicalMaterial
          color={WINDOW_GLASS}
          roughness={0.1}
          metalness={0.1}
          transmission={0.65}
          ior={1.45}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Muntin Bars */}
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.32, 0.018, 0.01]} />
        <meshStandardMaterial color={WINDOW_FRAME} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.018, 0.42, 0.01]} />
        <meshStandardMaterial color={WINDOW_FRAME} />
      </mesh>
    </group>
  );
}

// ─── 2. Classical Column / Pilaster ──────────────────────────────────────────
function ClassicalPilaster({ position, height = 2.4, radius = 0.09, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Fluted Column Shaft */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.92, radius, height, 16]} />
        <meshStandardMaterial color={STONE_COLUMN} roughness={0.5} />
      </mesh>
      {/* Molded Base Plinth */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[radius * 2.6, 0.10, radius * 2.6]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>
      {/* Corinthian / Ionic Capital on Top */}
      <mesh position={[0, height - 0.05, 0]}>
        <boxGeometry args={[radius * 2.7, 0.12, radius * 2.7]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ─── 3. Grand Central Entrance Portico & Triangular Pediment ─────────────────
function CentralEntrancePortico() {
  return (
    <group position={[0, Y_GROUND, HALF_D]}>
      {/* Stone Entrance Steps (Descending) */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, -0.32 - i * 0.06, 0.55 + i * 0.14]}>
          <boxGeometry args={[2.4 - i * 0.15, 0.06, 0.6]} />
          <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.7} />
        </mesh>
      ))}

      {/* Grand Double Wooden Door */}
      <group position={[0, 0.45, 0.02]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.74, 0.96, 0.04]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
        {/* Semi-circular Fanlight Arch above door */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.37, 0.37, 0.04, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color={WINDOW_GLASS} transmission={0.7} opacity={0.8} />
        </mesh>
      </group>

      {/* 4 Grand Portico Columns supporting the Pediment */}
      <ClassicalPilaster position={[-0.85, 0, 0.72]} height={2.85} radius={0.11} />
      <ClassicalPilaster position={[-0.30, 0, 0.72]} height={2.85} radius={0.11} />
      <ClassicalPilaster position={[ 0.30, 0, 0.72]} height={2.85} radius={0.11} />
      <ClassicalPilaster position={[ 0.85, 0, 0.72]} height={2.85} radius={0.11} />

      {/* Portico Architrave Beam */}
      <mesh position={[0, 2.85, 0.72]}>
        <boxGeometry args={[2.3, 0.18, 0.42]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.5} />
      </mesh>

      {/* Grand Triangular Pediment with Molded Cornice */}
      <group position={[0, 3.16, 0.72]}>
        {/* Tympanum triangle base */}
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, 1.35, 0.52, 3]} rotation={[0, 0, Math.PI]} scale={[1.8, 1, 0.35]} />
          <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.5} />
        </mesh>
        {/* Circular Oculus Window in Tympanum (matching elevation reference) */}
        <mesh position={[0, -0.06, 0.18]}>
          <torusGeometry args={[0.14, 0.035, 8, 24]} />
          <meshStandardMaterial color={WINDOW_FRAME} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.06, 0.18]}>
          <circleGeometry args={[0.13, 24]} />
          <meshPhysicalMaterial color={WINDOW_GLASS} transmission={0.8} transparent />
        </mesh>
      </group>
    </group>
  );
}

// ─── 4. Corner Living Algae Bioreactor Stack ────────────────────────────────
function CornerBioreactorStack({ position, floorYs = [Y_FLOOR1, Y_FLOOR2, Y_FLOOR3, Y_TERRACE] }) {
  const matRef = useRef();
  const bubblesRef = useRef();
  const currentFluidCol = useMemo(() => new THREE.Color('#10b981'), []);

  // Micro-bubble particle system inside the vertical corner reactor stack
  const bubbleCount = 70;
  const { bubblePositions, bubbleSpeeds } = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    const spd = new Float32Array(bubbleCount);
    for (let i = 0; i < bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.18;
      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = -1.2 + Math.random() * 3.2;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      spd[i] = 0.5 + Math.random() * 0.9;
    }
    return { bubblePositions: pos, bubbleSpeeds: spd };
  }, [bubbleCount]);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const { algae_health, hvacState } = useStore.getState();

    // Dynamically lerp fluid color based on real-time health telemetry
    const targetColor = getBioreactorFluidColor(algae_health);
    currentFluidCol.lerp(targetColor, delta * 3.0);
    matRef.current.color.copy(currentFluidCol);
    matRef.current.emissive.copy(currentFluidCol);

    // Bubble ascent physics tied to HVAC damper & velocity
    if (bubblesRef.current) {
      const vel = 0.6 + (hvacState.damperOpenPct / 100) * 1.8;
      const arr = bubblesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        arr[i * 3 + 1] += delta * vel * bubbleSpeeds[i];
        if (arr[i * 3 + 1] > 2.1) {
          arr[i * 3 + 1] = -1.2;
        }
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* 4 Stacked Cylindrical Modules corresponding to each floor */}
      {floorYs.map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          {/* Outer Borosilicate Glass Cylinder */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.62, 24, 1, false]} />
            <meshPhysicalMaterial
              color="#f8fafc"
              roughness={0.05}
              transmission={0.92}
              ior={1.5}
              thickness={0.5}
              transparent
              opacity={0.4}
              clearcoat={1.0}
            />
          </mesh>

          {/* Inner Liquid Microalgae Culture Core */}
          <mesh>
            <cylinderGeometry args={[0.21, 0.21, 0.58, 20]} />
            <meshPhysicalMaterial
              ref={i === 0 ? matRef : undefined}
              color="#10b981"
              emissive="#064e3b"
              emissiveIntensity={0.35}
              roughness={0.18}
              transmission={0.5}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Stainless Steel Sanitary Flange Collars on Top & Bottom */}
          <mesh position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 20]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.31, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 20]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Connecting HVAC Loop Pipes attaching reactor to the facade */}
          <group position={[0, 0, -0.28]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
              <meshStandardMaterial color={PIPE_METAL} metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Internal Rising Sparging Bubble Particles */}
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={bubbleCount}
            array={bubblePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#f0fdf4"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Continuous Vertical Support Truss & Exhaust Riser */}
      <mesh position={[0, 0.35, -0.28]}>
        <cylinderGeometry args={[0.035, 0.035, 3.4, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── 5. HVAC Connecting Conduits & Animated Airflow Particles ───────────────
function AirflowPipeNetwork() {
  const pointsRef = useRef();
  const particleCount = 60;

  const { particlePos, meta } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const m = [];
    const corners = [
      [-HALF_W + 0.15, HALF_D - 0.15],
      [ HALF_W - 0.15, HALF_D - 0.15],
      [-HALF_W + 0.15, -HALF_D + 0.15],
      [ HALF_W - 0.15, -HALF_D + 0.15]
    ];

    for (let i = 0; i < particleCount; i++) {
      const c = corners[i % 4];
      const flrIdx = Math.floor(Math.random() * 4);
      const yBase = [Y_FLOOR1, Y_FLOOR2, Y_FLOOR3, Y_TERRACE][flrIdx];
      pos[i * 3 + 0] = c[0];
      pos[i * 3 + 1] = yBase;
      pos[i * 3 + 2] = c[1];
      m.push({ corner: c, yBase, progress: Math.random() });
    }
    return { particlePos: pos, meta: m };
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const { hvacState } = useStore.getState();
    const arr = pointsRef.current.geometry.attributes.position.array;
    const speed = hvacState.airflowVelocity * 0.9;

    for (let i = 0; i < particleCount; i++) {
      meta[i].progress += delta * speed;
      if (meta[i].progress > 1) meta[i].progress = 0;

      // Pulse along connecting pipe
      arr[i * 3 + 1] = meta[i].yBase + (Math.sin(meta[i].progress * Math.PI * 2) * 0.15);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.material.color.set(hvacState.airflowColor);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particlePos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.065} color="#38bdf8" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ─── 6. Full Neoclassical Building Architecture ──────────────────────────────
function NeoclassicalBuildingArchitecture() {
  // Symmetrical Window Bay Offsets along X-axis (Front & Rear: 7 bays)
  const frontBayXs = useMemo(() => [-2.85, -1.90, -0.95, 0.95, 1.90, 2.85], []);

  // Symmetrical Window Bay Offsets along Z-axis (Sides: 5 bays)
  const sideBayZs = useMemo(() => [-2.2, -1.1, 0, 1.1, 2.2], []);

  return (
    <group>
      {/* ── GROUND FLOOR RUSTICATED PODIUM (+0.000m to +4.200m) ── */}
      <mesh position={[0, Y_GROUND + 0.42, 0]} receiveShadow castShadow>
        <boxGeometry args={[B_WIDTH, 0.84, B_DEPTH]} />
        <meshStandardMaterial color={STONE_RUSTIC} roughness={0.85} />
      </mesh>

      {/* Belt Cornice above Ground Floor */}
      <mesh position={[0, Y_FLOOR1 - 0.06, 0]}>
        <boxGeometry args={[B_WIDTH + 0.14, 0.12, B_DEPTH + 0.14]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>

      {/* ── UPPER FLOORS CORE (+4.200m to +15.000m) ── */}
      <mesh position={[0, (Y_FLOOR1 + Y_TERRACE) / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[B_WIDTH, Y_TERRACE - Y_FLOOR1, B_DEPTH]} />
        <meshStandardMaterial color={STONE_CREAM} roughness={0.7} />
      </mesh>

      {/* Intermediate Horizontal Stringcourse Moldings between Floors */}
      <mesh position={[0, Y_FLOOR2 - 0.04, 0]}>
        <boxGeometry args={[B_WIDTH + 0.08, 0.08, B_DEPTH + 0.08]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>
      <mesh position={[0, Y_FLOOR3 - 0.04, 0]}>
        <boxGeometry args={[B_WIDTH + 0.08, 0.08, B_DEPTH + 0.08]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.6} />
      </mesh>

      {/* ── MAIN ROOF ENTABLATURE & BALUSTRADE (+15.000m) ── */}
      <mesh position={[0, Y_TERRACE + 0.08, 0]}>
        <boxGeometry args={[B_WIDTH + 0.22, 0.16, B_DEPTH + 0.22]} />
        <meshStandardMaterial color={STONE_BEIGE_LIGHT} roughness={0.55} />
      </mesh>
      {/* Parapet / Terrace Balustrade Wall */}
      <mesh position={[0, Y_TERRACE + 0.24, 0]}>
        <boxGeometry args={[B_WIDTH + 0.16, 0.18, B_DEPTH + 0.16]} />
        <meshStandardMaterial color={STONE_CREAM} roughness={0.75} />
      </mesh>

      {/* Roof Deck Slab */}
      <mesh position={[0, Y_TERRACE + 0.14, 0]}>
        <boxGeometry args={[B_WIDTH - 0.1, 0.06, B_DEPTH - 0.1]} />
        <meshStandardMaterial color={ROOF_SLATE} roughness={0.8} />
      </mesh>

      {/* ── FRONT ELEVATION WINDOWS & CLASSICAL PILASTERS ── */}
      {/* Ground Floor Arched Windows (Front) */}
      {frontBayXs.map((x, i) => (
        <ArchedWindow key={`fg-${i}`} position={[x, Y_GROUND + 0.42, HALF_D + 0.01]} />
      ))}

      {/* Floors 1, 2, 3 Rectangular Windows (Front) */}
      {[Y_FLOOR1 + 0.36, Y_FLOOR2 + 0.36, Y_FLOOR3 + 0.36].map((y, fi) =>
        frontBayXs.map((x, bi) => (
          <RectangularWindow key={`fw-${fi}-${bi}`} position={[x, y, HALF_D + 0.01]} />
        ))
      )}

      {/* Full-Height Classical Pilasters flanking the Front bays */}
      {[-3.3, -2.4, -1.4, 1.4, 2.4, 3.3].map((x, i) => (
        <ClassicalPilaster key={`fp-${i}`} position={[x, Y_FLOOR1, HALF_D + 0.02]} height={2.2} radius={0.08} />
      ))}

      {/* Grand Central Entrance Portico with Columns & Pediment */}
      <CentralEntrancePortico />

      {/* ── REAR ELEVATION WINDOWS & PILASTERS ── */}
      {/* Ground Floor Arched Windows (Rear) */}
      {frontBayXs.map((x, i) => (
        <ArchedWindow key={`rg-${i}`} position={[x, Y_GROUND + 0.42, -HALF_D - 0.01]} rotation={[0, Math.PI, 0]} />
      ))}
      {/* Floors 1, 2, 3 Rectangular Windows (Rear) */}
      {[Y_FLOOR1 + 0.36, Y_FLOOR2 + 0.36, Y_FLOOR3 + 0.36].map((y, fi) =>
        frontBayXs.map((x, bi) => (
          <RectangularWindow key={`rw-${fi}-${bi}`} position={[x, y, -HALF_D - 0.01]} rotation={[0, Math.PI, 0]} />
        ))
      )}
      {/* Central Pilaster Colonnade (Rear Elevation Center Feature) */}
      {[-0.95, -0.32, 0.32, 0.95].map((x, i) => (
        <ClassicalPilaster key={`rp-${i}`} position={[x, Y_FLOOR1, -HALF_D - 0.02]} height={2.2} radius={0.09} rotation={[0, Math.PI, 0]} />
      ))}

      {/* ── LEFT SIDE ELEVATION WINDOWS & PILASTERS (5 Bays) ── */}
      {sideBayZs.map((z, i) => (
        <ArchedWindow key={`lg-${i}`} position={[-HALF_W - 0.01, Y_GROUND + 0.42, z]} rotation={[0, -Math.PI / 2, 0]} />
      ))}
      {[Y_FLOOR1 + 0.36, Y_FLOOR2 + 0.36, Y_FLOOR3 + 0.36].map((y, fi) =>
        sideBayZs.map((z, bi) => (
          <RectangularWindow key={`lw-${fi}-${bi}`} position={[-HALF_W - 0.01, y, z]} rotation={[0, -Math.PI / 2, 0]} />
        ))
      )}
      {[-2.75, -1.65, -0.55, 0.55, 1.65, 2.75].map((z, i) => (
        <ClassicalPilaster key={`lp-${i}`} position={[-HALF_W - 0.02, Y_FLOOR1, z]} height={2.2} radius={0.08} rotation={[0, -Math.PI / 2, 0]} />
      ))}

      {/* ── RIGHT SIDE ELEVATION WINDOWS & PILASTERS (5 Bays) ── */}
      {sideBayZs.map((z, i) => (
        <ArchedWindow key={`rg2-${i}`} position={[HALF_W + 0.01, Y_GROUND + 0.42, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      {[Y_FLOOR1 + 0.36, Y_FLOOR2 + 0.36, Y_FLOOR3 + 0.36].map((y, fi) =>
        sideBayZs.map((z, bi) => (
          <RectangularWindow key={`rw2-${fi}-${bi}`} position={[HALF_W + 0.01, y, z]} rotation={[0, Math.PI / 2, 0]} />
        ))
      )}
      {[-2.75, -1.65, -0.55, 0.55, 1.65, 2.75].map((z, i) => (
        <ClassicalPilaster key={`rp2-${i}`} position={[HALF_W + 0.02, Y_FLOOR1, z]} height={2.2} radius={0.08} rotation={[0, Math.PI / 2, 0]} />
      ))}

      {/* ── CORNER LIVING ALGAE BIOREACTORS (MATCHING 4 ELEVATIONS) ── */}
      {/* Front-Left Corner Stack */}
      <CornerBioreactorStack position={[-HALF_W + 0.28, 0, HALF_D - 0.28]} />
      {/* Front-Right Corner Stack */}
      <CornerBioreactorStack position={[ HALF_W - 0.28, 0, HALF_D - 0.28]} />
      {/* Rear-Left Corner Stack */}
      <CornerBioreactorStack position={[-HALF_W + 0.28, 0, -HALF_D + 0.28]} />
      {/* Rear-Right Corner Stack */}
      <CornerBioreactorStack position={[ HALF_W - 0.28, 0, -HALF_D + 0.28]} />

      {/* ── AIRFLOW DUCTWORK & CONNECTING PARTICLE SYSTEM ── */}
      <AirflowPipeNetwork />
    </group>
  );
}

// ─── Camera Angle Controller (Front, Rear, Left, Right Presets) ──────────────
function CameraController({ viewAngle }) {
  const { camera } = useThree();

  useEffect(() => {
    const targets = {
      front: [0, 0.6, 11.2],
      rear: [0, 0.6, -11.2],
      left: [-11.0, 0.6, 0],
      right: [11.0, 0.6, 0],
      perspective: [7.5, 4.2, 8.2]
    };
    const t = targets[viewAngle] || targets.perspective;
    camera.position.set(t[0], t[1], t[2]);
    camera.lookAt(0, 0.3, 0);
  }, [viewAngle, camera]);

  return null;
}

// ─── Dynamic Biological Light ────────────────────────────────────────────────
function DynamicBioLight() {
  const lightRef = useRef();

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const { algae_health, hvacState } = useStore.getState();
    const color = getBioreactorFluidColor(algae_health);
    lightRef.current.color.lerp(color, delta * 3.0);
    lightRef.current.intensity = 0.8 + (algae_health / 100) * 1.4;
  });

  return (
    <group>
      <pointLight ref={lightRef} position={[-HALF_W, 0.5, HALF_D]} distance={6} decay={1.8} />
      <pointLight position={[HALF_W, 0.5, HALF_D]} color="#10b981" distance={6} decay={1.8} intensity={0.9} />
    </group>
  );
}

// ─── Twin HUD Overlay with Elevation Angle Presets ───────────────────────────
function NeoclassicalTwinHUD({ focusMode, viewAngle, setViewAngle }) {
  const algaeHealth = useStore((s) => s.algae_health);
  const occupancy   = useStore((s) => s.occupancy);
  const co2Ppm      = useStore((s) => s.co2_ppm);
  const hvacState   = useStore((s) => s.hvacState);
  const triggerHvac = useStore((s) => s.triggerHvacScenario);
  const setDamper   = useStore((s) => s.setHvacDamper);

  const statusColor = algaeHealth >= 75 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <>
      {/* Top-Left Mode & Elevation Status */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-2">
        <div
          className="px-3 py-1.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          style={{
            borderColor: `${statusColor}66`,
            backgroundColor: `${statusColor}18`,
            color: statusColor
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: statusColor }} />
          NEOCLASSICAL ARCHITECTURE · {hvacState.hvacStatusText}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-mono bg-black/60 border border-slate-800 text-slate-300 backdrop-blur-md">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          {occupancy} occupants · {co2Ppm} ppm CO₂ · {hvacState.damperOpenPct}% Damper
        </div>
      </div>

      {/* Top-Right 4-Elevation Camera View Selectors */}
      <div className="absolute top-3 right-3 z-20 pointer-events-auto bg-[#0a101d]/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-2xl flex flex-col gap-1.5">
        <div className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider px-1 flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3 text-sky-400" /> Elevation Views
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
          {[
            { key: 'front', label: 'Front' },
            { key: 'rear', label: 'Rear' },
            { key: 'left', label: 'Left Side' },
            { key: 'right', label: 'Right Side' },
            { key: 'perspective', label: '3D Orbit' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewAngle(key)}
              className={`px-2 py-1 rounded-lg border transition-all text-center ${
                viewAngle === key
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              } ${key === 'perspective' ? 'col-span-2' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar: AI Diagnostics & Damper Control */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2">
        <div className="max-w-md text-[11px] font-mono text-slate-300 bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1 text-[10px] uppercase tracking-wide">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            Gemini 3.8 Flash BMS Dynamic Control
          </div>
          <p className="text-slate-300 font-sans text-xs leading-snug">
            {hvacState.aiReasoning}
          </p>
        </div>

        <div className="pointer-events-auto bg-[#0a1222]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-3 text-xs font-mono shadow-xl">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400">DAMPER VALVE</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hvacState.damperOpenPct}
            onChange={(e) => setDamper(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="font-bold text-white w-8 text-right">{hvacState.damperOpenPct}%</span>
        </div>
      </div>
    </>
  );
}

// ─── Default Export: BuildingTwin ────────────────────────────────────────────
export default function BuildingTwin({ focusMode = 'overview' }) {
  const [viewAngle, setViewAngle] = useState('perspective');

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#060b14] via-[#091322] to-[#040812] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* HUD Overlay with Elevation Angle Selectors */}
      <NeoclassicalTwinHUD
        focusMode={focusMode}
        viewAngle={viewAngle}
        setViewAngle={setViewAngle}
      />

      {/* Footer Dimension Specs */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
        <span className="text-amber-300 font-bold">41.4m × 34.2m NEOCLASSICAL ELEVATIONS</span>
        <span>·</span>
        <span className="text-emerald-400">CORNER BIOREACTOR MODULES</span>
        <span>·</span>
        <span className="text-sky-300">LIVE BMS DATA-DRIVEN</span>
      </div>

      {/* Three.js Canvas Scene */}
      <Canvas shadows dpr={[1, 2]} className="flex-1 w-full h-full">
        <PerspectiveCamera makeDefault position={[7.5, 4.2, 8.2]} fov={44} />
        <CameraController viewAngle={viewAngle} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={4}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />

        {/* Studio Architectural Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 8, -8]} intensity={0.45} color="#dbeafe" />
        <directionalLight position={[0, -6, 8]} intensity={0.25} color="#fef3c7" />

        {/* Dynamic biological point lighting */}
        <DynamicBioLight />

        {/* Skybox Environment */}
        <Environment preset="city" />

        {/* The Neoclassical Building Model */}
        <Float speed={0.5} rotationIntensity={0.015} floatIntensity={0.08}>
          <group position={[0, 0, 0]}>
            <NeoclassicalBuildingArchitecture />
          </group>
        </Float>

        {/* Ground Shadows & Grid */}
        <ContactShadows
          position={[0, -1.95, 0]}
          opacity={0.65}
          scale={22}
          blur={2.5}
          far={8}
          color="#000000"
        />
        <Grid
          position={[0, -1.96, 0]}
          args={[26, 26]}
          cellSize={1.0}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={3.0}
          sectionThickness={1.0}
          sectionColor="#334155"
          fadeDistance={22}
        />
      </Canvas>
    </div>
  );
}
