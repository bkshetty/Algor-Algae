/**
 * HVACDiagram.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * 2D HVAC System Layout & Bio-Redirection Flow Visualizer.
 * Enforces the strict biological cause-and-effect loop driven by CV sensors:
 *
 * 1. "Feed the Algae" Pipeline (Redirecting TO the Bioreactor):
 *    - Trigger: YOLOv8 detects humans in the camera frame.
 *    - Logic: CO2 spike (400ppm baseline + 150ppm per person).
 *    - Action: Healthy algae (green) + humans -> Gemini AI opens HVAC dampers (85%).
 *      CO2-rich human exhaust is routed directly INTO bioreactor panels as photosynthetic fuel.
 *    - Visual: Glowing, fast-moving orange pipeline labeled "HUMAN CO2 RETURN AIR"
 *      flowing from occupied rooms into the green facade.
 *
 * 2. "Acidification Bypass" Pipeline (Redirecting AWAY from the Bioreactor):
 *    - Trigger: OpenCV detects yellow pixels in target box, dropping algae_health below 45%.
 *    - Logic: Sick microalgae cannot process carbon efficiently; pumping high CO2 air turns into
 *      carbonic acid, rapidly lowering pH (<6.8) and killing culture.
 *    - Action: Gemini AI triggers Emergency Bypass, clamping dampers down to 15% (restricting flow to 15%)
 *      to protect biology from acidifying.
 *    - Visual: Air flow instantly reroutes through heavily pulsing crimson & amber pipeline labeled
 *      "ALGAE COLLAPSE BYPASS SHUNT", venting CO2 to safe rooftop scrubber.
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
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useStore } from '../store';

// ─── Preset State Definitions (Biological Cause-and-Effect Matrix) ───────────
const STATES = {
  state1: {
    id: 'state1',
    title: 'State 1: Exhaust Mode (Low Occupancy <4)',
    subtitle: '1 human detected (550 ppm CO2). Less than 4 occupants: Air directs in HVAC system to rooftop scrubber exhausts.',
    occupants: 1,
    co2: 550,
    algaeHealth: 95,
    toAlgaePct: 15,
    toOutdoorPct: 85,
    damperAngle: 12,
    flowLpm: 2.5,
    algaeColor: '#34C759',
    liquidTone: 'healthy',
    modeText: 'EXHAUST MODE (85% OUTDOOR VENT)',
    badgeColor: '#0071E3'
  },
  state2: {
    id: 'state2',
    title: 'State 2: "Feed the Algae" Pipeline (High Occupancy)',
    subtitle: 'YOLOv8 detects humans (CO2 = 400 + 150/pers). Healthy algae: Damper opens to 85%, routing CO2 into facade as fuel.',
    occupants: 4,
    co2: 1000,
    algaeHealth: 92,
    toAlgaePct: 85,
    toOutdoorPct: 15,
    damperAngle: 75,
    flowLpm: 26.0,
    algaeColor: '#34C759',
    liquidTone: 'healthy',
    modeText: 'FEED THE ALGAE (85% BIO-FEED)',
    badgeColor: '#FF9500'
  },
  state3: {
    id: 'state3',
    title: 'State 3: "Acidification Bypass" Pipeline (<45% Health)',
    subtitle: 'OpenCV detects yellow pixels (<45% health). Sick algae cannot process CO2: Damper clamped to 15%, venting through ALGAE COLLAPSE BYPASS SHUNT.',
    occupants: 4,
    co2: 1000,
    algaeHealth: 32,
    toAlgaePct: 15,
    toOutdoorPct: 85,
    damperAngle: 12,
    flowLpm: 2.5,
    algaeColor: '#FFCC00',
    liquidTone: 'unhealthy',
    modeText: 'ALGAE COLLAPSE BYPASS SHUNT (15% CLAMP)',
    badgeColor: '#FF3B30'
  }
};

// ─── Helper Donut / Pie Chart Component ──────────────────────────────────────
function DistributionDonut({ toAlgaePct, toOutdoorPct, size = 38 }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const algaeDash = (toAlgaePct / 100) * circumference;
  const isCrisis = toAlgaePct <= 15;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="rotate-[-90deg]">
        {/* Background circle (outdoor scrubber) */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={isCrisis ? "#FF3B30" : "#334155"}
          strokeWidth="6"
        />
        {/* Algae arc */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={isCrisis ? "#FF9500" : "#34C759"}
          strokeWidth="6"
          strokeDasharray={`${algaeDash} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold ${isCrisis ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
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
      <circle cx="12" cy="7" r="4" fill={active ? "#FF9500" : "#475569"} />
      {/* Body seated at desk */}
      <path
        d="M6 22 C6 15 9 13 12 13 C15 13 18 15 18 22 Z"
        fill={active ? "#F97316" : "#334155"}
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
      <circle cx="0" cy="0" r={r} fill="#091322" stroke="#0071E3" strokeWidth="2" />
      <circle cx="0" cy="0" r={r - 3} fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 2" />
      {/* Center hub */}
      <circle cx="0" cy="0" r="3.5" fill="#0071E3" />
      {/* 4 Blades */}
      <g className={spinning ? "animate-spin origin-center" : ""} style={{ transformOrigin: '0px 0px', animationDuration: '2s' }}>
        <path d="M0 -3 C4 -11 11 -8 8 -2 Z" fill="#0071E3" opacity="0.9" />
        <path d="M3 0 C11 4 8 11 2 8 Z" fill="#0071E3" opacity="0.9" />
        <path d="M0 3 C-4 11 -11 8 -8 2 Z" fill="#0071E3" opacity="0.9" />
        <path d="M-3 0 C-11 -4 -8 -11 -2 -8 Z" fill="#0071E3" opacity="0.9" />
      </g>
    </g>
  );
}

// ─── 3-Way Motorized Damper Valve SVG ──────────────────────────────────────────
function ThreeWayDamperValve({ cx, cy, angle = 45, toAlgaePct = 80 }) {
  const isBypass = toAlgaePct <= 15;
  const damperColor = isBypass ? '#FF3B30' : toAlgaePct >= 60 ? '#34C759' : '#FF9500';

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
  const isCrisis = health < 45;
  const isHealthy = health >= 65;
  const liquidColor = isCrisis ? '#EAB308' : isHealthy ? '#34C759' : '#84CC16';
  const liquidGlow = isCrisis ? 'rgba(234, 179, 8, 0.5)' : 'rgba(52, 199, 89, 0.45)';

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
        stroke={isCrisis ? "#FF3B30" : "#334155"}
        strokeWidth={isCrisis ? "2.5" : "2"}
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
        opacity={isCrisis ? "0.9" : "0.78"}
        style={{ filter: `drop-shadow(0 0 10px ${liquidGlow})`, transition: 'fill 0.6s ease' }}
      />

      {/* Liquid Highlights / Glass reflection */}
      <line x1="10" y1="18" x2="10" y2={height - 20} stroke="#ffffff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="14" y1="22" x2="14" y2={height - 40} stroke="#ffffff" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

      {/* Sparging Bubbles rising */}
      <g opacity={toAlgaePct > 20 ? 0.95 : 0.2}>
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
        <rect x="0" y="0" width="22" height="28" rx="4" fill="#091322" stroke={isCrisis ? "#FF3B30" : "#0071E3"} strokeWidth="1.2" />
        <text x="11" y="11" fill={isCrisis ? "#FF3B30" : "#0071E3"} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FM</text>
        <line x1="3" y1="14" x2="19" y2="14" stroke="#1e3a5f" strokeWidth="1" />
        <text x="11" y="23" fill="#94a3b8" fontSize="6.5" textAnchor="middle" fontFamily="monospace">
          {toAlgaePct > 20 ? '26.0' : '2.5'}L
        </text>
      </g>

      {/* Bioreactor Label Text */}
      <text x={width / 2} y={height + 17} fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        Algae Bioreactor
      </text>
      <text x={width / 2} y={height + 27} fill={isCrisis ? "#FFCC00" : "#34C759"} fontSize="8" fontWeight="semibold" textAnchor="middle" fontFamily="monospace">
        Facade Panel ({health}%)
      </text>

      {/* Warning Overlay when Algae is in Acidification Risk (<45%) */}
      {isCrisis && (
        <g transform={`translate(-28, ${height / 2 - 32})`}>
          <rect x="0" y="0" width={width + 56} height="58" rx="8" fill="#450a0a" stroke="#FF3B30" strokeWidth="1.8" className="animate-pulse" />
          <text x={(width + 56) / 2} y="16" fill="#FF3B30" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            ⚠️ SICK ALGAE CULTURE
          </text>
          <text x={(width + 56) / 2} y="28" fill="#FDE047" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            DAMPER CLAMPED TO 15%
          </text>
          <text x={(width + 56) / 2} y="40" fill="#FECACA" fontSize="7" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">
            Acidification Shield Active
          </text>
          <text x={(width + 56) / 2} y="50" fill="#9CA3AF" fontSize="6.5" textAnchor="middle" fontFamily="sans-serif">
            (Preventing pH &lt; 6.8 Crash)
          </text>
        </g>
      )}
    </g>
  );
}

function StateMatrixCard({ stateKey, data, isSelected, onSelect }) {
  const isHighOcc = data.occupants >= 4;
  const isCrisis = !isHighOcc && (data.algaeHealth < 45 || data.toAlgaePct <= 20);

  return (
    <div
      onClick={() => onSelect(stateKey)}
      className={`relative flex flex-col rounded-2xl p-4 transition-all cursor-pointer border ${
        isSelected
          ? 'bg-[#FFFFFF] border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-md'
          : 'bg-[#FFFFFF] border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.18)]'
      }`}
    >
      {/* Selection pill */}
      {isSelected && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-semibold text-[#0071E3] bg-[#E8F2FD] px-2.5 py-0.5 rounded-[980px]">
          <CheckCircle2 className="w-3 h-3" /> ACTIVE SIMULATION
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="pr-16">
        <h3 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.badgeColor }} />
          {data.title}
        </h3>
        <p className="text-[11px] text-[#86868B] mt-0.5 leading-snug">
          {data.subtitle}
        </p>
      </div>

      {/* Mini Schematic Cross-Section View */}
      <div className="my-3.5 relative bg-[#000000] rounded-xl p-3 border border-[rgba(255,255,255,0.08)] overflow-hidden min-h-[160px] flex items-center justify-between">
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
              <span className="text-[9px] font-mono font-bold text-slate-300 ml-3">ROOF SCRUBBER</span>
            </div>
            {/* Small exhaust arrow to atmosphere */}
            <div className={`text-[9px] font-mono font-bold flex items-center ${isCrisis ? 'text-[#FF3B30] animate-pulse' : 'text-amber-400'}`}>
              <span>{data.toOutdoorPct}%</span>
              <Cloud className="w-3 h-3 ml-1 text-slate-400" />
            </div>
          </div>

          {/* Floor 2: Office Room */}
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: Math.min(3, data.occupants) }).map((_, i) => (
                <div key={i} className="w-4 h-5 bg-amber-500/20 border border-amber-400/40 rounded flex items-center justify-center text-[9px] text-amber-300">
                  👤
                </div>
              ))}
              <span className="text-[9px] text-slate-400 font-mono">{data.occupants} Pers</span>
            </div>
            {/* Orange CO2 Return Pipe Arrow */}
            <span className="text-[8px] font-mono text-[#FF9500] font-bold flex items-center">
              CO₂ Return <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>

          {/* Damper Status */}
          <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between text-[8px] font-mono">
            <span className="text-slate-400">Damper:</span>
            <span style={{ color: data.badgeColor }} className="font-bold">
              {data.damperAngle}° ({data.toAlgaePct}% BIO)
            </span>
          </div>
        </div>

        {/* Center: Dynamic Animated Airflow Arrow */}
        <div className="relative z-10 flex flex-col items-center px-2">
          {isCrisis ? (
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-[#FF3B30] font-bold animate-pulse text-center leading-tight">
                BYPASS<br />SHUNT
              </span>
              <ArrowRight className="w-4 h-4 text-[#FF3B30] my-0.5 animate-bounce" />
              <span className="text-[7.5px] font-mono text-amber-400">85% Vent</span>
            </div>
          ) : !isHighOcc ? (
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-[#0071E3] font-bold text-center leading-tight">
                ROOFTOP<br />EXHAUST
              </span>
              <ArrowRight className="w-4 h-4 text-[#0071E3] my-0.5" />
              <span className="text-[7.5px] font-mono text-[#0071E3] font-bold">85% Outside</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-[#FF9500] font-bold text-center leading-tight">
                HUMAN CO₂<br />RETURN
              </span>
              <ArrowRight className="w-4 h-4 text-[#FF9500] my-0.5" />
              <span className="text-[7.5px] font-mono text-[#34C759] font-bold">85% Bio-Fuel</span>
            </div>
          )}
        </div>

        {/* Right: Vertical Facade Column Preview */}
        <div className="relative z-10 w-[55px] h-[130px] rounded-lg border border-slate-700 bg-slate-950 p-1 flex flex-col justify-between items-center overflow-hidden">
          {/* Header */}
          <span className="text-[7.5px] font-mono text-slate-400 font-bold">FACADE</span>
          {/* Liquid fill */}
          <div
            className="w-full rounded transition-all duration-500 relative flex items-center justify-center"
            style={{
              height: '75%',
              backgroundColor: data.algaeColor,
              opacity: isCrisis ? 0.85 : 0.75,
              boxShadow: `0 0 12px ${isCrisis ? 'rgba(234,179,8,0.5)' : 'rgba(52,199,89,0.5)'}`
            }}
          >
            {isCrisis ? (
              <span className="text-[8px] font-bold text-red-950 text-center leading-none">
                15%<br />CLAMP
              </span>
            ) : !isHighOcc ? (
              <span className="text-[8px] font-bold text-sky-950 text-center leading-none">
                15%<br />BLEED
              </span>
            ) : (
              <span className="text-[8px] font-bold text-emerald-950 text-center leading-none">
                85%<br />FEED
              </span>
            )}
          </div>
          <span className="text-[7.5px] font-mono text-slate-300 font-semibold">{data.algaeHealth}% Hlt</span>
        </div>
      </div>

      {/* Bottom Metadata Summary Tiles */}
      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[rgba(0,0,0,0.06)] text-center">
        {/* Metric 1: Occupancy */}
        <div className="flex flex-col items-start">
          <span className="text-[#86868B] text-[9px] font-medium flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-[#0071E3]" /> Humans
          </span>
          <span className="font-semibold text-xs text-[#1D1D1F] mt-0.5">{data.occupants}</span>
        </div>

        {/* Metric 2: CO2 ppm */}
        <div className="flex flex-col items-start">
          <span className="text-[#86868B] text-[9px] font-medium flex items-center gap-1">
            <Wind className="w-2.5 h-2.5 text-[#FF9500]" /> CO₂
          </span>
          <span className="font-semibold text-xs text-[#FF9500] mt-0.5">{data.co2} ppm</span>
        </div>

        {/* Metric 3: Algae Health */}
        <div className="flex flex-col items-start">
          <span className="text-[#86868B] text-[9px] font-medium flex items-center gap-1">
            <Leaf className="w-2.5 h-2.5 text-[#34C759]" /> Algae Health
          </span>
          <span
            className="font-semibold text-xs mt-0.5"
            style={{ color: isCrisis ? '#FF3B30' : '#34C759' }}
          >
            {data.algaeHealth}%
          </span>
        </div>

        {/* Metric 4: Air Distribution */}
        <div className="flex flex-col items-end">
          <span className="text-[#86868B] text-[9px] font-medium">Distribution</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <DistributionDonut
              toAlgaePct={data.toAlgaePct}
              toOutdoorPct={data.toOutdoorPct}
              size={24}
            />
            <div className="text-[8px] text-right text-[#86868B] leading-tight">
              <span className={isCrisis ? "text-[#FF9500] font-semibold block" : "text-[#34C759] font-semibold block"}>
                {data.toAlgaePct}% Bio
              </span>
              <span className="text-[#86868B] block">{data.toOutdoorPct}% Out</span>
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
  const isHighOcc = occupants >= 4;
  const isDirectToExhaust = !isHighOcc; // When occupants < 4, air directs in HVAC system to exhausts
  const isCrisis = !isHighOcc && algaeHealth < 45;

  return (
    <div className="relative w-full bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[rgba(0,0,0,0.08)] overflow-hidden">
      {/* SVG Definitions for Gradients & Filters */}
      <svg className="w-0 h-0 absolute">
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0071E3" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#34C759" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="orangeDuct" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="crimsonBypassDuct" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
          <linearGradient id="greenDuct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34C759" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[rgba(0,0,0,0.06)] gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#0071E3]" />
            2D HVAC System Layout &amp; Biological Redirection Architecture
          </h2>
          <p className="text-[11px] text-[#86868B]">
            Cause-and-effect pipeline modulated by YOLOv8 human detection and OpenCV chlorophyll health
          </p>
        </div>

        {/* Live operational readout */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-[980px] bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] text-[#1D1D1F]">
            Intake: <strong className="text-[#0071E3]">Fresh Air 100%</strong>
          </span>
          <span className={`px-3 py-1 rounded-[980px] border text-[#1D1D1F] ${isCrisis ? 'bg-[#FFF2F2] border-[#FF3B30]/30' : 'bg-[#E8F2FD] border-[#0071E3]/20'}`}>
            Return: <strong className="text-[#FF9500]">HUMAN CO₂ ({co2} ppm)</strong>
          </span>
          <span className={`px-3 py-1 rounded-[980px] border text-[#1D1D1F] ${isDirectToExhaust ? 'bg-[#E8F2FD] border-[#0071E3]/30' : 'bg-[#E8F8EE] border-[#34C759]/20'}`}>
            {isDirectToExhaust ? (
              <span>Exhaust: <strong className="text-[#0071E3]">{toOutdoorPct}% (ROOFTOP SCRUBBER)</strong></span>
            ) : (
              <span>Bioreactor: <strong className="text-[#34C759]">{toAlgaePct}% (85% BIO-FEED)</strong></span>
            )}
          </span>
        </div>
      </div>

      {/* Main SVG Schematic - Apple Surface Dark Contrast Tile */}
      <div className="w-full overflow-x-auto py-2 my-2 bg-[#000000] rounded-xl border border-[rgba(0,0,0,0.08)]">
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
          <g transform="translate(20, 95)">
            <text x="0" y="-12" fill="#0071E3" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Outdoor Air Intake
            </text>
            <path d="M 0 10 L 70 10" stroke="#0071E3" strokeWidth="6" strokeLinecap="round" />
            <polygon points="76,10 66,5 66,15" fill="#0071E3" />
            <line x1="0" y1="10" x2="70" y2="10" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 8" className="animate-flow-dash" />
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
            HVAC Central Air Handler
          </text>

          {/* Filter Unit */}
          <g transform="translate(130, 90)">
            <rect x="0" y="0" width="36" height="36" rx="4" fill="#0f1f38" stroke="#0071E3" strokeWidth="1.5" />
            <path d="M 6 4 L 12 32 L 18 4 L 24 32 L 30 4" fill="none" stroke="#0071E3" strokeWidth="1.5" opacity="0.7" />
            <text x="18" y="47" fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">HEPA Filter</text>
          </g>

          {/* Inter-filter conduit to fan */}
          <path d="M 166 108 L 210 108" stroke="#0071E3" strokeWidth="6" strokeLinecap="round" />

          {/* Supply Fan */}
          <g transform="translate(230, 108)">
            <SpinningFan cx={0} cy={0} r={20} spinning={true} />
            <text x="0" y="-28" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Supply Fan
            </text>
          </g>

          {/* Supply Conduit from Fan -> Split Header */}
          <path d="M 250 108 L 300 108" stroke="#0071E3" strokeWidth="6" strokeLinecap="round" />

          {/* ══════════════════════════════════════════════════════════════════
              2. SUPPLY AIR TO ROOMS (BLUE NETWORK)
             ══════════════════════════════════════════════════════════════════ */}
          <g>
            <text x="45" y="270" fill="#0071E3" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Fresh Supply Air
            </text>

            {/* Main Supply Vertical Header Drop */}
            <path
              d="M 300 108 L 300 150 L 130 150 L 130 195"
              fill="none"
              stroke="#0071E3"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Horizontal Distribution Line across Rooms 1, 2, 3 */}
            <path
              d="M 130 150 L 400 150"
              fill="none"
              stroke="#0071E3"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Room 1 Supply Branch (Drop down) */}
            <path d="M 130 150 L 130 195" stroke="#0071E3" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="130,202 126,193 134,193" fill="#0071E3" />

            {/* Room 2 Supply Branch (Drop down) */}
            <path d="M 240 150 L 240 195" stroke="#0071E3" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="240,202 236,193 244,193" fill="#0071E3" />

            {/* Room 3 Supply Branch (Drop down) */}
            <path d="M 350 150 L 350 195" stroke="#0071E3" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="350,202 346,193 354,193" fill="#0071E3" />
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              3. OCCUPIED ROOMS (YOLOv8 DETECTS HUMANS)
             ══════════════════════════════════════════════════════════════════ */}
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
              4. "HUMAN CO2 RETURN AIR" PIPELINE (GLOWING RADIANT ORANGE)
                 Flows from occupied rooms into the green facade when healthy!
             ══════════════════════════════════════════════════════════════════ */}
          {/* Room 1 Return Drop */}
          <path d="M 130 292 L 130 330" stroke="#FF9500" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="130,336 126,327 134,327" fill="#FF9500" />

          {/* Room 2 Return Drop */}
          <path d="M 240 292 L 240 330" stroke="#FF9500" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="240,336 236,327 244,327" fill="#FF9500" />

          {/* Room 3 Return Drop */}
          <path d="M 350 292 L 350 330" stroke="#FF9500" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="350,336 346,327 354,327" fill="#FF9500" />

          {/* Bottom Return Manifold Header (Horizontal Glowing Orange Pipe) */}
          <path
            d="M 72 342 L 416 342"
            fill="none"
            stroke="#FF9500"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,149,0,0.85))' }}
          />
          <line
            x1="72"
            y1="342"
            x2="416"
            y2="342"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-flow-dash-fast"
          />
          <polygon points="66,342 76,337 76,347" fill="#FF9500" />

          {/* Return Riser: Bottom Right (416, 342) -> Rises Up into HVAC System */}
          <path
            d="M 416 342 L 440 342 L 440 185 L 360 185 L 360 108 L 470 108"
            fill="none"
            stroke="#FF9500"
            strokeWidth="7"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,149,0,0.85))' }}
          />
          <path
            d="M 416 342 L 440 342 L 440 185 L 360 185 L 360 108 L 470 108"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            strokeLinejoin="round"
            className="animate-flow-dash-fast"
          />
          <polygon points="410,185 400,180 400,190" fill="#FF9500" />

          {/* PROMINENT LABEL: "HUMAN CO2 RETURN AIR" */}
          <g transform="translate(18, 375)">
            <rect x="0" y="0" width="180" height="42" rx="8" fill="#431407" stroke="#FF9500" strokeWidth="1.8" />
            <text x="12" y="18" fill="#FF9500" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
              HUMAN CO₂ RETURN AIR
            </text>
            <text x="12" y="32" fill="#FED7AA" fontSize="8" fontFamily="monospace">
              CO₂: 400 + ({occupants} × 150) = {co2} ppm
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              5. CO2 SENSOR BOX [CO2]
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(490, 108)">
            <circle cx="0" cy="0" r="18" fill="#0b172a" stroke="#FF9500" strokeWidth="2.5" />
            <text x="0" y="-3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              CO₂
            </text>
            <text x="0" y="8" fill="#fed7aa" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {co2}ppm
            </text>
            <text x="0" y="-26" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              CO₂ Sensor
            </text>
          </g>

          {/* Conduit from CO2 Sensor to 3-Way Damper */}
          <path d="M 508 108 L 575 108" stroke="#FF9500" strokeWidth="7" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,149,0,0.85))' }} />
          <line x1="508" y1="108" x2="575" y2="108" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash-fast" />
          <polygon points="560,108 550,103 550,113" fill="#FF9500" />

          {/* ══════════════════════════════════════════════════════════════════
              6. 3-WAY DAMPER (CONTROL VIA GEMINI AI)
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(595, 108)">
            <ThreeWayDamperValve cx={0} cy={0} angle={damperAngle} toAlgaePct={toAlgaePct} />
            <text x="0" y="-32" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              3-way Damper
            </text>
            <text x="0" y="-20" fill={isDirectToExhaust ? (isCrisis ? "#FF3B30" : "#38BDF8") : "#FF9500"} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {isHighOcc ? '(AI REDIRECTED 85% TO BIOREACTOR)' : '(AI DIRECTED 85% TO EXHAUST)'}
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              7. UPWARD EXHAUST BRANCH (ROOFTOP SCRUBBER EXHAUST)
                 Active when occupants < 4 or during crisis!
                 Demonstrates air directed in HVAC system to outside exhausts.
             ══════════════════════════════════════════════════════════════════ */}
          {isCrisis ? (
            /* HEAVILY PULSING CRIMSON AND AMBER PIPELINE (CRISIS BYPASS) */
            <g>
              <path
                d="M 595 84 L 595 55 L 675 55"
                fill="none"
                stroke="#FF3B30"
                strokeWidth="8"
                strokeLinejoin="round"
                className="animate-bypass-heavy"
              />
              <path
                d="M 595 84 L 595 55 L 675 55"
                fill="none"
                stroke="#FF9500"
                strokeWidth="3.5"
                strokeDasharray="8 6"
                strokeLinejoin="round"
                className="animate-flow-dash-fast"
              />
              <polygon points="687,55 675,48 675,62" fill="#FF3B30" className="animate-bypass-heavy" />

              <g transform="translate(565, 14)">
                <rect x="0" y="0" width="195" height="28" rx="6" fill="#450a0a" stroke="#FF3B30" strokeWidth="1.8" className="animate-pulse" />
                <text x="97.5" y="11" fill="#FF3B30" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  ⚠️ ALGAE COLLAPSE BYPASS SHUNT
                </text>
                <text x="97.5" y="21" fill="#FDE047" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  VENTING {toOutdoorPct}% TO PREVENT ACIDIFICATION
                </text>
              </g>
            </g>
          ) : isDirectToExhaust ? (
            /* ACTIVE EXHAUST STREAM (< 4 OCCUPANTS) - AIR DIRECTS IN HVAC SYSTEM TO EXHAUSTS */
            <g>
              {/* Outer glowing blue/cyan exhaust conduit */}
              <path
                d="M 595 84 L 595 55 L 675 55"
                fill="none"
                stroke="#0071E3"
                strokeWidth="7"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(0,113,227,0.85))' }}
              />
              {/* Animated high-velocity flow dashes */}
              <path
                d="M 595 84 L 595 55 L 675 55"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                strokeLinejoin="round"
                className="animate-flow-dash-fast"
              />
              <polygon points="687,55 675,49 675,61" fill="#0071E3" />

              {/* Prominent Badge: AIR DIRECTS TO EXHAUSTS */}
              <g transform="translate(565, 14)">
                <rect x="0" y="0" width="195" height="28" rx="6" fill="#081d38" stroke="#0071E3" strokeWidth="1.8" />
                <text x="97.5" y="11" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  💨 ROOFTOP SCRUBBER EXHAUST
                </text>
                <text x="97.5" y="21" fill="#BAE6FD" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  DIRECTING {toOutdoorPct}% AIR OUTSIDE (&lt;4 OCCUPANTS)
                </text>
              </g>
            </g>
          ) : (
            /* Normal standby outdoor exhaust bleed (Occupancy >= 4) */
            <g>
              <path
                d="M 595 84 L 595 55 L 675 55"
                fill="none"
                stroke="#475569"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <polygon points="687,55 675,49 675,61" fill="#475569" />
              <text x="635" y="46" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                15% Standby Vent
              </text>
            </g>
          )}

          {/* SAFE ROOFTOP SCRUBBER BOX (ATMOSPHERIC VENT) */}
          <g transform="translate(695, 26)">
            <rect
              x="0"
              y="0"
              width="155"
              height="62"
              rx="10"
              fill={isDirectToExhaust ? (isCrisis ? "#1f1012" : "#081d38") : "#0f172a"}
              stroke={isDirectToExhaust ? (isCrisis ? "#FF3B30" : "#0071E3") : "#475569"}
              strokeWidth={isDirectToExhaust ? "2" : "1.5"}
            />
            <text x="77.5" y="18" fill="#FFFFFF" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              SAFE ROOFTOP SCRUBBER
            </text>
            <text x="77.5" y="31" fill={isDirectToExhaust ? (isCrisis ? "#FCA5A5" : "#BAE6FD") : "#94A3B8"} fontSize="8" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">
              {isDirectToExhaust ? (isCrisis ? 'CO₂ Diverted (pH Safeguard)' : 'Active Airflow Exhaust (<4 Occ)') : 'Atmospheric Bleed Vent'}
            </text>
            <text x="77.5" y="47" fill={isDirectToExhaust ? (isCrisis ? "#FF9500" : "#38BDF8") : "#64748B"} fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {toOutdoorPct}% OUTDOOR EXHAUST
            </text>
          </g>

          {/* ══════════════════════════════════════════════════════════════════
              8. CONDUIT TO ALGAE BIOREACTOR (DOWNWARD BRANCH)
                 Healthy: Glowing Emerald Green (85% Photosynthetic Fuel)
                 Crisis: Clamped down to 15% (Acidification Shield)
             ══════════════════════════════════════════════════════════════════ */}
          {isBypass ? (
            /* CLAMPED FLOW (15%) */
            <g>
              <path
                d="M 595 132 L 595 240 L 640 240"
                fill="none"
                stroke="#64748B"
                strokeWidth="3"
                strokeDasharray="4 4"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <polygon points="650,240 638,234 638,246" fill="#64748B" opacity="0.6" />

              {/* Status Badge */}
              <g transform="translate(605, 175)">
                <rect x="0" y="0" width="165" height="34" rx="6" fill="#18181b" stroke="#FF9500" strokeWidth="1.2" />
                <text x="82.5" y="13" fill="#FF9500" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  RESTRICTED TO 15% FLOW
                </text>
                <text x="82.5" y="24" fill="#94A3B8" fontSize="7" fontWeight="medium" textAnchor="middle" fontFamily="monospace">
                  Acidification Shield (pH &lt; 6.8)
                </text>
              </g>
            </g>
          ) : (
            /* ACTIVE PHOTOSYNTHETIC FUEL (85% FLOW) */
            <g>
              <path
                d="M 595 132 L 595 240 L 640 240"
                fill="none"
                stroke="#34C759"
                strokeWidth="7"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(52,199,89,0.85))' }}
              />
              <path
                d="M 595 132 L 595 240 L 640 240"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                strokeLinejoin="round"
                className="animate-flow-dash-fast"
              />
              <polygon points="650,240 638,234 638,246" fill="#34C759" />

              {/* Status Badge */}
              <g transform="translate(605, 175)">
                <rect x="0" y="0" width="165" height="34" rx="6" fill="#064e3b" stroke="#34C759" strokeWidth="1.2" />
                <text x="82.5" y="13" fill="#34C759" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  PHOTOSYNTHETIC FUEL
                </text>
                <text x="82.5" y="24" fill="#6EE7B7" fontSize="7.5" fontWeight="medium" textAnchor="middle" fontFamily="monospace">
                  {toAlgaePct}% Routed to Bioreactor
                </text>
              </g>
            </g>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              9. ALGAE BIOREACTOR FACADE (GLASS COLUMN + FM METER)
             ══════════════════════════════════════════════════════════════════ */}
          <BioreactorColumn
            x={655}
            y={170}
            width={74}
            height={165}
            health={isHighOcc ? Math.max(88, algaeHealth) : algaeHealth}
            toAlgaePct={toAlgaePct}
          />

          {/* ══════════════════════════════════════════════════════════════════
              10. LEGEND (ENGINEERING SPECIFICATION)
             ══════════════════════════════════════════════════════════════════ */}
          <g transform="translate(775, 110)">
            <rect
              x="0"
              y="0"
              width="190"
              height="300"
              rx="12"
              fill="#080f1d"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="18" y="26" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              Pipeline Legend
            </text>
            <line x1="18" y1="36" x2="172" y2="36" stroke="#1e293b" strokeWidth="1" />

            {/* Item 1: Fresh Air (Supply) */}
            <g transform="translate(18, 56)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#0071E3" strokeWidth="4" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#0071E3" />
              <text x="44" y="4" fill="#e2e8f0" fontSize="9.5" fontFamily="sans-serif">Fresh Supply Air</text>
            </g>

            {/* Item 2: HUMAN CO2 RETURN AIR */}
            <g transform="translate(18, 86)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#FF9500" strokeWidth="5" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#FF9500" />
              <text x="44" y="4" fill="#FF9500" fontSize="9" fontWeight="bold" fontFamily="sans-serif">HUMAN CO₂ RETURN AIR</text>
            </g>

            {/* Item 3: Photosynthetic Fuel (To Algae) */}
            <g transform="translate(18, 116)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#34C759" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#34C759" />
              <text x="44" y="4" fill="#34C759" fontSize="9.5" fontFamily="sans-serif">Photosynthetic Fuel</text>
            </g>

            {/* Item 4: Rooftop Scrubber Exhaust */}
            <g transform="translate(18, 146)">
              <line x1="0" y1="0" x2="30" y2="0" stroke="#0071E3" strokeWidth="5" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#0071E3" />
              <text x="44" y="4" fill="#38BDF8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">ROOFTOP EXHAUST (&lt;4)</text>
            </g>

            <line x1="18" y1="168" x2="172" y2="168" stroke="#1e293b" strokeWidth="1" />

            {/* Symbol 1: Supply Fan */}
            <g transform="translate(30, 190)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#0071E3" strokeWidth="1.5" />
              <path d="M-5 -2 L5 2 M-2 5 L2 -5" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" />
              <text x="32" y="4" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">Supply Fan</text>
            </g>

            {/* Symbol 2: 3-Way AI Damper Valve */}
            <g transform="translate(30, 218)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#FF9500" strokeWidth="1.5" />
              <path d="M-6 -6 L6 6 M-6 6 L6 -6" stroke="#FF9500" strokeWidth="1.5" />
              <text x="32" y="4" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">3-Way Damper (AI)</text>
            </g>

            {/* Symbol 3: CO2 Sensor */}
            <g transform="translate(30, 246)">
              <rect x="-12" y="-8" width="24" height="16" rx="4" fill="#0f172a" stroke="#FF9500" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#FF9500" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CO₂</text>
              <text x="32" y="4" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">CO₂ Sensor</text>
            </g>

            {/* Symbol 4: Flow Meter */}
            <g transform="translate(30, 274)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#0071E3" strokeWidth="1.5" />
              <text x="0" y="3" fill="#0071E3" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FM</text>
              <text x="32" y="4" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">Flow Meter (L/m)</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── Default Export: HVACDiagram with Dual View & Fullscreen Modal ───────────
