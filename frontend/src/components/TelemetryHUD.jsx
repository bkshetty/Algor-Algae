/**
 * TelemetryHUD.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Apple Retail "Product-tile whiteout" Design System (apple-design.md):
 * - Flat pure-white surface (#FFFFFF) on off-white ground (#F5F5F7)
 * - Near-black ink (#1D1D1F) for metrics, #86868B for labels
 * - Single rationed blue (#0071E3) for primary signals
 * - Crisp 1px hairline border (rgba(0,0,0,0.08)), zero drop shadows
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
  const healthBadgeColor = isHealthy ? 'text-[#34C759]' : isStressed ? 'text-[#FF9500]' : 'text-[#FF3B30]';
  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif]">
      
      {/* 1. Human Occupancy Tile */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868B]">
          <span className="text-[11px] uppercase tracking-[0.06em] font-medium">Occupancy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">{occupancy}</span>
          <span className="text-[12px] text-[#86868B]">person{occupancy !== 1 ? 's' : ''}</span>
        </div>
        <div className="mt-2 text-[11px] text-[#86868B] border-t border-[rgba(0,0,0,0.06)] pt-2 flex items-center justify-between">
          <span>YOLOv8 Vision</span>
          <span className="text-[#1D1D1F] font-mono text-[10.5px]">30 FPS Active</span>
        </div>
      </div>

      {/* 2. Indoor CO2 Flux Tile */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868B]">
          <span className="text-[11px] uppercase tracking-[0.06em] font-medium">Indoor CO₂</span>
          <span className={`w-1.5 h-1.5 rounded-full ${co2Ppm > 800 ? 'bg-[#FF9500]' : 'bg-[#34C759]'}`} />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">{co2Ppm}</span>
          <span className="text-[12px] text-[#86868B]">ppm</span>
        </div>
        <div className="mt-2 text-[11px] text-[#86868B] border-t border-[rgba(0,0,0,0.06)] pt-2 flex items-center justify-between">
          <span>Breath Metabolic</span>
          <span className={`font-mono text-[10.5px] ${co2Ppm > 800 ? 'text-[#FF9500] font-medium' : 'text-[#34C759]'}`}>
            {co2Ppm > 800 ? '+Surge' : 'Nominal'}
          </span>
        </div>
      </div>

      {/* 3. Algae Bio-Health Tile */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868B]">
          <span className="text-[11px] uppercase tracking-[0.06em] font-medium">Algae Health</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-[#34C759]' : isStressed ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'}`} />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">
            {algaeHealth.toFixed(1)}%
          </span>
          <span className={`text-[12px] font-medium ${healthBadgeColor}`}>
            {algaeHealth >= 70 ? 'Healthy' : algaeHealth >= 45 ? 'Stressed' : 'Critical'}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-[#86868B] border-t border-[rgba(0,0,0,0.06)] pt-2 flex items-center justify-between">
          <span>Spectrophotometer</span>
          <span className="font-mono text-[10.5px] text-[#1D1D1F]">520nm Chl-a</span>
        </div>
      </div>

      {/* 4. Motorized Damper Actuation Tile */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#86868B]">
          <span className="text-[11px] uppercase tracking-[0.06em] font-medium">Damper Valve</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isBypass ? 'bg-[#FF3B30]' : 'bg-[#34C759]'}`} />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">
            {hvacState.damperOpenPct}%
          </span>
          <span className="text-[12px] text-[#86868B]">servo</span>
        </div>
        <div className="mt-2 text-[11px] text-[#86868B] border-t border-[rgba(0,0,0,0.06)] pt-2 flex items-center justify-between">
          <span>Airflow Loop</span>
          <span className={`font-mono text-[10.5px] ${isBypass ? 'text-[#FF3B30] font-medium' : 'text-[#34C759]'}`}>
            {isBypass ? 'Bypass Vent' : 'Bioreactor'}
          </span>
        </div>
      </div>

      {/* 5. Biofuel & Lipid Harvest Yield Tile */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1 lg:col-span-1">
        <div className="flex items-center justify-between text-[#86868B]">
          <span className="text-[11px] uppercase tracking-[0.06em] font-medium">Biofuel Rate</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">{biofuelRate}</span>
          <span className="text-[12px] text-[#86868B]">ml / hr</span>
        </div>
        <div className="mt-2 text-[11px] text-[#86868B] border-t border-[rgba(0,0,0,0.06)] pt-2 flex items-center justify-between">
          <span>Oxygen Recirculation</span>
          <span className="font-mono text-[10.5px] text-[#34C759]">Positive</span>
        </div>
      </div>

    </div>
  );
}
