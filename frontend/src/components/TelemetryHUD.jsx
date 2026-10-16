/**
 * TelemetryHUD.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Real-time Living Telemetry Badges conforming to the Design Specification:
 * - Obsidian & Secondary Ground: #060a12, #090f19
 * - Hairlines: rgba(237, 231, 220, 0.13)
 * - Inks: #ede7dc, #9ea5a8, #6c7378
 * - Typography: Syne 700 headings, Sora 500 labels, JetBrains Mono metrics
 * - Accents: purely as type ornaments, dots, and hairlines (no filled blocks)
 */

import React from 'react';
import { Users, Wind, Sun, Activity, Droplet } from 'lucide-react';
import { useStore } from '../store';

export default function TelemetryHUD() {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const ambientLux = useStore((state) => state.ambient_lux);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);
  const hvacState = useStore((state) => state.hvacState);

  const isHealthy = algaeHealth >= 70;
  const isStressed = algaeHealth >= 45 && algaeHealth < 70;
  const healthAccent = isHealthy ? '#10b981' : isStressed ? '#f59e0b' : '#ef4444';
  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full select-none font-['Sora']">
      
      {/* 1. Human Occupancy */}
      <div className="bg-[#090f19] border border-[rgba(237,231,220,0.13)] p-3.5 rounded-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[#9ea5a8]">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">Occupancy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-['Syne'] text-[#ede7dc]">{occupancy}</span>
          <span className="text-[11px] text-[#6c7378] font-mono">person{occupancy !== 1 ? 's' : ''}</span>
        </div>
        <div className="mt-1 text-[10.5px] text-[#9ea5a8] border-t border-[rgba(237,231,220,0.13)] pt-1.5 flex items-center justify-between font-mono">
          <span>YOLOv8 Edge</span>
          <span className="text-[#0284c7]">Class 0 // 30 FPS</span>
        </div>
      </div>

      {/* 2. Indoor CO2 Flux */}
      <div className="bg-[#090f19] border border-[rgba(237,231,220,0.13)] p-3.5 rounded-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[#9ea5a8]">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">Indoor CO₂</span>
          <span className={`w-1.5 h-1.5 rounded-full ${co2Ppm > 800 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-['Syne'] text-[#ede7dc]">{co2Ppm}</span>
          <span className="text-[11px] text-[#6c7378] font-mono">ppm</span>
        </div>
        <div className="mt-1 text-[10.5px] text-[#9ea5a8] border-t border-[rgba(237,231,220,0.13)] pt-1.5 flex items-center justify-between font-mono">
          <span>400 + N×150</span>
          <span className={co2Ppm > 800 ? 'text-[#f59e0b]' : 'text-[#10b981]'}>
            {co2Ppm > 800 ? 'SURGE REDIRECT' : 'EQUILIBRIUM'}
          </span>
        </div>
      </div>

      {/* 3. Algae Bio-Health */}
      <div className="bg-[#090f19] border border-[rgba(237,231,220,0.13)] p-3.5 rounded-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[#9ea5a8]">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">Algae Health</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: healthAccent }} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-['Syne']" style={{ color: healthAccent }}>
            {algaeHealth.toFixed(1)}%
          </span>
          <span className="text-[10.5px] font-mono text-[#6c7378]">CHL-a 520nm</span>
        </div>
        <div className="mt-1 text-[10.5px] border-t border-[rgba(237,231,220,0.13)] pt-1.5 flex items-center justify-between font-mono">
          <span className="text-[#9ea5a8]">Spectro ROI</span>
          <span style={{ color: healthAccent }}>
            {algaeHealth >= 70 ? 'PEAK CULTURE' : algaeHealth >= 45 ? 'CHLOROSIS' : 'CRITICAL BYPASS'}
          </span>
        </div>
      </div>

      {/* 4. Motorized Damper Actuation */}
      <div className="bg-[#090f19] border border-[rgba(237,231,220,0.13)] p-3.5 rounded-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[#9ea5a8]">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">Damper Valve</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isBypass ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-['Syne'] text-[#ede7dc]">
            {hvacState.damperOpenPct}%
          </span>
          <span className="text-[11px] text-[#6c7378] font-mono">servo</span>
        </div>
        <div className="mt-1 text-[10.5px] border-t border-[rgba(237,231,220,0.13)] pt-1.5 flex items-center justify-between font-mono">
          <span className="text-[#9ea5a8]">HVAC Loop</span>
          <span className={isBypass ? 'text-[#ef4444]' : 'text-[#10b981]'}>
            {isBypass ? 'OUTDOOR BYPASS' : 'FACADE FEED'}
          </span>
        </div>
      </div>

      {/* 5. Biofuel & Lipid Harvest Yield */}
      <div className="bg-[#090f19] border border-[rgba(237,231,220,0.13)] p-3.5 rounded-xl flex flex-col justify-between shadow-lg col-span-2 sm:col-span-1 lg:col-span-1">
        <div className="flex items-center justify-between text-[#9ea5a8]">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">Biofuel Yield</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-['Syne'] text-[#ede7dc]">{biofuelRate}</span>
          <span className="text-[11px] text-[#6c7378] font-mono">ml / hr</span>
        </div>
        <div className="mt-1 text-[10.5px] text-[#9ea5a8] border-t border-[rgba(237,231,220,0.13)] pt-1.5 flex items-center justify-between font-mono">
          <span>Lipid Synthesis</span>
          <span className="text-[#10b981]">O₂ POSITIVE</span>
        </div>
      </div>

    </div>
  );
}
