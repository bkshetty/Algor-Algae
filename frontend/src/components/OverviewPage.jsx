/**
 * OverviewPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * The Ultimate "Final Boss" Living Digital Twin Command Center for Judges.
 *
 * Rearranged Architecture:
 * 1. Two Main Pillars Command the Stage:
 *    - Left Stage: Gen AI 3D Twin & Biological Kinetics (Building / Bioreactor / HVAC)
 *    - Right Stage: Real-Time Camera Detection (YOLOv8 + OpenCV Spectrophotometer + Demo Triggers)
 *      paired with Autonomous Gemini 3.8 Flash BMS Kernel
 * 2. Fully Integrated Subsystems:
 *    - 3D Neoclassical Building Architecture (41.4m × 34.2m with corner bioreactors)
 *    - Close-up 3D Photobioreactor (PBR) Vessel with actinic grow lights & cooling coils
 *    - 2D HVAC System Layout & Closed-Loop Airflow Schematic
 * 3. Strict adherence to the Design Specification:
 *    - Obsidian #060a12, Secondary #090f19, Hairlines rgba(237,231,220,0.13)
 *    - Bone ink #ede7dc, Secondary #9ea5a8, Muted #6c7378
 *    - Accents strictly as type ornaments/dots (no solid filled blocks)
 *    - Syne headings, Sora labels, JetBrains Mono technical telemetry
 */

