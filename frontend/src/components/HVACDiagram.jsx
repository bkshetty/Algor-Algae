/**
 * HVACDiagram.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * 2D HVAC System Layout & Bio-Redirection Flow Visualizer.
 * Faithfully implements the design specification:
 * 1. Three Operational States Matrix (State 1: Normal, State 2: High Occ, State 3: Algae Low Bypass)
 * 2. 2D HVAC System Layout (SVG technical schematic with Filter, Supply Fan, Rooms 1-3,
 *    Return manifold, CO2 Sensor, 3-way Damper, Algae Bioreactor Facade, Exhaust cloud & Legend)
 * 3. Dynamic binding to live sensor telemetry or interactive state simulation.
 */

import React, { useState, useMemo } from 'react';
import {
  Wind,
  Users,
  Cloud,
  Leaf,
  AlertTriangle,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  CheckCircle2,
  RefreshCw,
  Gauge,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store';

// ─── Preset State Definitions (from design specification) ───────────────────
const STATES = {
  state1: {
    id: 'state1',
    title: 'State 1: Normal (Low Occupancy)',
    subtitle: 'Few or no humans detected. CO2 is low. Minimal redirection.',
    occupants: 1,
    co2: 550,
    algaeHealth: 100,
    toAlgaePct: 10,
    toOutdoorPct: 90,
    damperAngle: 12,
    flowLpm: 4.5,
    algaeColor: '#10b981',
    liquidTone: 'healthy',
    modeText: 'MINIMAL BIO-FEED',
    badgeColor: '#38bdf8'
  },
  state2: {
    id: 'state2',
    title: 'State 2: High Occupancy (Redirect to Algae)',
    subtitle: 'YOLO detects more humans. CO2 rises. Air is redirected to algae bioreactor.',
    occupants: 4,
    co2: 1000,
    algaeHealth: 85,
    toAlgaePct: 80,
    toOutdoorPct: 20,
    damperAngle: 72,
    flowLpm: 26.0,
    algaeColor: '#10b981',
    liquidTone: 'healthy',
    modeText: 'AI REDIRECT ACTIVE',
    badgeColor: '#f59e0b'
  },
  state3: {
    id: 'state3',
    title: 'State 3: Algae Health Low (Bypass to Outside)',
    subtitle: 'Algae is unhealthy. System bypasses algae and vents CO2 outside.',
    occupants: 4,
    co2: 1000,
    algaeHealth: 30,
    toAlgaePct: 5,
    toOutdoorPct: 95,
    damperAngle: 8,
    flowLpm: 2.0,
    algaeColor: '#eab308',
    liquidTone: 'unhealthy',
    modeText: 'EMERGENCY BYPASS',
    badgeColor: '#ef4444'
  }
};

// ─── Helper Donut / Pie Chart Component ──────────────────────────────────────
function DistributionDonut({ toAlgaePct, toOutdoorPct, size = 38 }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const algaeDash = (toAlgaePct / 100) * circumference;
  const outdoorDash = circumference - algaeDash;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="rotate-[-90deg]">
        {/* Background circle (outdoor) */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth="6"
        />
        {/* Algae arc */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="6"
          strokeDasharray={`${algaeDash} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-emerald-400">
        {toAlgaePct}%
      </div>
    </div>
  );
}

// ─── SVG Human Silhouette ────────────────────────────────────────────────────
function HumanSilhouette({ x, y, active = true, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={active ? 0.95 : 0.25}>
      {/* Head */}
      <circle cx="12" cy="7" r="4" fill={active ? "#7dd3fc" : "#475569"} />
      {/* Body seated at desk */}
      <path
        d="M6 22 C6 15 9 13 12 13 C15 13 18 15 18 22 Z"
        fill={active ? "#38bdf8" : "#334155"}
      />
      {/* Chair / Desk suggestion */}
      <rect x="3" y="19" width="18" height="2" rx="1" fill="#1e293b" />
      <rect x="18" y="14" width="7" height="7" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
    </g>
  );
}

// ─── Supply Fan SVG Icon with CSS Spin ─────────────────────────────────────────
function SpinningFan({ cx, cy, r = 16, spinning = true }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* Outer casing */}
      <circle cx="0" cy="0" r={r} fill="#091322" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="0" cy="0" r={r - 3} fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 2" />
      {/* Center hub */}
      <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
      {/* 4 Blades */}
      <g className={spinning ? "animate-spin origin-center" : ""} style={{ transformOrigin: '0px 0px', animationDuration: '2s' }}>
        <path d="M0 -3 C4 -11 11 -8 8 -2 Z" fill="#38bdf8" opacity="0.9" />
        <path d="M3 0 C11 4 8 11 2 8 Z" fill="#38bdf8" opacity="0.9" />
        <path d="M0 3 C-4 11 -11 8 -8 2 Z" fill="#38bdf8" opacity="0.9" />
        <path d="M-3 0 C-11 -4 -8 -11 -2 -8 Z" fill="#38bdf8" opacity="0.9" />
      </g>
    </g>
  );
}

// ─── 3-Way Motorized Damper Valve SVG ──────────────────────────────────────────
function ThreeWayDamperValve({ cx, cy, angle = 45, toAlgaePct = 80 }) {
  const isBypass = toAlgaePct <= 15;
  const damperColor = isBypass ? '#ef4444' : toAlgaePct >= 60 ? '#10b981' : '#f59e0b';

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* Housing Valve Box */}
      <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#0a1222" stroke={damperColor} strokeWidth="2" />
      <rect x="-20" y="-20" width="40" height="40" rx="5" fill="#030712" />

      {/* Internal Butterfly Valve / Flap */}
      <g transform={`rotate(${angle})`} style={{ transformOrigin: '0px 0px', transition: 'transform 0.5s ease' }}>
        <line x1="-16" y1="0" x2="16" y2="0" stroke={damperColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="0" cy="0" r="4" fill="#f8fafc" stroke={damperColor} strokeWidth="1.5" />
      </g>

      {/* Label Badge */}
      <rect x="-22" y="14" width="44" height="8" rx="2" fill="#0f172a" />
      <text x="0" y="20.5" fill={damperColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
        {toAlgaePct}% BIO
      </text>
    </g>
  );
}

// ─── Vertical Bioreactor Facade Column SVG ────────────────────────────────────
function BioreactorColumn({ x, y, width = 64, height = 150, health = 85, toAlgaePct = 80 }) {
  const isHealthy = health >= 60;
  const isCrisis = health < 45;
  const liquidColor = isCrisis ? '#eab308' : isHealthy ? '#10b981' : '#84cc16';
  const liquidGlow = isCrisis ? 'rgba(234, 179, 8, 0.3)' : 'rgba(16, 185, 129, 0.4)';

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Outer Glass Column */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="10"
        fill="#07101e"
        stroke="#334155"
        strokeWidth="2.5"
      />
      <rect
        x="2"
        y="2"
        width={width - 4}
        height={height - 4}
        rx="8"
        fill="url(#glassGrad)"
        opacity="0.8"
      />

      {/* Liquid Chamber */}
      <rect
        x="4"
        y="12"
        width={width - 8}
        height={height - 18}
        rx="6"
        fill={liquidColor}
        opacity={isCrisis ? "0.6" : "0.75"}
        style={{ filter: `drop-shadow(0 0 10px ${liquidGlow})`, transition: 'fill 0.6s ease' }}
      />

      {/* Liquid Highlights / Glass reflection */}
      <line x1="10" y1="18" x2="10" y2={height - 20} stroke="#ffffff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="14" y1="22" x2="14" y2={height - 40} stroke="#ffffff" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

      {/* Sparging Bubbles rising */}
      <g opacity={toAlgaePct > 15 ? 0.9 : 0.2}>
        <circle cx="18" cy={height - 26} r="2" fill="#ffffff" opacity="0.7" className="animate-ping" style={{ animationDuration: '1.4s' }} />
        <circle cx="32" cy={height - 45} r="2.8" fill="#ffffff" opacity="0.8" className="animate-ping" style={{ animationDuration: '1.8s' }} />
        <circle cx="46" cy={height - 35} r="1.8" fill="#ffffff" opacity="0.6" className="animate-ping" style={{ animationDuration: '1.2s' }} />
        <circle cx="25" cy={height - 75} r="3" fill="#ffffff" opacity="0.75" className="animate-ping" style={{ animationDuration: '2.1s' }} />
        <circle cx="38" cy={height - 95} r="2.2" fill="#ffffff" opacity="0.6" className="animate-ping" style={{ animationDuration: '1.6s' }} />
        <circle cx="20" cy={height - 110} r="2.5" fill="#ffffff" opacity="0.7" className="animate-ping" style={{ animationDuration: '1.9s' }} />
      </g>

      {/* Column Base and Top Fixtures */}
      <rect x="-4" y="-3" width={width + 8} height="8" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <rect x="-4" y={height - 5} width={width + 8} height="10" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* Attached Flow Meter [FM] */}
      <g transform={`translate(-22, ${height / 2 - 14})`}>
        <rect x="0" y="0" width="22" height="28" rx="4" fill="#091322" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="11" y="11" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FM</text>
        <line x1="3" y1="14" x2="19" y2="14" stroke="#1e3a5f" strokeWidth="1" />
        <text x="11" y="23" fill="#94a3b8" fontSize="6.5" textAnchor="middle" fontFamily="monospace">
          {toAlgaePct > 20 ? '26.0' : '2.0'}L
        </text>
      </g>

      {/* Bioreactor Label Text */}
      <text x={width / 2} y={height + 17} fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        Algae Bioreactor
      </text>
      <text x={width / 2} y={height + 27} fill="#10b981" fontSize="8" fontWeight="semibold" textAnchor="middle" fontFamily="monospace">
        Facade Panel
      </text>

      {/* Warning Overlay when Algae is Unhealthy */}
      {isCrisis && (
        <g transform={`translate(-25, ${height / 2 - 25})`}>
          <rect x="0" y="0" width={width + 50} height="48" rx="6" fill="#1a0909" stroke="#ef4444" strokeWidth="1.5" />
          <text x={(width + 50) / 2} y="18" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            ⚠️ ALGAE UNHEALTHY
          </text>
          <text x={(width + 50) / 2} y="32" fill="#fca5a5" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            BYPASSING FLOW (95%)
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Single State Architecture Card Component (Top 3 Cards) ─────────────────
function StateMatrixCard({ stateKey, data, isSelected, onSelect }) {
  const isHealthy = data.algaeHealth >= 60;
  const isCrisis = data.algaeHealth < 45;

  return (
    <div
      onClick={() => onSelect(stateKey)}
      className={`relative flex flex-col rounded-2xl p-4 transition-all cursor-pointer border ${
        isSelected
          ? 'bg-[#0b1322] border-sky-400 ring-2 ring-sky-500/20 shadow-xl'
          : 'bg-[#090f1c]/90 border-slate-800 hover:border-slate-700 hover:bg-[#0c1527]'
      }`}
    >
      {/* Selection pill */}
      {isSelected && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
          <CheckCircle2 className="w-3 h-3" /> ACTIVE SIMULATION
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="pr-16">
        <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.badgeColor }} />
          {data.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
          {data.subtitle}
        </p>
      </div>

      {/* Mini Schematic Cross-Section View */}
      <div className="my-3.5 relative bg-[#040812] rounded-xl p-3 border border-slate-800/80 overflow-hidden min-h-[160px] flex items-center justify-between">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />

        {/* Left: Building & Rooms */}
        <div className="relative z-10 flex-1 flex flex-col space-y-2 max-w-[190px]">
          {/* Rooftop HVAC unit */}
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <SpinningFan cx={10} cy={10} r={8} spinning={true} />
              <span className="text-[9px] font-mono font-bold text-slate-300 ml-3">HVAC UNIT</span>
            </div>
            {/* Small exhaust arrow to atmosphere */}
            <div className="text-[9px] font-mono text-amber-400 font-bold flex items-center">
              <span>{data.toOutdoorPct}%</span>
              <Cloud className="w-3 h-3 ml-1 text-slate-400" />
            </div>
          </div>

          {/* Floor 2: Office Room */}
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: Math.min(2, data.occupants) }).map((_, i) => (
                <div key={i} className="w-4 h-5 bg-sky-500/20 border border-sky-400/40 rounded flex items-center justify-center text-[9px] text-sky-300">
                  👤
                </div>
              ))}
              <span className="text-[9px] text-slate-400 font-mono">Floor 2</span>
            </div>
            {/* Blue Supply Air Arrow */}
            <span className="text-[8px] font-mono text-sky-400 flex items-center">
              ↓ Fresh Air
            </span>
          </div>

          {/* Floor 1: Office Room */}
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: Math.max(1, data.occupants - 2) }).map((_, i) => (
                <div key={i} className="w-4 h-5 bg-sky-500/20 border border-sky-400/40 rounded flex items-center justify-center text-[9px] text-sky-300">
                  👤
                </div>
              ))}
              <span className="text-[9px] text-slate-400 font-mono">Floor 1</span>
            </div>
            {/* Red Return CO2 arrow */}
            <span className="text-[8px] font-mono text-rose-400 flex items-center">
              ↑ CO₂ Rich
            </span>
          </div>
        </div>

        {/* Center: Conduit Redirection Arrow */}
        <div className="flex flex-col items-center justify-center px-2 z-10 text-center">
          <div
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm"
            style={{
              backgroundColor: `${data.badgeColor}18`,
              borderColor: `${data.badgeColor}40`,
              color: data.badgeColor
            }}
          >
            {data.toAlgaePct}% TO ALGAE
          </div>
          <ArrowRight className="w-5 h-5 my-1" style={{ color: data.badgeColor }} />
          <div className="text-[8px] font-mono text-slate-400">
            {data.toOutdoorPct}% TO OUTDOOR
          </div>
        </div>

        {/* Right: Algae Bioreactor Column */}
        <div className="relative z-10 w-14 h-32 rounded-xl border border-slate-700 bg-slate-900/80 p-1 flex flex-col justify-end overflow-hidden">
          {/* Liquid */}
          <div
            className="w-full rounded-lg transition-all relative overflow-hidden"
            style={{
              height: '85%',
              backgroundColor: isCrisis ? '#ca8a04' : '#10b981',
              boxShadow: isCrisis ? '0 0 12px rgba(202, 138, 4, 0.4)' : '0 0 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            {/* Rising Bubbles */}
            <div className="absolute inset-0 flex flex-col justify-around items-center opacity-70">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
            </div>
          </div>

          {/* Warning badge on low health */}
          {isCrisis && (
            <div className="absolute inset-x-1 top-2 bg-rose-950/90 border border-rose-500 rounded p-1 text-[7px] font-mono font-bold text-rose-300 text-center leading-tight">
              ⚠️ BYPASS ACTIVE
            </div>
          )}

          <div className="text-[7.5px] font-mono text-center text-slate-300 mt-1 font-bold">
            BIOREACTOR
          </div>
        </div>
      </div>

      {/* Metrics Row (Matching design spec) */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
        {/* Metric 1: Occupants */}
        <div className="flex flex-col">
          <span className="text-slate-400 text-[9px] flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-sky-400" /> Occupants
          </span>
          <span className="font-bold text-white text-xs mt-0.5 flex items-center gap-1">
            👤 {data.occupants}
          </span>
        </div>

        {/* Metric 2: Indoor CO2 */}
        <div className="flex flex-col">
          <span className="text-slate-400 text-[9px] flex items-center gap-1">
            <Cloud className="w-2.5 h-2.5 text-amber-400" /> Indoor CO₂
          </span>
          <span
            className="font-bold text-xs mt-0.5"
            style={{ color: data.co2 > 800 ? '#ef4444' : '#38bdf8' }}
          >
            {data.co2} ppm
          </span>
        </div>

        {/* Metric 3: Algae Health */}
        <div className="flex flex-col">
          <span className="text-slate-400 text-[9px] flex items-center gap-1">
            <Leaf className="w-2.5 h-2.5 text-emerald-400" /> Algae Health
          </span>
          <span
            className="font-bold text-xs mt-0.5"
            style={{ color: isCrisis ? '#eab308' : '#10b981' }}
          >
            {data.algaeHealth}%
          </span>
        </div>

        {/* Metric 4: Air Distribution */}
        <div className="flex flex-col items-end">
          <span className="text-slate-400 text-[9px]">Air Distribution</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <DistributionDonut
              toAlgaePct={data.toAlgaePct}
              toOutdoorPct={data.toOutdoorPct}
              size={24}
            />
            <div className="text-[8px] text-right text-slate-300 leading-tight">
              <span className="text-emerald-400 font-bold block">{data.toAlgaePct}% Algae</span>
              <span className="text-slate-400 block">{data.toOutdoorPct}% Out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2D Technical HVAC Layout Schematic (SVG Implementation) ─────────────────
function TechnicalHVACSchematic({ stateData }) {
  const { occupants, co2, algaeHealth, toAlgaePct, toOutdoorPct, damperAngle, flowLpm } = stateData;
  const isHealthy = algaeHealth >= 60;
  const isCrisis = algaeHealth < 45;

  return (
    <div className="relative w-full bg-[#050b16] rounded-2xl p-4 border border-slate-800 shadow-2xl overflow-hidden">
      {/* SVG Definitions for Gradients & Filters */}
      <svg className="w-0 h-0 absolute">
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="blueDuct" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="redDuct" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="greenDuct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-2 font-mono">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-400" />
            Design Draft - 2D HVAC System Layout
          </h2>
          <p className="text-[11px] text-slate-400">
            Clean layout for implementation (SVG / HTML Canvas / React)
          </p>
        </div>

        {/* Live operational readout */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-sky-300 font-mono">
            Supply: <strong className="text-white">Fresh Air (100%)</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-emerald-300 font-mono">
            Bio-Feed: <strong className="text-emerald-400">{toAlgaePct}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-amber-300 font-mono">
            Atmosphere Exhaust: <strong className="text-amber-400">{toOutdoorPct}%</strong>
          </span>
        </div>
      </div>

      {/* Main SVG Schematic */}
      <div className="w-full overflow-x-auto py-2">
        <svg
          viewBox="0 0 980 460"
          className="w-full min-w-[760px] h-auto select-none"
          style={{ maxHeight: '460px' }}
        >
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <rect width="980" height="460" fill="url(#grid)" />

          {/* ══════════════════════════════════════════════════════════════════
              1. OUTDOOR AIR INTAKE & HVAC UNIT (TOP-LEFT)
             ══════════════════════════════════════════════════════════════════ */}
          {/* Outdoor Air Intake Label & Arrow */}
          <g transform="translate(20, 95)">
            <text x="0" y="-12" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Outdoor Air Intake
            </text>
            {/* Blue Air Intake Arrow */}
            <path d="M 0 10 L 70 10" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="76,10 66,5 66,15" fill="#38bdf8" />
            {/* Animated Flow Dash */}
            <line x1="0" y1="10" x2="70" y2="10" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 8" className="animate-pulse" />
          </g>

          {/* HVAC Unit Main Enclosure Box */}
          <rect
            x="110"
            y="60"
            width="240"
            height="85"
            rx="12"
            fill="#091322"
            stroke="#334155"
            strokeWidth="2.5"
          />
          <text x="230" y="80" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            HVAC Unit
          </text>

          {/* Filter Unit */}
          <g transform="translate(130, 90)">
            <rect x="0" y="0" width="36" height="36" rx="4" fill="#0f1f38" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Zig-zag filter pleats */}
            <path d="M 6 4 L 12 32 L 18 4 L 24 32 L 30 4" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            <text x="18" y="47" fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">Filter</text>
          </g>

          {/* Inter-filter conduit to fan */}
          <path d="M 166 108 L 210 108" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

          {/* Supply Fan */}
          <g transform="translate(230, 108)">
            <SpinningFan cx={0} cy={0} r={20} spinning={true} />
            <text x="0" y="-28" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Supply Fan
            </text>
          </g>

          {/* Supply Conduit from Fan -> Split Header */}
          <path d="M 250 108 L 300 108" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

          {/* ══════════════════════════════════════════════════════════════════
              2. SUPPLY AIR TO ROOMS (BLUE NETWORK)
             ══════════════════════════════════════════════════════════════════ */}
          <g>
            <text x="45" y="270" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Supply Air to Rooms
            </text>

            {/* Main Supply Vertical Header Drop */}
            <path
              d="M 300 108 L 300 150 L 130 150 L 130 195"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Horizontal Distribution Line across Rooms 1, 2, 3 */}
            <path
              d="M 130 150 L 400 150"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Room 1 Supply Branch (Drop down) */}
            <path d="M 130 150 L 130 195" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="130,202 126,193 134,193" fill="#38bdf8" />

            {/* Room 2 Supply Branch (Drop down) */}
            <path d="M 240 150 L 240 195" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="240,202 236,193 244,193" fill="#38bdf8" />

            {/* Room 3 Supply Branch (Drop down) */}
            <path d="M 350 150 L 350 195" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="350,202 346,193 354,193" fill="#38bdf8" />
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              3. ROOM 1, ROOM 2, ROOM 3 (ROOM ENCLOSURES & PEOPLE)
             ══════════════════════════════════════════════════════════════════ */}
          {/* Main Structural Outer Box for Rooms */}
          <rect
            x="72"
            y="205"
            width="336"
            height="90"
            rx="10"
            fill="#070d18"
            stroke="#1e293b"
            strokeWidth="3"
          />

          {/* Room 1 */}
          <rect x="76" y="208" width="106" height="84" rx="6" fill="#0b1322" stroke="#334155" strokeWidth="1" />
          <text x="129" y="224" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Room 1</text>
          <HumanSilhouette x={88} y={242} active={occupants >= 1} scale={0.9} />
          <HumanSilhouette x={126} y={242} active={occupants >= 2} scale={0.9} />

          {/* Room 2 */}
          <rect x="187" y="208" width="106" height="84" rx="6" fill="#0b1322" stroke="#334155" strokeWidth="1" />
          <text x="240" y="224" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Room 2</text>
          <HumanSilhouette x={198} y={242} active={occupants >= 3} scale={0.9} />
          <HumanSilhouette x={238} y={242} active={occupants >= 4} scale={0.9} />

          {/* Room 3 */}
          <rect x="298" y="208" width="106" height="84" rx="6" fill="#0b1322" stroke="#334155" strokeWidth="1" />
          <text x="351" y="224" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Room 3</text>
          <HumanSilhouette x={312} y={242} active={occupants >= 1} scale={0.9} />
          <HumanSilhouette x={352} y={242} active={occupants >= 4} scale={0.9} />

          {/* ══════════════════════════════════════════════════════════════════
              4. RETURN AIR NETWORK (RED CO2-RICH CONDUITS)
             ══════════════════════════════════════════════════════════════════ */}
          {/* Room 1 Return Drop */}
          <path d="M 130 292 L 130 330" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="130,336 126,327 134,327" fill="#ef4444" />

          {/* Room 2 Return Drop */}
          <path d="M 240 292 L 240 330" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="240,336 236,327 244,327" fill="#ef4444" />

          {/* Room 3 Return Drop */}
          <path d="M 350 292 L 350 330" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="350,336 346,327 354,327" fill="#ef4444" />

          {/* Bottom Return Manifold Header (Horizontal Red Pipe) */}
          <path
            d="M 72 342 L 416 342"
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Left Arrow on Return Pipe */}
          <polygon points="66,342 76,337 76,347" fill="#ef4444" />

          {/* Return Air (from rooms) Label */}
          <g transform="translate(18, 380)">
            <text x="0" y="0" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Return Air
            </text>
            <text x="0" y="14" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
              (from rooms)
            </text>
          </g>

          {/* Return Riser: Bottom Right (416, 342) -> Rises Up into HVAC System */}
          <path
            d="M 416 342 L 440 342 L 440 185 L 360 185 L 360 108 L 470 108"
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Return Air flow arrow pointing up/right */}
          <polygon points="410,185 400,180 400,190" fill="#ef4444" />

          {/* ══════════════════════════════════════════════════════════════════
              5. CO2 SENSOR BOX [CO2]
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(490, 108)">
            {/* Sensor Housing */}
            <circle cx="0" cy="0" r="18" fill="#0b172a" stroke="#ef4444" strokeWidth="2.5" />
            <text x="0" y="-3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              CO₂
            </text>
            <text x="0" y="8" fill="#fca5a5" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {co2}ppm
            </text>
            <text x="0" y="-26" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              CO₂ Sensor
            </text>
          </g>

          {/* Conduit from CO2 Sensor to 3-Way Damper */}
          <path d="M 508 108 L 575 108" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <polygon points="560,108 550,103 550,113" fill="#ef4444" />

          {/* ══════════════════════════════════════════════════════════════════
              6. 3-WAY DAMPER (CONTROL VIA AI)
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(595, 108)">
            <ThreeWayDamperValve cx={0} cy={0} angle={damperAngle} toAlgaePct={toAlgaePct} />
            <text x="0" y="-32" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              3-way Damper
            </text>
            <text x="0" y="-20" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              (Control via AI)
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              7. EXHAUST TO ATMOSPHERE (ORANGE PATH UPWARD)
             ══════════════════════════════════════════════════════════════════ */}
          {/* Orange Duct branching UP from Damper into Atmosphere */}
          <path
            d="M 595 84 L 595 55 L 680 55"
            fill="none"
            stroke="#f97316"
            strokeWidth={toOutdoorPct > 50 ? "7" : "3.5"}
            strokeLinejoin="round"
          />
          <polygon points="692,55 680,49 680,61" fill="#f97316" />

          {/* Atmospheric Cloud Graphic */}
          <g transform="translate(710, 42)">
            {/* Stylized Cloud */}
            <path
              d="M 15 20 A 12 12 0 0 1 35 12 A 18 18 0 0 1 65 14 A 12 12 0 0 1 80 25 A 10 10 0 0 1 70 38 L 15 38 A 10 10 0 0 1 15 20 Z"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="1.8"
            />
            <text x="45" y="-12" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Exhaust to
            </text>
            <text x="45" y="0" fill="#f97316" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Atmosphere
            </text>
            <text x="45" y="28" fill="#fb923c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {toOutdoorPct}% OUT
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              8. REDIRECTED TO ALGAE (GREEN CONDUIT DOWNWARD)
             ══════════════════════════════════════════════════════════════════ */}
          <path
            d="M 595 132 L 595 240 L 640 240"
            fill="none"
            stroke="#10b981"
            strokeWidth={toAlgaePct > 30 ? "7" : "3.5"}
            strokeLinejoin="round"
          />
          <polygon points="650,240 638,234 638,246" fill="#10b981" />

          {/* Redirected to Algae Label */}
          <g transform="translate(620, 185)">
            <text x="0" y="0" fill="#10b981" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
              To Algae
            </text>
            <text x="0" y="14" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
              Bioreactor ({toAlgaePct}%)
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              9. ALGAE BIOREACTOR FACADE (GLASS COLUMN + FM METER)
             ══════════════════════════════════════════════════════════════════ */}
          <BioreactorColumn
            x={655}
            y={170}
            width={74}
            height={165}
            health={algaeHealth}
            toAlgaePct={toAlgaePct}
          />

          {/* ══════════════════════════════════════════════════════════════════
              10. LEGEND (BOTTOM RIGHT, EXACTLY AS IN DESIGN DRAFT)
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(775, 120)">
            {/* Legend Card Container */}
            <rect
              x="0"
              y="0"
              width="190"
              height="280"
              rx="12"
              fill="#080f1d"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="18" y="26" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              Legend
            </text>
            <line x1="18" y1="36" x2="172" y2="36" stroke="#1e293b" strokeWidth="1" />

            {/* Item 1: Fresh Air (Supply) */}
            <g transform="translate(18, 56)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#38bdf8" />
              <text x="44" y="4" fill="#e2e8f0" fontSize="9.5" fontFamily="sans-serif">Fresh Air (Supply)</text>
            </g>

            {/* Item 2: CO2 Rich Air (Return) */}
            <g transform="translate(18, 86)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#ef4444" />
              <text x="44" y="4" fill="#e2e8f0" fontSize="9.5" fontFamily="sans-serif">CO₂ Rich Air (Return)</text>
            </g>

            {/* Item 3: Redirected to Algae */}
            <g transform="translate(18, 116)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#10b981" />
              <text x="44" y="4" fill="#e2e8f0" fontSize="9.5" fontFamily="sans-serif">Redirected to Algae</text>
            </g>

            {/* Item 4: To Outdoor (Exhaust) */}
            <g transform="translate(18, 146)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#f97316" />
              <text x="44" y="4" fill="#e2e8f0" fontSize="9.5" fontFamily="sans-serif">To Outdoor (Exhaust)</text>
            </g>

            <line x1="18" y1="166" x2="172" y2="166" stroke="#1e293b" strokeWidth="1" />

            {/* Symbol 1: Fan */}
            <g transform="translate(30, 185)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M-5 -2 L5 2 M-2 5 L2 -5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <text x="32" y="4" fill="#cbd5e1" fontSize="9.5" fontFamily="sans-serif">Fan</text>
            </g>

            {/* Symbol 2: Damper / Valve */}
            <g transform="translate(30, 212)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M-6 -6 L6 6 M-6 6 L6 -6" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="32" y="4" fill="#cbd5e1" fontSize="9.5" fontFamily="sans-serif">Damper / Valve</text>
            </g>

            {/* Symbol 3: CO2 Sensor */}
            <g transform="translate(30, 239)">
              <rect x="-12" y="-8" width="24" height="16" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CO₂</text>
              <text x="32" y="4" fill="#cbd5e1" fontSize="9.5" fontFamily="sans-serif">CO₂ Sensor</text>
            </g>

            {/* Symbol 4: Flow Meter */}
            <g transform="translate(30, 264)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="0" y="3" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FM</text>
              <text x="32" y="4" fill="#cbd5e1" fontSize="9.5" fontFamily="sans-serif">Flow Meter</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── Default Export: HVACDiagram with Dual View & Fullscreen Modal ───────────
export default function HVACDiagram() {
  const [selectedState, setSelectedState] = useState('state2'); // Default to State 2 (Active Redirection)
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'schematic' | 'both'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live telemetry from store
  const storeOccupancy = useStore((s) => s.occupancy);
  const storeCo2 = useStore((s) => s.co2_ppm);
  const storeAlgaeHealth = useStore((s) => s.algae_health);
  const hvacState = useStore((s) => s.hvacState);
  const triggerHvac = useStore((s) => s.triggerHvacScenario);

  // Determine current active state data (either preset or dynamic live)
  const currentStateData = useMemo(() => {
    if (selectedState === 'live') {
      const isBypass = hvacState.activeLoop === 'roof_bypass' || storeAlgaeHealth < 45;
      const toAlgae = isBypass ? 5 : hvacState.damperOpenPct;
      const toOutdoor = 100 - toAlgae;
      return {
        id: 'live',
        title: 'Live Telemetry Sync',
        subtitle: `Streaming live from CV sensors: ${storeOccupancy} humans, ${storeCo2} ppm CO2.`,
        occupants: storeOccupancy,
        co2: storeCo2,
        algaeHealth: Math.round(storeAlgaeHealth),
        toAlgaePct: toAlgae,
        toOutdoorPct: toOutdoor,
        damperAngle: (toAlgae / 100) * 85,
        flowLpm: parseFloat(hvacState.spargingRateLpm),
        algaeColor: storeAlgaeHealth >= 60 ? '#10b981' : '#eab308',
        liquidTone: storeAlgaeHealth >= 60 ? 'healthy' : 'unhealthy',
        modeText: hvacState.hvacStatusText,
        badgeColor: hvacState.airflowColor
      };
    }
    return STATES[selectedState] || STATES.state2;
  }, [selectedState, storeOccupancy, storeCo2, storeAlgaeHealth, hvacState]);

  // Handler for state selection
  const handleSelectState = (key) => {
    setSelectedState(key);
    // Also trigger matching 3D Twin store preset
    if (key === 'state1') {
      triggerHvac('auto');
    } else if (key === 'state2') {
      triggerHvac('redirect');
    } else if (key === 'state3') {
      triggerHvac('bypass');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ── Top Control & View Switcher Bar ── */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: View Selector */}
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
              viewMode === 'matrix'
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>3-State Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('schematic')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
              viewMode === 'schematic'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>2D System Layout</span>
          </button>

          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
              viewMode === 'both'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Overview Both</span>
          </button>
        </div>

        {/* Right: State Preset Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase mr-1 hidden sm:inline">Active Mode:</span>
          {Object.entries(STATES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleSelectState(key)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all flex items-center gap-1 ${
                selectedState === key
                  ? 'border-white font-bold text-white shadow-md'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-900/60'
              }`}
              style={selectedState === key ? { backgroundColor: `${item.badgeColor}25`, borderColor: item.badgeColor } : {}}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.badgeColor }} />
              {key === 'state1' ? 'State 1 (Normal)' : key === 'state2' ? 'State 2 (Redirect)' : 'State 3 (Bypass)'}
            </button>
          ))}

          <button
            onClick={() => setSelectedState('live')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all flex items-center gap-1 ${
              selectedState === 'live'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md'
                : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-900/60'
            }`}
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Live Sync</span>
          </button>

          {/* Fullscreen Expand Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Expand Fullscreen"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all ml-1"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── View 1: 3-State Operational Matrix (Top section of design spec) ── */}
      {(viewMode === 'matrix' || viewMode === 'both') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="uppercase tracking-wider">HVAC Redirection Operating Scenarios</span>
            <span className="text-[11px] text-slate-500">Click any card to engage flow state</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {Object.entries(STATES).map(([key, data]) => (
              <StateMatrixCard
                key={key}
                stateKey={key}
                data={data}
                isSelected={selectedState === key}
                onSelect={handleSelectState}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── View 2: 2D HVAC System Layout (SVG Technical Schematic) ── */}
      {(viewMode === 'schematic' || viewMode === 'both') && (
        <TechnicalHVACSchematic stateData={currentStateData} />
      )}

      {/* ── Modal Dialog for Fullscreen Inspection ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-400" />
                Algor-Algae 2D HVAC Architecture & Redirection Matrix
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Full-Screen Engineering Specification View
              </p>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5"
            >
              <Minimize2 className="w-4 h-4" /> Exit Fullscreen
            </button>
          </div>

          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(STATES).map(([key, data]) => (
                <StateMatrixCard
                  key={key}
                  stateKey={key}
                  data={data}
                  isSelected={selectedState === key}
                  onSelect={handleSelectState}
                />
              ))}
            </div>

            <TechnicalHVACSchematic stateData={currentStateData} />
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-500">
            Algor-Algae Living Bioreactor Digital Twin · Autonomous BMS powered by Gemini 3.8 Flash
          </div>
        </div>
      )}
    </div>
  );
}
