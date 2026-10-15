/**
 * HVACSystem.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Procedural HVAC Ductwork + Airflow Particle System for the Algor-Algae
 * Digital Twin. ZERO external model files — built entirely from R3F primitives.
 *
 * Data bindings:
 *   occupancy  → flow speed, tube emission intensity, particle count activation
 *   co2_ppm    → colour gradient (blue → orange → crimson)
 *   hvacState  → damper angle, activeLoop, airflowVelocity, airflowColor
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

// ─── Colour helpers ────────────────────────────────────────────────────────
const C_CALM     = new THREE.Color('#38bdf8'); // icy blue  – low CO2
const C_MODERATE = new THREE.Color('#f59e0b'); // amber     – moderate
const C_HEAVY    = new THREE.Color('#ef4444'); // crimson   – high occupancy
const C_BIO      = new THREE.Color('#10b981'); // emerald   – healthy algae
const C_TMP      = new THREE.Color();          // scratch – mutated only

function lerp3(out, a, b, c, t) {
  if (t < 0.5) out.lerpColors(a, b, t * 2);
  else          out.lerpColors(b, c, (t - 0.5) * 2);
}

// ─── HVAC Riser ── vertical central supply duct ───────────────────────────
function CentralRiser({ height = 7, radius = 0.22 }) {
  const matRef  = useRef();
  const lerpCol = useMemo(() => new THREE.Color('#38bdf8'), []);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const { co2_ppm } = useStore.getState();
    const t = Math.min(1, Math.max(0, (co2_ppm - 400) / 800));
    lerp3(C_TMP, C_CALM, C_MODERATE, C_HEAVY, t);
    lerpCol.lerp(C_TMP, delta * 2.5);
    matRef.current.emissive.copy(lerpCol);
    matRef.current.emissiveIntensity = 0.55 + t * 0.45;
  });

  return (
    <mesh position={[0, height / 2 - 3.5, 0]}>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color="#1e293b"
        roughness={0.3}
        metalness={0.9}
        emissive="#38bdf8"
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

// ─── Branch duct – horizontal from riser to exterior ──────────────────────
function BranchDuct({ from, to, radius = 0.08, co2t = 0 }) {
  const matRef = useRef();
  const col    = useMemo(() => new THREE.Color('#38bdf8'), []);
  const dir    = useMemo(() => new THREE.Vector3().subVectors(to, from), [from, to]);
  const len    = useMemo(() => dir.length(), [dir]);
  const mid    = useMemo(() => new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5), [from, to]);
  const quat   = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return q;
  }, [dir]);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    lerp3(C_TMP, C_CALM, C_MODERATE, C_HEAVY, co2t);
    col.lerp(C_TMP, delta * 3);
    matRef.current.emissive.copy(col);
  });

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 10]} />
      <meshStandardMaterial
        ref={matRef}
        color="#334155"
        roughness={0.25}
        metalness={0.85}
        emissive="#38bdf8"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

// ─── Motorised Damper Collar ───────────────────────────────────────────────
function DamperCollar({ position, open = 0.5 }) {
  const meshRef = useRef();
  const matRef  = useRef();
  const col     = useMemo(() => new THREE.Color('#38bdf8'), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !matRef.current) return;
    // Rotate plate proportional to valve opening
    const targetRot = (1 - open) * Math.PI * 0.42;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z, targetRot, delta * 4
    );
    const { hvacState } = useStore.getState();
    col.lerp(new THREE.Color(hvacState.airflowColor), delta * 3);
    matRef.current.emissive.copy(col);
    matRef.current.emissiveIntensity = 0.4 + open * 0.6;
  });

  return (
    <group position={position}>
      {/* Ring housing */}
      <mesh>
        <torusGeometry args={[0.145, 0.035, 8, 20]} />
        <meshStandardMaterial
          ref={matRef}
          color="#475569"
          metalness={0.95}
          roughness={0.1}
          emissive="#38bdf8"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Rotating vane */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.26, 0.025, 0.025]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Airflow particle stream ── core riser stream ─────────────────────────
function CoreAirflowParticles({ count = 80 }) {
  const ref  = useRef();
  const col  = useMemo(() => new THREE.Color('#38bdf8'), []);

  const { positions, speeds } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.18;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = Math.sin(a) * r;
      spds[i]        = 0.6 + Math.random() * 0.8;
    }
    return { positions: pos, speeds: spds };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const { occupancy, co2_ppm, hvacState } = useStore.getState();
    const velocity = hvacState.airflowVelocity * (0.5 + occupancy * 0.3);
    const arr = ref.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * velocity * speeds[i];
      if (arr[i * 3 + 1] > 3.5) arr[i * 3 + 1] = -3.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // Colour shift
    const t = Math.min(1, Math.max(0, (co2_ppm - 400) / 800));
    lerp3(C_TMP, C_CALM, C_MODERATE, C_HEAVY, t);
    col.lerp(C_TMP, delta * 2.5);
    ref.current.material.color.copy(col);
    ref.current.material.size = 0.055 + occupancy * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#38bdf8"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Radial redirection stream ── riser → facade ──────────────────────────