import React, { useState } from 'react';
import { 
  Building2, 
  FlaskConical, 
  Wind, 
  Eye, 
  Bot, 
  Sliders, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import BuildingTwin from './BuildingTwin';
import BioreactorTwin from './BioreactorTwin';
import HVACDiagram from './HVACDiagram';
import CameraFeed from './CameraFeed';
import TelemetryHUD from './TelemetryHUD';
import AgentDrawer from './AgentDrawer';
import { useStore } from '../store';

export default function OverviewPage({ onNavigate }) {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const hvacState = useStore((state) => state.hvacState);
  const isConnected = useStore((state) => state.isConnected);

  // Subsystem Stage Mode: 'building' | 'bioreactor' | 'hvac'
  const [twinViewMode, setTwinViewMode] = useState('building');

  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;
  const statusColor = algaeHealth >= 75 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col space-y-5 w-full text-[#ede7dc] font-['Sora'] select-none">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. TOP COMMAND BAR & SUBSYSTEM MODE SELECTOR
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[rgba(237,231,220,0.13)]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#9ea5a8] uppercase tracking-[0.16em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Digital Twin v1.0 // Judicial Command Center</span>
          </div>
          <h1 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl uppercase tracking-[-0.02em] text-[#ede7dc] mt-0.5">
            Living Bioreactor Facade Twin<span className="text-[#10b981]">.</span>
          </h1>
        </div>

        {/* Primary Subsystem View Mode Switcher Pills */}
        <div className="flex items-center space-x-2 font-mono text-xs overflow-x-auto pb-1">
          <button
            onClick={() => setTwinViewMode('building')}
            className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center space-x-2 tracking-wider ${
              twinViewMode === 'building'
                ? 'border-[#10b981] text-[#10b981] font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#10b981] hover:text-[#10b981]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${twinViewMode === 'building' ? 'bg-[#10b981]' : 'bg-[#9ea5a8]'}`} />
            <span>3D Neoclassical Building</span>
          </button>

          <button
            onClick={() => setTwinViewMode('bioreactor')}
            className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center space-x-2 tracking-wider ${
              twinViewMode === 'bioreactor'
                ? 'border-[#10b981] text-[#10b981] font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#10b981] hover:text-[#10b981]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${twinViewMode === 'bioreactor' ? 'bg-[#10b981]' : 'bg-[#9ea5a8]'}`} />
            <span>3D Bioreactor Vessel</span>
          </button>

          <button
            onClick={() => setTwinViewMode('hvac')}
            className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center space-x-2 tracking-wider ${
              twinViewMode === 'hvac'
                ? 'border-[#0284c7] text-[#0284c7] font-bold shadow-[0_0_12px_rgba(2,132,199,0.2)]'
                : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#0284c7] hover:text-[#0284c7]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${twinViewMode === 'hvac' ? 'bg-[#0284c7]' : 'bg-[#9ea5a8]'}`} />
            <span>2D HVAC Schematic</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. REAL-TIME TELEMETRY HUD STRIP
         ══════════════════════════════════════════════════════════════════════ */}
      <TelemetryHUD />

      {/* ══════════════════════════════════════════════════════════════════════
          3. MAIN REARRANGED STAGE:
             LEFT: Gen AI 3D Twin & Living Bioreactor (Building / PBR / HVAC)
             RIGHT: Camera Detection Perception & Autonomous Gemini BMS Kernel
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        
        {/* ────────────────────────────────────────────────────────────────────
            PART 1 (LEFT 7 COLS): THE GEN AI 3D TWIN / BIOLOGICAL STAGE
           ──────────────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Subsystem Stage Header Bar */}
          <div className="flex items-center justify-between px-1 text-xs font-mono">
            <div className="flex items-center space-x-2 text-[#9ea5a8] uppercase tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="font-['Syne'] font-bold text-[#ede7dc]">
                {twinViewMode === 'building' && '01 // 3D Neoclassical Architectural Twin'}
                {twinViewMode === 'bioreactor' && '01 // High-Fidelity 3D Photobioreactor Vessel'}
                {twinViewMode === 'hvac' && '01 // 2D Closed-Loop HVAC Airflow Schematic'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[#6c7378] text-[11px]">
              <span>ACTIVE LOOP:</span>
              <span className={isBypass ? 'text-[#ef4444] font-bold' : 'text-[#10b981] font-bold'}>
                {isBypass ? 'OUTDOOR ROOF BYPASS' : 'FACADE BIO-FEED'}
              </span>
            </div>
          </div>

          {/* Interactive Visualizer Canvas Container */}
          <div className="h-[560px] lg:h-[620px] w-full rounded-2xl overflow-hidden border border-[rgba(237,231,220,0.13)] bg-[#090f19] shadow-2xl relative">
            
            {twinViewMode === 'building' && (
              <BuildingTwin focusMode="overview" />
            )}

            {twinViewMode === 'bioreactor' && (
              <div className="w-full h-full relative">
                <BioreactorTwin />
              </div>
            )}

            {twinViewMode === 'hvac' && (
              <div className="w-full h-full overflow-y-auto p-2 bg-[#090f19]">
                <HVACDiagram />
              </div>
            )}
          </div>

          {/* Bottom Technical Specs Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
            <div className="bg-[#090f19] p-3 rounded-xl border border-[rgba(237,231,220,0.13)] flex items-center justify-between">
              <div>
                <span className="text-[#6c7378] block text-[10px] uppercase font-['Sora']">Dimensions</span>
                <span className="text-[#ede7dc] font-bold">41.4m × 34.2m Core</span>
              </div>
              <span className="text-[10px] text-[#9ea5a8]">7-Bay Facade</span>
            </div>

            <div className="bg-[#090f19] p-3 rounded-xl border border-[rgba(237,231,220,0.13)] flex items-center justify-between">
              <div>
                <span className="text-[#6c7378] block text-[10px] uppercase font-['Sora']">Bioreactors</span>
                <span className="text-[#10b981] font-bold">20 Corner Modules</span>
              </div>
              <span className="text-[10px] text-[#9ea5a8]">4 Towers</span>
            </div>

            <div className="bg-[#090f19] p-3 rounded-xl border border-[rgba(237,231,220,0.13)] flex items-center justify-between">
              <div>
                <span className="text-[#6c7378] block text-[10px] uppercase font-['Sora']">Acid Safeguard</span>
                <span className={isBypass ? 'text-[#ef4444] font-bold' : 'text-[#0284c7] font-bold'}>
                  {isBypass ? '< 60ms ACTUATED' : 'pH ≥ 6.8 NOMINAL'}
                </span>
              </div>
              <span className="text-[10px] text-[#9ea5a8]">Servo 88%</span>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            PART 2 (RIGHT 5 COLS): CAMERA DETECTION & GEMINI BMS KERNEL
           ──────────────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Subsystem Header Bar */}
          <div className="flex items-center justify-between px-1 text-xs font-mono">
            <div className="flex items-center space-x-2 text-[#9ea5a8] uppercase tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
              <span className="font-['Syne'] font-bold text-[#ede7dc]">
                02 // Vision Perception & Autonomous AI
              </span>
            </div>

            <span className="text-[11px] text-[#6c7378]">
              ZERO-LATENCY TENSOR
            </span>
          </div>

          {/* Top Component: Real-Time Camera Detection + Judge Triggers */}
          <div className="flex-shrink-0">
            <CameraFeed mode="overview" />
          </div>

          {/* Bottom Component: Autonomous Gemini BMS Agent Log & ESG Audit */}
          <div className="flex-1 min-h-[300px]">
            <AgentDrawer />
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. BOTTOM ARCHITECTURAL BENCHMARKS (LEED PLATINUM CRITERIA)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-4 pt-6 border-t border-[rgba(237,231,220,0.13)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#6c7378]">
              03 // Closed-Loop Biological Specifications
            </div>
            <h2 className="font-['Syne'] font-bold text-xl text-[#ede7dc] mt-0.5">
              Autonomous Building Performance Benchmarks
            </h2>
          </div>
          <span className="font-mono text-xs text-[#9ea5a8]">
            CHLORELLA VULGARIS SYMBIOSIS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          
          <div className="bg-[#090f19] p-4 rounded-xl border border-[rgba(237,231,220,0.13)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9ea5a8] text-[10.5px] uppercase font-['Sora']">Spectrophotometry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
            <div className="text-lg font-bold font-['Syne'] text-[#ede7dc]">
              520nm // 580nm
            </div>
            <p className="text-[11px] font-sans text-[#9ea5a8] leading-relaxed">
              OpenCV ROI evaluates chlorophyll-a peak vs carotenoids to detect chlorosis onset before cell death.
            </p>
          </div>

          <div className="bg-[#090f19] p-4 rounded-xl border border-[rgba(237,231,220,0.13)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9ea5a8] text-[10.5px] uppercase font-['Sora']">Edge Perception</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
            </div>
            <div className="text-lg font-bold font-['Syne'] text-[#ede7dc]">
              YOLOv8 Nano // Class 0
            </div>
            <p className="text-[11px] font-sans text-[#9ea5a8] leading-relaxed">
              Real-time occupant bounding boxes correlate directly with indoor CO₂ surges via mathematical modeling.
            </p>
          </div>

          <div className="bg-[#090f19] p-4 rounded-xl border border-[rgba(237,231,220,0.13)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9ea5a8] text-[10.5px] uppercase font-['Sora']">Damper Actuation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            </div>
            <div className="text-lg font-bold font-['Syne'] text-[#ede7dc]">
              &lt; 60ms Motorized Servo
            </div>
            <p className="text-[11px] font-sans text-[#9ea5a8] leading-relaxed">
              3-way damper redirects 88% air into spargers during occupancy spikes, or bypasses outside during culture stress.
            </p>
          </div>

          <div className="bg-[#090f19] p-4 rounded-xl border border-[rgba(237,231,220,0.13)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9ea5a8] text-[10.5px] uppercase font-['Sora']">ESG Carbon Sequestration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
            <div className="text-lg font-bold font-['Syne'] text-[#ede7dc]">
              88% Peak Sequestration
            </div>
            <p className="text-[11px] font-sans text-[#9ea5a8] leading-relaxed">
              Transforms commercial breath waste into continuous biofuel and pure O₂, verified via cryptographic ESG reports.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