export default function HVACDiagram({
  defaultView = 'schematic',
  defaultState = 'live',
  compact = false,
  showHeader = true,
  className = ''
}) {
  const [selectedState, setSelectedState] = useState(defaultState);
  const [viewMode, setViewMode] = useState(defaultView); // 'matrix' | 'schematic' | 'both'
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
      const isHighOcc = storeOccupancy >= 4;
      const isCrisis = !isHighOcc && storeAlgaeHealth < 45.0;
      // When occupants >= 4: 85% to Bioreactor, 15% to Outdoor
      // When occupants < 4: air directs to exhausts: 85% to Outdoor Exhaust, 15% to Bioreactor
      const toAlgae = isHighOcc ? 85 : 15;
      const toOutdoor = 100 - toAlgae;
      return {
        id: 'live',
        title: isHighOcc
          ? 'Live Sync: "Feed the Algae" Active (High Occupancy ≥4)'
          : (isCrisis
            ? 'Live Sync: "Acidification Bypass" Shunt'
            : 'Live Sync: Exhaust Mode Active (<4 Occupants)'),
        subtitle: isHighOcc
          ? `YOLOv8 detected ${storeOccupancy} occupants in Live CV (${storeCo2} ppm CO₂). HVAC dampers modulated to 85% — directing human CO₂ exhaust straight into the bioreactor facade.`
          : (isCrisis
            ? `ALGAE COLLAPSE BYPASS SHUNT active: Yellow pixels detected (${Math.round(storeAlgaeHealth)}% < 45%). Damper clamped to 15% to prevent carbonic acidification. 85% exhaust routed to safe rooftop scrubber.`
            : `YOLOv8 detected ${storeOccupancy} occupant${storeOccupancy !== 1 ? 's' : ''} in Live CV (<4 threshold). Air directs in HVAC system to rooftop scrubber exhaust (85% outdoor exhaust vent).`),
        occupants: storeOccupancy,
        co2: storeCo2,
        algaeHealth: isHighOcc ? Math.max(88, Math.round(storeAlgaeHealth)) : Math.round(storeAlgaeHealth),
        toAlgaePct: toAlgae,
        toOutdoorPct: toOutdoor,
        damperAngle: isHighOcc ? 75 : 12,
        flowLpm: isHighOcc ? 26.0 : 2.5,
        algaeColor: (!isCrisis || isHighOcc) ? '#34C759' : '#FFCC00',
        liquidTone: (!isCrisis || isHighOcc) ? 'healthy' : 'unhealthy',
        modeText: isHighOcc
          ? 'FEED THE ALGAE (85% BIO-FEED)'
          : (isCrisis ? 'ALGAE COLLAPSE BYPASS SHUNT (15% CLAMP)' : 'EXHAUST MODE (85% OUTDOOR VENT)'),
        badgeColor: isHighOcc ? '#FF9500' : (isCrisis ? '#FF3B30' : '#0071E3')
      };
    }
    return STATES[selectedState] || STATES.state2;
  }, [selectedState, storeOccupancy, storeCo2, storeAlgaeHealth, hvacState]);

  // Handler for state selection
  const handleSelectState = (key) => {
    setSelectedState(key);
    if (key === 'state1') {
      triggerHvac('auto');
    } else if (key === 'state2') {
      triggerHvac('redirect');
    } else if (key === 'state3') {
      triggerHvac('bypass');
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* ── Top Control & View Switcher Bar ── */}
      {showHeader && (
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: View Selector - Apple Segmented Control */}
          <div className="flex items-center bg-[#E8E8ED] p-1 rounded-[980px] text-xs">
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3.5 py-1 rounded-[980px] transition-all flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>2D HVAC Layout</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3.5 py-1 rounded-[980px] transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>3-State Scenarios</span>
            </button>

            <button
              onClick={() => setViewMode('both')}
              className={`px-3.5 py-1 rounded-[980px] transition-all flex items-center gap-1.5 ${
                viewMode === 'both'
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <span>Overview Both</span>
            </button>
          </div>

          {/* Right: State Preset Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase mr-1 hidden sm:inline">Active Mode:</span>
            {Object.entries(STATES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleSelectState(key)}
                className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all flex items-center gap-1.5 ${
                  selectedState === key
                    ? 'btn-apple-primary'
                    : 'btn-apple-secondary'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedState === key ? '#FFFFFF' : item.badgeColor }} />
                {key === 'state1' ? 'State 1 (Baseline)' : key === 'state2' ? 'State 2 (Feed Algae)' : 'State 3 (Bypass Shunt)'}
              </button>
            ))}

            <button
              onClick={() => setSelectedState('live')}
              className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all flex items-center gap-1.5 ${
                selectedState === 'live'
                  ? 'bg-[#34C759] text-white shadow-sm'
                  : 'btn-apple-secondary'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Live CV Sync</span>
            </button>

            {/* Fullscreen Expand Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Expand Fullscreen"
              className="btn-apple-secondary p-1.5 rounded-[980px] ml-1"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* ── View 1: 3-State Operational Matrix ── */}
      {(viewMode === 'matrix' || viewMode === 'both') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B] px-1 font-medium">
            <span className="uppercase tracking-wider">Biological Cause-and-Effect Scenarios</span>
            <span className="text-[11px] text-[#86868B]">Click any card to engage flow state</span>
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
        <div className="fixed inset-0 z-50 bg-[rgba(245,245,247,0.95)] backdrop-blur-[20px] p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.08)]">
            <div>
              <h2 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
                <Wind className="w-5 h-5 text-[#0071E3]" />
                Algor-Algae 2D HVAC Architecture &amp; Redirection Matrix
              </h2>
              <p className="text-xs text-[#86868B]">
                Full-Screen Engineering Specification View · Real-Time Cause-and-Effect Redirection
              </p>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="btn-apple-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
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

          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] text-center text-xs text-[#86868B]">
            Algor-Algae Living Bioreactor Digital Twin · Autonomous BMS powered by Gemini 3.8 Flash
          </div>
        </div>
      )}
    </div>
  );
}