function RadialAirflowParticles({ count = 120, floors = 5, facadeRadius = 2.6 }) {
  const ref    = useRef();
  const col    = useMemo(() => new THREE.Color('#38bdf8'), []);
  const floorH = 1.1;

  const { positions, meta } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const m   = [];
    const arms = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    for (let i = 0; i < count; i++) {
      const arm      = arms[i % arms.length] + (Math.random() - 0.5) * 0.08;
      const floorIdx = Math.floor(Math.random() * floors);
      const y        = (floorIdx - (floors - 1) / 2) * floorH;
      const progress = Math.random();
      const r        = 0.22 + progress * (facadeRadius - 0.22);
      pos[i * 3]     = Math.cos(arm) * r;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.35;
      pos[i * 3 + 2] = Math.sin(arm) * r;
      m.push({ arm, y, floorIdx, progress, spd: 0.5 + Math.random() * 0.7 });
    }
    return { positions: pos, meta: m };
  }, [count, floors, facadeRadius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const { occupancy, co2_ppm, hvacState } = useStore.getState();
    const velocity = hvacState.airflowVelocity * (0.8 + occupancy * 0.35);
    const arr = ref.current.geometry.attributes.position.array;
    const bypass = hvacState.activeLoop === 'roof_bypass';

    for (let i = 0; i < count; i++) {
      const m = meta[i];
      m.progress += delta * velocity * m.spd * (bypass ? 0.2 : 1);
      if (m.progress > 1) m.progress = 0;
      const r = 0.22 + m.progress * (facadeRadius - 0.22);
      arr[i * 3]     = Math.cos(m.arm) * r;
      arr[i * 3 + 2] = Math.sin(m.arm) * r;
      arr[i * 3 + 1] = m.y + Math.sin(m.progress * Math.PI * 4) * 0.06;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    const t = Math.min(1, Math.max(0, (co2_ppm - 400) / 800));
    lerp3(C_TMP, C_CALM, C_MODERATE, C_HEAVY, t);
    col.lerp(new THREE.Color(hvacState.airflowColor), delta * 2.5);
    ref.current.material.color.copy(col);
    ref.current.material.size = 0.07 + occupancy * 0.015;
    ref.current.material.opacity = bypass ? 0.25 : 0.9;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#38bdf8"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Bypass particles ── riser → rooftop scrubber ─────────────────────────
function BypassParticles({ count = 60 }) {
  const ref = useRef();
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 0.3;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const { hvacState } = useStore.getState();
    const active = hvacState.activeLoop === 'roof_bypass';
    ref.current.visible = active;
    if (!active) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 2.2;
      if (arr[i * 3 + 1] > 3.8) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#ef4444" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ─── Facade panel sparging bubbles ────────────────────────────────────────
function FacadeSpargingBubbles({ count = 140, facadeRadius = 2.6, floors = 5 }) {
  const ref    = useRef();
  const floorH = 1.1;
  const { positions, speeds } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    const panelAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
    for (let i = 0; i < count; i++) {
      const ang  = panelAngles[i % panelAngles.length] + (Math.random() - 0.5) * 0.1;
      const flr  = Math.floor(Math.random() * floors);
      const y    = (flr - (floors - 1) / 2) * floorH + (Math.random() - 0.5) * floorH * 0.8;
      pos[i * 3]     = Math.cos(ang) * (facadeRadius + 0.05);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(ang) * (facadeRadius + 0.05);
      spds[i]        = 0.3 + Math.random() * 0.5;
    }
    return { positions: pos, speeds: spds };
  }, [count, facadeRadius, floors]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const { hvacState, algae_health } = useStore.getState();
    const baseSpeed = 0.5 + (hvacState.damperOpenPct / 100) * 1.8;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * baseSpeed * speeds[i];
      const flr = Math.round(i / count * 5);
      const topY = ((flr + 1) - 5 / 2) * floorH;
      if (arr[i * 3 + 1] > topY + 0.6) {
        arr[i * 3 + 1] = topY - floorH * 0.9;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const healthy = algae_health >= 70;
    ref.current.material.color.set(healthy ? '#10b981' : algae_health >= 45 ? '#f59e0b' : '#ef4444');
    ref.current.material.opacity = 0.7;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.065} color="#10b981" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────
export default function HVACSystem({ floors = 5, facadeRadius = 2.6 }) {
  const floorH   = 1.1;
  const arms     = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const riserTop = (floors / 2) * floorH;

  // Pre-compute branch geometries
  const branches = useMemo(() => {
    const items = [];
    for (let f = 0; f < floors; f++) {
      const y = (f - (floors - 1) / 2) * floorH;
      for (const arm of arms) {
        const from = new THREE.Vector3(0, y, 0);
        const to   = new THREE.Vector3(
          Math.cos(arm) * (facadeRadius - 0.05),
          y,
          Math.sin(arm) * (facadeRadius - 0.05)
        );
        items.push({ key: `b-${f}-${arm}`, from, to, y, arm });
      }
    }
    return items;
  }, [floors, facadeRadius]);

  return (
    <group>
      {/* Central riser */}
      <CentralRiser height={floors * floorH + 0.4} />

      {/* Horizontal branches + dampers */}
      {branches.map(({ key, from, to, y, arm }) => (
        <group key={key}>
          <BranchDuct from={from} to={to} />
          {/* Damper collar at mid-point */}
          <DamperCollar
            position={[
              Math.cos(arm) * (facadeRadius * 0.5),
              y,
              Math.sin(arm) * (facadeRadius * 0.5),
            ]}
          />
        </group>
      ))}

      {/* Rooftop scrubber connect pipe (visible in bypass mode) */}
      <mesh position={[0, riserTop + 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 1.2, 10]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} emissive="#ef4444" emissiveIntensity={0.2} />
      </mesh>

      {/* Particle systems */}
      <CoreAirflowParticles   count={80} />
      <RadialAirflowParticles count={120} floors={floors} facadeRadius={facadeRadius} />
      <BypassParticles        count={60} />
      <FacadeSpargingBubbles  count={140} facadeRadius={facadeRadius} floors={floors} />
    </group>
  );
}
